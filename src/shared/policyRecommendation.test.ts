import { describe, expect, it } from 'vitest';
import {
  choosePolicyStep,
  getPolicyReadinessState,
  isOverrideAction,
  recommendPolicyAction,
  resolveOffenseCount,
} from './scoring';
import type { AttributedModAction, RulePolicy } from './schema';

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

const priorAction: AttributedModAction = {
  id: 'action-1',
  subreddit: 'ExampleLearning',
  source: 'modmirror',
  rawActionType: 'remove',
  normalizedAction: 'remove',
  targetAuthor: 'learner_1',
  createdAt: '2026-05-15T00:00:00.000Z',
  inferredRuleKey: policy.ruleKey,
  inferredRuleName: policy.ruleName,
  confidence: 'high',
  evidence: ['ModMirror-created action'],
};

describe('policy recommendation helpers', () => {
  it('resolves offense count from matching ModMirror action history', () => {
    expect(
      resolveOffenseCount([priorAction], policy.ruleKey, 'Learner_1')
    ).toBe(2);
  });

  it('chooses the highest policy step that matches the offense count', () => {
    expect(choosePolicyStep(policy.steps, 3)?.recommendedAction).toBe(
      'temporary_ban_suggested'
    );
    expect(choosePolicyStep(policy.steps, 10)?.recommendedAction).toBe(
      'temporary_ban_suggested'
    );
  });

  it('returns no-policy fallback without pretending enforcement is configured', () => {
    const recommendation = recommendPolicyAction({
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
    });

    expect(recommendation.fallbackReason).toBe('no_policy');
    expect(recommendation.recommendedAction).toBe('manual_review');
    expect(recommendation.messageDeliveryMode).toBe('log_only');
  });

  it('requires override reason only when a selected action deviates', () => {
    const recommendation = recommendPolicyAction({
      policy,
      ruleKey: policy.ruleKey,
      actionHistory: [priorAction],
      targetAuthor: 'learner_1',
      selectedAction: 'temporary_ban_suggested',
    });

    expect(recommendation.recommendedAction).toBe('remove');
    expect(recommendation.deviatesFromPolicy).toBe(true);
    expect(recommendation.requiresOverrideReason).toBe(true);
    expect(isOverrideAction('remove', 'temporary_ban_suggested')).toBe(true);
  });

  it('describes small subreddit policy readiness separately from missing policy', () => {
    expect(getPolicyReadinessState(undefined).reason).toBe('no_policy');
    expect(getPolicyReadinessState(policy, 2).reason).toBe('small_subreddit');
  });
});
