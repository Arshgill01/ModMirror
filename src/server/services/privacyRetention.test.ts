import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionReceipt,
  EvidenceBoardThread,
  LastScanMetadata,
  TeamDeliveryReceipt,
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
    del: vi.fn((...keys: string[]) => {
      for (const key of keys) {
        redisState.strings.delete(key);
        redisState.sortedSets.delete(key);
      }
      return Promise.resolve();
    }),
    exists: vi.fn((...keys: string[]) =>
      Promise.resolve(
        keys.filter(
          (key) =>
            redisState.strings.has(key) || redisState.sortedSets.has(key)
        ).length
      )
    ),
    zAdd: vi.fn((key: string, ...values: { member: string; score: number }[]) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      rows.push(...values);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve(values.length);
    }),
    zRem: vi.fn((key: string, members: string[]) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      redisState.sortedSets.set(
        key,
        rows.filter((row) => !members.includes(row.member))
      );
      return Promise.resolve();
    }),
    zScore: vi.fn((key: string, member: string) =>
      Promise.resolve(
        redisState.sortedSets.get(key)?.find((row) => row.member === member)
          ?.score
      )
    ),
  },
}));

describe('privacy retention service', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('returns conservative default settings with protected policy history', async () => {
    const { getPrivacyRetentionSettings } = await import('./privacyRetention');

    await expect(getPrivacyRetentionSettings('ExampleLearning')).resolves.toEqual({
      subreddit: 'ExampleLearning',
      updatedAt: '1970-01-01T00:00:00.000Z',
      scanHistoryDays: 90,
      actionReceiptDays: 180,
      evidenceBoardDays: 365,
      teamDeliveryReceiptDays: 180,
      aiAdvisoryLogDays: 30,
      casePacketDays: 180,
      protectPolicyHistory: true,
    });
  });

  it('normalizes retention updates and keeps policy history protected', async () => {
    const { getPrivacyRetentionSettings, updatePrivacyRetentionSettings } =
      await import('./privacyRetention');

    const updated = await updatePrivacyRetentionSettings({
      subreddit: 'ExampleLearning',
      updatedBy: 'lead_mod',
      request: {
        scanHistoryDays: 0,
        actionReceiptDays: 3651,
        evidenceBoardDays: 30.8,
      },
    });

    expect(updated).toMatchObject({
      subreddit: 'ExampleLearning',
      updatedBy: 'lead_mod',
      scanHistoryDays: 1,
      actionReceiptDays: 3650,
      evidenceBoardDays: 30,
      protectPolicyHistory: true,
    });
    await expect(getPrivacyRetentionSettings('ExampleLearning')).resolves.toEqual(
      updated
    );
  });

  it('exports inventory counts without exposing private payloads', async () => {
    const { exportPrivacyRetentionInventory } = await import('./privacyRetention');

    const exported = await exportPrivacyRetentionInventory({
      subreddit: 'ExampleLearning',
      dependencies: {
        now: () => '2026-05-18T12:00:00.000Z',
        listScans: vi.fn().mockResolvedValue([scan('scan-1')]),
        listReceipts: vi.fn().mockResolvedValue([receipt('receipt-1')]),
        listEvidenceBoards: vi.fn().mockResolvedValue([board('board-1')]),
        listTeamDeliveryReceipts: vi.fn().mockResolvedValue([
          deliveryReceipt('delivery-1'),
        ]),
      },
    });

    expect(exported.exportedAt).toBe('2026-05-18T12:00:00.000Z');
    expect(exported.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'scan_history',
          retainedCount: 1,
          deletedCount: 0,
        }),
        expect.objectContaining({
          category: 'policy_history',
          protected: true,
        }),
      ])
    );
    expect(JSON.stringify(exported)).not.toContain('Queue discussion');
    expect(exported.warnings.join(' ')).toContain('inventory');
  });

  it('dry-runs manual category deletion without deleting Redis keys', async () => {
    const deleteKeys = vi.fn();
    const zRem = vi.fn();
    const { deletePrivacyData } = await import('./privacyRetention');

    const result = await deletePrivacyData({
      subreddit: 'ExampleLearning',
      request: {
        categories: ['action_receipts'],
        dryRun: true,
      },
      dependencies: {
        now: () => '2026-05-18T12:00:00.000Z',
        listScans: vi.fn().mockResolvedValue([]),
        listReceipts: vi.fn().mockResolvedValue([receipt('receipt-1')]),
        listEvidenceBoards: vi.fn().mockResolvedValue([]),
        listTeamDeliveryReceipts: vi.fn().mockResolvedValue([]),
        deleteKeys,
        zRem,
      },
    });

    expect(result.dryRun).toBe(true);
    expect(result.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'action_receipts',
          deletedCount: 1,
          retainedCount: 0,
        }),
        expect.objectContaining({
          category: 'policy_history',
          protected: true,
        }),
      ])
    );
    expect(deleteKeys).not.toHaveBeenCalled();
    expect(zRem).not.toHaveBeenCalled();
  });

  it('cleans only expired records according to retention windows', async () => {
    const deleteKeys = vi.fn();
    const zRem = vi.fn();
    const { cleanupExpiredPrivacyData, updatePrivacyRetentionSettings } =
      await import('./privacyRetention');

    await updatePrivacyRetentionSettings({
      subreddit: 'ExampleLearning',
      request: {
        scanHistoryDays: 10,
        actionReceiptDays: 10,
        evidenceBoardDays: 10,
        teamDeliveryReceiptDays: 10,
      },
    });
    const result = await cleanupExpiredPrivacyData({
      subreddit: 'ExampleLearning',
      dryRun: false,
      dependencies: {
        now: () => '2026-05-18T12:00:00.000Z',
        listScans: vi.fn().mockResolvedValue([
          scan('scan-old', '2026-05-01T12:00:00.000Z'),
          scan('scan-fresh', '2026-05-17T12:00:00.000Z'),
        ]),
        getLastScan: vi.fn().mockResolvedValue(scan('scan-fresh')),
        listReceipts: vi.fn().mockResolvedValue([
          receipt('receipt-old', '2026-05-01T12:00:00.000Z'),
          receipt('receipt-fresh', '2026-05-17T12:00:00.000Z'),
        ]),
        listEvidenceBoards: vi.fn().mockResolvedValue([
          board('board-old', '2026-05-01T12:00:00.000Z'),
          board('board-fresh', '2026-05-17T12:00:00.000Z'),
        ]),
        listTeamDeliveryReceipts: vi.fn().mockResolvedValue([
          deliveryReceipt('delivery-old', '2026-05-01T12:00:00.000Z'),
          deliveryReceipt('delivery-fresh', '2026-05-17T12:00:00.000Z'),
        ]),
        deleteKeys,
        zRem,
      },
    });

    expect(result.categories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'scan_history',
          deletedCount: 1,
          retainedCount: 1,
        }),
        expect.objectContaining({
          category: 'action_receipts',
          deletedCount: 1,
          retainedCount: 1,
        }),
        expect.objectContaining({
          category: 'evidence_boards',
          deletedCount: 1,
          retainedCount: 1,
        }),
        expect.objectContaining({
          category: 'team_delivery_receipts',
          deletedCount: 1,
          retainedCount: 1,
        }),
      ])
    );
    expect(deleteKeys).toHaveBeenCalledWith(
      'modmirror:ExampleLearning:scan:scan-old'
    );
    expect(deleteKeys).toHaveBeenCalledWith(
      'modmirror:ExampleLearning:receipt:receipt-old'
    );
    expect(deleteKeys).toHaveBeenCalledWith(
      'modmirror:ExampleLearning:evidence:board:board-old'
    );
    expect(deleteKeys).toHaveBeenCalledWith(
      'modmirror:ExampleLearning:delivery:receipt:delivery-old'
    );
    expect(JSON.stringify(result.categories)).toContain('policy_history');
  });

  it('runs a synthetic retention cleanup smoke check through Redis indexes', async () => {
    const { runRetentionCleanupSmoke } = await import('./privacyRetention');
    const { redisKeys } = await import('./redis');

    const result = await runRetentionCleanupSmoke('ExampleLearning');

    expect(result).toMatchObject({
      subreddit: 'ExampleLearning',
      expected: {
        scanHistoryDeleted: 1,
        actionReceiptsDeleted: 1,
        evidenceBoardsDeleted: 1,
        teamDeliveryReceiptsDeleted: 1,
      },
      observed: {
        scanHistoryDeleted: 1,
        actionReceiptsDeleted: 1,
        evidenceBoardsDeleted: 1,
        teamDeliveryReceiptsDeleted: 1,
        detailKeysRemaining: 0,
        indexReferencesRemaining: 0,
      },
      ok: true,
    });
    expect(
      redisState.strings.has(redisKeys.scan('ExampleLearning', 'retention-smoke-scan'))
    ).toBe(false);
    expect(
      redisState.strings.has(
        redisKeys.receipt('ExampleLearning', 'retention-smoke-receipt')
      )
    ).toBe(false);
    expect(
      redisState.sortedSets
        .get(redisKeys.scans('ExampleLearning'))
        ?.some((row) => row.member.includes('retention-smoke-scan')) ?? false
    ).toBe(false);
    expect(
      redisState.sortedSets
        .get(redisKeys.receipts('ExampleLearning'))
        ?.some((row) => row.member.includes('retention-smoke-receipt')) ?? false
    ).toBe(false);
  });
});

