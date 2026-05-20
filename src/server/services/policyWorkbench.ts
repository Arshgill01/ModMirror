import type {
  DriftRadarRuleDetail,
  PolicyStep,
  PolicyWorkbenchResponse,
  PolicyWorkbenchSummary,
  PolicyWorkbenchValidationWarning,
  PolicyVersion,
  RulePolicy,
} from '../../shared/schema';
import { summarizePolicyRatification } from './policyRatification';

export function buildPolicyWorkbenchResponse(input: {
  subreddit: string;
  generatedAt: string;
  policies: RulePolicy[];
  versionsByPolicy: Record<string, PolicyVersion[]>;
  driftDetails?: DriftRadarRuleDetail[];
}): PolicyWorkbenchResponse {
  return {
    subreddit: input.subreddit,
    generatedAt: input.generatedAt,
    policies: input.policies.map((policy) => {
      const summaryInput: Parameters<typeof buildPolicyWorkbenchSummary>[0] = {
        policy,
        versions: input.versionsByPolicy[policy.id] ?? [],
      };
      const linkedDrift = input.driftDetails?.find(
        (detail) => detail.ruleKey === policy.ruleKey
      );
      if (linkedDrift !== undefined) {
        summaryInput.linkedDrift = linkedDrift;
      }
      return buildPolicyWorkbenchSummary(summaryInput);
    }),
    starterTemplates: buildStarterTemplates(),
    trustLabels: [
      {
        kind: 'capability',
        label: 'Moderator-confirmed adoption',
        detail: 'Policy adoption uses explicit review/adopt actions and keeps version history.',
        tone: 'good',
      },
    ],
  };
}

export function buildPolicyWorkbenchSummary(input: {
  policy: RulePolicy;
  versions: PolicyVersion[];
  linkedDrift?: DriftRadarRuleDetail;
}): PolicyWorkbenchSummary {
  const activeVersion = input.versions.find(
    (version) => version.id === input.policy.activeVersionId
  );
  const candidateVersion =
    input.versions.find((version) => version.id === input.policy.proposedVersionId) ??
    input.versions[0];
  const summary: PolicyWorkbenchSummary = {
    policyId: input.policy.id,
    ruleKey: input.policy.ruleKey,
    ruleName: input.policy.ruleName,
    adoptionState: input.policy.active ? 'active' : 'missing',
    missingSteps: findMissingSteps(input.policy.steps),
    warnings: validatePolicyWorkbench(input.policy),
    versionCompare: comparePolicyVersions(activeVersion, candidateVersion),
  };
  if (input.policy.activeVersionId !== undefined) {
    summary.activeVersionId = input.policy.activeVersionId;
  }
  if (candidateVersion !== undefined && candidateVersion.id !== input.policy.activeVersionId) {
    summary.draftVersionId = candidateVersion.id;
  }
  if (input.policy.proposedVersionId !== undefined) {
    summary.proposedVersionId = input.policy.proposedVersionId;
  }
  if (input.linkedDrift !== undefined) {
    summary.linkedDrift = input.linkedDrift;
  }
  return summary;
}

export function validatePolicyWorkbench(
  policy: RulePolicy
): PolicyWorkbenchValidationWarning[] {
  const warnings: PolicyWorkbenchValidationWarning[] = [];
  if (policy.steps.length === 0) {
    warnings.push({
      code: 'no_steps',
      severity: 'blocker',
      message: 'Policy needs at least one ladder step before adoption.',
    });
  }
  if (!policy.steps.some((step) => step.offenseCount === 1)) {
    warnings.push({
      code: 'missing_first_offense',
      severity: 'warning',
      message: 'Add a first-offense step so Apply Policy has a clear default.',
    });
  }
  if (
    policy.steps.some(
      (step) =>
        step.recommendedAction === 'temporary_ban_suggested' ||
        step.recommendedAction === 'permanent_ban_suggested'
    ) &&
    policy.steps.some((step) => !step.requireOverrideReasonForDeviation)
  ) {
    warnings.push({
      code: 'missing_override_gate',
      severity: 'warning',
      message: 'Escalation policies should require override reasons for deviations.',
    });
  }
  if (hasUnsafeFirstStepEscalation(policy.steps)) {
    warnings.push({
      code: 'unsafe_escalation',
      severity: 'warning',
      message: 'First-offense escalation should be reserved for severe or manual-review cases.',
    });
  }
  if (!policy.active) {
    warnings.push({
      code: 'inactive_policy',
      severity: 'info',
      message: 'Inactive policy drafts are not used by Apply Policy.',
    });
  }
  summarizePolicyRatification({
    reviewRecords: policy.reviewRecords,
    settings: policy.ratificationSettings,
  });
  return warnings;
}

function comparePolicyVersions(
  activeVersion: PolicyVersion | undefined,
  candidateVersion: PolicyVersion | undefined
): PolicyWorkbenchSummary['versionCompare'] {
  if (activeVersion === undefined || candidateVersion === undefined) {
    return {
      changedStepCount: candidateVersion?.steps.length ?? 0,
      summary: 'No active version is available for comparison yet.',
    };
  }
  const changedStepCount = Math.max(
    activeVersion.steps.length,
    candidateVersion.steps.length
  ) - countMatchingSteps(activeVersion.steps, candidateVersion.steps);
  return {
    baselineVersion: activeVersion.versionNumber,
    candidateVersion: candidateVersion.versionNumber,
    changedStepCount,
    summary:
      changedStepCount === 0
        ? 'No ladder step changes from the active version.'
        : `${changedStepCount} ladder step(s) differ from the active version.`,
  };
}

function findMissingSteps(steps: PolicyStep[]): number[] {
  const offenseCounts = new Set(steps.map((step) => step.offenseCount));
  const max = Math.max(3, ...offenseCounts);
  return Array.from({ length: max }, (_, index) => index + 1).filter(
    (count) => !offenseCounts.has(count)
  );
}

function countMatchingSteps(left: PolicyStep[], right: PolicyStep[]): number {
  return left.filter((step) =>
    right.some(
      (candidate) =>
        candidate.offenseCount === step.offenseCount &&
        candidate.windowDays === step.windowDays &&
        candidate.recommendedAction === step.recommendedAction &&
        candidate.requireOverrideReasonForDeviation ===
          step.requireOverrideReasonForDeviation
    )
  ).length;
}

function hasUnsafeFirstStepEscalation(steps: PolicyStep[]): boolean {
  return steps.some(
    (step) =>
      step.offenseCount === 1 &&
      (step.recommendedAction === 'temporary_ban_suggested' ||
        step.recommendedAction === 'permanent_ban_suggested')
  );
}

function buildStarterTemplates(): PolicyWorkbenchResponse['starterTemplates'] {
  return [
    {
      id: 'education-first',
      label: 'Education first',
      ruleShape: 'Low-effort or fixable behavior',
      steps: [
        {
          offenseCount: 1,
          windowDays: 30,
          recommendedAction: 'warn',
          requireOverrideReasonForDeviation: true,
        },
        {
          offenseCount: 2,
          windowDays: 30,
          recommendedAction: 'remove',
          requireOverrideReasonForDeviation: true,
        },
        {
          offenseCount: 3,
          windowDays: 30,
          recommendedAction: 'temporary_ban_suggested',
          requireOverrideReasonForDeviation: true,
        },
      ],
    },
    {
      id: 'review-first',
      label: 'Manual review first',
      ruleShape: 'Context-heavy rules',
      steps: [
        {
          offenseCount: 1,
          windowDays: 30,
          recommendedAction: 'manual_review',
          requireOverrideReasonForDeviation: true,
        },
      ],
    },
  ];
}
