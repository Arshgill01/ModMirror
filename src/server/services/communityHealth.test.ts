import { describe, expect, it } from 'vitest';
import type {
  ActionEvent,
  ActionReceipt,
  MirrorScanRecord,
  OverrideEvent,
  PolicyChangeEvent,
  RulePolicy,
} from '../../shared/schema';
import { computeCommunityHealth } from './communityHealth';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2',
  ruleName: 'Rule 2',
  activeVersionId: 'policy-version-1',
  activeVersionNumber: 1,
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
  createdBy: 'leadmod',
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

describe('community health lens', () => {
  it('returns truthful empty states without per-mod blame fields', () => {
    const summary = computeCommunityHealth({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-18T00:00:00.000Z',
      policies: [],
      actions: [],
      overrides: [],
      receipts: [],
      scans: [],
      policyChanges: [],
    });

    expect(summary.dataQuality).toBe('empty');
    expect(summary.status).toBe('insufficient_data');
    expect(summary.ruleSignals).toEqual([]);
    expect(JSON.stringify(summary)).not.toContain('modUsername');
    expect(summary.privacyGuardrails).toContain(
      'No per-moderator leaderboard fields are emitted.'
    );
  });

  it('builds aggregate rule health from stored actions and overrides', () => {
    const summary = computeCommunityHealth({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-18T00:00:00.000Z',
      policies: [policy],
      actions: [
        action('a1', 'learner_a', 'warn', 'warn'),
        action('a2', 'learner_a', 'remove', 'warn'),
        action('a3', 'learner_b', 'warn', 'warn'),
        action('a4', 'learner_c', 'warn', 'warn'),
        action('a5', 'learner_d', 'warn', 'warn'),
      ],
      overrides: [override('o1', 'unresolved')],
      receipts: [receipt('r1'), receipt('r2')],
      scans: [
        scan('scan-1', '2026-05-17T00:00:00.000Z', 2),
        scan('scan-2', '2026-05-18T00:00:00.000Z', 1),
      ],
      policyChanges: [policyChange('c1'), policyChange('c2')],
    });

    expect(summary.dataQuality).toBe('usable');
    expect(summary.status).toBe('needs_review');
    expect(summary.policyChurnCount).toBe(2);
    expect(summary.driftStability).toBe('improving');
    expect(summary.casePacketVolume).toMatchObject({
      eligibleReceiptCount: 2,
      persistedPacketCount: 0,
      source: 'not_persisted',
    });
    expect(summary.ruleSignals[0]).toMatchObject({
      ruleKey: 'rule-2',
      actionCount: 5,
      consistentActionCount: 4,
      overrideCount: 1,
      unresolvedOverrideCount: 1,
      repeatAuthorCount: 1,
      status: 'needs_review',
    });
  });

  it('labels small communities before making health claims', () => {
    const summary = computeCommunityHealth({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-18T00:00:00.000Z',
      policies: [policy],
      actions: [action('a1', 'learner_a', 'warn', 'warn')],
      overrides: [],
      receipts: [],
      scans: [],
      policyChanges: [],
    });

    expect(summary.dataQuality).toBe('small_sample');
    expect(summary.status).toBe('insufficient_data');
    expect(summary.ruleSignals[0]?.status).toBe('insufficient_data');
    expect(summary.caveats).toContain(
      'Small communities need more tracked actions before health claims are reliable.'
    );
  });
});

function action(
  id: string,
  targetAuthor: string,
  selectedAction: ActionEvent['selectedAction'],
  recommendedAction: ActionEvent['recommendedAction']
): ActionEvent {
  return {
    id,
    subreddit: 'ExampleLearning',
    ruleKey: 'rule-2',
    ruleName: 'Rule 2',
    targetAuthor,
    selectedAction,
    recommendedAction,
    deliveryMode: 'log_only',
    source: 'simulator',
    createdAt: '2026-05-18T00:00:00.000Z',
  };
}

function override(
  id: string,
  reviewStatus: OverrideEvent['reviewStatus']
): OverrideEvent {
  return {
    id,
    subreddit: 'ExampleLearning',
    modUsername: 'hidden_in_summary',
    ruleKey: 'rule-2',
    ruleName: 'Rule 2',
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'edge_case_mod_discretion',
    reviewStatus,
    updatedAt: '2026-05-18T00:00:00.000Z',
    createdAt: '2026-05-18T00:00:00.000Z',
  };
}

function receipt(id: string): ActionReceipt {
  return {
    id,
    actionEventId: `action-${id}`,
    subreddit: 'ExampleLearning',
    targetType: 'post',
    targetSnapshot: {
      targetType: 'post',
      source: 'not_provided',
      warnings: [],
    },
    modUsername: 'hidden_in_summary',
    source: 'simulator',
    recommendation: {
      ruleKey: 'rule-2',
      ruleName: 'Rule 2',
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: false,
      deviatesFromPolicy: false,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warn.',
    },
    selectedAction: 'warn',
    deviatesFromPolicy: false,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: '2026-05-18T00:00:00.000Z',
  };
}

function scan(
  id: string,
  createdAt: string,
  driftCandidateCount: number
): MirrorScanRecord {
  return {
    id,
    subreddit: 'ExampleLearning',
    createdAt,
    source: 'live',
    totalActionsScanned: 5,
    attributedCount: 5,
    unmatchedCount: 0,
    confidenceBreakdown: {
      high: 5,
      medium: 0,
      low: 0,
      unmatched: 0,
    },
    driftCandidates: Array.from({ length: driftCandidateCount }, (_, index) => ({
      ruleKey: `rule-${index}`,
      ruleName: `Rule ${index}`,
      confidence: 'high',
      summary: 'Aggregate drift candidate.',
      totalActions: 5,
      actionDistribution: { warn: 5 },
      recommendation: 'Review policy consistency.',
    })),
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: 5,
      minimumActions: 5,
      message: 'Enough history.',
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 50,
      pageSize: 50,
      fetchedActions: 5,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    warnings: [],
    attributedActions: [],
    unmatchedActions: [],
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: 0,
    },
  };
}

function policyChange(id: string): PolicyChangeEvent {
  return {
    id,
    policyId: policy.id,
    policyVersionId: 'policy-version-1',
    policyVersionNumber: 1,
    subreddit: 'ExampleLearning',
    ruleKey: 'rule-2',
    ruleName: 'Rule 2',
    changeType: 'updated',
    changedAt: '2026-05-18T00:00:00.000Z',
    changedBy: 'leadmod',
  };
}
