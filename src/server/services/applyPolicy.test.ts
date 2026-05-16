import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionEvent, RulePolicy } from '../../shared/schema';

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

const actionEvent: ActionEvent = {
  id: 'action-1',
  subreddit: 'ExampleLearning',
  ruleKey: policy.ruleKey,
  ruleName: policy.ruleName,
  policyId: policy.id,
  recommendedAction: 'warn',
  selectedAction: 'warn',
  deliveryMode: 'log_only',
  source: 'simulator',
  createdAt: '2026-05-16T00:00:00.000Z',
};

const getPolicyByRule = vi.fn();
const listRecentActionEvents = vi.fn();
const saveActionEvent = vi.fn();
const saveOverrideEvent = vi.fn();

vi.mock('./policies', () => ({
  getPolicyByRule,
}));

vi.mock('./audit', () => ({
  createLogOnlyActionInput: vi.fn((input) => input),
  listRecentActionEvents,
  saveActionEvent,
  saveOverrideEvent,
}));

describe('apply policy service', () => {
  beforeEach(() => {
    getPolicyByRule.mockResolvedValue(policy);
    listRecentActionEvents.mockResolvedValue([]);
    saveActionEvent.mockResolvedValue(actionEvent);
    saveOverrideEvent.mockResolvedValue({
      id: 'override-1',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_a',
      ruleKey: policy.ruleKey,
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'edge_case_mod_discretion',
      createdAt: '2026-05-16T00:00:00.000Z',
    });
  });

  it('previews the recommendation for a policy', async () => {
    const { previewApplyPolicy } = await import('./applyPolicy');
    const preview = await previewApplyPolicy({
      subreddit: 'ExampleLearning',
      ruleKey: policy.ruleKey,
      selectedAction: 'warn',
    });

    expect(preview.recommendation.recommendedAction).toBe('warn');
    expect(preview.recommendation.messageDeliveryMode).toBe('log_only');
  });

  it('confirms matching log_only action without override', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    const result = await confirmApplyPolicy({
      modUsername: 'mod_a',
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        selectedAction: 'warn',
      },
    });

    expect(result.actionEvent.id).toBe('action-1');
    expect(saveOverrideEvent).not.toHaveBeenCalled();
  });

  it('rejects deviation without override reason', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    await expect(
      confirmApplyPolicy({
        input: {
          subreddit: 'ExampleLearning',
          ruleKey: policy.ruleKey,
          selectedAction: 'manual_review',
        },
      })
    ).rejects.toThrow(/Override reason is required/);
  });

  it('stores override event when deviation has a reason', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    const result = await confirmApplyPolicy({
      modUsername: 'mod_a',
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        selectedAction: 'manual_review',
        overrideReason: 'edge_case_mod_discretion',
      },
    });

    expect(result.overrideEvent?.overrideReason).toBe(
      'edge_case_mod_discretion'
    );
  });
});
