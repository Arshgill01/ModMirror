import type {
  MirrorScan,
  PolicyHealthOverview,
  PolicyHealthStatus,
  PolicyHealthSummary,
  RulePolicy,
} from './schema';

export type ProductPageId =
  | 'act'
  | 'scan'
  | 'agree'
  | 'review'
  | 'prove'
  | 'settings';

export type ProductDataMode = 'live' | 'demo' | 'unknown';

export type CommandCenterAction = {
  label: string;
  page: ProductPageId;
  intent:
    | 'load_demo'
    | 'run_scan'
    | 'apply_policy'
    | 'create_policy'
    | 'review_overrides'
    | 'review_policy'
    | 'generate_digest';
};

export type CommandCenterSummary = {
  consistencyScore: number;
  topIssue: string;
  unresolvedOverrideCount: number;
  activePolicyCount: number;
  lastScanLabel: string;
  dataMode: ProductDataMode;
  primaryAction: CommandCenterAction;
  secondaryActions: CommandCenterAction[];
};

export type SetupStepId =
  | 'choose-source'
  | 'run-scan'
  | 'create-policy'
  | 'apply-policy'
  | 'review-results';

export type SetupStep = {
  id: SetupStepId;
  title: string;
  status: 'complete' | 'current' | 'pending';
  action: CommandCenterAction;
};

type OverrideReviewCountable = {
  reviewStatus?: string;
};

const HEALTH_PRIORITY: Record<PolicyHealthStatus, number> = {
  needs_review: 5,
  at_risk: 4,
  watch: 3,
  insufficient_data: 2,
  stable: 1,
};

export function buildCommandCenterSummary(input: {
  scan?: MirrorScan;
  policies: RulePolicy[];
  health?: PolicyHealthOverview;
  overrides?: OverrideReviewCountable[];
}): CommandCenterSummary {
  const activePolicyCount = input.policies.filter((policy) => policy.active).length;
  const unresolvedOverrideCount =
    input.health?.unresolvedOverrides ??
    (input.overrides ?? []).filter(
      (event) => (event.reviewStatus ?? 'unresolved') === 'unresolved'
    ).length;
  const topHealth = getTopPolicyHealth(input.health?.summaries ?? []);
  const dataMode: ProductDataMode =
    input.scan?.source === 'demo'
      ? 'demo'
      : input.scan?.source === 'live'
        ? 'live'
        : 'unknown';
  const topIssue =
    topHealth !== undefined
      ? `${topHealth.ruleName} ${formatHealthStatus(topHealth.status)}`
      : input.scan?.driftCandidates[0]?.ruleName !== undefined
        ? `${input.scan.driftCandidates[0].ruleName} drift candidate`
        : 'No scan signal yet';

  const scoreInput: Parameters<typeof computeConsistencyScore>[0] = {
    policies: input.policies,
    unresolvedOverrideCount,
  };
  if (input.health !== undefined) {
    scoreInput.health = input.health;
  }
  if (input.scan !== undefined) {
    scoreInput.scan = input.scan;
  }
  const actionInput: Parameters<typeof getPrimaryAction>[0] = {
    activePolicyCount,
    unresolvedOverrideCount,
  };
  if (input.scan !== undefined) {
    actionInput.scan = input.scan;
  }
  if (topHealth !== undefined) {
    actionInput.topHealth = topHealth;
  }

  return {
    consistencyScore: computeConsistencyScore(scoreInput),
    topIssue,
    unresolvedOverrideCount,
    activePolicyCount,
    lastScanLabel: input.scan?.createdAt ?? 'Not run yet',
    dataMode,
    primaryAction: getPrimaryAction(actionInput),
    secondaryActions: [
      { label: 'Run Scan', page: 'scan', intent: 'run_scan' },
      { label: 'Create Policy', page: 'agree', intent: 'create_policy' },
      { label: 'Generate Digest', page: 'prove', intent: 'generate_digest' },
    ],
  };
}

