import { describe, expect, it } from 'vitest';
import type { CalibrationPackResponse, MirrorScan, ReviewRoomResponse, RulePolicy } from '../../shared/schema';
import { buildOnboardingPaths } from './onboarding';

describe('onboarding paths', () => {
  it('routes a new install to scanning before policy and calibration', () => {
    const paths = buildOnboardingPaths({ policies: [] });
    const newMod = paths.find((path) => path.id === 'new-mod-learn-policy');

    expect(newMod?.steps.map((step) => step.status)).toEqual([
      'pending',
      'pending',
      'pending',
      'pending',
    ]);
    expect(paths.find((path) => path.id === 'small-subreddit-start')?.steps[0]?.status)
      .toBe('current');
  });

  it('routes demo data with policy and reviews into calibration and review room', () => {
    const paths = buildOnboardingPaths({
      scan: scan(),
      policies: [policy()],
      reviewRoom: reviewRoom(),
      calibration: calibration(),
    });

    const lead = paths.find((path) => path.id === 'lead-mod-resolve-drift');
    expect(lead?.steps.map((step) => step.status)).toContain('current');
    expect(lead?.steps.find((step) => step.target === 'review')?.status).toBe(
      'current'
    );

    const newMod = paths.find((path) => path.id === 'new-mod-learn-policy');
    expect(newMod?.steps.find((step) => step.target === 'calibration')?.status)
      .toBe('complete');
  });
});

function scan(): MirrorScan {
  return {
    id: 'scan-1',
    subreddit: 'ExampleLearning',
    createdAt: '2026-05-21T12:00:00.000Z',
    source: 'demo',
    totalActionsScanned: 60,
    attributedCount: 52,
    unmatchedCount: 8,
    confidenceBreakdown: {
      high: 30,
      medium: 15,
      low: 7,
      unmatched: 8,
    },
    driftCandidates: [],
    smallSubredditStatus: {
      meetsThreshold: true,
      message: 'Enough data for drift review.',
      minimumActions: 8,
      observedActions: 60,
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 120,
      pageSize: 60,
      fetchedActions: 60,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: true,
    },
    warnings: [],
  };
}

function policy(): RulePolicy {
  return {
    id: 'policy-1',
    subreddit: 'ExampleLearning',
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    createdAt: '2026-05-21T12:00:00.000Z',
    updatedAt: '2026-05-21T12:00:00.000Z',
    createdBy: 'demo-lead',
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
}

function reviewRoom(): ReviewRoomResponse {
  return {
    subreddit: 'ExampleLearning',
    generatedAt: '2026-05-21T12:00:00.000Z',
    trustLabels: [],
    tasks: [
      {
        id: 'task-1',
        subreddit: 'ExampleLearning',
        source: 'override',
        title: 'Review override',
        severity: 'watch',
        status: 'unresolved',
        dueSignal: '1 unresolved override.',
        linkedEvidence: [],
        nextAction: 'Review exception.',
        createdAt: '2026-05-21T12:00:00.000Z',
        updatedAt: '2026-05-21T12:00:00.000Z',
      },
    ],
  };
}

function calibration(): CalibrationPackResponse {
  return {
    subreddit: 'ExampleLearning',
    generatedAt: '2026-05-21T12:00:00.000Z',
    trustLabels: [],
    scenarios: [
      {
        id: 'scenario-1',
        subreddit: 'ExampleLearning',
        title: 'First Rule 2 case',
        prompt: 'A low-effort question needs review.',
        ruleKey: 'low-effort-questions-2',
        ruleName: 'Low-effort questions',
        expectedAction: 'warn',
        acceptableAlternatives: ['remove'],
        explanation: 'Team norm is warning first.',
        source: 'demo_fixture',
        active: true,
        privacy: {
          containsRealUserContent: false,
          authorCopied: false,
          moderatorCopied: false,
          notes: [],
        },
        createdAt: '2026-05-21T12:00:00.000Z',
        updatedAt: '2026-05-21T12:00:00.000Z',
      },
    ],
  };
}
