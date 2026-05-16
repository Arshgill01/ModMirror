import {
  MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY,
  MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY,
} from './constants';
import type {
  Confidence,
  EnforcementAction,
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
