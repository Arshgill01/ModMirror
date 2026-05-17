import { describe, expect, it } from 'vitest';
import type {
  MirrorScan,
  OverrideEvent,
  PolicyHealthOverview,
  RulePolicy,
} from './schema';
import {
  buildCommandCenterSummary,
  buildSetupSteps,
  generateManualDigest,
} from './productization';

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'low-effort-questions-2',
  ruleName: 'Low-effort questions',
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

const scan: MirrorScan = {
  id: 'scan-demo',
  subreddit: 'ExampleLearning',
  createdAt: '2026-05-17T00:00:00.000Z',
  source: 'demo',
  totalActionsScanned: 60,
  attributedCount: 51,
  unmatchedCount: 9,
  confidenceBreakdown: {
    high: 40,
    medium: 8,
    low: 3,
    unmatched: 9,
  },
  driftCandidates: [
    {
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      confidence: 'high',
      summary: 'First-time low-effort cases were handled three ways.',
      totalActions: 21,
      actionDistribution: {
        warn: 12,
        remove: 5,
        temporary_ban_suggested: 4,
      },
      recommendation: 'Create a first-offense policy.',
    },
  ],
  smallSubredditStatus: {
    meetsThreshold: true,
    observedActions: 60,
    minimumActions: 8,
    message: 'Enough actions for demo drift.',
  },
  warnings: ['Demo data'],
};

const health: PolicyHealthOverview = {
  totalPolicies: 1,
  stablePolicies: 0,
  policiesNeedingReview: 1,
  unresolvedOverrides: 2,
  summaries: [
    {
      policyId: policy.id,
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      status: 'needs_review',
      totalActions: 10,
      followedPolicyCount: 7,
      overrideCount: 3,
      unresolvedOverrideCount: 2,
      policySeemsWrongCount: 1,
      adherenceRate: 0.7,
      overrideRate: 0.3,
      reasons: ['Multiple overrides are still unresolved.'],
      recommendations: ['Review recent exceptions before changing this policy.'],
    },
  ],
};

describe('productization helpers', () => {
  it('builds an operational command center summary', () => {
    const summary = buildCommandCenterSummary({
      scan,
      policies: [policy],
      health,
    });

    expect(summary.dataMode).toBe('demo');
    expect(summary.activePolicyCount).toBe(1);
    expect(summary.unresolvedOverrideCount).toBe(2);
    expect(summary.topIssue).toContain('Low-effort questions');
    expect(summary.primaryAction.intent).toBe('review_overrides');
    expect(summary.consistencyScore).toBe(66);
  });

  it('routes cold start to the demo scenario', () => {
    const summary = buildCommandCenterSummary({
      policies: [],
    });

    expect(summary.primaryAction.intent).toBe('load_demo');
    expect(summary.consistencyScore).toBe(0);
  });

  it('marks setup steps from current workflow state', () => {
    const steps = buildSetupSteps({
      scan,
      policies: [policy],
      hasAppliedPolicy: false,
      hasReviewedOverride: false,
    });

    expect(steps.map((step) => step.status)).toEqual([
      'complete',
      'complete',
      'complete',
      'current',
      'pending',
    ]);
  });

  it('generates deterministic manual digest markdown', () => {
    const summary = buildCommandCenterSummary({
      scan,
      policies: [policy],
      health,
    });
    const digest = generateManualDigest({
      generatedAt: '2026-05-17T00:00:00.000Z',
      dataMode: 'demo',
      summary,
      health,
      caveats: ['Historical attribution remains confidence-scored.'],
    });

    expect(digest).toContain('# ModMirror Manual Digest');
    expect(digest).toContain('Data mode: Demo');
    expect(digest).toContain('Low-effort questions: needs review');
    expect(digest).toContain('Historical attribution remains confidence-scored.');
  });

  it('counts unresolved overrides without health data', () => {
    const override: OverrideEvent = {
      id: 'override-1',
      subreddit: 'ExampleLearning',
      modUsername: 'mod',
      ruleKey: policy.ruleKey,
      recommendedAction: 'warn',
      selectedAction: 'manual_review',
      overrideReason: 'other',
      reviewStatus: 'unresolved',
      updatedAt: '2026-05-17T00:00:00.000Z',
      createdAt: '2026-05-17T00:00:00.000Z',
    };
    const summary = buildCommandCenterSummary({
      scan,
      policies: [policy],
      overrides: [override],
    });

    expect(summary.unresolvedOverrideCount).toBe(1);
  });
});
