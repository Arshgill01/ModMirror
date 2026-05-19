import type {
  ActionReceipt,
  ConsistencyAnalyticsDataQuality,
  ConsistencyAnalyticsSummary,
  DriftCandidate,
  MirrorScanRecord,
  OverrideEvent,
  PolicyImpactStatus,
  PolicyImpactSummary,
  PolicyImpactWindow,
  RuleDriftTrend,
  RuleDriftTrendPoint,
  RulePolicy,
  TrendDirection,
} from '../../shared/schema';
import { listRecentAuditEvents } from './audit';
import { listPolicies } from './policies';
import { listActionReceipts } from './receipts';
import { getScanRecord, listScanMetadata } from './scans';

const MINIMUM_SCANS_FOR_TREND = 2;
const MINIMUM_RECEIPTS_FOR_IMPACT = 3;
const RATE_CHANGE_THRESHOLD = 0.1;

export async function getConsistencyAnalytics(
  subreddit: string
): Promise<ConsistencyAnalyticsSummary> {
  const [metadata, receipts, policies, overrides] = await Promise.all([
    listScanMetadata(subreddit, { limit: 10 }),
    listActionReceipts(subreddit, 250),
    listPolicies(subreddit),
    listRecentAuditEvents(subreddit, 250),
  ]);
  const scans = (
    await Promise.all(
      metadata.map((scan) => getScanRecord(subreddit, scan.id))
    )
  ).filter((scan): scan is MirrorScanRecord => scan !== undefined);

  return computeConsistencyAnalytics({
    subreddit,
    scans,
    receipts,
    policies,
    overrides,
    generatedAt: new Date().toISOString(),
  });
}

export function computeConsistencyAnalytics(options: {
  subreddit: string;
  scans: MirrorScanRecord[];
  receipts: ActionReceipt[];
  policies: RulePolicy[];
  overrides: OverrideEvent[];
  generatedAt: string;
}): ConsistencyAnalyticsSummary {
  const scans = [...options.scans].sort(compareCreatedAt);
  const receipts = [...options.receipts].sort(compareCreatedAt);
  const activePolicies = options.policies.filter((policy) => policy.active);
  const ruleTrends = buildRuleTrends(scans);
  const policyImpacts = activePolicies.map((policy) =>
    buildPolicyImpact(policy, receipts, options.overrides)
  );
  const caveats = buildAnalyticsCaveats({
    scans,
    receipts,
    ruleTrends,
    policyImpacts,
  });

  return {
    subreddit: options.subreddit,
    generatedAt: options.generatedAt,
    scanCount: scans.length,
    receiptCount: receipts.length,
    dataQuality: resolveDataQuality(scans, receipts),
    caveats,
    ruleTrends,
    policyImpacts,
  };
}

function buildRuleTrends(scans: MirrorScanRecord[]): RuleDriftTrend[] {
  const pointsByRule = new Map<string, RuleDriftTrendPoint[]>();
  const labelsByRule = new Map<string, { ruleKey?: string; ruleName: string }>();

  for (const scan of scans) {
    for (const candidate of scan.driftCandidates) {
      const key = candidate.ruleKey ?? candidate.ruleName;
      pointsByRule.set(key, [
        ...(pointsByRule.get(key) ?? []),
        toTrendPoint(scan, candidate),
      ]);
      labelsByRule.set(key, {
        ...(candidate.ruleKey ? { ruleKey: candidate.ruleKey } : {}),
        ruleName: candidate.ruleName,
      });
    }
  }

  return [...pointsByRule.entries()]
    .map(([key, points]) => {
      const labels = labelsByRule.get(key) ?? { ruleName: key };
      const latest = points[points.length - 1];
      const trend: RuleDriftTrend = {
        ...labels,
        status: resolveTrendDirection(points),
        points,
        latestDistribution: latest?.actionDistribution ?? {},
        caveats: buildTrendCaveats(points),
      };
      return trend;
    })
    .sort((left, right) => right.points.length - left.points.length);
}

function toTrendPoint(
  scan: MirrorScanRecord,
  candidate: DriftCandidate
): RuleDriftTrendPoint {
  return {
    scanId: scan.id,
    createdAt: scan.createdAt,
    source: scan.source,
    depth: scan.scanDepth.depth,
    totalActions: candidate.totalActions,
    distinctActions: Object.keys(candidate.actionDistribution).length,
    confidence: candidate.confidence,
    actionDistribution: candidate.actionDistribution,
  };
}

function resolveTrendDirection(points: RuleDriftTrendPoint[]): TrendDirection {
  if (points.length < MINIMUM_SCANS_FOR_TREND) {
    return 'insufficient_data';
  }

  const first = points[0];
  const latest = points[points.length - 1];
  if (first === undefined || latest === undefined) {
    return 'insufficient_data';
  }
  if (latest.distinctActions < first.distinctActions) {
    return 'improving';
  }
  if (latest.distinctActions > first.distinctActions) {
    return 'regressing';
  }
  return 'stable';
}

