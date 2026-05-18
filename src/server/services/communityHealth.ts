import { createHash } from 'node:crypto';
import type {
  ActionEvent,
  ActionReceipt,
  CommunityHealthDataQuality,
  CommunityHealthRuleSignal,
  CommunityHealthStatus,
  CommunityHealthSummary,
  DriftStabilityStatus,
  MirrorScanRecord,
  OverrideEvent,
  PolicyChangeEvent,
  RulePolicy,
} from '../../shared/schema';
import { listRecentActionEvents, listRecentAuditEvents } from './audit';
import { listPolicyChangeEvents, listPolicies } from './policies';
import { listActionReceipts } from './receipts';
import { getScanRecord, listScanMetadata } from './scans';

const MINIMUM_ACTIONS_FOR_HEALTH = 5;
const WATCH_CONSISTENCY_RATE = 0.75;

export async function getCommunityHealthSummary(
  subreddit: string
): Promise<CommunityHealthSummary> {
  const [policies, actions, overrides, receipts, scanMetadata] =
    await Promise.all([
      listPolicies(subreddit),
      listRecentActionEvents(subreddit, 250),
      listRecentAuditEvents(subreddit, 250),
      listActionReceipts(subreddit, 250),
      listScanMetadata(subreddit, { limit: 10 }),
    ]);
  const [scans, policyChanges] = await Promise.all([
    Promise.all(
      scanMetadata.map((metadata) => getScanRecord(subreddit, metadata.id))
    ),
    Promise.all(
      policies.map((policy) => listPolicyChangeEvents(subreddit, policy.id))
    ),
  ]);

  return computeCommunityHealth({
    subreddit,
    generatedAt: new Date().toISOString(),
    policies,
    actions,
    overrides,
    receipts,
    scans: scans.filter((scan): scan is MirrorScanRecord => scan !== undefined),
    policyChanges: policyChanges.flat(),
  });
}

export function computeCommunityHealth(options: {
  subreddit: string;
  generatedAt: string;
  policies: RulePolicy[];
  actions: ActionEvent[];
  overrides: OverrideEvent[];
  receipts: ActionReceipt[];
  scans: MirrorScanRecord[];
  policyChanges: PolicyChangeEvent[];
}): CommunityHealthSummary {
  const actionCount = options.actions.length;
  const overrideCount = options.overrides.length;
  const unresolvedOverrideCount = options.overrides.filter(
    (event) => (event.reviewStatus ?? 'unresolved') === 'unresolved'
  ).length;
  const ruleSignals = buildRuleSignals({
    policies: options.policies,
    actions: options.actions,
    overrides: options.overrides,
  });
  const status = resolveCommunityStatus({
    actionCount,
    unresolvedOverrideCount,
    ruleSignals,
  });
  const dataQuality = resolveDataQuality({
    actions: options.actions,
    receipts: options.receipts,
    scans: options.scans,
  });

  return {
    subreddit: options.subreddit,
    generatedAt: options.generatedAt,
    dataQuality,
    status,
    scanCount: options.scans.length,
    receiptCount: options.receipts.length,
    actionCount,
    overrideCount,
    unresolvedOverrideCount,
    policyChurnCount: options.policyChanges.length,
    driftStability: resolveDriftStability(options.scans),
    casePacketVolume: {
      eligibleReceiptCount: options.receipts.length,
      persistedPacketCount: 0,
      source: 'not_persisted',
      note: 'Case packets are generated on demand; persisted packet volume is not tracked yet.',
    },
    ruleSignals,
    privacyGuardrails: [
      'No per-moderator leaderboard fields are emitted.',
      'Repeat-offense signals are aggregated by rule and do not expose usernames.',
      'Small-sample states are labeled before health claims are made.',
    ],
    caveats: buildCaveats(dataQuality, options.scans, options.receipts),
  };
}

function buildRuleSignals(options: {
  policies: RulePolicy[];
  actions: ActionEvent[];
  overrides: OverrideEvent[];
}): CommunityHealthRuleSignal[] {
  const ruleKeys = new Set([
    ...options.policies.map((policy) => policy.ruleKey),
    ...options.actions.map((event) => event.ruleKey),
    ...options.overrides.map((event) => event.ruleKey),
  ]);

  return [...ruleKeys]
    .map((ruleKey) =>
      buildRuleSignal({
        ruleKey,
        policies: options.policies,
        actions: options.actions,
        overrides: options.overrides,
      })
    )
    .sort((left, right) => right.actionCount - left.actionCount);
}

