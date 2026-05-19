import type {
  ActionReceipt,
  AttributedModAction,
  Confidence,
  ConsistencyAnalyticsDataQuality,
  DriftCandidate,
  EnforcementAction,
  MirrorScanRecord,
  OverrideEvent,
  PolicyImpactStatus,
  PolicyReplayResult,
  RulePolicy,
  TrendDirection,
} from '../../shared/schema';
import { getSmallSubredditThresholdStatus } from '../../shared/scoring';
import { computeConsistencyAnalytics } from './analytics';
import { runPolicyReplay, toPolicyReplayActions } from './replaySandbox';

export const SYNTHETIC_EVAL_SCHEMA_VERSION = 'modmirror.synthetic-eval.v1';
export const SYNTHETIC_EVAL_GENERATED_AT = '2026-05-18T18:00:00.000Z';
export const SYNTHETIC_EVAL_SUBREDDIT = 'SyntheticLearningLab';

export const SYNTHETIC_EVAL_SCENARIO_IDS = [
  'stable_rule',
  'high_drift',
  'policy_improved',
  'small_subreddit',
  'noisy_attribution',
  'repeated_offender',
  'policy_version_change',
  'incident_mode',
] as const;

export type SyntheticEvalScenarioId =
  (typeof SYNTHETIC_EVAL_SCENARIO_IDS)[number];

export interface SyntheticEvalDataset {
  id: SyntheticEvalScenarioId;
  label: string;
  description: string;
  generatedAt: string;
  subreddit: string;
  policy: RulePolicy;
  actions: AttributedModAction[];
  scans: MirrorScanRecord[];
  receipts: ActionReceipt[];
  overrides: OverrideEvent[];
  expected: SyntheticEvalExpectedOutcome;
  notes: string[];
}

export interface SyntheticEvalExpectedOutcome {
  replay: SyntheticReplayExpectation;
  analytics: SyntheticAnalyticsExpectation;
  drift: SyntheticDriftExpectation;
  safeguards: SyntheticSafeguardExpectation;
}

export interface SyntheticReplayExpectation {
  totalActionsEvaluated: number;
  matchedPolicyCount: number;
  changedRecommendationCount: number;
  skippedActionCount: number;
}

export interface SyntheticAnalyticsExpectation {
  dataQuality: ConsistencyAnalyticsDataQuality;
  ruleTrendStatusByRule: Record<string, TrendDirection>;
  policyImpactStatusByRule: Record<string, PolicyImpactStatus>;
}

export interface SyntheticDriftExpectation {
  candidateCount: number;
  latestDistinctActions: number;
  latestTotalActions: number;
  smallSubredditMeetsThreshold: boolean;
  unmatchedCount: number;
}

export interface SyntheticSafeguardExpectation {
  liveReceiptAttempts: number;
  incidentReceiptCount: number;
  syntheticScanWarningCount: number;
}

export interface SyntheticEvalManifest {
  schemaVersion: typeof SYNTHETIC_EVAL_SCHEMA_VERSION;
  generatedAt: string;
  scenarioCount: number;
  scenarios: SyntheticEvalScenarioResult[];
}

export interface SyntheticEvalScenarioResult {
  id: SyntheticEvalScenarioId;
  actionCount: number;
  scanCount: number;
  receiptCount: number;
  overrideCount: number;
  replay: SyntheticReplayExpectation;
  analytics: SyntheticAnalyticsExpectation;
  drift: SyntheticDriftExpectation;
  safeguards: SyntheticSafeguardExpectation;
}

export interface SyntheticEvalValidationResult {
  passed: boolean;
  failures: string[];
  manifest: SyntheticEvalManifest;
}

type ActionSpec = {
  id: string;
  normalizedAction: EnforcementAction;
  targetAuthor: string;
  minuteOffset: number;
  ruleKey?: string | null;
  ruleName?: string | null;
  confidence?: Confidence;
  source?: AttributedModAction['source'];
};

type ReceiptSpec = {
  id: string;
  createdAt: string;
  deviatesFromPolicy: boolean;
  selectedAction?: EnforcementAction;
  overrideEventId?: string;
  incidentId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
};

const RULE_KEY = 'low-effort-questions-2';
const RULE_NAME = 'Low-effort questions';
const OTHER_RULE_KEY = 'self-promotion-3';
const OTHER_RULE_NAME = 'Self-promotion';
const BASE_TIME = Date.parse('2026-05-18T09:00:00.000Z');
const SYNTHETIC_SCAN_WARNING =
  'Synthetic evaluation fixture: not live Reddit history.';

