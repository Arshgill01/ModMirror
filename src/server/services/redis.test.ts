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
    zAdd: vi.fn((key: string, ...values: { member: string; score: number }[]) => {
      const rows = redisState.sortedSets.get(key) ?? [];
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
  },
}));

describe('redis service diagnostics', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
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
});
