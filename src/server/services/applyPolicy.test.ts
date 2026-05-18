import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionEvent, ActionReceipt, RulePolicy } from '../../shared/schema';

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
      responseTemplates: {
        warning: {
          kind: 'warning',
          body: 'Hi {{target_author}}, please review {{rule_name}}.',
          deliveryMode: 'log_only',
          enabled: true,
        },
      },
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

const receipt: ActionReceipt = {
  id: 'receipt-1',
  actionEventId: actionEvent.id,
  subreddit: 'ExampleLearning',
  targetType: 'unknown',
  targetSnapshot: {
    targetType: 'unknown',
    source: 'not_provided',
    warnings: [],
  },
  modUsername: 'mod_a',
  source: 'simulator',
  recommendation: {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    policyId: policy.id,
    offenseCount: 1,
    recommendedAction: 'warn',
    messageDeliveryMode: 'log_only',
    requiresOverrideReason: true,
    selectedAction: 'warn',
    deviatesFromPolicy: false,
    fallbackReason: 'policy_found',
    message: 'Team policy recommends warn.',
  },
  selectedAction: 'warn',
  deviatesFromPolicy: false,
  executionMode: 'log_only',
  executionAttempted: false,
  executionResult: 'skipped',
  redditOperation: 'none',
  capabilityState: 'not_applicable',
  createdAt: '2026-05-16T00:00:00.000Z',
};

const getPolicyByRule = vi.fn();
const capturePolicySnapshot = vi.fn();
const listRecentActionEvents = vi.fn();
const saveActionEvent = vi.fn();
const saveOverrideEvent = vi.fn();
const createActionReceiptInput = vi.fn();
const saveActionReceipt = vi.fn();
const getActiveIncidentMode = vi.fn();

function modNoteDependencies() {
  return {
    reddit: {
      addModNote: vi.fn().mockResolvedValue({
        id: 'ModNote_1',
        type: 'NOTE',
        createdAt: new Date('2026-05-16T00:00:00.000Z'),
        operator: {},
        user: {},
        subreddit: {},
      }),
    },
    capabilities: {
      nativeModNotesEnabled: true,
      nativeModNotesRuntimeVerified: true,
      receiptCreationAvailable: true,
    },
    now: () => '2026-05-16T00:00:00.000Z',
  };
}

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

vi.mock('./receipts', () => ({
  createActionReceiptInput,
  saveActionReceipt,
}));

vi.mock('./incidentMode', () => ({
  getActiveIncidentMode,
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
    createActionReceiptInput.mockImplementation((input) => input);
    saveActionReceipt.mockResolvedValue(receipt);
    getActiveIncidentMode.mockResolvedValue(undefined);
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
    expect(preview.contentSnapshot).toEqual(
      expect.objectContaining({
        targetThingId: 't3_target_post',
        targetType: 'post',
        authorName: 'learner_1',
        fetchStatus: 'captured',
      })
    );
    expect(preview.responsePreview).toEqual(
      expect.objectContaining({
        deliveryWillBeAttempted: false,
        templates: [
          expect.objectContaining({
            kind: 'warning',
            body: 'Hi learner_1, please review Rule 2: Low-effort questions.',
            deliveryGated: true,
          }),
        ],
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
    expect(preview.targetSnapshot.warnings[0]).toMatch(/No Reddit post\/comment target/);
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
        modNoteMode: 'log_only',
      },
      modNoteDependencies: modNoteDependencies(),
    });

    expect(result.actionEvent.id).toBe('action-1');
    expect(result.receipt.id).toBe('receipt-1');
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
    expect(createActionReceiptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        actionEvent,
        execution: expect.objectContaining({
          executionMode: 'log_only',
          redditOperation: 'none',
        }),
        nativeModNote: expect.objectContaining({
          mode: 'log_only',
          status: 'skipped',
          deliveryAttempted: false,
          errorCode: 'log_only_mode',
        }),
        modUsername: 'mod_a',
      })
    );
    expect(saveActionReceipt).toHaveBeenCalled();
  });

  it('passes verified native Mod Note status into receipt creation', async () => {
    const { confirmApplyPolicy } = await import('./applyPolicy');
    const deps = modNoteDependencies();
    await confirmApplyPolicy({
      modUsername: 'mod_a',
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        targetThingId: 't3_target_post',
        targetAuthor: 'learner_1',
        selectedAction: 'warn',
        confirmed: true,
        modNoteMode: 'native',
      },
      modNoteDependencies: deps,
    });

    expect(deps.reddit.addModNote).toHaveBeenCalledWith(
      expect.objectContaining({
        subreddit: 'ExampleLearning',
        user: 'learner_1',
        redditId: 't3_target_post',
      })
    );
    expect(createActionReceiptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        nativeModNote: expect.objectContaining({
          status: 'sent',
          deliveryAttempted: true,
          noteId: 'ModNote_1',
        }),
      })
    );
  });

  it('tags receipts with the active incident ID without changing execution', async () => {
    getActiveIncidentMode.mockResolvedValue({
      id: 'incident-1',
      subreddit: 'ExampleLearning',
      status: 'active',
      reason: 'spam_flood',
      startedAt: '2026-05-16T00:00:00.000Z',
      expiresAt: '2026-05-16T02:00:00.000Z',
      presetSuggestions: [],
      triageGroups: [],
    });
    const { confirmApplyPolicy } = await import('./applyPolicy');

    await confirmApplyPolicy({
      modUsername: 'mod_a',
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: policy.ruleKey,
        selectedAction: 'warn',
        confirmed: true,
      },
    });

    expect(createActionReceiptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        incidentId: 'incident-1',
        execution: expect.objectContaining({
          executionMode: 'log_only',
          executionResult: 'skipped',
        }),
      })
    );
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
    expect(createActionReceiptInput).toHaveBeenCalledWith(
      expect.objectContaining({
        overrideEvent: expect.objectContaining({
          overrideReason: 'edge_case_mod_discretion',
        }),
      })
    );
  });
});
