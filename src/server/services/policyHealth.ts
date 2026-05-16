import type {
  ActionEvent,
  OverrideEvent,
  PolicyHealthOverview,
  PolicyHealthStatus,
  PolicyHealthSummary,
  RulePolicy,
} from '../../shared/schema';
import { listRecentActionEvents, listRecentAuditEvents } from './audit';
import { listPolicies } from './policies';

export type PolicyHealthOptions = {
  minimumActions: number;
  needsReviewUnresolvedOverrides: number;
  needsReviewPolicyWrongOverrides: number;
  atRiskOverrideRate: number;
  watchOverrideRate: number;
  stableAdherenceRate: number;
};

export const DEFAULT_POLICY_HEALTH_OPTIONS: PolicyHealthOptions = {
  minimumActions: 5,
  needsReviewUnresolvedOverrides: 5,
  needsReviewPolicyWrongOverrides: 3,
  atRiskOverrideRate: 0.35,
  watchOverrideRate: 0.2,
  stableAdherenceRate: 0.85,
};

export function computePolicyHealth(options: {
  policy: RulePolicy;
  actions: ActionEvent[];
  overrides: OverrideEvent[];
  thresholds?: Partial<PolicyHealthOptions>;
}): PolicyHealthSummary {
  const thresholds = {
    ...DEFAULT_POLICY_HEALTH_OPTIONS,
    ...options.thresholds,
  };
  const actions = options.actions.filter((event) =>
    eventMatchesPolicy(event, options.policy)
  );
  const overrides = options.overrides.filter((event) =>
    eventMatchesPolicy(event, options.policy)
  );
  const totalActions = actions.length;
  const followedPolicyCount = actions.filter(
    (event) => event.selectedAction === event.recommendedAction
  ).length;
  const overrideCount = overrides.length;
  const unresolvedOverrideCount = overrides.filter(
    (event) => (event.reviewStatus ?? 'unresolved') === 'unresolved'
  ).length;
  const policySeemsWrongCount = overrides.filter(
    (event) => event.overrideReason === 'policy_seems_wrong'
  ).length;
  const adherenceRate = totalActions === 0 ? 0 : followedPolicyCount / totalActions;
  const overrideRate = totalActions === 0 ? 0 : overrideCount / totalActions;
  const status = resolvePolicyHealthStatus({
    totalActions,
    adherenceRate,
    overrideRate,
    unresolvedOverrideCount,
    policySeemsWrongCount,
    thresholds,
  });
  const reasons = buildReasons({
    status,
    totalActions,
    adherenceRate,
    overrideRate,
    unresolvedOverrideCount,
    policySeemsWrongCount,
    thresholds,
  });
  const recommendations = buildRecommendations({
    status,
    unresolvedOverrideCount,
    policySeemsWrongCount,
  });
  const summary: PolicyHealthSummary = {
    policyId: options.policy.id,
    ruleKey: options.policy.ruleKey,
    ruleName: options.policy.ruleName,
    status,
    totalActions,
    followedPolicyCount,
    overrideCount,
    unresolvedOverrideCount,
    policySeemsWrongCount,
    adherenceRate,
    overrideRate,
    reasons,
    recommendations,
  };
  const warning = reasons[0];
  if (warning !== undefined && status !== 'stable') {
    summary.sampleWarning = warning;
  }

  return summary;
}

export function buildPolicyHealthOverview(
  summaries: PolicyHealthSummary[]
): PolicyHealthOverview {
  return {
    totalPolicies: summaries.length,
    stablePolicies: summaries.filter((summary) => summary.status === 'stable')
      .length,
    policiesNeedingReview: summaries.filter((summary) =>
      ['needs_review', 'at_risk'].includes(summary.status)
    ).length,
    unresolvedOverrides: summaries.reduce(
      (total, summary) => total + summary.unresolvedOverrideCount,
      0
    ),
    summaries,
  };
}