export function buildSetupSteps(input: {
  scan?: MirrorScan;
  policies: RulePolicy[];
  hasAppliedPolicy: boolean;
  hasReviewedOverride: boolean;
}): SetupStep[] {
  const hasScan = input.scan !== undefined;
  const hasPolicy = input.policies.some((policy) => policy.active);

  return [
    {
      id: 'choose-source',
      title: 'Choose live scan or demo scenario',
      status: 'complete',
      action: { label: 'Use Demo Scenario', page: 'scan', intent: 'load_demo' },
    },
    {
      id: 'run-scan',
      title: 'Run scan or load ExampleLearning',
      status: getStepStatus(hasScan, true),
      action: { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' },
    },
    {
      id: 'create-policy',
      title: 'Create the Rule 2 policy ladder',
      status: getStepStatus(hasPolicy, hasScan),
      action: { label: 'Create Policy', page: 'agree', intent: 'create_policy' },
    },
    {
      id: 'apply-policy',
      title: 'Apply policy to a sample case',
      status: getStepStatus(input.hasAppliedPolicy, hasPolicy),
      action: { label: 'Apply Sample', page: 'act', intent: 'apply_policy' },
    },
    {
      id: 'review-results',
      title: 'Review override and case context',
      status: getStepStatus(input.hasReviewedOverride, input.hasAppliedPolicy),
      action: { label: 'Review Results', page: 'review', intent: 'review_overrides' },
    },
  ];
}

export function generateManualDigest(input: {
  generatedAt: string;
  dataMode: ProductDataMode;
  summary: CommandCenterSummary;
  health?: PolicyHealthOverview;
  caveats: string[];
}): string {
  const healthRows =
    input.health?.summaries.map((summary) =>
      [
        `- ${summary.ruleName}: ${formatHealthStatus(summary.status)}`,
        `  - Adherence: ${formatPercent(summary.adherenceRate)}`,
        `  - Overrides: ${summary.overrideCount}`,
        `  - Recommendation: ${summary.recommendations[0] ?? 'Continue monitoring.'}`,
      ].join('\n')
    ) ?? [];

  return [
    '# ModMirror Manual Digest',
    '',
    `Generated: ${input.generatedAt}`,
    `Data mode: ${formatDataMode(input.dataMode)}`,
    '',
    '## Command Center',
    `- Consistency score: ${input.summary.consistencyScore}/100`,
    `- Top issue: ${input.summary.topIssue}`,
    `- Unresolved overrides: ${input.summary.unresolvedOverrideCount}`,
    `- Active policies: ${input.summary.activePolicyCount}`,
    `- Primary next action: ${input.summary.primaryAction.label}`,
    '',
    '## Policy Health',
    healthRows.length > 0
      ? healthRows.join('\n')
      : '- No policy health signals yet. Create a policy and log Apply Policy actions.',
    '',
    '## Recommendations',
    `- ${input.summary.primaryAction.label}`,
    ...collectDigestRecommendations(input.health).map(
      (recommendation) => `- ${recommendation}`
    ),
    '',
    '## Caveats',
    ...input.caveats.map((caveat) => `- ${caveat}`),
  ].join('\n');
}

export function getTopPolicyHealth(
  summaries: PolicyHealthSummary[]
): PolicyHealthSummary | undefined {
  return [...summaries].sort((left, right) => {
    const priority =
      HEALTH_PRIORITY[right.status] - HEALTH_PRIORITY[left.status];
    if (priority !== 0) {
      return priority;
    }
    return right.unresolvedOverrideCount - left.unresolvedOverrideCount;
  })[0];
}

function computeConsistencyScore(input: {
  policies: RulePolicy[];
  health?: PolicyHealthOverview;
  scan?: MirrorScan;
  unresolvedOverrideCount: number;
}): number {
  if (input.health?.summaries.length) {
    const adherenceAverage =
      input.health.summaries.reduce(
        (total, summary) => total + summary.adherenceRate,
        0
      ) / input.health.summaries.length;
    return clampScore(
      Math.round(adherenceAverage * 100) - input.unresolvedOverrideCount * 2
    );
  }

  if (input.policies.some((policy) => policy.active)) {
    return 60;
  }

  if ((input.scan?.driftCandidates.length ?? 0) > 0) {
    return 42;
  }

  return 0;
}

function getPrimaryAction(input: {
  scan?: MirrorScan;
  activePolicyCount: number;
  unresolvedOverrideCount: number;
  topHealth?: PolicyHealthSummary;
}): CommandCenterAction {
  if (!input.scan) {
    return { label: 'Load Demo Scenario', page: 'scan', intent: 'load_demo' };
  }
  if (input.activePolicyCount === 0) {
    return { label: 'Create First Policy', page: 'agree', intent: 'create_policy' };
  }
  if (input.unresolvedOverrideCount > 0) {
    return {
      label: 'Review Overrides',
      page: 'review',
      intent: 'review_overrides',
    };
  }
  if (
    input.topHealth &&
    ['needs_review', 'at_risk', 'watch'].includes(input.topHealth.status)
  ) {
    return { label: 'Review Policy', page: 'review', intent: 'review_policy' };
  }
  return { label: 'Generate Digest', page: 'prove', intent: 'generate_digest' };
}

function getStepStatus(
  complete: boolean,
  canStart: boolean
): SetupStep['status'] {
  if (complete) {
    return 'complete';
  }
  return canStart ? 'current' : 'pending';
}

function collectDigestRecommendations(
  health: PolicyHealthOverview | undefined
): string[] {
  const recommendations =
    health?.summaries.flatMap((summary) => summary.recommendations) ?? [];
  return [...new Set(recommendations)].slice(0, 4);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function formatHealthStatus(status: PolicyHealthStatus): string {
  return status.replaceAll('_', ' ');
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDataMode(mode: ProductDataMode): string {
  return mode === 'demo' ? 'Demo' : mode === 'live' ? 'Live' : 'Unknown';
}
