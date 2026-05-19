import type {
  ActionReceipt,
  ConsistencyAnalyticsDataQuality,
  MirrorScanRecord,
  OverrideEvent,
  PolicyImpactEvidenceWindow,
  PolicyImpactMeasurement,
  PolicyImpactStatus,
  PolicyImpactTimelineEvent,
  PolicyVersion,
  RulePolicy,
} from '../../shared/schema';
import { listPolicyVersions } from './policies';
import { listActionReceipts } from './receipts';
import { getScanRecord, listScanMetadata } from './scans';
import { listRecentAuditEvents } from './audit';

const MINIMUM_RECEIPTS_PER_WINDOW = 3;
const IMPACT_DELTA_THRESHOLD = 0.1;

export async function getPolicyImpactMeasurement(options: {
  subreddit: string;
  policy: RulePolicy;
}): Promise<PolicyImpactMeasurement> {
  const [versions, receipts, overrides, metadata] = await Promise.all([
    listPolicyVersions(options.subreddit, options.policy.id),
    listActionReceipts(options.subreddit, 500),
    listRecentAuditEvents(options.subreddit, 500),
    listScanMetadata(options.subreddit, { limit: 20 }),
  ]);
  const scans = (
    await Promise.all(
      metadata.map((scan) => getScanRecord(options.subreddit, scan.id))
    )
  ).filter((scan): scan is MirrorScanRecord => scan !== undefined);

  return computePolicyImpactMeasurement({
    policy: options.policy,
    versions,
    receipts,
    overrides,
    scans,
    generatedAt: new Date().toISOString(),
    source: 'stored',
  });
}

export function computePolicyImpactMeasurement(options: {
  policy: RulePolicy;
  versions: PolicyVersion[];
  receipts: ActionReceipt[];
  overrides: OverrideEvent[];
  scans: MirrorScanRecord[];
  generatedAt: string;
  source: 'stored' | 'demo';
}): PolicyImpactMeasurement {
  const adoptedVersion = findAdoptedVersion(options.policy, options.versions);
  const adoptedAt =
    adoptedVersion?.adoptedAt ?? options.policy.adoptedAt ?? options.policy.updatedAt;
  const policyReceipts = options.receipts
    .filter((receipt) => receiptMatchesPolicy(receipt, options.policy))
    .sort(compareCreatedAt);
  const ruleScans = options.scans
    .filter((scan) => scanHasRule(scan, options.policy.ruleKey, options.policy.ruleName))
    .sort(compareCreatedAt);
  const before = buildWindow({
    receipts: policyReceipts.filter((receipt) => receipt.createdAt < adoptedAt),
    scans: ruleScans.filter((scan) => scan.createdAt < adoptedAt),
    overrides: options.overrides,
  });
  const after = buildWindow({
    receipts: policyReceipts.filter((receipt) => receipt.createdAt >= adoptedAt),
    scans: ruleScans.filter((scan) => scan.createdAt >= adoptedAt),
    overrides: options.overrides,
  });
  const status = resolveImpactStatus(before, after);
  const measurement: PolicyImpactMeasurement = {
    policyId: options.policy.id,
    ruleKey: options.policy.ruleKey,
    ruleName: options.policy.ruleName,
    generatedAt: options.generatedAt,
    dataQuality: resolveDataQuality(before, after, ruleScans),
    status,
    before,
    after,
    timeline: buildTimeline({
      adoptedAt,
      adoptedVersion,
      receipts: policyReceipts,
      scans: ruleScans,
    }),
    caveats: buildCaveats(before, after, ruleScans, options.source),
    source: options.source,
  };
  if (adoptedAt !== undefined) {
    measurement.adoptedAt = adoptedAt;
  }
  if (adoptedVersion?.id !== undefined) {
    measurement.policyVersionId = adoptedVersion.id;
  }
  if (adoptedVersion?.versionNumber !== undefined) {
    measurement.policyVersionNumber = adoptedVersion.versionNumber;
  }
  return measurement;
}

function buildWindow(options: {
  receipts: ActionReceipt[];
  scans: MirrorScanRecord[];
  overrides: OverrideEvent[];
}): PolicyImpactEvidenceWindow {
  const overrideReceiptCount = options.receipts.filter(
    (receipt) => receipt.deviatesFromPolicy
  ).length;
  const unresolvedOverrideCount = options.receipts.filter((receipt) =>
    isReceiptOverrideUnresolved(receipt, options.overrides)
  ).length;
  const receiptCount = options.receipts.length;
  const sortedReceipts = [...options.receipts].sort(compareCreatedAt);
  const sortedScans = [...options.scans].sort(compareCreatedAt);
  const firstDate = sortedReceipts[0]?.createdAt ?? sortedScans[0]?.createdAt;
  const lastDate =
    sortedReceipts[sortedReceipts.length - 1]?.createdAt ??
    sortedScans[sortedScans.length - 1]?.createdAt;

  const window: PolicyImpactEvidenceWindow = {
    receiptCount,
    scanCount: options.scans.length,
    consistencyRate:
      receiptCount === 0 ? 0 : (receiptCount - overrideReceiptCount) / receiptCount,
    overrideRate: receiptCount === 0 ? 0 : overrideReceiptCount / receiptCount,
    driftCandidateCount: options.scans.reduce(
      (total, scan) => total + scan.driftCandidates.length,
      0
    ),
  };
  if (firstDate !== undefined) {
    window.startAt = firstDate;
  }
  if (lastDate !== undefined) {
    window.endAt = lastDate;
  }
  if (unresolvedOverrideCount > 0) {
    window.overrideRate = Math.max(window.overrideRate, overrideReceiptCount / receiptCount);
  }
  return window;
}

