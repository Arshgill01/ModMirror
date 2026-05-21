import { describe, expect, it } from 'vitest';
import type { MirrorScanRecord } from '../../shared/schema';
import { buildDriftRadar } from './driftRadar';

describe('Drift Radar', () => {
  it('builds privacy-safe rule detail with explanations and policy questions', () => {
    const radar = buildDriftRadar(scanRecord());
    const rule = radar.details.find(
      (detail) => detail.ruleKey === 'low-effort-questions-2'
    );

    expect(rule).toBeDefined();
    expect(rule?.actionDistribution).toMatchObject({
      warn: 1,
      remove: 1,
      temporary_ban_suggested: 1,
    });
    expect(rule?.confidenceDistribution.high).toBe(2);
    expect(rule?.whyFlagged.join(' ')).toContain('distinct action');
    expect(rule?.policyQuestions[0]).toContain('first-offense');
    expect(JSON.stringify(rule)).not.toContain('mod_a');
    expect(JSON.stringify(rule)).not.toContain('learner_a');
    expect(Object.keys(rule?.representativeCases[0] ?? {})).not.toEqual(
      expect.arrayContaining(['moderator', 'targetAuthor'])
    );
  });
});

function scanRecord(): MirrorScanRecord {
  return {
    id: 'scan-1',
    subreddit: 'ExampleLearning',
    createdAt: '2026-05-21T00:00:00.000Z',
    source: 'demo',
    totalActionsScanned: 3,
    attributedCount: 3,
    unmatchedCount: 0,
    confidenceBreakdown: { high: 2, medium: 1, low: 0, unmatched: 0 },
    driftCandidates: [],
    smallSubredditStatus: {
      meetsThreshold: false,
      observedActions: 3,
      minimumActions: 8,
      message: 'small sample',
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 60,
      pageSize: 60,
      fetchedActions: 3,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    warnings: [],
    attributedActions: ['warn', 'remove', 'temporary_ban_suggested'].map(
      (action, index) => ({
        id: `action-${index + 1}`,
        subreddit: 'ExampleLearning',
        source: 'demo',
        rawActionType: 'remove',
        normalizedAction: action as 'warn' | 'remove' | 'temporary_ban_suggested',
        moderator: 'mod_a',
        targetAuthor: 'learner_a',
        createdAt: `2026-05-21T00:0${index}:00.000Z`,
        inferredRuleKey: 'low-effort-questions-2',
        inferredRuleName: 'Low-effort questions',
        confidence: index === 1 ? 'medium' : 'high',
        evidence: ['Matched Rule 2 text.'],
      })
    ),
    unmatchedActions: [],
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: 3,
    },
  };
}
