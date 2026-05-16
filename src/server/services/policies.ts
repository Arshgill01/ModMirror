import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import { DEFAULT_POLICY_WINDOW_DAYS } from '../../shared/constants';
import type {
  DriftCandidate,
  PolicyChangeEvent,
  PolicyCreateInput,
  PolicySnapshot,
  PolicyStep,
  PolicyUpdateInput,
  PolicyVersion,
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
  const policy = await readJson<RulePolicy>(redisKeys.policy(subreddit, ruleKey));
  return policy ? ensurePolicyVersioned(policy, 'legacy_migrated') : undefined;
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

  const policies = Object.values(policyMap as Record<string, string>)
    .map((value) => parseJson<RulePolicy>(value))
    .filter((policy): policy is RulePolicy => policy !== undefined);
  const versionedPolicies = await Promise.all(
    policies.map((policy) => ensurePolicyVersioned(policy, 'legacy_migrated'))
  );

  return versionedPolicies.sort((left, right) =>
    left.ruleName.localeCompare(right.ruleName)
  );
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
    activeVersionId: '',
    activeVersionNumber: 1,
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

  const version = buildPolicyVersion({
    policy,
    versionNumber: 1,
    createdAt: now,
    createdBy: input.createdBy,
    changeReason: 'initial_policy',
    changeSummary: 'Initial policy version created.',
  });
  policy.activeVersionId = version.id;

  await setPolicyByRule(policy);
  await savePolicyVersion(policy, version);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy,
      version,
      changeType: 'created',
      changedAt: now,
      changedBy: input.createdBy,
      changeReason: 'initial_policy',
      changeSummary: 'Initial policy version created.',
    })
  );
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

  const now = new Date().toISOString();
  const nextVersionNumber = (current.activeVersionNumber ?? 1) + 1;
  const updated: RulePolicy = {
    ...current,
    activeVersionNumber: nextVersionNumber,
    updatedAt: now,
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

  const changedBy = input.updatedBy ?? current.createdBy;
  const version = buildPolicyVersion({
    policy: updated,
    versionNumber: nextVersionNumber,
    createdAt: now,
    createdBy: changedBy,
    changeReason: input.changeReason,
    changeSummary: input.changeSummary,
  });
  updated.activeVersionId = version.id;

  await setPolicyByRule(updated);
  await savePolicyVersion(updated, version);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy: updated,
      version,
      changeType: 'updated',
      changedAt: now,
      changedBy,
      changeReason: input.changeReason,
      changeSummary: input.changeSummary,
    })
  );
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

export async function getActivePolicyVersion(
  policy: RulePolicy
): Promise<PolicyVersion | undefined> {
  const versionedPolicy = await ensurePolicyVersioned(policy, 'legacy_migrated');
  if (!versionedPolicy.activeVersionId) {
    return undefined;
  }

  return readJson<PolicyVersion>(
    redisKeys.policyVersion(
      versionedPolicy.subreddit,
      versionedPolicy.id,
      versionedPolicy.activeVersionId
    )
  );
}

export async function listPolicyVersions(
  subreddit: string,
  policyId: string
): Promise<PolicyVersion[]> {
  const rows = await redis.zRange(
    redisKeys.policyVersions(subreddit, policyId),
    0,
    -1,
    {
      by: 'rank',
    }
  );

  return rows
    .map((row: { member: string }) => parseJson<PolicyVersion>(row.member))
    .filter((version): version is PolicyVersion => version !== undefined)
    .sort((left, right) => left.versionNumber - right.versionNumber);
}

export async function listPolicyChangeEvents(
  subreddit: string,
  policyId: string
): Promise<PolicyChangeEvent[]> {
  const rows = await redis.zRange(
    redisKeys.policyChanges(subreddit, policyId),
    0,
    -1,
    {
      by: 'rank',
    }
  );

  return rows
    .map((row: { member: string }) => parseJson<PolicyChangeEvent>(row.member))
    .filter((event): event is PolicyChangeEvent => event !== undefined)
    .sort((left, right) => left.policyVersionNumber - right.policyVersionNumber);
}

