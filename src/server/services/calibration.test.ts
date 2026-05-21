import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
  values: new Map<string, string>(),
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
    get: vi.fn((key: string) => Promise.resolve(redisState.values.get(key))),
    set: vi.fn((key: string, value: string) => {
      redisState.values.set(key, value);
      return Promise.resolve();
    }),
  },
}));

import {
  archiveScenario,
  buildDemoCalibrationScenarios,
  createScenarioDraft,
  getCalibrationPack,
  listCalibrationScenarios,
  submitCalibrationAnswer,
} from './calibration';

describe('Team Calibration Studio', () => {
  beforeEach(() => {
    redisState.sortedSets.clear();
    redisState.values.clear();
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

  it('rejects incomplete scenario drafts before persistence', async () => {
    await expect(
      createScenarioDraft({
        subreddit: 'ExampleLearning',
        title: '',
        prompt: 'Prompt',
        ruleKey: 'rule-2',
        ruleName: 'Rule 2',
        expectedAction: 'warn',
        explanation: 'Explain the expected team norm.',
        source: 'manual',
        active: true,
      })
    ).rejects.toThrow('Scenario title is required.');

    expect(redisState.values.size).toBe(0);
    expect(redisState.sortedSets.size).toBe(0);
  });

  it('persists acceptable alternatives and removes archived scenarios from the active pack', async () => {
    const scenario = await createScenarioDraft({
      subreddit: 'ExampleLearning',
      title: 'Manual Rule 2 practice',
      prompt: 'A learner posts a vague question after one prior warning.',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      expectedAction: 'remove',
      acceptableAlternatives: ['warn', 'manual_review'],
      explanation: 'Removal is the team norm, while warning is acceptable for a borderline case.',
      source: 'manual',
      active: true,
      teachingReason: 'Practice non-punitive team calibration.',
    });

    expect(scenario.acceptableAlternatives).toEqual(['warn', 'manual_review']);
    expect((await getCalibrationPack('ExampleLearning')).scenarios.map((item) => item.id))
      .toContain(scenario.id);

    await archiveScenario('ExampleLearning', scenario.id);

    expect((await getCalibrationPack('ExampleLearning')).scenarios.map((item) => item.id))
      .not.toContain(scenario.id);
    expect((await listCalibrationScenarios('ExampleLearning')).find((item) => item.id === scenario.id)?.active)
      .toBe(false);
  });
});
