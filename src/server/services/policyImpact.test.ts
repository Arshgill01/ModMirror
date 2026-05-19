import { describe, expect, it } from 'vitest';
import type {
  ActionReceipt,
  MirrorScanRecord,
  PolicyVersion,
  RulePolicy,
} from '../../shared/schema';
import { computePolicyImpactMeasurement } from './policyImpact';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2',
  ruleName: 'Rule 2',
  activeVersionId: 'version-2',
  activeVersionNumber: 2,
  adoptedAt: '2026-05-18T12:00:00.000Z',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T12:00:00.000Z',
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

const adoptedVersion: PolicyVersion = {
  id: 'version-2',
  policyId: policy.id,
  versionNumber: 2,
  subreddit: policy.subreddit,
  ruleKey: policy.ruleKey,
  ruleName: policy.ruleName,
  steps: policy.steps,
  defaultMessageMode: 'log_only',
  active: true,
  createdAt: '2026-05-18T12:00:00.000Z',
  createdBy: 'leadmod',
  lifecycleState: 'adopted',
  adoptedAt: '2026-05-18T12:00:00.000Z',
};

describe('policy impact measurement', () => {
  it('measures before/after consistency when thresholds are met', () => {
    const impact = computePolicyImpactMeasurement({
      policy,
      versions: [adoptedVersion],
      receipts: [
        receipt('before-1', '2026-05-18T10:00:00.000Z', true),
        receipt('before-2', '2026-05-18T10:10:00.000Z', true),
        receipt('before-3', '2026-05-18T10:20:00.000Z', false),
        receipt('after-1', '2026-05-18T12:10:00.000Z', false),
        receipt('after-2', '2026-05-18T12:20:00.000Z', false),
        receipt('after-3', '2026-05-18T12:30:00.000Z', false),
      ],
      overrides: [],
      scans: [
        scan('scan-before', '2026-05-18T10:00:00.000Z'),
        scan('scan-after', '2026-05-18T13:00:00.000Z'),
      ],
      generatedAt: '2026-05-18T14:00:00.000Z',
      source: 'stored',
    });

    expect(impact.status).toBe('improving');
    expect(impact.dataQuality).toBe('usable');
    expect(impact.before).toMatchObject({
      receiptCount: 3,
      overrideRate: 2 / 3,
    });
    expect(impact.after).toMatchObject({
      receiptCount: 3,
      consistencyRate: 1,
    });
    expect(impact.timeline[0]?.source).toBe('receipt');
    expect(impact.policyVersionId).toBe('version-2');
  });

  it('requires before and after thresholds', () => {
    const impact = computePolicyImpactMeasurement({
      policy,
      versions: [adoptedVersion],
      receipts: [receipt('after-1', '2026-05-18T12:10:00.000Z', false)],
      overrides: [],
      scans: [],
      generatedAt: '2026-05-18T14:00:00.000Z',
      source: 'stored',
    });

    expect(impact.status).toBe('insufficient_data');
    expect(impact.dataQuality).toBe('insufficient');
    expect(impact.caveats).toContain(
      'Before-adoption receipts are below the impact threshold.'
    );
    expect(impact.caveats).toContain(
      'After-adoption receipts are below the impact threshold.'
    );
  });

  it('labels demo impact as demo', () => {
    const impact = computePolicyImpactMeasurement({
      policy,
      versions: [adoptedVersion],
      receipts: [],
      overrides: [],
      scans: [],
      generatedAt: '2026-05-18T14:00:00.000Z',
      source: 'demo',
    });

    expect(impact.source).toBe('demo');
    expect(impact.caveats[0]).toBe(
      'Demo impact is seeded for preview and is not live subreddit proof.'
    );
  });
});

function receipt(
  id: string,
  createdAt: string,
  deviatesFromPolicy: boolean
): ActionReceipt {
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
    modUsername: 'mod_a',
    source: 'simulator',
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
}

function scan(id: string, createdAt: string): MirrorScanRecord {
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
    driftCandidates: [
      {
        ruleKey: policy.ruleKey,
        ruleName: policy.ruleName,
        confidence: 'high',
        summary: 'Rule drift candidate.',
        totalActions: 5,
        actionDistribution: { warn: 3, remove: 2 },
        recommendation: 'Review policy consistency.',
      },
    ],
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
