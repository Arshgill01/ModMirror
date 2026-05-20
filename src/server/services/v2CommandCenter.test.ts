import { describe, expect, it } from 'vitest';
import type { MirrorScan, PolicyHealthOverview, RulePolicy } from '../../shared/schema';
import { buildCommandCenterV2 } from './v2CommandCenter';

describe('V2 Command Center', () => {
  it('combines score, rule health, next action, and trust labels', () => {
    const response = buildCommandCenterV2({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-21T00:00:00.000Z',
      scan: scan(),
      policies: [policy()],
      policyHealth: health(),
    });

    expect(response.consistencyScore).toBe(58);
    expect(response.nextBestAction.target).toBe('review');
    expect(response.ruleHealth[0]).toMatchObject({
      ruleName: 'Low-effort questions',
      status: 'needs_review',
    });
    expect(response.trustLabels.map((label) => label.kind)).toEqual(
      expect.arrayContaining(['source', 'confidence', 'privacy'])
    );
  });
});

function policy(): RulePolicy {
  return {
    id: 'policy-1',
    subreddit: 'ExampleLearning',
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    createdAt: '2026-05-21T00:00:00.000Z',
    updatedAt: '2026-05-21T00:00:00.000Z',
    createdBy: 'lead',
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction: 'warn',
        requireOverrideReasonForDeviation: true,
      },
    ],
    defaultMessageMode: 'log_only',
    active: true,
  };
}

function health(): PolicyHealthOverview {
  return {
    totalPolicies: 1,
    stablePolicies: 0,
    policiesNeedingReview: 1,
    unresolvedOverrides: 1,
    summaries: [
      {
        policyId: 'policy-1',
        ruleKey: 'low-effort-questions-2',
        ruleName: 'Low-effort questions',
        status: 'needs_review',
        totalActions: 10,
        followedPolicyCount: 6,
        overrideCount: 4,
        unresolvedOverrideCount: 1,
        policySeemsWrongCount: 1,
        adherenceRate: 0.6,
        overrideRate: 0.4,
        reasons: ['Override review needed.'],
        recommendations: ['Review recent exceptions.'],
      },
    ],
  };
}

function scan(): MirrorScan {
  return {
    id: 'scan-1',
    subreddit: 'ExampleLearning',
    createdAt: '2026-05-21T00:00:00.000Z',
    source: 'demo',
    totalActionsScanned: 20,
    attributedCount: 18,
    unmatchedCount: 2,
    confidenceBreakdown: { high: 12, medium: 5, low: 1, unmatched: 2 },
    driftCandidates: [
      {
        ruleKey: 'low-effort-questions-2',
        ruleName: 'Low-effort questions',
        confidence: 'high',
        summary: 'Rule 2 drift.',
        totalActions: 12,
        actionDistribution: { warn: 6, remove: 4, temporary_ban_suggested: 2 },
        recommendation: 'Create or update the policy.',
      },
    ],
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: 20,
      minimumActions: 8,
      message: 'Enough actions.',
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 60,
      pageSize: 60,
      fetchedActions: 20,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    warnings: [],
  };
}
