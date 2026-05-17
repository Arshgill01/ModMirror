import { describe, expect, it } from 'vitest';
import type { ActionEvent } from '../../shared/schema';
import {
  findComparableCases,
  getOffenseBucket,
  getOffenseCountAtAction,
  toActionFamily,
} from './comparableCases';

const baseAction: ActionEvent = {
  id: 'action-current',
  subreddit: 'ExampleLearning',
  targetThingId: 't3_current',
  targetAuthor: 'learner_1',
  ruleKey: 'low-effort-questions-2',
  ruleName: 'Low-effort questions',
  policyId: 'policy-r2',
  policyVersionId: 'policy-r2-v1',
  policyVersionNumber: 1,
  policyVersionStatus: 'active',
  recommendedAction: 'remove',
  selectedAction: 'temporary_ban_suggested',
  deliveryMode: 'log_only',
  source: 'simulator',
  createdAt: '2026-05-16T12:00:00.000Z',
};

function action(overrides: Partial<ActionEvent>): ActionEvent {
  return {
    ...baseAction,
    id: overrides.id ?? 'action',
    targetAuthor: overrides.targetAuthor ?? 'learner_2',
    createdAt: overrides.createdAt ?? '2026-05-15T12:00:00.000Z',
    ...overrides,
  };
}

describe('deterministic comparable cases', () => {
  it('normalizes offense buckets and action families', () => {
    expect(getOffenseBucket(1)).toBe('first_offense');
    expect(getOffenseBucket(2)).toBe('second_offense');
    expect(getOffenseBucket(3)).toBe('third_or_more');
    expect(getOffenseBucket(undefined)).toBe('unknown');
    expect(toActionFamily('temporary_ban_suggested')).toBe(
      'temporary_ban_suggested'
    );
    expect(toActionFamily('log_only')).toBe('unknown');
  });

  it('counts same-user same-rule offenses at action time', () => {
    const prior = action({
      id: 'action-prior',
      targetAuthor: 'learner_1',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      createdAt: '2026-05-10T12:00:00.000Z',
    });

    expect(getOffenseCountAtAction(baseAction, [prior, baseAction])).toBe(2);
  });

  it('includes same-rule cases with matching offense and action families', () => {
    const comparablePrior = action({
      id: 'action-comparable-prior',
      targetAuthor: 'learner_2',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      createdAt: '2026-05-11T12:00:00.000Z',
    });
    const comparable = action({
      id: 'action-comparable',
      targetAuthor: 'learner_2',
      createdAt: '2026-05-15T12:00:00.000Z',
    });
    const currentPrior = action({
      id: 'action-current-prior',
      targetAuthor: 'learner_1',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      createdAt: '2026-05-10T12:00:00.000Z',
    });

    const cases = findComparableCases({
      currentAction: baseAction,
      actions: [currentPrior, comparablePrior, comparable, baseAction],
      timeWindowDays: 30,
    });

    expect(cases.map((item) => item.actionId)).toEqual(['action-comparable']);
    expect(cases[0]?.matchReasons).toContain('same rule');
    expect(cases[0]?.matchReasons).toContain('same selected action family');
  });

  it('excludes current action, other rules, and actions outside the window', () => {
    const otherRule = action({
      id: 'action-other-rule',
      ruleKey: 'self-promotion-3',
    });
    const oldAction = action({
      id: 'action-old',
      createdAt: '2026-03-01T12:00:00.000Z',
    });

    const cases = findComparableCases({
      currentAction: baseAction,
      actions: [baseAction, otherRule, oldAction],
      timeWindowDays: 30,
    });

    expect(cases).toEqual([]);
  });
});
