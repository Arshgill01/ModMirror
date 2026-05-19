import { describe, expect, it } from 'vitest';
import {
  replayActionFixtures,
  replayPolicyFixture,
} from './fixtures/replaySandbox';
import { runPolicyReplay, toPolicyReplayActions } from './replaySandbox';
import type {
  AttributedModAction,
  PolicyReplayActionInput,
} from '../../shared/schema';

describe('policy replay sandbox', () => {
  it('replays historical actions without mutating inputs', () => {
    const actions = replayActionFixtures.map((action) => ({ ...action }));
    const result = runPolicyReplay({
      subreddit: 'ExampleLearning',
      policy: replayPolicyFixture,
      source: 'synthetic',
      actions,
      generatedAt: '2026-05-18T01:00:00.000Z',
    });

    expect(actions).toEqual(replayActionFixtures);
    expect(result.totalActionsEvaluated).toBe(2);
    expect(result.skippedActionCount).toBe(1);
    expect(result.changedRecommendationCount).toBe(1);
    expect(result.items[0]).toMatchObject({
      actionId: 'action-1',
      historicalAction: 'remove',
      recommendedAction: 'warn',
      offenseCount: 1,
      wouldChangeOutcome: true,
    });
    expect(result.items[1]).toMatchObject({
      actionId: 'action-2',
      historicalAction: 'remove',
      recommendedAction: 'remove',
      offenseCount: 2,
      wouldChangeOutcome: false,
    });
    expect(result.warnings[0]).toMatch(/read-only/);
  });

  it('converts persisted scan actions into replay-safe inputs', () => {
    const attributed: AttributedModAction[] = [
      {
        id: 'action-1',
        subreddit: 'ExampleLearning',
        source: 'live',
        rawActionType: 'remove',
        normalizedAction: 'remove',
        targetAuthor: 'learner_a',
        createdAt: '2026-05-18T00:00:00.000Z',
        inferredRuleKey: 'low-effort-questions-2',
        confidence: 'high',
        evidence: ['Matched removal reason title.'],
      },
    ];

    expect(toPolicyReplayActions(attributed)).toEqual([
      {
        id: 'action-1',
        subreddit: 'ExampleLearning',
        rawActionType: 'remove',
        normalizedAction: 'remove',
        targetAuthor: 'learner_a',
        createdAt: '2026-05-18T00:00:00.000Z',
        inferredRuleKey: 'low-effort-questions-2',
        confidence: 'high',
        evidence: ['Matched removal reason title.'],
      },
    ]);
  });

  it('handles unmatched histories without inventing actions', () => {
    const differentRule: PolicyReplayActionInput = {
      ...replayActionFixtures[2]!,
      id: 'different-rule',
    };

    const result = runPolicyReplay({
      subreddit: 'ExampleLearning',
      policy: replayPolicyFixture,
      source: 'synthetic',
      actions: [differentRule],
      generatedAt: '2026-05-18T01:00:00.000Z',
    });

    expect(result.totalActionsEvaluated).toBe(0);
    expect(result.changedRecommendationCount).toBe(0);
    expect(result.skippedActionCount).toBe(1);
    expect(result.items).toEqual([]);
  });
});
