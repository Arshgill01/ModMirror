import {
  MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY,
  MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY,
} from './constants';
import type {
  AttributedModAction,
  Confidence,
  EnforcementAction,
  PolicyReadinessState,
  PolicyRecommendation,
  PolicyStep,
  RulePolicy,
  SmallSubredditThresholdStatus,
} from './schema';

export function confidenceLabel(score: number): Confidence {
  if (score >= 0.8) {
    return 'high';
  }

  if (score >= 0.5) {
    return 'medium';
  }

  if (score > 0) {
    return 'low';
  }

  return 'unmatched';
}

export function isOverrideAction(
  recommendedAction: EnforcementAction,
  selectedAction: EnforcementAction
): boolean {
  return recommendedAction !== selectedAction;
}

export function resolveOffenseCount(
  actions: AttributedModAction[],
  ruleKey: string,
  targetAuthor?: string,
  now = new Date()
): number {
  if (!targetAuthor) {
    return 1;
  }

  const normalizedAuthor = targetAuthor.toLowerCase();
  const priorActions = actions.filter((action) => {
    if (action.inferredRuleKey !== ruleKey) {
      return false;
    }
    if (action.targetAuthor?.toLowerCase() !== normalizedAuthor) {
      return false;
    }

    const createdAt = Date.parse(action.createdAt);
    return !Number.isNaN(createdAt) && createdAt <= now.getTime();
  });

  return priorActions.length + 1;
}

export function choosePolicyStep(
  steps: PolicyStep[],
  offenseCount: number
): PolicyStep | undefined {
  return [...steps]
    .sort((left, right) => left.offenseCount - right.offenseCount)
    .reduce<PolicyStep | undefined>((selected, step) => {
      if (step.offenseCount <= offenseCount) {
        return step;
      }
      return selected;
    }, steps[0]);
}

export function getPolicyReadinessState(
  policy: RulePolicy | undefined,
  observedActions?: number
): PolicyReadinessState {
  if (!policy) {
    return {
      reason: 'no_policy',
      message: 'No team policy exists for this rule yet. Create one now.',
      canCreatePolicy: true,
    };
  }

  if (typeof observedActions === 'number' && observedActions === 0) {
    return {
      reason: 'no_scan_data',
      message:
        'No scan history exists yet. Set a policy now and ModMirror will start measuring consistency from today.',
      canCreatePolicy: false,
    };
  }

  const smallSubreddit = getSmallSubredditThresholdStatus(observedActions ?? 0);
  if (typeof observedActions === 'number' && !smallSubreddit.meetsThreshold) {
    return {
      reason: 'small_subreddit',
      message:
        'Not enough history for reliable drift detection yet. Set your team policy now; ModMirror will measure consistency from today.',
      canCreatePolicy: false,
    };
  }

  return {
    reason: 'policy_found',
    message: 'Team policy is ready for Apply Policy.',
    canCreatePolicy: false,
  };
}

export function recommendPolicyAction(options: {
  policy?: RulePolicy;
  ruleKey: string;
  ruleName?: string;
  actionHistory?: AttributedModAction[];
  targetAuthor?: string;
  selectedAction?: EnforcementAction;
  now?: Date;
}): PolicyRecommendation {
  const offenseCount = resolveOffenseCount(
    options.actionHistory ?? [],
    options.ruleKey,
    options.targetAuthor,
    options.now
  );

  if (!options.policy) {
    const recommendedAction: EnforcementAction = 'manual_review';
    const recommendation: PolicyRecommendation = {
      ruleKey: options.ruleKey,
      offenseCount,
      recommendedAction,
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: false,
      deviatesFromPolicy:
        options.selectedAction !== undefined &&
        isOverrideAction(recommendedAction, options.selectedAction),
      fallbackReason: 'no_policy',
      message: 'No team policy exists for this rule yet. Create one now.',
    };

    if (options.ruleName !== undefined) {
      recommendation.ruleName = options.ruleName;
    }
    if (options.selectedAction !== undefined) {
      recommendation.selectedAction = options.selectedAction;
    }

    return recommendation;
  }

  const step = choosePolicyStep(options.policy.steps, offenseCount);
  const recommendedAction = step?.recommendedAction ?? 'manual_review';
  const deviatesFromPolicy =
    options.selectedAction !== undefined &&
    isOverrideAction(recommendedAction, options.selectedAction);

  const recommendation: PolicyRecommendation = {
    ruleKey: options.policy.ruleKey,
    ruleName: options.policy.ruleName,
    policyId: options.policy.id,
    offenseCount,
    recommendedAction,
    messageDeliveryMode: options.policy.defaultMessageMode,
    requiresOverrideReason:
      Boolean(step?.requireOverrideReasonForDeviation) && deviatesFromPolicy,
    deviatesFromPolicy,
    fallbackReason: 'policy_found',
    message: `Team policy recommends ${recommendedAction.replaceAll('_', ' ')} for offense ${offenseCount}.`,
  };

  if (options.selectedAction !== undefined) {
    recommendation.selectedAction = options.selectedAction;
  }

  return recommendation;
}

export function getSmallSubredditThresholdStatus(
  observedActions: number,
  minimumActions = MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY
): SmallSubredditThresholdStatus {
  const meetsThreshold = observedActions >= minimumActions;

  return {
    meetsThreshold,
    observedActions,
    minimumActions,
    message: meetsThreshold
      ? 'Enough recent actions to show drift candidates.'
      : 'Not enough recent actions for confident drift display; use demo mode or start with policy setup.',
  };
}

export function hasEnoughRuleActionsForDrift(
  observedRuleActions: number,
  minimumRuleActions = MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY
): boolean {
  return observedRuleActions >= minimumRuleActions;
}

export function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function normalizeForMatching(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function toRuleKey(ruleName: string, priority?: number): string {
  const base = normalizeForMatching(ruleName).replace(/\s+/g, '-');
  const suffix = typeof priority === 'number' ? `-${priority}` : '';

  return `${base || 'rule'}${suffix}`;
}
