import { describe, expect, it } from 'vitest';
import {
  buildOverrideSummary,
  createLogOnlyActionInput,
  validateOverrideReasonForDeviation,
} from './audit';
import type { OverrideEvent } from '../../shared/schema';

const overrideEvents: OverrideEvent[] = [
  {
    id: 'override-1',
    subreddit: 'ExampleLearning',
    modUsername: 'mod_a',
    ruleKey: 'rule-2-low-effort-questions-2',
    recommendedAction: 'warn',
    selectedAction: 'temporary_ban_suggested',
    overrideReason: 'severe_context',
    createdAt: '2026-05-16T00:00:00.000Z',
  },
  {
    id: 'override-2',
    subreddit: 'ExampleLearning',
    modUsername: 'mod_b',
    ruleKey: 'rule-2-low-effort-questions-2',
    recommendedAction: 'remove',
    selectedAction: 'manual_review',
    overrideReason: 'policy_seems_wrong',
    createdAt: '2026-05-16T00:01:00.000Z',
  },
];

describe('audit helpers', () => {
  it('requires an override reason when selected action deviates', () => {
    expect(() =>
      validateOverrideReasonForDeviation('warn', 'temporary_ban_suggested')
    ).toThrow(/Override reason is required/);

    expect(() =>
      validateOverrideReasonForDeviation(
        'warn',
        'temporary_ban_suggested',
        'severe_context'
      )
    ).not.toThrow();
  });

  it('does not require override reason when the selected action matches', () => {
    expect(() => validateOverrideReasonForDeviation('warn', 'warn')).not.toThrow();
  });

  it('builds aggregate override summary without per-mod breakdowns', () => {
    const summary = buildOverrideSummary(overrideEvents);

    expect(summary.totalOverrides).toBe(2);
    expect(summary.overridesByRule['rule-2-low-effort-questions-2']).toBe(2);
    expect(summary.overridesByReason.severe_context).toBe(1);
    expect(summary.overridesByReason.policy_seems_wrong).toBe(1);
    expect(JSON.stringify(summary)).not.toContain('mod_a');
  });

  it('defaults action events to log_only simulator input', () => {
    const input = createLogOnlyActionInput({
      subreddit: 'ExampleLearning',
      ruleKey: 'rule-2-low-effort-questions-2',
      recommendedAction: 'warn',
      selectedAction: 'warn',
    });

    expect(input.deliveryMode).toBe('log_only');
    expect(input.source).toBe('simulator');
  });
});
