import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  hashes: new Map<string, Record<string, string>>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    hSet: vi.fn((key: string, values: Record<string, string>) => {
      redisState.hashes.set(key, {
        ...(redisState.hashes.get(key) ?? {}),
        ...values,
      });
      return Promise.resolve();
    }),
    hGetAll: vi.fn((key: string) =>
      Promise.resolve(redisState.hashes.get(key) ?? {})
    ),
    zAdd: vi.fn((key: string, value: { member: string; score: number }) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      rows.push(value);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve();
    }),
  },
}));

describe('attribution calibration persistence', () => {
  beforeEach(() => {
    redisState.hashes.clear();
    redisState.sortedSets.clear();
  });

  it('stores and indexes moderator corrections', async () => {
    const {
      createAttributionCorrectionIndex,
      listAttributionCorrections,
      saveAttributionCorrection,
    } = await import('./attributionCalibration');

    const correction = await saveAttributionCorrection({
      subreddit: 'ExampleLearning',
      actionId: 'act-1',
      targetThingId: 't3_post_1',
      sourceScanId: 'scan-demo',
      originalRuleKey: 'low-effort-questions-2',
      originalRuleName: 'Low-effort questions',
      originalConfidence: 'medium',
      correctedRuleKey: 'self-promotion-3',
      correctedRuleName: 'Self-promotion',
      correctedBy: 'leadmod',
      note: 'Moderator says this was a promotional link.',
    });

    const corrections = await listAttributionCorrections('ExampleLearning');
    const index = createAttributionCorrectionIndex(corrections);

    expect(correction.id).toMatch(/^attr-correction-/);
    expect(corrections).toHaveLength(1);
    expect(index.byActionId.get('act-1')?.correctedRuleKey).toBe(
      'self-promotion-3'
    );
    expect(index.byTargetThingId.get('t3_post_1')?.correctedBy).toBe('leadmod');
  });

  it('rejects empty corrected rule keys', async () => {
    const { saveAttributionCorrection } = await import('./attributionCalibration');

    await expect(
      saveAttributionCorrection({
        subreddit: 'ExampleLearning',
        actionId: 'act-1',
        originalConfidence: 'low',
        correctedRuleKey: ' ',
        correctedBy: 'leadmod',
      })
    ).rejects.toThrow('correctedRuleKey is required');
  });
});
