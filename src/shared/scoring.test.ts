import { describe, expect, it } from 'vitest';
import {
  confidenceLabel,
  getSmallSubredditThresholdStatus,
  isOverrideAction,
  normalizeForMatching,
  toRuleKey,
} from './scoring';

describe('shared scoring helpers', () => {
  it('maps numeric scores to confidence labels', () => {
    expect(confidenceLabel(0.8)).toBe('high');
    expect(confidenceLabel(0.5)).toBe('medium');
    expect(confidenceLabel(0.1)).toBe('low');
    expect(confidenceLabel(0)).toBe('unmatched');
  });

  it('detects selected actions that differ from policy', () => {
    expect(isOverrideAction('warn', 'warn')).toBe(false);
    expect(isOverrideAction('warn', 'temporary_ban_suggested')).toBe(true);
  });

  it('returns small-subreddit threshold status', () => {
    expect(getSmallSubredditThresholdStatus(7, 8)).toMatchObject({
      meetsThreshold: false,
      observedActions: 7,
      minimumActions: 8,
    });

    expect(getSmallSubredditThresholdStatus(8, 8).meetsThreshold).toBe(true);
  });

  it('normalizes text for deterministic matching', () => {
    expect(normalizeForMatching('  Rule 2: Low-effort Questions! ')).toBe(
      'rule 2 low effort questions'
    );
    expect(toRuleKey('Low-effort Questions', 2)).toBe('low-effort-questions-2');
  });
});
