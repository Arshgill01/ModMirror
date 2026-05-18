import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MirrorScanRecord } from '../../shared/schema';

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
    zRemRangeByRank: vi.fn((key: string, start: number, stop: number) => {
      const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
        (left, right) => left.score - right.score
      );
      rows.splice(start, stop < 0 ? rows.length + stop + 1 : stop - start + 1);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve();
    }),
  },
}));

describe('scan persistence', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
  });

  it('stores full scan records and lists metadata by source', async () => {
    const { getScanRecord, listScanMetadata, saveScanRecord } = await import(
      './scans'
    );
    await saveScanRecord(scanRecord('scan-demo-1', 'demo', 0));
    await saveScanRecord(scanRecord('scan-live-1', 'live', 60_000));

    await expect(
      getScanRecord('ExampleLearning', 'scan-demo-1')
    ).resolves.toEqual(
      expect.objectContaining({
        id: 'scan-demo-1',
        attributedActions: expect.arrayContaining([
          expect.objectContaining({ id: 'action-1' }),
        ]),
      })
    );
    await expect(listScanMetadata('ExampleLearning')).resolves.toEqual([
      expect.objectContaining({ id: 'scan-live-1', source: 'live' }),
      expect.objectContaining({ id: 'scan-demo-1', source: 'demo' }),
    ]);
    await expect(
      listScanMetadata('ExampleLearning', { source: 'demo' })
    ).resolves.toEqual([
      expect.objectContaining({ id: 'scan-demo-1', source: 'demo' }),
    ]);
  });

  it('compares two persisted scans', async () => {
    const { compareScanRecords, saveScanRecord } = await import('./scans');
    await saveScanRecord(scanRecord('scan-a', 'demo', 0));
    await saveScanRecord({
      ...scanRecord('scan-b', 'demo', 60_000),
      totalActionsScanned: 4,
      attributedCount: 3,
      unmatchedCount: 1,
      confidenceBreakdown: {
        high: 2,
        medium: 1,
        low: 0,
        unmatched: 1,
      },
      driftCandidates: [
        {
          ruleKey: 'rule-2',
          ruleName: 'Rule 2',
          confidence: 'high',
          summary: 'Rule 2 drift',
          totalActions: 3,
          actionDistribution: { warn: 1, remove: 2 },
          recommendation: 'Review policy',
        },
      ],
    });

    await expect(
      compareScanRecords('ExampleLearning', 'scan-a', 'scan-b')
    ).resolves.toEqual(
      expect.objectContaining({
        leftScanId: 'scan-a',
        rightScanId: 'scan-b',
        totalActionsDelta: 1,
        attributedDelta: 1,
        unmatchedDelta: 0,
        driftCandidateDelta: 1,
        confidenceDelta: {
          high: 1,
          medium: 0,
          low: 0,
          unmatched: 0,
        },
      })
    );
  });
});

function scanRecord(
  id: string,
  source: MirrorScanRecord['source'],
  offsetMs: number
): MirrorScanRecord {
  const createdAt = new Date(
    Date.parse('2026-05-18T00:00:00.000Z') + offsetMs
  ).toISOString();

  return {
    id,
    subreddit: 'ExampleLearning',
    createdAt,
    createdBy: 'mod_a',
    source,
    totalActionsScanned: 3,
    attributedCount: 2,
    unmatchedCount: 1,
    confidenceBreakdown: {
      high: 1,
      medium: 1,
      low: 0,
      unmatched: 1,
    },
    driftCandidates: [],
    smallSubredditStatus: {
      meetsThreshold: false,
      observedActions: 3,
      minimumActions: 8,
      message: 'Not enough recent actions for confident drift display.',
    },
    warnings: source === 'demo' ? ['Demo dataset'] : [],
    attributedActions: [
      {
        id: 'action-1',
        subreddit: 'ExampleLearning',
        source,
        rawActionType: 'remove',
        normalizedAction: 'remove',
        targetAuthor: 'Learner_1',
        createdAt,
        inferredRuleKey: 'rule-2',
        inferredRuleName: 'Rule 2',
        confidence: 'high',
        evidence: ['Matched rule text'],
      },
      {
        id: 'action-2',
        subreddit: 'ExampleLearning',
        source,
        rawActionType: 'approve',
        normalizedAction: 'approve',
        createdAt,
        confidence: 'unmatched',
        evidence: ['No deterministic match'],
      },
    ],
    unmatchedActions: [
      {
        id: 'action-2',
        subreddit: 'ExampleLearning',
        source,
        rawActionType: 'approve',
        normalizedAction: 'approve',
        createdAt,
        confidence: 'unmatched',
        evidence: ['No deterministic match'],
      },
    ],
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: 2,
    },
  };
}
