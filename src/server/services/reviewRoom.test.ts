import { describe, expect, it } from 'vitest';
import type {
  CommunityHealthSummary,
  EvidenceBoardThread,
  PolicyHealthOverview,
} from '../../shared/schema';
import { buildReviewTasks } from './reviewRoom';

describe('Review Room', () => {
  it('generates aggregate review tasks from health, boards, and drift', () => {
    const tasks = buildReviewTasks({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-21T00:00:00.000Z',
      policyHealth: policyHealth(),
      communityHealth: communityHealth(),
      boards: [board()],
      policies: [],
      driftRadar: {
        subreddit: 'ExampleLearning',
        scanId: 'scan-1',
        generatedAt: '2026-05-21T00:00:00.000Z',
        dataMode: 'demo',
        trustLabels: [],
        details: [
          {
            ruleKey: 'low-effort-questions-2',
            ruleName: 'Low-effort questions',
            totalActions: 3,
            actionDistribution: { warn: 1, remove: 1 },
            confidenceDistribution: { high: 2, medium: 1, low: 0, unmatched: 0 },
            unmatchedCount: 0,
            whyFlagged: ['Two action types.'],
            policyQuestions: ['Which action should be default?'],
            representativeCases: [],
            caveats: [],
          },
        ],
      },
    });

    expect(tasks.map((task) => task.source)).toEqual(
      expect.arrayContaining([
        'policy_health',
        'evidence_board',
        'drift',
        'community_health',
      ])
    );
    expect(JSON.stringify(tasks)).not.toContain('modUsername');
  });
});

function policyHealth(): PolicyHealthOverview {
  return {
    totalPolicies: 1,
    stablePolicies: 0,
    policiesNeedingReview: 1,
    unresolvedOverrides: 2,
    summaries: [
      {
        policyId: 'policy-1',
        ruleKey: 'low-effort-questions-2',
        ruleName: 'Low-effort questions',
        status: 'needs_review',
        totalActions: 5,
        followedPolicyCount: 3,
        overrideCount: 2,
        unresolvedOverrideCount: 2,
        policySeemsWrongCount: 1,
        adherenceRate: 0.6,
        overrideRate: 0.4,
        reasons: ['Unresolved overrides.'],
        recommendations: ['Review recent exceptions.'],
      },
    ],
  };
}

function communityHealth(): CommunityHealthSummary {
  return {
    subreddit: 'ExampleLearning',
    generatedAt: '2026-05-21T00:00:00.000Z',
    dataQuality: 'usable',
    status: 'needs_review',
    scanCount: 1,
    receiptCount: 2,
    actionCount: 5,
    overrideCount: 2,
    unresolvedOverrideCount: 2,
    policyChurnCount: 1,
    driftStability: 'stable',
    casePacketVolume: {
      eligibleReceiptCount: 2,
      persistedPacketCount: 0,
      source: 'not_persisted',
      note: 'Generated on demand.',
    },
    ruleSignals: [],
    privacyGuardrails: ['No per-moderator leaderboard fields are emitted.'],
    caveats: [],
  };
}

function board(): EvidenceBoardThread {
  return {
    id: 'board-1',
    subreddit: 'ExampleLearning',
    title: 'Rule 2 evidence',
    status: 'open',
    subject: { ruleKey: 'low-effort-questions-2' },
    evidence: [],
    statusHistory: [],
    createdAt: '2026-05-21T00:00:00.000Z',
    updatedAt: '2026-05-21T00:00:00.000Z',
  };
}