export async function listPolicyHealthSummaries(
  subreddit: string
): Promise<PolicyHealthSummary[]> {
  const [policies, actions, overrides] = await Promise.all([
    listPolicies(subreddit),
    listRecentActionEvents(subreddit, 250),
    listRecentAuditEvents(subreddit, 250),
  ]);

  return policies
    .filter((policy) => policy.active)
    .map((policy) =>
      computePolicyHealth({
        policy,
        actions,
        overrides,
      })
    );
}

export async function getPolicyHealthOverview(
  subreddit: string
): Promise<PolicyHealthOverview> {
  return buildPolicyHealthOverview(await listPolicyHealthSummaries(subreddit));
}

function resolvePolicyHealthStatus(options: {
  totalActions: number;
  adherenceRate: number;
  overrideRate: number;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
  thresholds: PolicyHealthOptions;
}): PolicyHealthStatus {
  if (options.totalActions < options.thresholds.minimumActions) {
    return 'insufficient_data';
  }
  if (
    options.unresolvedOverrideCount >=
      options.thresholds.needsReviewUnresolvedOverrides ||
    options.policySeemsWrongCount >=
      options.thresholds.needsReviewPolicyWrongOverrides
  ) {
    return 'needs_review';
  }
  if (options.overrideRate >= options.thresholds.atRiskOverrideRate) {
    return 'at_risk';
  }
  if (options.overrideRate >= options.thresholds.watchOverrideRate) {
    return 'watch';
  }
  if (options.adherenceRate >= options.thresholds.stableAdherenceRate) {
    return 'stable';
  }
  return 'watch';
}

function buildReasons(options: {
  status: PolicyHealthStatus;
  totalActions: number;
  adherenceRate: number;
  overrideRate: number;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
  thresholds: PolicyHealthOptions;
}): string[] {
  if (options.status === 'insufficient_data') {
    return [
      `Only ${options.totalActions} tracked actions; ${options.thresholds.minimumActions} are needed for a policy health signal.`,
    ];
  }

  const reasons: string[] = [];
  if (
    options.policySeemsWrongCount >=
    options.thresholds.needsReviewPolicyWrongOverrides
  ) {
    reasons.push('Several overrides say the policy seems wrong.');
  }
  if (
    options.unresolvedOverrideCount >=
    options.thresholds.needsReviewUnresolvedOverrides
  ) {
    reasons.push('Multiple overrides are still unresolved.');
  }
  if (options.overrideRate >= options.thresholds.atRiskOverrideRate) {
    reasons.push(`Override rate is ${formatPercent(options.overrideRate)}.`);
  } else if (options.overrideRate >= options.thresholds.watchOverrideRate) {
    reasons.push(`Override rate is ${formatPercent(options.overrideRate)}.`);
  }
  if (options.status === 'stable') {
    reasons.push(`Adherence rate is ${formatPercent(options.adherenceRate)}.`);
  }

  return reasons.length > 0 ? reasons : ['Policy health needs monitoring.'];
}

function buildRecommendations(options: {
  status: PolicyHealthStatus;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
}): string[] {
  if (options.status === 'insufficient_data') {
    return [
      'Keep using ModMirror to build enough tracked actions for health scoring.',
    ];
  }
  if (options.policySeemsWrongCount > 0) {
    return ['Review this policy: overrides indicate the ladder may be wrong.'];
  }
  if (options.unresolvedOverrideCount > 0) {
    return ['Review recent exceptions before changing this policy.'];
  }
  if (options.status === 'stable') {
    return ['Policy appears stable. No action needed.'];
  }
  if (options.status === 'at_risk') {
    return ['Discuss whether the policy should change or exceptions need clearer guidance.'];
  }
  return ['Watch this policy and review new overrides as they arrive.'];
}

function eventMatchesPolicy(
  event: Pick<ActionEvent | OverrideEvent, 'ruleKey' | 'policyId'>,
  policy: RulePolicy
): boolean {
  return event.policyId === policy.id || event.ruleKey === policy.ruleKey;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
