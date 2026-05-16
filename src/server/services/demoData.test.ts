import { describe, expect, it } from 'vitest';
import {
  DEMO_DATA_LABEL,
  DEMO_MOD_ACTIONS,
  DEMO_SCAN_RULES,
  getDemoMirrorScanSources,
} from './demoData';

describe('Mirror Scan demo seed data', () => {
  it('provides a clearly labeled demo source payload', () => {
    const sources = getDemoMirrorScanSources();

    expect(sources.source).toBe('demo');
    expect(sources.subreddit).toBe('ExampleLearning');
    expect(sources.warnings).toContain(DEMO_DATA_LABEL);
    expect(sources.actions).toHaveLength(60);
  });

  it('covers the required fake subreddit rules', () => {
    expect(DEMO_SCAN_RULES.map((rule) => rule.ruleName)).toEqual([
      'Be civil',
      'Low-effort questions',
      'Self-promotion',
    ]);
  });

  it('contains intentional Rule 2 enforcement drift', () => {
    const rule2Actions = DEMO_MOD_ACTIONS.filter(
      (action) =>
        action.detailsText?.includes('Rule 2') ||
        action.detailsText?.includes('R2') ||
        action.removalReasonTitle?.includes('Rule 2') ||
        action.detailsText?.includes('Low effort')
    );
    const distribution = rule2Actions.reduce<Record<string, number>>(
      (counts, action) => {
        const key = action.normalizedAction ?? 'unknown';
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      },
      {}
    );

    expect(rule2Actions).toHaveLength(21);
    expect(distribution).toMatchObject({
      warn: 12,
      remove: 5,
      temporary_ban_suggested: 4,
    });
  });

  it('includes noisy unmatched-style actions for honest scan output', () => {
    const noisy = DEMO_MOD_ACTIONS.filter((action) =>
      action.id.startsWith('demo-noisy')
    );

    expect(noisy).toHaveLength(9);
    expect(noisy.every((action) => !action.removalReasonId)).toBe(true);
  });
});
