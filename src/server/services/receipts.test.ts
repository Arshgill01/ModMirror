import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionEvent,
  ApplyPolicyPreview,
  ModerationExecutionResult,
} from '../../shared/schema';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => Promise.resolve(redisState.strings.get(key))),
    set: vi.fn((key: string, value: string) => {
      redisState.strings.set(key, value);
      return Promise.resolve();
    }),
    zAdd: vi.fn((key: string, value: { member: string; score: number }) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      rows.push(value);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve();
    }),
    zRange: vi.fn((key: string, start: number, end: number) => {
      const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
        (left, right) => right.score - left.score
      );
      const normalizedEnd = end < 0 ? rows.length : end + 1;
      return Promise.resolve(rows.slice(start, normalizedEnd));
    }),
  },
}));

const preview: ApplyPolicyPreview = {
  policySnapshot: {
    policyId: 'policy-rule-2',
    policyVersionId: 'policy-version-1',
    policyVersionNumber: 1,
    policyVersionStatus: 'active',
    ruleKey: 'rule-2',
    ruleName: 'Rule 2',
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction: 'warn',
        requireOverrideReasonForDeviation: true,
      },
    ],
    defaultMessageMode: 'log_only',
    capturedAt: '2026-05-18T00:00:00.000Z',
  },
  targetSnapshot: {
    targetThingId: 't3_target_post',
    targetType: 'post',
    subreddit: 'ExampleLearning',
    authorName: 'learner_1',
    source: 'provided',
    warnings: [],
  },
  contentSnapshot: {
    schemaVersion: 1,
    targetThingId: 't3_target_post',
    targetType: 'post',
    subreddit: 'ExampleLearning',
    authorName: 'learner_1',
    titleExcerpt: 'Low-effort question',
    fetchedAt: '2026-05-18T00:00:00.000Z',
    fetchStatus: 'captured',
    source: 'provided',
    warnings: [],
    privacy: {
      retentionCategory: 'moderation_evidence',
      authorStored: true,
      titleExcerptStored: true,
      bodyExcerptStored: false,
      permalinkStored: false,
      redactionNotes: ['Test snapshot stores excerpts only.'],
    },
  },
  evidence: [],
  confirmation: {
    executionMode: 'log_only',
    willExecuteRedditAction: false,
    actionLabel: 'warn',
    requiresOverrideReason: false,
    message: 'Log only.',
    caveats: [],
  },
  recommendation: {
    ruleKey: 'rule-2',
    ruleName: 'Rule 2',
    policyId: 'policy-rule-2',
    offenseCount: 1,
    recommendedAction: 'warn',
    messageDeliveryMode: 'log_only',
    requiresOverrideReason: false,
    selectedAction: 'warn',
    deviatesFromPolicy: false,
    fallbackReason: 'policy_found',
    message: 'Team policy recommends warn.',
  },
};

const actionEvent: ActionEvent = {
  id: 'action-1',
  subreddit: 'ExampleLearning',
  targetThingId: 't3_target_post',
  targetAuthor: 'learner_1',
  ruleKey: 'rule-2',
  ruleName: 'Rule 2',
  recommendedAction: 'warn',
  selectedAction: 'warn',
  deliveryMode: 'log_only',
  source: 'live',
  createdAt: '2026-05-18T00:00:00.000Z',
};

const execution: ModerationExecutionResult = {
  executionMode: 'log_only',
  executionAttempted: false,
  executionResult: 'skipped',
  redditOperation: 'none',
  selectedAction: 'warn',
  targetThingId: 't3_target_post',
  targetType: 'post',
  capabilityState: 'not_applicable',
  startedAt: '2026-05-18T00:00:00.000Z',
  completedAt: '2026-05-18T00:00:00.000Z',
};

describe('action receipts', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
  });

  it('builds receipt input from an apply policy confirmation', async () => {
    const { createActionReceiptInput } = await import('./receipts');
    const receiptInput = createActionReceiptInput({
      preview,
      input: {
        subreddit: 'ExampleLearning',
        ruleKey: 'rule-2',
        targetThingId: 't3_target_post',
        targetAuthor: 'learner_1',
        selectedAction: 'warn',
        source: 'live',
        confirmed: true,
      },
      actionEvent,
      execution,
      modUsername: 'mod_a',
    });

    expect(receiptInput).toEqual(
      expect.objectContaining({
        actionEventId: 'action-1',
        targetThingId: 't3_target_post',
        targetType: 'post',
        modUsername: 'mod_a',
        source: 'dashboard',
        selectedAction: 'warn',
        executionResult: 'skipped',
        redditOperation: 'none',
      })
    );
    expect(receiptInput.policySnapshot?.policyVersionId).toBe(
      'policy-version-1'
    );
    expect(receiptInput.contentSnapshot?.fetchStatus).toBe('captured');
  });

  it('stores and lists receipts by subreddit and target', async () => {
    const {
      createActionReceiptInput,
      getActionReceipt,
      listActionReceipts,
      listActionReceiptsByTarget,
      saveActionReceipt,
    } = await import('./receipts');

    const first = await saveActionReceipt({
      ...createActionReceiptInput({
        preview,
        input: {
          subreddit: 'ExampleLearning',
          ruleKey: 'rule-2',
          targetThingId: 't3_target_post',
          targetAuthor: 'learner_1',
          selectedAction: 'warn',
          source: 'live',
          confirmed: true,
        },
        actionEvent,
        execution,
        modUsername: 'mod_a',
      }),
      id: 'receipt-1',
      createdAt: '2026-05-18T00:00:00.000Z',
    });
    await saveActionReceipt({
      ...createActionReceiptInput({
        preview,
        input: {
          subreddit: 'ExampleLearning',
          ruleKey: 'rule-2',
          targetThingId: 't3_target_post',
          targetAuthor: 'learner_1',
          selectedAction: 'warn',
          source: 'live',
          confirmed: true,
        },
        actionEvent: { ...actionEvent, id: 'action-2' },
        execution,
        modUsername: 'mod_b',
      }),
      id: 'receipt-2',
      createdAt: '2026-05-18T00:01:00.000Z',
    });

    await expect(
      getActionReceipt('ExampleLearning', first.id)
    ).resolves.toEqual(expect.objectContaining({ id: 'receipt-1' }));
    await expect(listActionReceipts('ExampleLearning')).resolves.toEqual([
      expect.objectContaining({ id: 'receipt-2' }),
      expect.objectContaining({ id: 'receipt-1' }),
    ]);
    await expect(
      listActionReceiptsByTarget('ExampleLearning', 't3_target_post')
    ).resolves.toHaveLength(2);
  });
});
