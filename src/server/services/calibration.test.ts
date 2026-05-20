import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
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
      return Promise.resolve(rows.slice(start, end + 1));
    }),
    get: vi.fn(() => Promise.resolve(undefined)),
    set: vi.fn(() => Promise.resolve()),
  },
}));

import {
  buildDemoCalibrationScenarios,
  getCalibrationPack,
  submitCalibrationAnswer,
} from './calibration';

describe('Team Calibration Studio', () => {
  beforeEach(() => {
    redisState.sortedSets.clear();
  });

  it('builds a deterministic non-punitive demo pack', () => {
    const scenarios = buildDemoCalibrationScenarios();

    expect(scenarios).toHaveLength(5);
    expect(scenarios.every((scenario) => scenario.privacy.authorCopied === false)).toBe(true);
    expect(JSON.stringify(scenarios)).not.toContain('leaderboard');
  });

  it('returns aggregate-only answer results', async () => {
    const pack = await getCalibrationPack('ExampleLearning');
    const result = await submitCalibrationAnswer({
      subreddit: 'ExampleLearning',
      scenarioId: pack.scenarios[0]!.id,
      selectedAction: pack.scenarios[0]!.expectedAction,
    });

    expect(result.alignment).toBe('aligned');
    expect(result.aggregateSummary.note).toContain('not stored with moderator names');
  });
});
