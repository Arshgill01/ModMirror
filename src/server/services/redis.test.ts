import { beforeEach, describe, expect, it, vi } from 'vitest';

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
      for (const value of values) {
        const existingIndex = rows.findIndex((row) => row.member === value.member);
        if (existingIndex >= 0) {
          rows.splice(existingIndex, 1);
        }
      }
      rows.push(...values);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve(values.length);
    }),
    zCard: vi.fn((key: string) =>
      Promise.resolve(redisState.sortedSets.get(key)?.length ?? 0)
    ),
    zScore: vi.fn((key: string, member: string) =>
      Promise.resolve(
        redisState.sortedSets.get(key)?.find((row) => row.member === member)
          ?.score
      )
    ),
    zRange: vi.fn(
      (
        key: string,
        start: number,
        end: number,
        options?: { reverse?: boolean }
      ) => {
        const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
          (left, right) =>
            options?.reverse ? right.score - left.score : left.score - right.score
        );
        const normalizedEnd = end < 0 ? rows.length : end + 1;
        return Promise.resolve(rows.slice(start, normalizedEnd));
      }
    ),
    zRem: vi.fn((key: string, members: string[]) => {
      const memberSet = new Set(members);
      const rows = redisState.sortedSets.get(key) ?? [];
      const retainedRows = rows.filter((row) => !memberSet.has(row.member));
      redisState.sortedSets.set(key, retainedRows);
      return Promise.resolve(rows.length - retainedRows.length);
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

describe('redis service diagnostics', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('treats malformed JSON index members as stale instead of throwing', async () => {
    const { parseJson } = await import('./redis');

    expect(parseJson('{not-json')).toBeUndefined();
  });

  it('round-trips the Redis data smoke key', async () => {
    const { runRedisDataSmoke } = await import('./redis');

    const result = await runRedisDataSmoke('ExampleLearning');

    expect(result.ok).toBe(true);
    expect(result.key).toBe('modmirror:ExampleLearning:smoke:redis-data-layer');
    expect(result.readBack).toBe(result.value);
  });

  it('verifies sorted-set reverse-rank ordering and cleans the smoke key', async () => {
    const { redisKeys, runRedisSortedSetSmoke } = await import('./redis');

    const result = await runRedisSortedSetSmoke('ExampleLearning');

    expect(result).toEqual({
      key: 'modmirror:ExampleLearning:smoke:redis-zset-ordering',
      addCount: 3,
      cardinality: 3,
      expectedOrder: ['newest', 'middle', 'oldest'],
      observedOrder: ['newest', 'middle', 'oldest'],
      observedScores: [3000, 2000, 1000],
      scoreChecks: {
        newest: 3000,
        middle: 2000,
        oldest: 1000,
      },
      ok: true,
    });
    expect(redisState.sortedSets.has(redisKeys.smokeSortedSet('ExampleLearning'))).toBe(
      false
    );
  });

  it('verifies the bounded Redis storage envelope and cleans smoke keys', async () => {
    const { redisKeys, runRedisStorageSmoke } = await import('./redis');

    const result = await runRedisStorageSmoke('ExampleLearning');

    expect(result.keys).toEqual({
      scanRecord: 'modmirror:ExampleLearning:smoke:redis-storage:scan-record',
      scanIndex: 'modmirror:ExampleLearning:smoke:redis-storage:scan-index',
      actions: 'modmirror:ExampleLearning:smoke:redis-storage:actions',
      overrides: 'modmirror:ExampleLearning:smoke:redis-storage:overrides',
    });
    expect(result.expected).toEqual({
      scanMetadataCount: 10,
      actionEventCount: 500,
      overrideEventCount: 500,
    });
    expect(result.observed.scanRecordBytes).toBeGreaterThan(0);
    expect(result.observed.scanIndexCardinality).toBe(10);
    expect(result.observed.actionIndexCardinality).toBe(500);
    expect(result.observed.overrideIndexCardinality).toBe(500);
    expect(result.observed.postCleanupExistingKeys).toBe(0);
    expect(result.ok).toBe(true);
    expect(
      redisState.strings.has(redisKeys.smokeStorageScanRecord('ExampleLearning'))
    ).toBe(false);
    expect(
      redisState.sortedSets.has(
        redisKeys.smokeStorageScanIndex('ExampleLearning')
      )
    ).toBe(false);
    expect(
      redisState.sortedSets.has(
        redisKeys.smokeStorageActions('ExampleLearning')
      )
    ).toBe(false);
    expect(
      redisState.sortedSets.has(
        redisKeys.smokeStorageOverrides('ExampleLearning')
      )
    ).toBe(false);
  });

  it('compacts stale JSON sorted-set members while preserving newest records', async () => {
    const { readCompactedJsonSortedSet, serializeJson } = await import('./redis');
    const key = 'modmirror:ExampleLearning:mutable-index';

    redisState.sortedSets.set(key, [
      {
        member: 'not-json',
        score: 4000,
      },
      {
        member: serializeJson({ id: 'policy-1', revision: 2 }),
        score: 3000,
      },
      {
        member: serializeJson({ id: 'policy-2', revision: 1 }),
        score: 2000,
      },
      {
        member: serializeJson({ id: 'policy-1', revision: 1 }),
        score: 1000,
      },
    ]);

    const result = await readCompactedJsonSortedSet<{
      id: string;
      revision: number;
    }>(key, {
      limit: 10,
      getStableId: (record) => record.id,
    });

    expect(result.values).toEqual([
      { id: 'policy-1', revision: 2 },
      { id: 'policy-2', revision: 1 },
    ]);
    expect(result.staleMembers).toEqual([
      'not-json',
      serializeJson({ id: 'policy-1', revision: 1 }),
    ]);
    expect(result.removedCount).toBe(2);
    expect(redisState.sortedSets.get(key)).toEqual([
      {
        member: serializeJson({ id: 'policy-1', revision: 2 }),
        score: 3000,
      },
      {
        member: serializeJson({ id: 'policy-2', revision: 1 }),
        score: 2000,
      },
    ]);
  });

  it('upserts mutable JSON sorted-set records without leaving stale members', async () => {
    const { parseJson, upsertJsonSortedSetMember } = await import('./redis');
    const key = 'modmirror:ExampleLearning:upsert-index';

    await upsertJsonSortedSetMember(
      key,
      { id: 'policy-1', status: 'draft' },
      1000,
      (record) => record.id,
      { maxCount: 2 }
    );
    await upsertJsonSortedSetMember(
      key,
      { id: 'policy-2', status: 'active' },
      2000,
      (record) => record.id,
      { maxCount: 2 }
    );
    await upsertJsonSortedSetMember(
      key,
      { id: 'policy-1', status: 'active' },
      3000,
      (record) => record.id,
      { maxCount: 2 }
    );
    await upsertJsonSortedSetMember(
      key,
      { id: 'policy-3', status: 'draft' },
      4000,
      (record) => record.id,
      { maxCount: 2 }
    );

    const rows = redisState.sortedSets.get(key) ?? [];
    const records = rows
      .sort((left, right) => right.score - left.score)
      .map((row) => parseJson<{ id: string; status: string }>(row.member));

    expect(records).toEqual([
      { id: 'policy-3', status: 'draft' },
      { id: 'policy-1', status: 'active' },
    ]);
    expect(records.filter((record) => record?.id === 'policy-1')).toHaveLength(1);
  });

  it('deletes mutable JSON sorted-set records by stable id', async () => {
    const { deleteJsonSortedSetMembersById, serializeJson } = await import(
      './redis'
    );
    const key = 'modmirror:ExampleLearning:delete-index';

    redisState.sortedSets.set(key, [
      {
        member: serializeJson({ id: 'policy-1', revision: 1 }),
        score: 1000,
      },
      {
        member: serializeJson({ id: 'policy-2', revision: 1 }),
        score: 2000,
      },
      {
        member: serializeJson({ id: 'policy-1', revision: 2 }),
        score: 3000,
      },
    ]);

    const removedCount = await deleteJsonSortedSetMembersById<{
      id: string;
      revision: number;
    }>(key, ['policy-1'], (record) => record.id);

    expect(removedCount).toBe(2);
    expect(redisState.sortedSets.get(key)).toEqual([
      {
        member: serializeJson({ id: 'policy-2', revision: 1 }),
        score: 2000,
      },
    ]);
  });

  it('keeps the currently verified local storage caps unchanged', async () => {
    const {
      ACTION_EVENT_HISTORY_LIMIT,
      OVERRIDE_EVENT_HISTORY_LIMIT,
      SCAN_HISTORY_LIMIT,
    } = await import('../../shared/constants');

    expect(SCAN_HISTORY_LIMIT).toBe(10);
    expect(ACTION_EVENT_HISTORY_LIMIT).toBe(500);
    expect(OVERRIDE_EVENT_HISTORY_LIMIT).toBe(500);
  });
});
