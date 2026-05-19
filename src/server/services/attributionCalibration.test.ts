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

  it('applies stored corrections before scan replay', async () => {
    const {
      applyAttributionCorrectionsToStoredActions,
      listAttributionCorrections,
      saveAttributionCorrection,
    } = await import('./attributionCalibration');

    await saveAttributionCorrection({
      subreddit: 'ExampleLearning',
      actionId: 'act-1',
      sourceScanId: 'scan-live',
      originalConfidence: 'unmatched',
      correctedRuleKey: 'low-effort-questions-2',
      correctedRuleName: 'Low-effort questions',
      correctedBy: 'leadmod',
      note: 'Replay should honor the moderator correction.',
    });

    const [corrected] = applyAttributionCorrectionsToStoredActions(
      [
        {
          id: 'act-1',
          subreddit: 'ExampleLearning',
          source: 'live',
          rawActionType: 'remove',
          normalizedAction: 'remove',
          createdAt: '2026-05-18T00:00:00.000Z',
          confidence: 'unmatched',
          attributionKind: 'unmatched',
          evidence: ['No rule signal met the minimum attribution threshold.'],
        },
      ],
      await listAttributionCorrections('ExampleLearning')
    );

    expect(corrected).toBeDefined();
    if (corrected === undefined) {
      throw new Error('expected corrected action');
    }
    expect(corrected).toMatchObject({
      inferredRuleKey: 'low-effort-questions-2',
      inferredRuleName: 'Low-effort questions',
      confidence: 'high',
      attributionKind: 'corrected',
      correction: {
        correctedRuleKey: 'low-effort-questions-2',
        correctedRuleName: 'Low-effort questions',
        correctedBy: 'leadmod',
        originalConfidence: 'unmatched',
      },
    });
    expect(corrected.evidence[0]).toContain('Moderator correction applied');
  });

  it('does not apply one correction to every action with a shared non-content target', async () => {
    const {
      applyAttributionCorrectionsToStoredActions,
      createAttributionCorrectionIndex,
      listAttributionCorrections,
      saveAttributionCorrection,
    } = await import('./attributionCalibration');

    await saveAttributionCorrection({
      subreddit: 'ExampleLearning',
      actionId: 'act-1',
      targetThingId: 't5_shared_subreddit',
      originalConfidence: 'unmatched',
      correctedRuleKey: 'low-effort-questions-2',
      correctedBy: 'leadmod',
    });

    const corrections = await listAttributionCorrections('ExampleLearning');
    const index = createAttributionCorrectionIndex(corrections);

    expect(corrections[0]?.targetThingId).toBeUndefined();
    expect(index.byTargetThingId.size).toBe(0);

    const corrected = applyAttributionCorrectionsToStoredActions(
      [
        {
          id: 'act-1',
          subreddit: 'ExampleLearning',
          source: 'live',
          rawActionType: 'dev_platform_app_changed',
          createdAt: '2026-05-18T00:00:00.000Z',
          confidence: 'unmatched',
          attributionKind: 'unmatched',
          evidence: ['No rule signal met the minimum attribution threshold.'],
        },
        {
          id: 'act-2',
          subreddit: 'ExampleLearning',
          source: 'live',
          rawActionType: 'dev_platform_app_changed',
          createdAt: '2026-05-18T00:01:00.000Z',
          targetThingId: 't5_shared_subreddit',
          confidence: 'unmatched',
          attributionKind: 'unmatched',
          evidence: ['No rule signal met the minimum attribution threshold.'],
        },
      ],
      corrections
    );

    expect(corrected[0]?.inferredRuleKey).toBe('low-effort-questions-2');
    expect(corrected[1]?.inferredRuleKey).toBeUndefined();
    expect(corrected[1]?.confidence).toBe('unmatched');
  });
});