function resolveImpactStatus(
  before: PolicyImpactEvidenceWindow,
  after: PolicyImpactEvidenceWindow
): PolicyImpactStatus {
  if (
    before.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW ||
    after.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW
  ) {
    return 'insufficient_data';
  }
  if (after.consistencyRate >= before.consistencyRate + IMPACT_DELTA_THRESHOLD) {
    return 'improving';
  }
  if (after.consistencyRate <= before.consistencyRate - IMPACT_DELTA_THRESHOLD) {
    return 'regressing';
  }
  return 'stable';
}

function resolveDataQuality(
  before: PolicyImpactEvidenceWindow,
  after: PolicyImpactEvidenceWindow,
  scans: MirrorScanRecord[]
): ConsistencyAnalyticsDataQuality {
  if (
    before.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW ||
    after.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW
  ) {
    return 'insufficient';
  }
  if (scans.length < 2) {
    return 'limited';
  }
  return 'usable';
}

function buildTimeline(options: {
  adoptedAt: string;
  adoptedVersion?: PolicyVersion | undefined;
  receipts: ActionReceipt[];
  scans: MirrorScanRecord[];
}): PolicyImpactTimelineEvent[] {
  const events: PolicyImpactTimelineEvent[] = [
    {
      id: options.adoptedVersion?.id ?? `adopted-${options.adoptedAt}`,
      occurredAt: options.adoptedAt,
      label: 'Policy adopted',
      detail: `Version ${options.adoptedVersion?.versionNumber ?? 1} became the comparison point.`,
      source: 'policy_version',
    },
  ];
  for (const receipt of options.receipts.slice(0, 6)) {
    events.push({
      id: receipt.id,
      occurredAt: receipt.createdAt,
      label: receipt.deviatesFromPolicy ? 'Override receipt' : 'Consistent receipt',
      detail: `${receipt.recommendation.ruleName ?? receipt.recommendation.ruleKey}: ${receipt.selectedAction}.`,
      source: 'receipt',
    });
  }
  for (const scan of options.scans.slice(0, 4)) {
    events.push({
      id: scan.id,
      occurredAt: scan.createdAt,
      label: 'Mirror Scan',
      detail: `${scan.driftCandidates.length} drift candidate(s) for this rule context.`,
      source: 'scan',
    });
  }
  return events.sort(compareCreatedAt).slice(0, 12);
}

function buildCaveats(
  before: PolicyImpactEvidenceWindow,
  after: PolicyImpactEvidenceWindow,
  scans: MirrorScanRecord[],
  source: 'stored' | 'demo'
): string[] {
  const caveats: string[] = [];
  if (source === 'demo') {
    caveats.push('Demo impact is seeded for preview and is not live subreddit proof.');
  }
  if (before.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW) {
    caveats.push('Before-adoption receipts are below the impact threshold.');
  }
  if (after.receiptCount < MINIMUM_RECEIPTS_PER_WINDOW) {
    caveats.push('After-adoption receipts are below the impact threshold.');
  }
  if (scans.length < 2) {
    caveats.push('At least two persisted scans are needed for scan-backed caveats.');
  }
  caveats.push('Impact uses ModMirror receipts and scan history, not every Reddit moderation action.');
  return caveats;
}

function findAdoptedVersion(
  policy: RulePolicy,
  versions: PolicyVersion[]
): PolicyVersion | undefined {
  return (
    versions.find((version) => version.id === policy.activeVersionId) ??
    versions.find((version) => version.lifecycleState === 'adopted')
  );
}

function receiptMatchesPolicy(
  receipt: ActionReceipt,
  policy: RulePolicy
): boolean {
  return (
    receipt.recommendation.ruleKey === policy.ruleKey ||
    receipt.policySnapshot?.ruleKey === policy.ruleKey ||
    receipt.policySnapshot?.policyId === policy.id
  );
}

function scanHasRule(
  scan: MirrorScanRecord,
  ruleKey: string,
  ruleName: string
): boolean {
  return scan.driftCandidates.some(
    (candidate) =>
      candidate.ruleKey === ruleKey || candidate.ruleName === ruleName
  );
}

function isReceiptOverrideUnresolved(
  receipt: ActionReceipt,
  overrides: OverrideEvent[]
): boolean {
  if (receipt.overrideEventId === undefined && receipt.overrideReason === undefined) {
    return false;
  }
  const override = overrides.find((event) => event.id === receipt.overrideEventId);
  return (override?.reviewStatus ?? 'unresolved') === 'unresolved';
}

function compareCreatedAt(
  left: { createdAt?: string; occurredAt?: string },
  right: { createdAt?: string; occurredAt?: string }
): number {
  return (left.createdAt ?? left.occurredAt ?? '').localeCompare(
    right.createdAt ?? right.occurredAt ?? ''
  );
}
