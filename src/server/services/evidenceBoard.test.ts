import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionReceipt,
  CasePacket,
  OverrideEvent,
  PolicyChangeEvent,
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

const receipt: ActionReceipt = {
  id: 'receipt-1',
  actionEventId: 'action-1',
  subreddit: 'ExampleLearning',
  targetThingId: 't3_target',
  targetType: 'post',
  targetSnapshot: {
    targetThingId: 't3_target',
    targetType: 'post',
    authorName: 'learner_1',
    title: 'Low-effort question',
    source: 'provided',
    warnings: [],
  },
  contentSnapshot: {
    schemaVersion: 1,
    targetThingId: 't3_target',
    targetType: 'post',
    subreddit: 'ExampleLearning',
    authorName: 'learner_1',
    titleExcerpt: 'Low-effort question',
    bodyExcerpt: 'How do I learn everything fast?',
    fetchedAt: '2026-05-18T10:00:00.000Z',
    fetchStatus: 'captured',
    source: 'receipt',
    warnings: [],
    privacy: {
      retentionCategory: 'moderation_evidence',
      authorStored: true,
      titleExcerptStored: true,
      bodyExcerptStored: true,
      permalinkStored: false,
      redactionNotes: ['Snapshot stores bounded excerpts only.'],
    },
  },
  modUsername: 'mod_a',
  source: 'dashboard',
  recommendation: {
    ruleKey: 'rule-2',
    ruleName: 'Low-effort questions',
    policyId: 'policy-2',
    offenseCount: 1,
    recommendedAction: 'warn',
    messageDeliveryMode: 'log_only',
    requiresOverrideReason: true,
    selectedAction: 'remove',
    deviatesFromPolicy: true,
    fallbackReason: 'policy_found',
    message: 'Team policy recommends warn.',
  },
  selectedAction: 'remove',
  deviatesFromPolicy: true,
  overrideEventId: 'override-1',
  overrideReason: 'severe_context',
  executionMode: 'log_only',
  executionAttempted: false,
  executionResult: 'skipped',
  redditOperation: 'none',
  capabilityState: 'not_applicable',
  createdAt: '2026-05-18T10:00:00.000Z',
};

const override: OverrideEvent = {
  id: 'override-1',
  subreddit: 'ExampleLearning',
  modUsername: 'mod_a',
  targetThingId: 't3_target',
  targetAuthor: 'learner_1',
  ruleKey: 'rule-2',
  ruleName: 'Low-effort questions',
  recommendedAction: 'warn',
  selectedAction: 'remove',
  overrideReason: 'severe_context',
  reviewStatus: 'unresolved',
  createdAt: '2026-05-18T10:00:10.000Z',
  updatedAt: '2026-05-18T10:00:10.000Z',
};

const policyChange: PolicyChangeEvent = {
  id: 'change-1',
  policyId: 'policy-2',
  policyVersionId: 'policy-2-v2',
  policyVersionNumber: 2,
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2',
  ruleName: 'Low-effort questions',
  changeType: 'adopted',
  changedAt: '2026-05-18T09:00:00.000Z',
  changedBy: 'lead_mod',
  changeSummary: 'Clarified first-offense handling.',
};

const casePacket: CasePacket = {
  id: 'case-packet-1',
  generatedAt: '2026-05-18T10:05:00.000Z',
  subreddit: 'ExampleLearning',
  packetType: 'appeal_context',
  subject: {
    type: 'action',
    actionId: 'action-1',
    receiptId: 'receipt-1',
  },
  action: {
    actionId: 'action-1',
    receiptId: 'receipt-1',
    targetThingId: 't3_target',
    targetAuthor: 'learner_1',
    ruleKey: 'rule-2',
    ruleName: 'Low-effort questions',
    recommendedAction: 'warn',
    selectedAction: 'remove',
  },
  policyContext: {
    policyId: 'policy-2',
    policyVersionId: 'policy-2-v2',
    ruleKey: 'rule-2',
    ruleName: 'Low-effort questions',
  },
  consistencyStatus: 'stricter_than_policy',
  userHistory: [],
  comparableCases: [
    {
      actionId: 'action-comparable',
      receiptId: 'receipt-comparable',
      createdAt: '2026-05-17T10:00:00.000Z',
      ruleKey: 'rule-2',
      ruleName: 'Low-effort questions',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      offenseBucket: 'first_offense',
      selectedActionFamily: 'warn',
      recommendedActionFamily: 'warn',
      matchReasons: ['same rule', 'same offense bucket'],
      anonymizedTargetAuthor: 'user-ab12',
      evidenceSource: 'verified_receipt',
    },
  ],
  evidence: [
    {
      label: 'Action receipt',
      source: 'verified_receipt',
      detail: 'Receipt-backed case packet.',
    },
  ],
  appealPosture: 'review_recommended',
  caveats: [],
  markdown: '# Case packet',
};

describe('evidence board service', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('collects receipts, snapshots, overrides, case packets, comparables, and policy changes', async () => {
    const { createEvidenceBoard, listEvidenceBoards } = await import(
      './evidenceBoard'
    );

    const board = await createEvidenceBoard({
      subreddit: 'ExampleLearning',
      createdBy: 'lead_mod',
      dependencies: {
        getReceipt: vi.fn().mockResolvedValue(receipt),
        getOverride: vi.fn().mockResolvedValue(override),
        listPolicyChanges: vi.fn().mockResolvedValue([policyChange]),
      },
      request: {
        title: 'Review Rule 2 appeal',
        casePacket,
        sourceRefs: [
          { source: 'receipt', id: receipt.id },
          { source: 'policy_change', id: policyChange.id, policyId: 'policy-2' },
        ],
      },
    });
    const boards = await listEvidenceBoards('ExampleLearning');
    const sources = board.evidence.map((item) => item.source);

    expect(sources).toEqual([
      'receipt',
      'content_snapshot',
      'override',
      'policy_change',
      'case_packet',
      'comparable_case',
    ]);
    expect(board.subject).toMatchObject({
      receiptId: 'receipt-1',
      casePacketId: 'case-packet-1',
      ruleKey: 'rule-2',
    });
    expect(board.evidence.every((item) => !item.privacy.authorCopiedToBoard)).toBe(
      true
    );
    expect(
      board.evidence.every((item) => !item.privacy.moderatorNameCopiedToBoard)
    ).toBe(true);
    expect(boards[0]?.id).toBe(board.id);
  });

  it('updates status and appends lifecycle history', async () => {
    const { createEvidenceBoard, updateEvidenceBoardStatus } = await import(
      './evidenceBoard'
    );

    const board = await createEvidenceBoard({
      subreddit: 'ExampleLearning',
      request: {
        title: 'Review Rule 2 appeal',
        sourceRefs: [],
      },
    });
    const updated = await updateEvidenceBoardStatus({
      subreddit: 'ExampleLearning',
      boardId: board.id,
      changedBy: 'lead_mod',
      request: {
        status: 'needs_policy_change',
        note: 'Policy wording needs a clearer first-offense branch.',
      },
    });

    expect(updated?.status).toBe('needs_policy_change');
    expect(updated?.statusHistory).toHaveLength(2);
    expect(updated?.statusHistory[1]).toMatchObject({
      fromStatus: 'open',
      toStatus: 'needs_policy_change',
      changedBy: 'lead_mod',
    });
  });

  it('rejects invalid status updates', async () => {
    const { validateEvidenceBoardStatus } = await import('./evidenceBoard');

    expect(() => validateEvidenceBoardStatus('not_real')).toThrow(
      'Invalid evidence board status'
    );
  });
});