export function capturePolicySnapshot(
  policy: RulePolicy | undefined
): PolicySnapshot | undefined {
  if (!policy) {
    return undefined;
  }

  return {
    policyId: policy.id,
    policyVersionId: policy.activeVersionId ?? 'missing',
    policyVersionNumber: policy.activeVersionNumber ?? 1,
    policyVersionStatus: policy.activeVersionId ? 'active' : 'legacy',
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    steps: normalizeSteps(policy.steps),
    defaultMessageMode: policy.defaultMessageMode,
    capturedAt: new Date().toISOString(),
  };
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

async function ensurePolicyVersioned(
  policy: RulePolicy,
  changeType: PolicyChangeEvent['changeType']
): Promise<RulePolicy> {
  if (policy.activeVersionId && policy.activeVersionNumber) {
    return policy;
  }

  const migrated: RulePolicy = {
    ...policy,
    activeVersionNumber: 1,
    updatedAt: policy.updatedAt,
  };
  const version = buildPolicyVersion({
    policy: migrated,
    versionNumber: 1,
    createdAt: policy.createdAt,
    createdBy: policy.createdBy,
    changeReason: 'legacy_policy_fallback',
    changeSummary: 'Legacy Wave 3/4 policy treated as version 1.',
  });
  migrated.activeVersionId = version.id;

  await setPolicyByRule(migrated);
  await savePolicyVersion(migrated, version);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy: migrated,
      version,
      changeType,
      changedAt: policy.updatedAt,
      changedBy: policy.createdBy,
      changeReason: 'legacy_policy_fallback',
      changeSummary: 'Legacy Wave 3/4 policy treated as version 1.',
    })
  );

  return migrated;
}

function buildPolicyVersion(options: {
  policy: RulePolicy;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  changeReason?: string | undefined;
  changeSummary?: string | undefined;
}): PolicyVersion {
  const version: PolicyVersion = {
    id: `policy-version-${randomUUID()}`,
    policyId: options.policy.id,
    versionNumber: options.versionNumber,
    subreddit: options.policy.subreddit,
    ruleKey: options.policy.ruleKey,
    ruleName: options.policy.ruleName,
    steps: normalizeSteps(options.policy.steps),
    defaultMessageMode: options.policy.defaultMessageMode,
    active: options.policy.active,
    createdAt: options.createdAt,
    createdBy: options.createdBy,
  };

  if (options.policy.rulePriority !== undefined) {
    version.rulePriority = options.policy.rulePriority;
  }
  if (options.policy.ruleKind !== undefined) {
    version.ruleKind = options.policy.ruleKind;
  }
  if (options.changeReason !== undefined) {
    version.changeReason = options.changeReason;
  }
  if (options.changeSummary !== undefined) {
    version.changeSummary = options.changeSummary;
  }

  return version;
}

async function savePolicyVersion(
  policy: RulePolicy,
  version: PolicyVersion
): Promise<void> {
  await Promise.all([
    writeJson(
      redisKeys.policyVersion(policy.subreddit, policy.id, version.id),
      version
    ),
    redis.zAdd(redisKeys.policyVersions(policy.subreddit, policy.id), {
      member: serializeJson(version),
      score: version.versionNumber,
    }),
  ]);
}

function buildPolicyChangeEvent(options: {
  policy: RulePolicy;
  version: PolicyVersion;
  changeType: PolicyChangeEvent['changeType'];
  changedAt: string;
  changedBy: string;
  changeReason?: string | undefined;
  changeSummary?: string | undefined;
}): PolicyChangeEvent {
  const event: PolicyChangeEvent = {
    id: `policy-change-${randomUUID()}`,
    policyId: options.policy.id,
    policyVersionId: options.version.id,
    policyVersionNumber: options.version.versionNumber,
    subreddit: options.policy.subreddit,
    ruleKey: options.policy.ruleKey,
    ruleName: options.policy.ruleName,
    changeType: options.changeType,
    changedAt: options.changedAt,
    changedBy: options.changedBy,
  };

  if (options.changeReason !== undefined) {
    event.changeReason = options.changeReason;
  }
  if (options.changeSummary !== undefined) {
    event.changeSummary = options.changeSummary;
  }

  return event;
}

async function savePolicyChangeEvent(event: PolicyChangeEvent): Promise<void> {
  await redis.zAdd(redisKeys.policyChanges(event.subreddit, event.policyId), {
    member: serializeJson(event),
    score: Date.parse(event.changedAt) || Date.now(),
  });
}