function buildRuleSignal(options: {
  ruleKey: string;
  policies: RulePolicy[];
  actions: ActionEvent[];
  overrides: OverrideEvent[];
}): CommunityHealthRuleSignal {
  const policy = options.policies.find(
    (candidate) => candidate.ruleKey === options.ruleKey
  );
  const actions = options.actions.filter(
    (event) => event.ruleKey === options.ruleKey
  );
  const overrides = options.overrides.filter(
    (event) => event.ruleKey === options.ruleKey
  );
  const consistentActionCount = actions.filter(
    (event) => event.selectedAction === event.recommendedAction
  ).length;
  const unresolvedOverrideCount = overrides.filter(
    (event) => (event.reviewStatus ?? 'unresolved') === 'unresolved'
  ).length;
  const repeatAuthorCount = countRepeatAuthors(actions);
  const consistencyRate =
    actions.length === 0 ? 0 : consistentActionCount / actions.length;
  const overrideRate = actions.length === 0 ? 0 : overrides.length / actions.length;
  const status = resolveRuleStatus({
    actionCount: actions.length,
    consistencyRate,
    unresolvedOverrideCount,
  });

  const signal: CommunityHealthRuleSignal = {
    ruleKey: options.ruleKey,
    actionCount: actions.length,
    consistentActionCount,
    overrideCount: overrides.length,
    unresolvedOverrideCount,
    repeatAuthorCount,
    consistencyRate,
    overrideRate,
    status,
    notes: buildRuleNotes({
      status,
      actionCount: actions.length,
      repeatAuthorCount,
      unresolvedOverrideCount,
    }),
  };
  const ruleName = policy?.ruleName ?? actions[0]?.ruleName ?? overrides[0]?.ruleName;
  if (ruleName !== undefined) {
    signal.ruleName = ruleName;
  }
  return signal;
}

function countRepeatAuthors(actions: ActionEvent[]): number {
  const counts = new Map<string, number>();
  for (const action of actions) {
    if (action.targetAuthor === undefined) {
      continue;
    }
    const authorHash = createHash('sha256')
      .update(action.targetAuthor.toLowerCase())
      .digest('hex')
      .slice(0, 16);
    counts.set(authorHash, (counts.get(authorHash) ?? 0) + 1);
  }
  return [...counts.values()].filter((count) => count > 1).length;
}

function resolveRuleStatus(options: {
  actionCount: number;
  consistencyRate: number;
  unresolvedOverrideCount: number;
}): CommunityHealthStatus {
  if (options.actionCount < MINIMUM_ACTIONS_FOR_HEALTH) {
    return 'insufficient_data';
  }
  if (options.unresolvedOverrideCount > 0) {
    return 'needs_review';
  }
  if (options.consistencyRate < WATCH_CONSISTENCY_RATE) {
    return 'watch';
  }
  return 'stable';
}

function resolveCommunityStatus(options: {
  actionCount: number;
  unresolvedOverrideCount: number;
  ruleSignals: CommunityHealthRuleSignal[];
}): CommunityHealthStatus {
  if (options.actionCount < MINIMUM_ACTIONS_FOR_HEALTH) {
    return 'insufficient_data';
  }
  if (
    options.unresolvedOverrideCount > 0 ||
    options.ruleSignals.some((signal) => signal.status === 'needs_review')
  ) {
    return 'needs_review';
  }
  if (options.ruleSignals.some((signal) => signal.status === 'watch')) {
    return 'watch';
  }
  return 'stable';
}

function resolveDataQuality(options: {
  actions: ActionEvent[];
  receipts: ActionReceipt[];
  scans: MirrorScanRecord[];
}): CommunityHealthDataQuality {
  if (
    options.actions.length === 0 &&
    options.receipts.length === 0 &&
    options.scans.length === 0
  ) {
    return 'empty';
  }
  if (options.actions.length < MINIMUM_ACTIONS_FOR_HEALTH) {
    return 'small_sample';
  }
  return 'usable';
}

function resolveDriftStability(scans: MirrorScanRecord[]): DriftStabilityStatus {
  const sorted = [...scans].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
  if (sorted.length < 2) {
    return 'insufficient_data';
  }
  const first = sorted[0];
  const latest = sorted[sorted.length - 1];
  if (first === undefined || latest === undefined) {
    return 'insufficient_data';
  }
  if (latest.driftCandidates.length < first.driftCandidates.length) {
    return 'improving';
  }
  if (latest.driftCandidates.length > first.driftCandidates.length) {
    return 'regressing';
  }
  return 'stable';
}

function buildRuleNotes(options: {
  status: CommunityHealthStatus;
  actionCount: number;
  repeatAuthorCount: number;
  unresolvedOverrideCount: number;
}): string[] {
  if (options.status === 'insufficient_data') {
    return [
      `Only ${options.actionCount} tracked action(s); more history is needed before making a health claim.`,
    ];
  }
  const notes: string[] = [];
  if (options.unresolvedOverrideCount > 0) {
    notes.push(`${options.unresolvedOverrideCount} unresolved override(s).`);
  }
  if (options.repeatAuthorCount > 0) {
    notes.push(`${options.repeatAuthorCount} repeat author bucket(s).`);
  }
  return notes.length > 0 ? notes : ['Rule consistency is stable in stored data.'];
}

function buildCaveats(
  dataQuality: CommunityHealthDataQuality,
  scans: MirrorScanRecord[],
  receipts: ActionReceipt[]
): string[] {
  const caveats: string[] = [];
  if (dataQuality === 'empty') {
    caveats.push('No stored ModMirror actions, receipts, or scans are available yet.');
  }
  if (dataQuality === 'small_sample') {
    caveats.push('Small communities need more tracked actions before health claims are reliable.');
  }
  if (scans.length < 2) {
    caveats.push('At least two persisted scans are needed for drift stability.');
  }
  if (receipts.length === 0) {
    caveats.push('Receipt-backed case packet volume is unavailable until Apply Policy is used.');
  }
  return caveats;
}
