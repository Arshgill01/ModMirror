import { describe, expect, it } from 'vitest';
import type { PolicyVersion, RulePolicy } from '../../shared/schema';
import {
  buildPolicyWorkbenchSummary,
  validatePolicyWorkbench,
} from './policyWorkbench';

describe('Policy Workbench', () => {
  it('flags missing first-offense and unsafe escalation gaps', () => {
    const warnings = validatePolicyWorkbench({
      ...policy(),
      active: false,
      steps: [
        {
          offenseCount: 2,
          windowDays: 30,
          recommendedAction: 'temporary_ban_suggested',
          requireOverrideReasonForDeviation: false,
        },
      ],
    });

    expect(warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining([
        'missing_first_offense',
        'missing_override_gate',
        'inactive_policy',
      ])
    );
  });

  it('compares active and candidate versions without mutating history', () => {
    const summary = buildPolicyWorkbenchSummary({
      policy: {
        ...policy(),
        activeVersionId: 'v1',
        activeVersionNumber: 1,
        proposedVersionId: 'v2',
        proposedVersionNumber: 2,
      },
      versions: [
        version('v1', 1, 'warn'),
        version('v2', 2, 'remove'),
      ],
    });

    expect(summary.activeVersionId).toBe('v1');
    expect(summary.proposedVersionId).toBe('v2');
    expect(summary.versionCompare).toMatchObject({
      baselineVersion: 1,
      candidateVersion: 2,
      changedStepCount: 1,
    });
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

function version(
  id: string,
  versionNumber: number,
  recommendedAction: 'warn' | 'remove'
): PolicyVersion {
  return {
    id,
    policyId: 'policy-1',
    versionNumber,
    subreddit: 'ExampleLearning',
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction,
        requireOverrideReasonForDeviation: true,
      },
    ],
    defaultMessageMode: 'log_only',
    active: true,
    createdAt: '2026-05-21T00:00:00.000Z',
    createdBy: 'lead',
  };
}