export function buildSyntheticEvalDataset(
  id: SyntheticEvalScenarioId
): SyntheticEvalDataset {
  switch (id) {
    case 'stable_rule':
      return stableRuleDataset();
    case 'high_drift':
      return highDriftDataset();
    case 'policy_improved':
      return policyImprovedDataset();
    case 'small_subreddit':
      return smallSubredditDataset();
    case 'noisy_attribution':
      return noisyAttributionDataset();
    case 'repeated_offender':
      return repeatedOffenderDataset();
    case 'policy_version_change':
      return policyVersionChangeDataset();
    case 'incident_mode':
      return incidentModeDataset();
  }
}

export function buildAllSyntheticEvalDatasets(): SyntheticEvalDataset[] {
  return SYNTHETIC_EVAL_SCENARIO_IDS.map((id) =>
    buildSyntheticEvalDataset(id)
  );
}

export function evaluateSyntheticEvalDataset(
  dataset: SyntheticEvalDataset
): SyntheticEvalScenarioResult {
  const replay = runPolicyReplay({
    subreddit: dataset.subreddit,
    policy: dataset.policy,
    source: 'synthetic',
    actions: toPolicyReplayActions(dataset.actions),
    generatedAt: dataset.generatedAt,
  });
  const analytics = computeConsistencyAnalytics({
    subreddit: dataset.subreddit,
    scans: dataset.scans,
    receipts: dataset.receipts,
    policies: [dataset.policy],
    overrides: dataset.overrides,
    generatedAt: dataset.generatedAt,
  });
  const latestScan = latestByCreatedAt(dataset.scans);
  const latestRuleTrend = analytics.ruleTrends.find(
    (trend) => trend.ruleKey === dataset.policy.ruleKey
  );
  const latestDriftPoint = latestRuleTrend?.points.at(-1);

  return {
    id: dataset.id,
    actionCount: dataset.actions.length,
    scanCount: dataset.scans.length,
    receiptCount: dataset.receipts.length,
    overrideCount: dataset.overrides.length,
    replay: summarizeReplay(replay),
    analytics: {
      dataQuality: analytics.dataQuality,
      ruleTrendStatusByRule: Object.fromEntries(
        analytics.ruleTrends.map((trend) => [
          trend.ruleKey ?? trend.ruleName,
          trend.status,
        ])
      ),
      policyImpactStatusByRule: Object.fromEntries(
        analytics.policyImpacts.map((impact) => [
          impact.ruleKey,
          impact.status,
        ])
      ),
    },
    drift: {
      candidateCount: latestScan?.driftCandidates.length ?? 0,
      latestDistinctActions: latestDriftPoint?.distinctActions ?? 0,
      latestTotalActions: latestDriftPoint?.totalActions ?? 0,
      smallSubredditMeetsThreshold:
        latestScan?.smallSubredditStatus.meetsThreshold ?? false,
      unmatchedCount: latestScan?.unmatchedCount ?? 0,
    },
    safeguards: {
      liveReceiptAttempts: dataset.receipts.filter(
        (receipt) =>
          receipt.executionMode === 'live' && receipt.executionAttempted
      ).length,
      incidentReceiptCount: dataset.receipts.filter(
        (receipt) => receipt.incidentId !== undefined
      ).length,
      syntheticScanWarningCount: dataset.scans.filter((scan) =>
        scan.warnings.includes(SYNTHETIC_SCAN_WARNING)
      ).length,
    },
  };
}

export function buildSyntheticEvalManifest(): SyntheticEvalManifest {
  const scenarios = buildAllSyntheticEvalDatasets().map((dataset) =>
    evaluateSyntheticEvalDataset(dataset)
  );
  return {
    schemaVersion: SYNTHETIC_EVAL_SCHEMA_VERSION,
    generatedAt: SYNTHETIC_EVAL_GENERATED_AT,
    scenarioCount: scenarios.length,
    scenarios,
  };
}

export function validateSyntheticEvalDatasets(
  expectedManifest?: SyntheticEvalManifest
): SyntheticEvalValidationResult {
  const manifest = buildSyntheticEvalManifest();
  const failures = buildAllSyntheticEvalDatasets().flatMap((dataset) =>
    validationFailuresForDataset(dataset, evaluateSyntheticEvalDataset(dataset))
  );

  if (
    expectedManifest !== undefined &&
    JSON.stringify(manifest) !== JSON.stringify(expectedManifest)
  ) {
    failures.push('Synthetic evaluation manifest differs from the golden file.');
  }

  return {
    passed: failures.length === 0,
    failures,
    manifest,
  };
}

