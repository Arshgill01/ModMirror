import { describe, expect, it } from 'vitest';
import { replayActionFixtures, replayPolicyFixture } from './fixtures/replaySandbox';
import { simulatePolicyDraft } from './policySimulator';

describe('Policy Simulator', () => {
  it('classifies draft policy deltas deterministically without side effects', () => {
    const draftPolicy = {
      ...replayPolicyFixture,
      steps: [
        {
          offenseCount: 1,
          windowDays: 30,
          recommendedAction: 'remove' as const,
          requireOverrideReasonForDeviation: true,
        },
      ],
    };
    const result = simulatePolicyDraft({
      subreddit: 'ExampleLearning',
      activePolicy: replayPolicyFixture,
      draftPolicy,
      actions: replayActionFixtures,
      generatedAt: '2026-05-21T00:00:00.000Z',
    });

    expect(result.id).toBe('policy-simulation-5547d76244e3ca81');
    expect(result.summary.stricter).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('read-only');
  });

  it('labels low-confidence cases as insufficient data', () => {
    const result = simulatePolicyDraft({
      subreddit: 'ExampleLearning',
      draftPolicy: replayPolicyFixture,
      actions: [
        {
          ...replayActionFixtures[0]!,
          confidence: 'low',
        },
      ],
      generatedAt: '2026-05-21T00:00:00.000Z',
    });

    expect(result.items[0]?.delta).toBe('insufficient_data');
    expect(result.warnings.join(' ')).toContain('Low-confidence');
  });
});
