import { describe, expect, it } from 'vitest';
import type {
  ActionReceipt,
  EnforcementAction,
  MirrorScanRecord,
  OverrideEvent,
  RulePolicy,
} from '../../shared/schema';
import { computeConsistencyAnalytics } from './analytics';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2',
  ruleName: 'Rule 2',
  activeVersionId: 'policy-version-2',
  activeVersionNumber: 2,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  createdBy: 'leadmod',
  defaultMessageMode: 'log_only',
  active: true,
  steps: [
    {
      offenseCount: 1,
      windowDays: 30,
      recommendedAction: 'warn',
      requireOverrideReasonForDeviation: true,
    },
  ],
};

describe('consistency analytics', () => {
  it('computes improving drift trend and policy impact from scans and receipts', () => {
    const summary = computeConsistencyAnalytics({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-18T00:00:00.000Z',
      policies: [policy],
      scans: [
        scanRecord('scan-before', '2026-05-15T00:00:00.000Z', {
          warn: 2,
          remove: 3,
          temporary_ban_suggested: 2,
        }),
        scanRecord('scan-after', '2026-05-18T00:00:00.000Z', {
          warn: 5,
          remove: 2,
        }),
      ],
      receipts: [
        receipt('before-1', '2026-05-15T10:00:00.000Z', true, {
          policyVersionId: 'policy-version-1',
          policyVersionNumber: 1,
        }),
        receipt('before-2', '2026-05-15T11:00:00.000Z', true, {
          policyVersionId: 'policy-version-1',
          policyVersionNumber: 1,
        }),
        receipt('before-3', '2026-05-15T12:00:00.000Z', false, {
          policyVersionId: 'policy-version-1',
          policyVersionNumber: 1,
        }),
        receipt('after-1', '2026-05-16T01:00:00.000Z', false),
        receipt('after-2', '2026-05-16T02:00:00.000Z', false),
        receipt('after-3', '2026-05-16T03:00:00.000Z', false),
        receipt('after-4', '2026-05-16T04:00:00.000Z', true, {
          overrideEventId: 'override-1',
        }),
      ],
      overrides: [override('override-1', 'accepted_exception')],
    });

    expect(summary.dataQuality).toBe('usable');
    expect(summary.ruleTrends[0]).toEqual(
      expect.objectContaining({
        ruleKey: 'rule-2',
        status: 'improving',
      })
    );
    expect(summary.policyImpacts[0]).toEqual(
      expect.objectContaining({
        policyId: policy.id,
        status: 'improving',
        before: expect.objectContaining({
          receiptCount: 3,
          overrideRate: 2 / 3,
        }),
        after: expect.objectContaining({
          receiptCount: 4,
          overrideRate: 1 / 4,
          unresolvedOverrideCount: 0,
        }),
      })
    );
  });

  it('returns insufficient data instead of fake analytics', () => {
    const summary = computeConsistencyAnalytics({
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-18T00:00:00.000Z',
      policies: [policy],
      scans: [scanRecord('scan-only', '2026-05-18T00:00:00.000Z', { warn: 1 })],
      receipts: [receipt('after-1', '2026-05-18T01:00:00.000Z', false)],
      overrides: [],
    });

    expect(summary.dataQuality).toBe('insufficient');
    expect(summary.ruleTrends[0]?.status).toBe('insufficient_data');
    expect(summary.policyImpacts[0]?.status).toBe('insufficient_data');
    expect(summary.caveats).toContain(
      'At least two persisted scans are needed for drift-over-time analytics.'
    );
  });
});

function scanRecord(
  id: string,
  createdAt: string,
  distribution: Partial<Record<EnforcementAction, number>>
): MirrorScanRecord {
  return {
    id,
    subreddit: 'ExampleLearning',
    createdAt,
    createdBy: 'mod_a',
    source: 'live',
    totalActionsScanned: 10,
    attributedCount: 8,
    unmatchedCount: 2,
    confidenceBreakdown: {
      high: 5,
      medium: 2,
      low: 1,
      unmatched: 2,
    },
    driftCandidates: [
      {
        ruleKey: 'rule-2',
        ruleName: 'Rule 2',
        confidence: 'high',
        summary: 'Rule 2 drift',
        totalActions: 7,
        actionDistribution: distribution,
        recommendation: 'Review policy',
      },
    ],
    scanDepth: {
      depth: 'standard',
      requestedLimit: 60,
      pageSize: 60,
      fetchedActions: 10,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: 10,
      minimumActions: 8,
      message: 'Enough actions.',
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

function receipt(
  id: string,
  createdAt: string,
  deviatesFromPolicy: boolean,
  options: {
    overrideEventId?: string;
    policyVersionId?: string;
    policyVersionNumber?: number;
  } = {}
): ActionReceipt {
  const policyVersionId = options.policyVersionId ?? 'policy-version-2';
  const policyVersionNumber = options.policyVersionNumber ?? 2;
  const receiptValue: ActionReceipt = {
    id,
    actionEventId: `action-${id}`,
    subreddit: 'ExampleLearning',
    targetType: 'post',
    targetSnapshot: {
      targetThingId: `t3_${id}`,
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    modUsername: 'mod_a',
    source: 'dashboard',
    policySnapshot: {
      policyId: policy.id,
      policyVersionId,
      policyVersionNumber,
      policyVersionStatus: 'active',
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      steps: policy.steps,
      defaultMessageMode: 'log_only',
      capturedAt: createdAt,
    },
    recommendation: {
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      policyId: policy.id,
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: deviatesFromPolicy,
      selectedAction: deviatesFromPolicy ? 'remove' : 'warn',
      deviatesFromPolicy,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warn.',
    },
    selectedAction: deviatesFromPolicy ? 'remove' : 'warn',
    deviatesFromPolicy,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt,
  };
  if (options.overrideEventId !== undefined) {
    receiptValue.overrideEventId = options.overrideEventId;
    receiptValue.overrideReason = 'edge_case_mod_discretion';
  }
  return receiptValue;
}

function override(
  id: string,
  reviewStatus: OverrideEvent['reviewStatus']
): OverrideEvent {
  return {
    id,
    subreddit: 'ExampleLearning',
    modUsername: 'mod_a',
    ruleKey: policy.ruleKey,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'edge_case_mod_discretion',
    reviewStatus,
    updatedAt: '2026-05-18T00:00:00.000Z',
    createdAt: '2026-05-18T00:00:00.000Z',
  };
}