function buildTrendCaveats(points: RuleDriftTrendPoint[]): string[] {
  const caveats: string[] = [];
  if (points.length < MINIMUM_SCANS_FOR_TREND) {
    caveats.push('At least two persisted scans are needed for a trend.');
  }
  if (points.some((point) => point.source === 'demo')) {
    caveats.push('Demo scans are useful for preview, not live policy proof.');
  }
  if (points.some((point) => point.depth !== 'deep')) {
    caveats.push('Some scans use quick or standard depth, so older history may be missing.');
  }
  return caveats;
}

function buildPolicyImpact(
  policy: RulePolicy,
  receipts: ActionReceipt[],
  overrides: OverrideEvent[]
): PolicyImpactSummary {
  const policyReceipts = receipts.filter((receipt) =>
    receiptMatchesPolicy(receipt, policy)
  );
  const adoptedAt = policy.activeVersionId ? policy.updatedAt : policy.createdAt;
  const beforeReceipts = policyReceipts.filter(
    (receipt) => receipt.createdAt < adoptedAt
  );
  const afterReceipts = policyReceipts.filter(
    (receipt) => receipt.createdAt >= adoptedAt
  );
  const before = buildImpactWindow(beforeReceipts, overrides);
  const after = buildImpactWindow(afterReceipts, overrides);
  const status = resolvePolicyImpactStatus(before, after);
  const summary: PolicyImpactSummary = {
    policyId: policy.id,
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    adoptedAt,
    status,
    before,
    after,
    caveats: buildPolicyImpactCaveats(before, after),
  };
  if (policy.activeVersionId !== undefined) {
    summary.policyVersionId = policy.activeVersionId;
  }
  return summary;
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

function buildImpactWindow(
  receipts: ActionReceipt[],
  overrides: OverrideEvent[]
): PolicyImpactWindow {
  const overrideCount = receipts.filter((receipt) => receipt.deviatesFromPolicy)
    .length;
  const unresolvedOverrideCount = receipts.filter((receipt) =>
    isReceiptOverrideUnresolved(receipt, overrides)
  ).length;
  const receiptCount = receipts.length;

  return {
    receiptCount,
    adherenceRate: receiptCount === 0 ? 0 : (receiptCount - overrideCount) / receiptCount,
    overrideRate: receiptCount === 0 ? 0 : overrideCount / receiptCount,
    unresolvedOverrideCount,
  };
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

function resolvePolicyImpactStatus(
  before: PolicyImpactWindow,
  after: PolicyImpactWindow
): PolicyImpactStatus {
  if (after.receiptCount < MINIMUM_RECEIPTS_FOR_IMPACT) {
    return 'insufficient_data';
  }
  if (before.receiptCount < MINIMUM_RECEIPTS_FOR_IMPACT) {
    return 'new_policy_tracking';
  }
  if (after.adherenceRate >= before.adherenceRate + RATE_CHANGE_THRESHOLD) {
    return 'improving';
  }
  if (after.adherenceRate <= before.adherenceRate - RATE_CHANGE_THRESHOLD) {
    return 'regressing';
  }
  return 'stable';
}

function buildPolicyImpactCaveats(
  before: PolicyImpactWindow,
  after: PolicyImpactWindow
): string[] {
  const caveats: string[] = [];
  if (after.receiptCount < MINIMUM_RECEIPTS_FOR_IMPACT) {
    caveats.push('Not enough post-policy receipts for an impact claim.');
  }
  if (before.receiptCount < MINIMUM_RECEIPTS_FOR_IMPACT) {
    caveats.push('Before-policy receipt history is limited.');
  }
  caveats.push('Receipts are stronger than inferred mod-log matches, but only cover ModMirror Apply Policy usage.');
  return caveats;
}

function buildAnalyticsCaveats(options: {
  scans: MirrorScanRecord[];
  receipts: ActionReceipt[];
  ruleTrends: RuleDriftTrend[];
  policyImpacts: PolicyImpactSummary[];
}): string[] {
  const caveats: string[] = [];
  if (options.scans.length < MINIMUM_SCANS_FOR_TREND) {
    caveats.push('At least two persisted scans are needed for drift-over-time analytics.');
  }
  if (options.receipts.length < MINIMUM_RECEIPTS_FOR_IMPACT) {
    caveats.push('At least three receipts are needed for policy impact analytics.');
  }
  if (options.ruleTrends.length === 0) {
    caveats.push('No repeated drift candidates are available yet.');
  }
  if (
    options.policyImpacts.some(
      (impact) => impact.status === 'insufficient_data'
    )
  ) {
    caveats.push('Some policy impact cards are withheld because data is insufficient.');
  }
  return caveats;
}

function resolveDataQuality(
  scans: MirrorScanRecord[],
  receipts: ActionReceipt[]
): ConsistencyAnalyticsDataQuality {
  if (
    scans.length < MINIMUM_SCANS_FOR_TREND &&
    receipts.length < MINIMUM_RECEIPTS_FOR_IMPACT
  ) {
    return 'insufficient';
  }
  if (
    scans.length < MINIMUM_SCANS_FOR_TREND ||
    receipts.length < MINIMUM_RECEIPTS_FOR_IMPACT
  ) {
    return 'limited';
  }
  return 'usable';
}

function compareCreatedAt(
  left: { createdAt: string },
  right: { createdAt: string }
): number {
  return left.createdAt.localeCompare(right.createdAt);
}
