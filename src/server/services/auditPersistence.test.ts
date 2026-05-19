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
    zAdd: vi.fn(
      (key: string, value: { member: string; score: number }) => {
        const rows = redisState.sortedSets.get(key) ?? [];
        rows.push(value);
        redisState.sortedSets.set(key, rows);
        return Promise.resolve();
      }
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
            options?.reverse === true
              ? right.score - left.score
              : left.score - right.score
        );
        const normalizedEnd = end < 0 ? rows.length : end + 1;
        return Promise.resolve(rows.slice(start, normalizedEnd));
      }
    ),
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

describe('audit persistence', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
  });

  it('lists override events from the newest sorted-set score first', async () => {
    const { listRecentAuditEvents, saveOverrideEvent } = await import('./audit');

    await saveOverrideEvent({
      id: 'override-old',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_a',
      ruleKey: 'rule-2',
      recommendedAction: 'warn',
      selectedAction: 'remove',
      overrideReason: 'severe_context',
      createdAt: '2026-05-16T00:00:00.000Z',
    });
    await saveOverrideEvent({
      id: 'override-new',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_b',
      ruleKey: 'rule-2',
      recommendedAction: 'warn',
      selectedAction: 'temporary_ban_suggested',
      overrideReason: 'repeat_pattern_not_captured',
      createdAt: '2026-05-16T00:02:00.000Z',
    });
    await saveOverrideEvent({
      id: 'override-middle',
      subreddit: 'ExampleLearning',
      modUsername: 'mod_c',
      ruleKey: 'rule-2',
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'edge_case_mod_discretion',
      createdAt: '2026-05-16T00:01:00.000Z',
    });

    const events = await listRecentAuditEvents('ExampleLearning', 2);

    expect(events.map((event) => event.id)).toEqual([
      'override-new',
      'override-middle',
    ]);
  });

  it('trims action event indexes to the configured local history cap', async () => {
    const { ACTION_EVENT_HISTORY_LIMIT } = await import('../../shared/constants');
    const { listRecentActionEvents, saveActionEvent } = await import('./audit');

    for (let index = 0; index < ACTION_EVENT_HISTORY_LIMIT + 2; index += 1) {
      await saveActionEvent({
        id: `action-${index}`,
        subreddit: 'ExampleLearning',
        modUsername: 'mod_a',
        ruleKey: 'rule-2',
        recommendedAction: 'warn',
        selectedAction: 'warn',
        deliveryMode: 'log_only',
        source: 'simulator',
        createdAt: new Date(
          Date.parse('2026-05-16T00:00:00.000Z') + index
        ).toISOString(),
      });
    }

    const events = await listRecentActionEvents(
      'ExampleLearning',
      ACTION_EVENT_HISTORY_LIMIT + 2
    );
    const globalRows =
      redisState.sortedSets.get('modmirror:ExampleLearning:actions') ?? [];
    const userRows =
      redisState.sortedSets.get('modmirror:ExampleLearning:actions:user:mod_a') ??
      [];

    expect(events).toHaveLength(ACTION_EVENT_HISTORY_LIMIT);
    expect(events.at(-1)?.id).toBe('action-2');
    expect(globalRows).toHaveLength(ACTION_EVENT_HISTORY_LIMIT);
    expect(userRows).toHaveLength(ACTION_EVENT_HISTORY_LIMIT);
  });

  it('trims override audit indexes to the configured local history cap', async () => {
    const { OVERRIDE_EVENT_HISTORY_LIMIT } = await import('../../shared/constants');
    const { listRecentAuditEvents, saveOverrideEvent } = await import('./audit');

    for (let index = 0; index < OVERRIDE_EVENT_HISTORY_LIMIT + 2; index += 1) {
      await saveOverrideEvent({
        id: `override-${index}`,
        subreddit: 'ExampleLearning',
        modUsername: 'mod_a',
        ruleKey: 'rule-2',
        recommendedAction: 'warn',
        selectedAction: 'remove',
        overrideReason: 'severe_context',
        createdAt: new Date(
          Date.parse('2026-05-16T00:00:00.000Z') + index
        ).toISOString(),
      });
    }

    const events = await listRecentAuditEvents(
      'ExampleLearning',
      OVERRIDE_EVENT_HISTORY_LIMIT + 2
    );
    const rows =
      redisState.sortedSets.get('modmirror:ExampleLearning:overrides') ?? [];

    expect(events).toHaveLength(OVERRIDE_EVENT_HISTORY_LIMIT);
    expect(events.at(-1)?.id).toBe('override-2');
    expect(rows).toHaveLength(OVERRIDE_EVENT_HISTORY_LIMIT);
  });
});