function scan(
  id: string,
  createdAt = '2026-05-01T12:00:00.000Z'
): LastScanMetadata {
  return {
    id,
    subreddit: 'ExampleLearning',
    createdAt,
    createdBy: 'mod_a',
    source: 'live',
    totalActionsScanned: 3,
    attributedCount: 2,
    unmatchedCount: 1,
    confidenceBreakdown: {
      high: 1,
      medium: 1,
      low: 0,
      unmatched: 1,
    },
    driftCandidateCount: 1,
  };
}

function receipt(
  id: string,
  createdAt = '2026-05-01T12:00:00.000Z'
): ActionReceipt {
  return {
    id,
    actionEventId: `action-${id}`,
    subreddit: 'ExampleLearning',
    targetThingId: 't3_target',
    targetType: 'post',
    targetSnapshot: {
      targetThingId: 't3_target',
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    modUsername: 'mod_a',
    source: 'dashboard',
    recommendation: {
      ruleKey: 'rule-2',
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: false,
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
    createdAt,
  };
}

function board(
  id: string,
  updatedAt = '2026-05-01T12:00:00.000Z'
): EvidenceBoardThread {
  return {
    id,
    subreddit: 'ExampleLearning',
    title: 'Rule 2 review',
    status: 'open',
    subject: {
      policyId: 'policy-2',
    },
    evidence: [],
    statusHistory: [
      {
        toStatus: 'open',
        changedAt: updatedAt,
      },
    ],
    createdAt: updatedAt,
    updatedAt,
  };
}

function deliveryReceipt(
  id: string,
  createdAt = '2026-05-01T12:00:00.000Z'
): TeamDeliveryReceipt {
  return {
    id,
    subreddit: 'ExampleLearning',
    channel: 'manual_markdown',
    subjectType: 'digest',
    title: 'Queue discussion',
    status: 'manual_ready',
    requestedBy: 'lead_mod',
    createdAt,
    deliveryAttempted: false,
    runtimeVerified: false,
    previewMarkdown: '# Digest',
  };
}
