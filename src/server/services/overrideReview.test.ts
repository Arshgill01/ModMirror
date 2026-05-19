import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => redisState.strings.get(key)),
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

describe('override review state', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
  });

  it('defaults new overrides to unresolved', async () => {
    const { saveOverrideEvent } = await import('./audit');
    const override = await saveOverrideEvent({
      id: 'override-1',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_a',
      ruleKey: 'rule-2-low-effort-questions-2',
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'edge_case_mod_discretion',
      createdAt: '2026-05-16T00:00:00.000Z',
    });

    expect(override.reviewStatus).toBe('unresolved');
    expect(override.updatedAt).toBe(override.createdAt);
  });

  it('updates review status while preserving original override fields', async () => {
    const { getOverrideEvent, saveOverrideEvent, updateOverrideReview } =
      await import('./audit');
    await saveOverrideEvent({
      id: 'override-1',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_a',
      ruleKey: 'rule-2-low-effort-questions-2',
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'policy_seems_wrong',
      createdAt: '2026-05-16T00:00:00.000Z',
    });

    const reviewed = await updateOverrideReview(
      'ExampleLearning',
      'override-1',
      {
        reviewStatus: 'policy_needs_update',
        reviewedBy: 'leadmod',
        reviewNote: 'Policy ladder should mention this edge case.',
      }
    );
    const readBack = await getOverrideEvent('ExampleLearning', 'override-1');

    expect(reviewed?.reviewStatus).toBe('policy_needs_update');
    expect(reviewed?.overrideReason).toBe('policy_seems_wrong');
    expect(reviewed?.reviewedBy).toBe('leadmod');
    expect(readBack?.reviewNote).toBe(
      'Policy ladder should mention this edge case.'
    );
  });

  it('rejects invalid review statuses', async () => {
    const { validateOverrideReviewStatus } = await import('./audit');

    expect(() => validateOverrideReviewStatus('done')).toThrow(
      /Invalid override review status/
    );
  });

  it('filters unresolved overrides', async () => {
    const { listOverrideEvents, saveOverrideEvent, updateOverrideReview } =
      await import('./audit');
    await saveOverrideEvent({
      id: 'override-1',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_a',
      ruleKey: 'rule-2-low-effort-questions-2',
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'edge_case_mod_discretion',
      createdAt: '2026-05-16T00:00:00.000Z',
    });
    await saveOverrideEvent({
      id: 'override-2',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_b',
      ruleKey: 'rule-3-self-promotion-3',
      recommendedAction: 'remove',
      selectedAction: 'manual_review',
      overrideReason: 'severe_context',
      createdAt: '2026-05-16T00:01:00.000Z',
    });
    await updateOverrideReview('ExampleLearning', 'override-2', {
      reviewStatus: 'accepted_exception',
      reviewedBy: 'leadmod',
    });

    const unresolved = await listOverrideEvents({
      subreddit: 'ExampleLearning',
      status: 'unresolved',
    });

    expect(unresolved.map((event) => event.id)).toEqual(['override-1']);
  });
});
