import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import { DEFAULT_POLICY_WINDOW_DAYS } from '../../shared/constants';
import type {
  DriftCandidate,
  PolicyCreateInput,
  PolicyStep,
  PolicyUpdateInput,
  RulePolicy,
} from '../../shared/schema';
import {
  parseJson,
  readJson,
  redisKeys,
  serializeJson,
  writeJson,
} from './redis';

const DEFAULT_POLICY_STEPS: PolicyStep[] = [
  {
    offenseCount: 1,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'warn',
    removalMessageTemplate:
      'Please review this community rule before posting again.',
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 2,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'remove',
    noteTemplate: 'Repeat violation handled through ModMirror policy.',
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 3,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'temporary_ban_suggested',
    noteTemplate: 'Escalation suggested; moderator must confirm separately.',
    requireOverrideReasonForDeviation: true,
  },
];

export async function getPolicyByRule(
  subreddit: string,
  ruleKey: string
): Promise<RulePolicy | undefined> {
  return readJson<RulePolicy>(redisKeys.policy(subreddit, ruleKey));
}

export async function getPolicyById(
  subreddit: string,
  policyId: string
): Promise<RulePolicy | undefined> {
  const policies = await listPolicies(subreddit);
  return policies.find((policy) => policy.id === policyId);
}

export async function setPolicyByRule(policy: RulePolicy): Promise<void> {
  const policyJson = serializeJson(policy);

  await Promise.all([
    writeJson(redisKeys.policy(policy.subreddit, policy.ruleKey), policy),
    redis.hSet(redisKeys.policies(policy.subreddit), {
      [policy.ruleKey]: policyJson,
    }),
  ]);
}

export async function listPolicies(subreddit: string): Promise<RulePolicy[]> {
  const policyMap = await redis.hGetAll(redisKeys.policies(subreddit));

  return Object.values(policyMap as Record<string, string>)
    .map((value) => parseJson<RulePolicy>(value))
    .filter((policy): policy is RulePolicy => policy !== undefined)
    .sort((left, right) => left.ruleName.localeCompare(right.ruleName));
}

export async function createPolicy(
  input: PolicyCreateInput
): Promise<RulePolicy> {
  validatePolicyInput(input);

  const now = new Date().toISOString();
  const policy: RulePolicy = {
    id: `policy-${randomUUID()}`,
    subreddit: input.subreddit,
    ruleKey: input.ruleKey,
    ruleName: input.ruleName,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    steps: normalizeSteps(input.steps),
    defaultMessageMode: input.defaultMessageMode ?? 'log_only',
    active: input.active ?? true,
  };

  if (input.rulePriority !== undefined) {
    policy.rulePriority = input.rulePriority;
  }
  if (input.ruleKind !== undefined) {
    policy.ruleKind = input.ruleKind;
  }

  await setPolicyByRule(policy);
  return policy;
}

export async function updatePolicy(
  subreddit: string,
  policyId: string,
  input: PolicyUpdateInput
): Promise<RulePolicy | undefined> {
  const current = await getPolicyById(subreddit, policyId);
  if (!current) {
    return undefined;
  }

  const updated: RulePolicy = {
    ...current,
    updatedAt: new Date().toISOString(),
    ruleName: input.ruleName ?? current.ruleName,
    steps: input.steps ? normalizeSteps(input.steps) : current.steps,
    defaultMessageMode:
      input.defaultMessageMode ?? current.defaultMessageMode,
    active: input.active ?? current.active,
  };

  if (input.rulePriority !== undefined) {
    updated.rulePriority = input.rulePriority;
  }
  if (input.ruleKind !== undefined) {
    updated.ruleKind = input.ruleKind;
  }

  await setPolicyByRule(updated);
  return updated;
}

export async function deactivatePolicy(
  subreddit: string,
  policyId: string
): Promise<RulePolicy | undefined> {
  return updatePolicy(subreddit, policyId, { active: false });
}

export async function createPolicyFromDriftCandidate(options: {
  subreddit: string;
  createdBy: string;
  driftCandidate: DriftCandidate;
}): Promise<RulePolicy> {
  const ruleKey =
    options.driftCandidate.ruleKey ??
    options.driftCandidate.ruleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return createPolicy({
    subreddit: options.subreddit,
    createdBy: options.createdBy,
    ruleKey,
    ruleName: options.driftCandidate.ruleName,
    steps: DEFAULT_POLICY_STEPS,
    defaultMessageMode: 'log_only',
    active: true,
  });
}

export function getDefaultPolicySteps(): PolicyStep[] {
  return DEFAULT_POLICY_STEPS.map((step) => ({ ...step }));
}

function validatePolicyInput(input: PolicyCreateInput): void {
  if (!input.subreddit.trim()) {
    throw new Error('subreddit is required');
  }
  if (!input.ruleKey.trim()) {
    throw new Error('ruleKey is required');
  }
  if (!input.ruleName.trim()) {
    throw new Error('ruleName is required');
  }
  if (!input.createdBy.trim()) {
    throw new Error('createdBy is required');
  }
  normalizeSteps(input.steps);
}

function normalizeSteps(steps: PolicyStep[]): PolicyStep[] {
  if (steps.length === 0) {
    throw new Error('At least one policy step is required');
  }

  return [...steps]
    .sort((left, right) => left.offenseCount - right.offenseCount)
    .map((step) => {
      if (step.offenseCount < 1) {
        throw new Error('Policy step offenseCount must be at least 1');
      }
      if (step.windowDays < 1) {
        throw new Error('Policy step windowDays must be at least 1');
      }

      return { ...step };
    });
}