function stableRuleDataset(): SyntheticEvalDataset {
  const policy = policyFixture({
    createdAt: '2026-05-18T08:00:00.000Z',
    updatedAt: '2026-05-18T08:00:00.000Z',
  });
  const actions = actionsFromSpecs([
    actionSpec('stable-1', 'warn', 'learner_a', 0),
    actionSpec('stable-2', 'warn', 'learner_b', 5),
    actionSpec('stable-3', 'remove', 'learner_a', 10),
    actionSpec('stable-4', 'warn', 'learner_c', 15),
    actionSpec('stable-5', 'remove', 'learner_b', 20),
    actionSpec('stable-6', 'temporary_ban_suggested', 'learner_a', 25),
  ]);
  const scans = [
    scanFixture('stable-scan-1', policy, actions.slice(0, 3), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 2, remove: 1 },
    }),
    scanFixture('stable-scan-2', policy, actions, {
      createdAt: '2026-05-18T11:00:00.000Z',
      distribution: { warn: 3, remove: 2, temporary_ban_suggested: 1 },
    }),
  ];
  return dataset('stable_rule', policy, actions, scans, [], [], {
    replay: replayExpectation(6, 6, 0, 0),
    analytics: analyticsExpectation('limited', { [RULE_KEY]: 'regressing' }, {
      [RULE_KEY]: 'insufficient_data',
    }),
    drift: driftExpectation(1, 3, 6, false, 0),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function highDriftDataset(): SyntheticEvalDataset {
  const policy = policyFixture();
  const actions = actionsFromSpecs([
    actionSpec('drift-1', 'warn', 'learner_a', 0),
    actionSpec('drift-2', 'remove', 'learner_b', 5),
    actionSpec('drift-3', 'temporary_ban_suggested', 'learner_c', 10),
    actionSpec('drift-4', 'remove', 'learner_d', 15),
    actionSpec('drift-5', 'warn', 'learner_e', 20),
    actionSpec('drift-6', 'approve', 'learner_f', 25),
    actionSpec('drift-7', 'remove', 'learner_g', 30),
    actionSpec('drift-8', 'manual_review', 'learner_h', 35),
  ]);
  const scans = [
    scanFixture('drift-scan-1', policy, actions.slice(0, 4), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 1, remove: 2, temporary_ban_suggested: 1 },
    }),
    scanFixture('drift-scan-2', policy, actions, {
      createdAt: '2026-05-18T11:00:00.000Z',
      distribution: {
        warn: 2,
        remove: 3,
        temporary_ban_suggested: 1,
        approve: 1,
        manual_review: 1,
      },
    }),
  ];
  return dataset('high_drift', policy, actions, scans, [], [], {
    replay: replayExpectation(8, 2, 6, 0),
    analytics: analyticsExpectation('limited', { [RULE_KEY]: 'regressing' }, {
      [RULE_KEY]: 'insufficient_data',
    }),
    drift: driftExpectation(1, 5, 8, true, 0),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function policyImprovedDataset(): SyntheticEvalDataset {
  const policy = policyFixture({
    createdAt: '2026-05-18T08:00:00.000Z',
    updatedAt: '2026-05-18T12:00:00.000Z',
    activeVersionId: 'synthetic-policy-v2',
    activeVersionNumber: 2,
  });
  const actions = actionsFromSpecs([
    actionSpec('improved-1', 'remove', 'learner_a', 0),
    actionSpec('improved-2', 'temporary_ban_suggested', 'learner_b', 5),
    actionSpec('improved-3', 'warn', 'learner_c', 10),
    actionSpec('improved-4', 'warn', 'learner_d', 15),
    actionSpec('improved-5', 'warn', 'learner_e', 20),
  ]);
  const scans = [
    scanFixture('improved-scan-1', policy, actions.slice(0, 3), {
      createdAt: '2026-05-18T10:30:00.000Z',
      distribution: { remove: 1, temporary_ban_suggested: 1, warn: 1 },
    }),
    scanFixture('improved-scan-2', policy, actions.slice(2), {
      createdAt: '2026-05-18T13:30:00.000Z',
      distribution: { warn: 3 },
    }),
  ];
  const overrides = [
    overrideFixture('improved-override-1', 'receipt-improved-before-1'),
    overrideFixture('improved-override-2', 'receipt-improved-before-2'),
    overrideFixture('improved-override-3', 'receipt-improved-before-4'),
    overrideFixture('improved-override-4', 'receipt-improved-after-5'),
  ];
  const receipts = [
    receiptFixture('improved-before-1', policy, {
      createdAt: '2026-05-18T10:00:00.000Z',
      deviatesFromPolicy: true,
      overrideEventId: 'improved-override-1',
    }),
    receiptFixture('improved-before-2', policy, {
      createdAt: '2026-05-18T10:10:00.000Z',
      deviatesFromPolicy: true,
      overrideEventId: 'improved-override-2',
    }),
    receiptFixture('improved-before-3', policy, {
      createdAt: '2026-05-18T10:20:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('improved-before-4', policy, {
      createdAt: '2026-05-18T10:30:00.000Z',
      deviatesFromPolicy: true,
      overrideEventId: 'improved-override-3',
    }),
    receiptFixture('improved-after-1', policy, {
      createdAt: '2026-05-18T12:10:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('improved-after-2', policy, {
      createdAt: '2026-05-18T12:20:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('improved-after-3', policy, {
      createdAt: '2026-05-18T12:30:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('improved-after-4', policy, {
      createdAt: '2026-05-18T12:40:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('improved-after-5', policy, {
      createdAt: '2026-05-18T12:50:00.000Z',
      deviatesFromPolicy: true,
      overrideEventId: 'improved-override-4',
    }),
  ];
  return dataset('policy_improved', policy, actions, scans, receipts, overrides, {
    replay: replayExpectation(5, 3, 2, 0),
    analytics: analyticsExpectation('usable', { [RULE_KEY]: 'improving' }, {
      [RULE_KEY]: 'improving',
    }),
    drift: driftExpectation(1, 1, 3, false, 0),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function smallSubredditDataset(): SyntheticEvalDataset {
  const policy = policyFixture();
  const actions = actionsFromSpecs([
    actionSpec('small-1', 'warn', 'learner_a', 0),
    actionSpec('small-2', 'remove', 'learner_b', 5),
    actionSpec('small-3', 'warn', 'learner_c', 10),
  ]);
  const scans = [
    scanFixture('small-scan-1', policy, actions, {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 2, remove: 1 },
    }),
  ];
  return dataset('small_subreddit', policy, actions, scans, [], [], {
    replay: replayExpectation(3, 2, 1, 0),
    analytics: analyticsExpectation('insufficient', {
      [RULE_KEY]: 'insufficient_data',
    }, { [RULE_KEY]: 'insufficient_data' }),
    drift: driftExpectation(1, 2, 3, false, 0),
    safeguards: safeguardsExpectation(0, 0, 1),
  });
}

function noisyAttributionDataset(): SyntheticEvalDataset {
  const policy = policyFixture();
  const actions = actionsFromSpecs([
    actionSpec('noisy-1', 'warn', 'learner_a', 0, { confidence: 'high' }),
    actionSpec('noisy-2', 'remove', 'learner_b', 5, { confidence: 'medium' }),
    actionSpec('noisy-3', 'warn', 'learner_c', 10, { confidence: 'low' }),
    actionSpec('noisy-4', 'approve', 'learner_d', 15, {
      confidence: 'unmatched',
      ruleKey: null,
      ruleName: null,
    }),
    actionSpec('noisy-5', 'remove', 'learner_e', 20, {
      confidence: 'high',
      ruleKey: OTHER_RULE_KEY,
      ruleName: OTHER_RULE_NAME,
    }),
    actionSpec('noisy-6', 'manual_review', 'learner_f', 25, {
      confidence: 'unmatched',
      ruleKey: null,
      ruleName: null,
    }),
    actionSpec('noisy-7', 'note', 'learner_g', 30, { confidence: 'high' }),
    actionSpec('noisy-8', 'warn', 'learner_h', 35, { confidence: 'medium' }),
  ]);
  const scans = [
    scanFixture('noisy-scan-1', policy, actions.slice(0, 4), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 2, remove: 1 },
    }),
    scanFixture('noisy-scan-2', policy, actions, {
      createdAt: '2026-05-18T11:00:00.000Z',
      distribution: { warn: 3, remove: 1, note: 1 },
    }),
  ];
  return dataset('noisy_attribution', policy, actions, scans, [], [], {
    replay: replayExpectation(5, 3, 2, 3),
    analytics: analyticsExpectation('limited', { [RULE_KEY]: 'regressing' }, {
      [RULE_KEY]: 'insufficient_data',
    }),
    drift: driftExpectation(1, 3, 5, true, 2),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function repeatedOffenderDataset(): SyntheticEvalDataset {
  const policy = policyFixture();
  const actions = actionsFromSpecs([
    actionSpec('repeat-1', 'warn', 'repeat_learner', 0),
    actionSpec('repeat-2', 'warn', 'repeat_learner', 5),
    actionSpec('repeat-3', 'remove', 'repeat_learner', 10),
    actionSpec('repeat-4', 'remove', 'repeat_learner', 15),
    actionSpec('repeat-5', 'temporary_ban_suggested', 'repeat_learner', 20),
  ]);
  const scans = [
    scanFixture('repeat-scan-1', policy, actions.slice(0, 3), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 2, remove: 1 },
    }),
    scanFixture('repeat-scan-2', policy, actions, {
      createdAt: '2026-05-18T11:00:00.000Z',
      distribution: { warn: 2, remove: 2, temporary_ban_suggested: 1 },
    }),
  ];
  return dataset('repeated_offender', policy, actions, scans, [], [], {
    replay: replayExpectation(5, 2, 3, 0),
    analytics: analyticsExpectation('limited', { [RULE_KEY]: 'regressing' }, {
      [RULE_KEY]: 'insufficient_data',
    }),
    drift: driftExpectation(1, 3, 5, false, 0),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function policyVersionChangeDataset(): SyntheticEvalDataset {
  const policy = policyFixture({
    createdAt: '2026-05-18T08:00:00.000Z',
    updatedAt: '2026-05-18T12:00:00.000Z',
    activeVersionId: 'synthetic-policy-v2',
    activeVersionNumber: 2,
  });
  const actions = actionsFromSpecs([
    actionSpec('version-1', 'remove', 'learner_a', 0),
    actionSpec('version-2', 'remove', 'learner_b', 5),
    actionSpec('version-3', 'remove', 'learner_c', 10),
    actionSpec('version-4', 'warn', 'learner_d', 15),
    actionSpec('version-5', 'warn', 'learner_e', 20),
  ]);
  const scans = [
    scanFixture('version-scan-1', policy, actions.slice(0, 3), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { remove: 3 },
    }),
    scanFixture('version-scan-2', policy, actions.slice(3), {
      createdAt: '2026-05-18T13:00:00.000Z',
      distribution: { warn: 2 },
    }),
  ];
  const receipts = [
    receiptFixture('version-before-1', policy, {
      createdAt: '2026-05-18T10:00:00.000Z',
      deviatesFromPolicy: true,
      policyVersionId: 'synthetic-policy-v1',
      policyVersionNumber: 1,
    }),
    receiptFixture('version-before-2', policy, {
      createdAt: '2026-05-18T10:10:00.000Z',
      deviatesFromPolicy: true,
      policyVersionId: 'synthetic-policy-v1',
      policyVersionNumber: 1,
    }),
    receiptFixture('version-before-3', policy, {
      createdAt: '2026-05-18T10:20:00.000Z',
      deviatesFromPolicy: true,
      policyVersionId: 'synthetic-policy-v1',
      policyVersionNumber: 1,
    }),
    receiptFixture('version-after-1', policy, {
      createdAt: '2026-05-18T12:10:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('version-after-2', policy, {
      createdAt: '2026-05-18T12:20:00.000Z',
      deviatesFromPolicy: false,
    }),
    receiptFixture('version-after-3', policy, {
      createdAt: '2026-05-18T12:30:00.000Z',
      deviatesFromPolicy: false,
    }),
  ];
  return dataset('policy_version_change', policy, actions, scans, receipts, [], {
    replay: replayExpectation(5, 2, 3, 0),
    analytics: analyticsExpectation('usable', { [RULE_KEY]: 'stable' }, {
      [RULE_KEY]: 'improving',
    }),
    drift: driftExpectation(1, 1, 2, false, 0),
    safeguards: safeguardsExpectation(0, 0, 2),
  });
}

function incidentModeDataset(): SyntheticEvalDataset {
  const policy = policyFixture({
    createdAt: '2026-05-18T08:00:00.000Z',
    updatedAt: '2026-05-18T08:00:00.000Z',
  });
  const actions = actionsFromSpecs([
    actionSpec('incident-1', 'warn', 'learner_a', 0),
    actionSpec('incident-2', 'remove', 'learner_b', 5),
    actionSpec('incident-3', 'remove', 'learner_c', 10),
    actionSpec('incident-4', 'temporary_ban_suggested', 'learner_d', 15),
  ]);
  const scans = [
    scanFixture('incident-scan-1', policy, actions.slice(0, 2), {
      createdAt: '2026-05-18T10:00:00.000Z',
      distribution: { warn: 1, remove: 1 },
    }),
    scanFixture('incident-scan-2', policy, actions, {
      createdAt: '2026-05-18T11:00:00.000Z',
      distribution: { warn: 1, remove: 2, temporary_ban_suggested: 1 },
    }),
  ];
  const receipts = [
    receiptFixture('incident-1', policy, {
      createdAt: '2026-05-18T10:00:00.000Z',
      deviatesFromPolicy: false,
      incidentId: 'incident-raid-1',
    }),
    receiptFixture('incident-2', policy, {
      createdAt: '2026-05-18T10:05:00.000Z',
      deviatesFromPolicy: true,
      overrideEventId: 'incident-override-1',
      incidentId: 'incident-raid-1',
    }),
    receiptFixture('incident-3', policy, {
      createdAt: '2026-05-18T10:10:00.000Z',
      deviatesFromPolicy: false,
      incidentId: 'incident-raid-1',
    }),
    receiptFixture('incident-4', policy, {
      createdAt: '2026-05-18T10:15:00.000Z',
      deviatesFromPolicy: false,
      incidentId: 'incident-raid-1',
    }),
  ];
  const overrides = [overrideFixture('incident-override-1', 'receipt-incident-2')];
  return dataset('incident_mode', policy, actions, scans, receipts, overrides, {
    replay: replayExpectation(4, 1, 3, 0),
    analytics: analyticsExpectation('usable', { [RULE_KEY]: 'regressing' }, {
      [RULE_KEY]: 'new_policy_tracking',
    }),
    drift: driftExpectation(1, 3, 4, false, 0),
    safeguards: safeguardsExpectation(0, 4, 2),
  });
}

function dataset(
  id: SyntheticEvalScenarioId,
  policy: RulePolicy,
  actions: AttributedModAction[],
  scans: MirrorScanRecord[],
  receipts: ActionReceipt[],
  overrides: OverrideEvent[],
  expected: SyntheticEvalExpectedOutcome
): SyntheticEvalDataset {
  return {
    id,
    label: labelForScenario(id),
    description: descriptionForScenario(id),
    generatedAt: SYNTHETIC_EVAL_GENERATED_AT,
    subreddit: SYNTHETIC_EVAL_SUBREDDIT,
    policy,
    actions,
    scans,
    receipts,
    overrides,
    expected,
    notes: [
      'Synthetic fixtures are deterministic and do not represent live Reddit data.',
      'Replay evaluation is read-only and must not create moderation receipts.',
    ],
  };
}

function policyFixture(
  options: {
    createdAt?: string;
    updatedAt?: string;
    activeVersionId?: string;
    activeVersionNumber?: number;
  } = {}
): RulePolicy {
  const activeVersionId = options.activeVersionId ?? 'synthetic-policy-v1';
  const activeVersionNumber = options.activeVersionNumber ?? 1;
  return {
    id: 'synthetic-policy-low-effort',
    subreddit: SYNTHETIC_EVAL_SUBREDDIT,
    ruleKey: RULE_KEY,
    ruleName: RULE_NAME,
    activeVersionId,
    activeVersionNumber,
    lifecycleState: 'adopted',
    adoptedBy: 'lead_mod',
    adoptedAt: options.updatedAt ?? '2026-05-18T08:00:00.000Z',
    createdAt: options.createdAt ?? '2026-05-18T08:00:00.000Z',
    updatedAt: options.updatedAt ?? '2026-05-18T08:00:00.000Z',
    createdBy: 'lead_mod',
    defaultMessageMode: 'log_only',
    active: true,
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction: 'warn',
        requireOverrideReasonForDeviation: true,
      },
      {
        offenseCount: 2,
        windowDays: 30,
        recommendedAction: 'remove',
        requireOverrideReasonForDeviation: true,
      },
      {
        offenseCount: 3,
        windowDays: 30,
        recommendedAction: 'temporary_ban_suggested',
        requireOverrideReasonForDeviation: true,
      },
    ],
  };
}

function actionSpec(
  id: string,
  normalizedAction: EnforcementAction,
  targetAuthor: string,
  minuteOffset: number,
  options: Partial<Omit<ActionSpec, 'id' | 'normalizedAction' | 'targetAuthor' | 'minuteOffset'>> = {}
): ActionSpec {
  return {
    id,
    normalizedAction,
    targetAuthor,
    minuteOffset,
    ruleKey: options.ruleKey === undefined ? RULE_KEY : options.ruleKey,
    ruleName: options.ruleName === undefined ? RULE_NAME : options.ruleName,
    confidence: options.confidence ?? 'high',
    source: options.source ?? 'demo',
  };
}

function actionsFromSpecs(specs: ActionSpec[]): AttributedModAction[] {
  return specs.map((spec) => {
    const action: AttributedModAction = {
      id: `synthetic-${spec.id}`,
      subreddit: SYNTHETIC_EVAL_SUBREDDIT,
      source: spec.source ?? 'demo',
      rawActionType: spec.normalizedAction,
      normalizedAction: spec.normalizedAction,
      targetThingId: `t3_${spec.id}`,
      targetAuthor: spec.targetAuthor,
      moderator: 'synthetic_mod',
      createdAt: timestamp(spec.minuteOffset),
      confidence: spec.confidence ?? 'high',
      evidence: evidenceForSpec(spec),
      attributionKind:
        spec.confidence === 'unmatched' ? 'unmatched' : 'inferred',
    };
    if (spec.ruleKey !== undefined && spec.ruleKey !== null) {
      action.inferredRuleKey = spec.ruleKey;
    }
    if (spec.ruleName !== undefined && spec.ruleName !== null) {
      action.inferredRuleName = spec.ruleName;
    }
    return action;
  });
}

function evidenceForSpec(spec: ActionSpec): string[] {
  if (spec.confidence === 'unmatched') {
    return ['Synthetic noisy history intentionally left unmatched.'];
  }
  return [
    `Synthetic ${spec.confidence ?? 'high'} confidence match for ${spec.ruleName ?? 'unknown rule'}.`,
  ];
}

function scanFixture(
  id: string,
  policy: RulePolicy,
  actions: AttributedModAction[],
  options: {
    createdAt: string;
    distribution: Partial<Record<EnforcementAction, number>>;
  }
): MirrorScanRecord {
  const unmatchedActions = actions.filter(
    (action) => action.confidence === 'unmatched'
  );
  const attributedActions = actions.filter(
    (action) => action.confidence !== 'unmatched'
  );
  return {
    id,
    subreddit: SYNTHETIC_EVAL_SUBREDDIT,
    createdAt: options.createdAt,
    createdBy: 'synthetic_eval',
    source: 'demo',
    totalActionsScanned: actions.length,
    attributedCount: attributedActions.length,
    unmatchedCount: unmatchedActions.length,
    confidenceBreakdown: confidenceBreakdown(actions),
    driftCandidates: [
      driftCandidate(policy, actions, options.distribution),
    ],
    smallSubredditStatus: getSmallSubredditThresholdStatus(actions.length),
    scanDepth: {
      depth: actions.length >= 8 ? 'deep' : 'standard',
      requestedLimit: actions.length,
      pageSize: actions.length,
      fetchedActions: actions.length,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    warnings: [SYNTHETIC_SCAN_WARNING],
    attributedActions,
    unmatchedActions,
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: actions.length,
    },
  };
}

function driftCandidate(
  policy: RulePolicy,
  actions: AttributedModAction[],
  actionDistribution: Partial<Record<EnforcementAction, number>>
): DriftCandidate {
  const totalActions = Object.values(actionDistribution).reduce(
    (sum, count) => sum + (count ?? 0),
    0
  );
  return {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    confidence: weakestConfidence(actions),
    summary: `${policy.ruleName} has ${Object.keys(actionDistribution).length} observed action type(s) in synthetic history.`,
    totalActions,
    actionDistribution,
    recommendation: 'Use this fixture to validate drift and policy replay metrics.',
  };
}

function receiptFixture(
  id: string,
  policy: RulePolicy,
  spec: Omit<ReceiptSpec, 'id'>
): ActionReceipt {
  const policyVersionId = spec.policyVersionId ?? policy.activeVersionId;
  const policyVersionNumber = spec.policyVersionNumber ?? policy.activeVersionNumber;
  const selectedAction =
    spec.selectedAction ?? (spec.deviatesFromPolicy ? 'remove' : 'warn');
  const receipt: ActionReceipt = {
    id: `receipt-${id}`,
    actionEventId: `action-receipt-${id}`,
    subreddit: SYNTHETIC_EVAL_SUBREDDIT,
    targetThingId: `t3_receipt_${id}`,
    targetType: 'post',
    targetSnapshot: {
      targetThingId: `t3_receipt_${id}`,
      targetType: 'post',
      subreddit: SYNTHETIC_EVAL_SUBREDDIT,
      authorName: `receipt_author_${id}`,
      source: 'provided',
      warnings: [],
    },
    modUsername: 'synthetic_mod',
    source: 'simulator',
    policySnapshot: {
      policyId: policy.id,
      policyVersionId: policyVersionId ?? 'synthetic-policy-v1',
      policyVersionNumber: policyVersionNumber ?? 1,
      policyVersionStatus: 'active',
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      steps: policy.steps,
      defaultMessageMode: policy.defaultMessageMode,
      capturedAt: spec.createdAt,
    },
    recommendation: {
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      policyId: policy.id,
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: spec.deviatesFromPolicy,
      selectedAction,
      deviatesFromPolicy: spec.deviatesFromPolicy,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warn.',
    },
    selectedAction,
    deviatesFromPolicy: spec.deviatesFromPolicy,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: spec.createdAt,
  };
  if (spec.overrideEventId !== undefined) {
    receipt.overrideEventId = spec.overrideEventId;
    receipt.overrideReason = 'edge_case_mod_discretion';
  }
  if (spec.incidentId !== undefined) {
    receipt.incidentId = spec.incidentId;
  }
  return receipt;
}

function overrideFixture(id: string, receiptId: string): OverrideEvent {
  return {
    id,
    subreddit: SYNTHETIC_EVAL_SUBREDDIT,
    modUsername: 'synthetic_mod',
    targetThingId: `t3_${receiptId}`,
    targetAuthor: 'synthetic_author',
    ruleKey: RULE_KEY,
    ruleName: RULE_NAME,
    policyId: 'synthetic-policy-low-effort',
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'edge_case_mod_discretion',
    policyVersionId: 'synthetic-policy-v2',
    policyVersionNumber: 2,
    reviewStatus: 'unresolved',
    updatedAt: SYNTHETIC_EVAL_GENERATED_AT,
    createdAt: SYNTHETIC_EVAL_GENERATED_AT,
  };
}

function replayExpectation(
  totalActionsEvaluated: number,
  matchedPolicyCount: number,
  changedRecommendationCount: number,
  skippedActionCount: number
): SyntheticReplayExpectation {
  return {
    totalActionsEvaluated,
    matchedPolicyCount,
    changedRecommendationCount,
    skippedActionCount,
  };
}

function analyticsExpectation(
  dataQuality: ConsistencyAnalyticsDataQuality,
  ruleTrendStatusByRule: Record<string, TrendDirection>,
  policyImpactStatusByRule: Record<string, PolicyImpactStatus>
): SyntheticAnalyticsExpectation {
  return {
    dataQuality,
    ruleTrendStatusByRule,
    policyImpactStatusByRule,
  };
}

function driftExpectation(
  candidateCount: number,
  latestDistinctActions: number,
  latestTotalActions: number,
  smallSubredditMeetsThreshold: boolean,
  unmatchedCount: number
): SyntheticDriftExpectation {
  return {
    candidateCount,
    latestDistinctActions,
    latestTotalActions,
    smallSubredditMeetsThreshold,
    unmatchedCount,
  };
}

function safeguardsExpectation(
  liveReceiptAttempts: number,
  incidentReceiptCount: number,
  syntheticScanWarningCount: number
): SyntheticSafeguardExpectation {
  return {
    liveReceiptAttempts,
    incidentReceiptCount,
    syntheticScanWarningCount,
  };
}

function summarizeReplay(
  replay: PolicyReplayResult
): SyntheticReplayExpectation {
  return {
    totalActionsEvaluated: replay.totalActionsEvaluated,
    matchedPolicyCount: replay.matchedPolicyCount,
    changedRecommendationCount: replay.changedRecommendationCount,
    skippedActionCount: replay.skippedActionCount,
  };
}

function validationFailuresForDataset(
  dataset: SyntheticEvalDataset,
  result: SyntheticEvalScenarioResult
): string[] {
  const failures: string[] = [];
  if (JSON.stringify(result.replay) !== JSON.stringify(dataset.expected.replay)) {
    failures.push(`${dataset.id}: replay expectation failed`);
  }
  if (
    JSON.stringify(result.analytics) !==
    JSON.stringify(dataset.expected.analytics)
  ) {
    failures.push(`${dataset.id}: analytics expectation failed`);
  }
  if (JSON.stringify(result.drift) !== JSON.stringify(dataset.expected.drift)) {
    failures.push(`${dataset.id}: drift expectation failed`);
  }
  if (
    JSON.stringify(result.safeguards) !==
    JSON.stringify(dataset.expected.safeguards)
  ) {
    failures.push(`${dataset.id}: safeguard expectation failed`);
  }
  if (dataset.actions.some((action) => action.source === 'live')) {
    failures.push(`${dataset.id}: synthetic action was labeled live`);
  }
  if (dataset.scans.some((scan) => !scan.warnings.includes(SYNTHETIC_SCAN_WARNING))) {
    failures.push(`${dataset.id}: scan is missing synthetic warning`);
  }
  return failures;
}

function confidenceBreakdown(
  actions: AttributedModAction[]
): Record<Confidence, number> {
  return actions.reduce<Record<Confidence, number>>(
    (counts, action) => {
      counts[action.confidence] += 1;
      return counts;
    },
    {
      high: 0,
      medium: 0,
      low: 0,
      unmatched: 0,
    }
  );
}

function weakestConfidence(actions: AttributedModAction[]): Confidence {
  if (actions.some((action) => action.confidence === 'low')) {
    return 'low';
  }
  if (actions.some((action) => action.confidence === 'medium')) {
    return 'medium';
  }
  if (actions.some((action) => action.confidence === 'unmatched')) {
    return 'low';
  }
  return 'high';
}

function latestByCreatedAt<T extends { createdAt: string }>(
  items: T[]
): T | undefined {
  return [...items].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  ).at(-1);
}

function timestamp(minuteOffset: number): string {
  return new Date(BASE_TIME + minuteOffset * 60_000).toISOString();
}

function labelForScenario(id: SyntheticEvalScenarioId): string {
  return id
    .split('_')
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}

function descriptionForScenario(id: SyntheticEvalScenarioId): string {
  const descriptions: Record<SyntheticEvalScenarioId, string> = {
    stable_rule: 'A repeatable history where policy replay agrees with prior moderator actions.',
    high_drift: 'First-offense cases receive inconsistent actions for the same rule.',
    policy_improved: 'Receipts show policy adherence improving after adoption.',
    small_subreddit: 'A sparse community with too little history for confident drift claims.',
    noisy_attribution: 'Mixed confidence and unmatched attribution exercise skipped replay rows.',
    repeated_offender: 'A single author accumulates offenses through the policy ladder.',
    policy_version_change: 'Receipts span a policy version transition and measure impact.',
    incident_mode: 'Receipts are grouped under an incident while preserving policy checks.',
  };
  return descriptions[id];
}
