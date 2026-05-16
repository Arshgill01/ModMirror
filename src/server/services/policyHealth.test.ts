import { describe, expect, it } from 'vitest';
import type { ActionEvent, OverrideEvent, RulePolicy } from '../../shared/schema';
import { computePolicyHealth } from './policyHealth';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2-low-effort-questions-2',
  ruleName: 'Rule 2: Low-effort questions',
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  createdBy: 'leadmod',
  defaultMessageMode: 'log_only',
  active: true,
  steps: [
    {
      offenseCount: 1,
      windowDays: 30,
      recommendedAction: 'warn',
      requireOverrideReasonForDeviation: true,
    },
  ],
};

function action(
  id: string,
  selectedAction: ActionEvent['selectedAction'] = 'warn'
): ActionEvent {
  return {
    id,
    subreddit: policy.subreddit,
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    policyId: policy.id,
    recommendedAction: 'warn',
    selectedAction,
    deliveryMode: 'log_only',
    source: 'simulator',
    createdAt: `2026-05-16T00:00:0${id}.000Z`,
  };
}

function override(
  id: string,
  options: Partial<OverrideEvent> = {}
): OverrideEvent {
  return {
    id,
    subreddit: policy.subreddit,
    modUsername: 'mod_a',
    ruleKey: policy.ruleKey,
    policyId: policy.id,
    recommendedAction: 'warn',
    selectedAction: 'manual_review',
    overrideReason: 'edge_case_mod_discretion',
    reviewStatus: 'unresolved',
    ...options,
    updatedAt:
      options.updatedAt ?? options.createdAt ?? `2026-05-16T00:01:0${id}.000Z`,
    createdAt: options.createdAt ?? `2026-05-16T00:01:0${id}.000Z`,
  };
}

describe('policy health scoring', () => {
  it('returns insufficient data for sparse action history', () => {
    const summary = computePolicyHealth({
      policy,
      actions: [action('1'), action('2')],
      overrides: [],
    });

    expect(summary.status).toBe('insufficient_data');
    expect(summary.recommendations[0]).toMatch(/Keep using ModMirror/);
  });

  it('marks policy stable when adherence is high', () => {
    const summary = computePolicyHealth({
      policy,
      actions: ['1', '2', '3', '4', '5', '6'].map((id) => action(id)),
      overrides: [],
    });

    expect(summary.status).toBe('stable');
    expect(summary.adherenceRate).toBe(1);
  });

  it('marks policy watch when override rate is elevated', () => {
    const summary = computePolicyHealth({
      policy,
      actions: [
        action('1', 'manual_review'),
        action('2'),
        action('3'),
        action('4'),
        action('5'),
      ],
      overrides: [override('1')],
    });

    expect(summary.status).toBe('watch');
    expect(summary.overrideRate).toBe(0.2);
  });

  it('marks policy at risk when override rate is high', () => {
    const summary = computePolicyHealth({
      policy,
      actions: [
        action('1', 'manual_review'),
        action('2', 'manual_review'),
        action('3'),
        action('4'),
        action('5'),
      ],
      overrides: [override('1'), override('2')],
    });

    expect(summary.status).toBe('at_risk');
  });

  it('marks policy needs review when policy seems wrong repeats', () => {
    const summary = computePolicyHealth({
      policy,
      actions: ['1', '2', '3', '4', '5', '6'].map((id) =>
        action(id, 'manual_review')
      ),
      overrides: [
        override('1', { overrideReason: 'policy_seems_wrong' }),
        override('2', { overrideReason: 'policy_seems_wrong' }),
        override('3', { overrideReason: 'policy_seems_wrong' }),
      ],
    });

    expect(summary.status).toBe('needs_review');
    expect(summary.policySeemsWrongCount).toBe(3);
  });

  it('marks policy needs review when unresolved overrides pile up', () => {
    const summary = computePolicyHealth({
      policy,
      actions: ['1', '2', '3', '4', '5', '6'].map((id) =>
        action(id, 'manual_review')
      ),
      overrides: ['1', '2', '3', '4', '5'].map((id) => override(id)),
    });

    expect(summary.status).toBe('needs_review');
    expect(summary.unresolvedOverrideCount).toBe(5);
  });
});
