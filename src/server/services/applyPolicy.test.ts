import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionEvent, RulePolicy } from '../../shared/schema';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2-low-effort-questions-2',
  ruleName: 'Rule 2: Low-effort questions',
  activeVersionId: 'policy-version-1',
  activeVersionNumber: 1,
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
const capturePolicySnapshot = vi.fn();
const listRecentActionEvents = vi.fn();
const saveActionEvent = vi.fn();
const saveOverrideEvent = vi.fn();

vi.mock('./policies', () => ({
  capturePolicySnapshot,
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
    vi.clearAllMocks();
    getPolicyByRule.mockResolvedValue(policy);
    capturePolicySnapshot.mockReturnValue({
      policyId: policy.id,
      policyVersionId: 'policy-version-1',
      policyVersionNumber: 1,
      policyVersionStatus: 'active',
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      steps: policy.steps,
      defaultMessageMode: policy.defaultMessageMode,
      capturedAt: '2026-05-16T00:00:00.000Z',
    });
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
      targetThingId: 't3_target_post',
      targetAuthor: 'learner_1',
      selectedAction: 'warn',
      source: 'live',
    });

    expect(preview.recommendation.recommendedAction).toBe('warn');
    expect(preview.recommendation.messageDeliveryMode).toBe('log_only');
    expect(preview.policySnapshot).toEqual(
      expect.objectContaining({
        policyId: policy.id,
        policyVersionId: 'policy-version-1',
      })
    );
    expect(preview.targetSnapshot).toEqual(
      expect.objectContaining({
        targetThingId: 't3_target_post',
        targetType: 'post',
        authorName: 'learner_1',
        source: 'provided',
      })
    );
    expect(preview.evidence.map((item) => item.kind)).toEqual([
      'policy',
      'target',
      'history',
      'safety',
    ]);
    expect(preview.confirmation).toEqual(
      expect.objectContaining({
        executionMode: 'log_only',
        willExecuteRedditAction: false,
        requiresOverrideReason: false,
      })
    );
  });

  it('previews a missing target as an explicit caveat', async () => {
    const { previewApplyPolicy } = await import('./applyPolicy');
    const preview = await previewApplyPolicy({
      subreddit: 'ExampleLearning',
      ruleKey: policy.ruleKey,
      selectedAction: 'warn',
    });

    expect(preview.targetSnapshot).toEqual(
      expect.objectContaining({
        targetType: 'unknown',
        source: 'not_provided',
      })
    );
    expect(preview.targetSnapshot.warnings[0]).toMatch(/No target context/);
    expect(preview.evidence).toContainEqual(
      expect.objectContaining({
        kind: 'target',
        label: 'Target context missing',
      })
    );
  });

  it('rejects unsupported target thing IDs', async () => {
    const { previewApplyPolicy } = await import('./applyPolicy');
    await expect(
      previewApplyPolicy({
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        targetThingId: 't5_unsupported',
        selectedAction: 'warn',
      })
    ).rejects.toThrow(/targetThingId must be a post t3_ or comment t1_ ID/);
  });

  it('rejects a target type that conflicts with the thing ID', async () => {
    const { previewApplyPolicy } = await import('./applyPolicy');
    await expect(
      previewApplyPolicy({
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        targetThingId: 't1_target_comment',
        targetType: 'post',
        selectedAction: 'warn',
      })
    ).rejects.toThrow(/targetType does not match targetThingId/);
  });

  it('confirms matching log_only action without override', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    const result = await confirmApplyPolicy({
      modUsername: 'mod_a',
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        selectedAction: 'warn',
        confirmed: true,
      },
    });

    expect(result.actionEvent.id).toBe('action-1');
    expect(result.execution).toEqual(
      expect.objectContaining({
        executionMode: 'log_only',
        executionAttempted: false,
        executionResult: 'skipped',
        redditOperation: 'none',
      })
    );
    expect(saveActionEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        policyId: policy.id,
        policyVersionId: 'policy-version-1',
        policyVersionNumber: 1,
        policyVersionStatus: 'active',
        execution: expect.objectContaining({
          executionMode: 'log_only',
          redditOperation: 'none',
        }),
      })
    );
    expect(saveOverrideEvent).not.toHaveBeenCalled();
  });

  it('rejects confirm requests without explicit confirmation', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    await expect(
      confirmApplyPolicy({
        input: {
          subreddit: 'ExampleLearning',
          ruleKey: policy.ruleKey,
          selectedAction: 'warn',
          confirmed: false,
        },
      })
    ).rejects.toThrow(/Explicit confirmation is required/);
  });

  it('rejects deviation without override reason', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    await expect(
      confirmApplyPolicy({
        input: {
          subreddit: 'ExampleLearning',
          ruleKey: policy.ruleKey,
          selectedAction: 'manual_review',
          confirmed: true,
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
        confirmed: true,
        overrideReason: 'edge_case_mod_discretion',
      },
    });

    expect(result.overrideEvent?.overrideReason).toBe(
      'edge_case_mod_discretion'
    );
    expect(saveOverrideEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        policyId: policy.id,
        policyVersionId: 'policy-version-1',
        policyVersionNumber: 1,
        policyVersionStatus: 'active',
      })
    );
  });
});
