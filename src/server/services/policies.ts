import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  DEFAULT_POLICY_WINDOW_DAYS,
  RESPONSE_TEMPLATE_KIND_VALUES,
} from '../../shared/constants';
import type {
  DriftCandidate,
  PolicyAdoptInput,
  PolicyChangeEvent,
  PolicyCreateInput,
  PolicyProposeInput,
  PolicyReviewInput,
  PolicyReviewRecord,
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
import {
  normalizeRatificationSettings,
  summarizePolicyRatification,
  upsertPolicyReviewRecord,
} from './policyRatification';
import { normalizeResponseTemplate } from '../../shared/responseTemplates';

const DEFAULT_POLICY_STEPS: PolicyStep[] = [
  {
    offenseCount: 1,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'warn',
    removalMessageTemplate:
      'Please review this community rule before posting again.',
    responseTemplates: {
      warning: {
        kind: 'warning',
        title: 'Rule reminder for {{target_author}}',
        body: 'Hi {{target_author}}, please review {{rule_name}} before posting again. This is offense {{offense_count}} tracked by ModMirror.',
        deliveryMode: 'log_only',
        enabled: true,
      },
    },
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 2,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'remove',
    noteTemplate: 'Repeat violation handled through ModMirror policy.',
    responseTemplates: {
      removal_explanation: {
        kind: 'removal_explanation',
        title: 'Removal explanation for {{rule_name}}',
        body: 'Your post or comment was removed under {{rule_name}}. ModMirror shows this as offense {{offense_count}} within the policy window.',
        deliveryMode: 'log_only',
        enabled: true,
      },
      mod_note_summary: {
        kind: 'mod_note_summary',
        body: '{{rule_name}} repeat violation. Recommended action: {{recommended_action}}.',
        deliveryMode: 'log_only',
        enabled: true,
      },
    },
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 3,
    windowDays: DEFAULT_POLICY_WINDOW_DAYS,
    recommendedAction: 'temporary_ban_suggested',
    noteTemplate: 'Escalation suggested; moderator must confirm separately.',
    responseTemplates: {
      modmail_draft: {
        kind: 'modmail_draft',
        title: 'Escalation review for {{rule_name}}',
        body: '{{target_author}} has reached offense {{offense_count}} for {{rule_name}}. ModMirror suggests escalation review; confirm any ban action separately.',
        deliveryMode: 'log_only',
        enabled: true,
      },
      mod_note_summary: {
        kind: 'mod_note_summary',
        body: 'Escalation suggested for {{rule_name}}. Moderator confirmation required before any ban.',
        deliveryMode: 'log_only',
        enabled: true,
      },
    },
    requireOverrideReasonForDeviation: true,
  },
];

export async function getPolicyByRule(
  subreddit: string,
  ruleKey: string
): Promise<RulePolicy | undefined> {
  const policy = await readJson<RulePolicy>(redisKeys.policy(subreddit, ruleKey));
  if (policy) {
    const versioned = await ensurePolicyVersioned(policy, 'legacy_migrated');
    return isAdoptedPolicy(versioned) ? versioned : undefined;
  }

  const policies = await listPolicies(subreddit);
  return policies.find((item) => item.ruleKey === ruleKey && isAdoptedPolicy(item));
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

  return versionedPolicies
    .map(withRatificationDefaults)
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
    proposedVersionNumber: 1,
    lifecycleState: 'draft',
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    steps: normalizeSteps(input.steps),
    defaultMessageMode: input.defaultMessageMode ?? 'log_only',
    active: false,
    reviewRecords: [],
    ratificationSettings: normalizeRatificationSettings(
      input.ratificationSettings
    ),
    ratificationSummary: summarizePolicyRatification({
      reviewRecords: [],
      settings: input.ratificationSettings,
    }),
  };

  if (input.rulePriority !== undefined) {
    policy.rulePriority = input.rulePriority;
  }
  if (input.ruleKind !== undefined) {
    policy.ruleKind = input.ruleKind;
  }
  if (input.proposalRationale !== undefined) {
    policy.proposalRationale = input.proposalRationale;
  }
  if (input.proposalSource !== undefined) {
    policy.proposalSource = input.proposalSource;
  }

  const version = buildPolicyVersion({
    policy,
    versionNumber: 1,
    createdAt: now,
    createdBy: input.createdBy,
    changeReason: 'initial_policy',
    changeSummary: 'Initial policy draft created.',
    lifecycleState: 'draft',
  });
  policy.proposedVersionId = version.id;

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
      changeSummary: 'Initial policy draft created.',
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
  const nextVersionNumber =
    Math.max(current.activeVersionNumber ?? 0, current.proposedVersionNumber ?? 0) + 1;
  const proposalSteps = input.steps
    ? normalizeSteps(input.steps)
    : normalizeSteps(current.steps);
  const proposalDefaultMessageMode =
    input.defaultMessageMode ?? current.defaultMessageMode;
  const proposalRuleName = input.ruleName ?? current.ruleName;
  const changedBy = input.updatedBy ?? current.createdBy;
  const updated: RulePolicy = {
    ...current,
    proposedVersionNumber: nextVersionNumber,
    lifecycleState: 'draft',
    reviewRecords: [],
    ratificationSettings: normalizeRatificationSettings(
      input.ratificationSettings ?? current.ratificationSettings
    ),
    updatedAt: now,
    ruleName: proposalRuleName,
    active: input.active ?? current.active,
  };
  updated.ratificationSummary = summarizePolicyRatification({
    reviewRecords: [],
    settings: updated.ratificationSettings,
  });

  if (!current.activeVersionId) {
    updated.steps = proposalSteps;
    updated.defaultMessageMode = proposalDefaultMessageMode;
    updated.active = false;
  }
  if (input.rulePriority !== undefined) {
    updated.rulePriority = input.rulePriority;
  }
  if (input.ruleKind !== undefined) {
    updated.ruleKind = input.ruleKind;
  }
  if (input.proposalRationale !== undefined) {
    updated.proposalRationale = input.proposalRationale;
  }
  if (input.proposalSource !== undefined) {
    updated.proposalSource = input.proposalSource;
  }

  const version = buildPolicyVersion({
    policy: {
      ...updated,
      steps: proposalSteps,
      defaultMessageMode: proposalDefaultMessageMode,
      active: false,
    },
    versionNumber: nextVersionNumber,
    createdAt: now,
    createdBy: changedBy,
    changeReason: input.changeReason,
    changeSummary: input.changeSummary,
    lifecycleState: 'draft',
  });
  updated.proposedVersionId = version.id;
  delete updated.proposedBy;
  delete updated.proposedAt;
  delete updated.proposalNote;

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
  const current = await getPolicyById(subreddit, policyId);
  if (!current) {
    return undefined;
  }

  const now = new Date().toISOString();
  const archived: RulePolicy = {
    ...current,
    active: false,
    archived: true,
    lifecycleState: 'archived',
    updatedAt: now,
  };
  await setPolicyByRule(archived);

  const version = await getStoredPolicyVersion(archived, archived.activeVersionId);
  if (version !== undefined) {
    await savePolicyVersion(archived, {
      ...version,
      active: false,
      lifecycleState: 'archived',
    });
    await savePolicyChangeEvent(
      buildPolicyChangeEvent({
        policy: archived,
        version,
        changeType: 'archived',
        changedAt: now,
        changedBy: archived.createdBy,
        changeReason: 'policy_archived',
        changeSummary: 'Policy archived.',
      })
    );
  }

  return archived;
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
    active: false,
    proposalRationale: `Created from drift finding: ${options.driftCandidate.summary}`,
    proposalSource: {
      driftRuleKey: ruleKey,
      driftRuleName: options.driftCandidate.ruleName,
      driftCandidateSummary: options.driftCandidate.summary,
    },
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

export async function proposePolicyVersion(
  subreddit: string,
  policyId: string,
  input: PolicyProposeInput
): Promise<RulePolicy | undefined> {
  validateProposeInput(input);
  const policy = await getPolicyById(subreddit, policyId);
  if (!policy) {
    return undefined;
  }

  const version = await getReviewableVersion(policy, input.policyVersionId);
  if (!version) {
    throw new Error('No draft policy version is available for proposal');
  }
  if (version.lifecycleState !== 'draft') {
    throw new Error('Only draft policy versions can be proposed');
  }

  const now = new Date().toISOString();
  const proposedVersion: PolicyVersion = {
    ...version,
    lifecycleState: 'proposed',
    proposedBy: input.proposedBy,
    proposedAt: now,
    ratificationSettings: normalizeRatificationSettings(
      policy.ratificationSettings
    ),
    ratificationSummary: summarizePolicyRatification({
      reviewRecords: [],
      settings: policy.ratificationSettings,
    }),
  };
  const proposedPolicy: RulePolicy = {
    ...policy,
    lifecycleState: 'proposed',
    proposedBy: input.proposedBy,
    proposedAt: now,
    ratificationSettings: normalizeRatificationSettings(
      policy.ratificationSettings
    ),
    ratificationSummary: summarizePolicyRatification({
      reviewRecords: [],
      settings: policy.ratificationSettings,
    }),
    updatedAt: now,
  };
  if (input.note !== undefined) {
    proposedVersion.proposalNote = input.note;
    proposedPolicy.proposalNote = input.note;
  } else {
    delete proposedVersion.proposalNote;
    delete proposedPolicy.proposalNote;
  }

  await setPolicyByRule(proposedPolicy);
  await savePolicyVersion(proposedPolicy, proposedVersion);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy: proposedPolicy,
      version: proposedVersion,
      changeType: 'updated',
      changedAt: now,
      changedBy: input.proposedBy,
      changeReason: 'policy_proposed',
      changeSummary: input.note ?? 'Policy draft proposed for team review.',
    })
  );

  return proposedPolicy;
}

export async function addPolicyReview(
  subreddit: string,
  policyId: string,
  input: PolicyReviewInput
): Promise<RulePolicy | undefined> {
  validateReviewInput(input);
  const policy = await getPolicyById(subreddit, policyId);
  if (!policy) {
    return undefined;
  }

  const version = await getReviewableVersion(policy, input.policyVersionId);
  if (!version) {
    throw new Error('No proposed policy version is available for review');
  }
  if (!['proposed', 'under_review'].includes(version.lifecycleState ?? '')) {
    throw new Error('Only proposed policy versions can be reviewed');
  }

  const now = new Date().toISOString();
  const review: PolicyReviewRecord = {
    id: `policy-review-${randomUUID()}`,
    reviewer: input.reviewer,
    decision: input.decision,
    createdAt: now,
  };
  if (input.note !== undefined) {
    review.note = input.note;
  }
  const nextState =
    input.decision === 'request_changes' ? 'draft' : 'under_review';
  const reviewRecords = upsertPolicyReviewRecord(
    version.reviewRecords ?? [],
    review
  );
  const ratificationSettings = normalizeRatificationSettings(
    version.ratificationSettings ?? policy.ratificationSettings
  );
  const ratificationSummary = summarizePolicyRatification({
    reviewRecords,
    settings: ratificationSettings,
  });
  const reviewedVersion: PolicyVersion = {
    ...version,
    lifecycleState: nextState,
    reviewRecords,
    ratificationSettings,
    ratificationSummary,
  };
  const reviewedPolicy: RulePolicy = {
    ...policy,
    lifecycleState: nextState,
    reviewRecords,
    ratificationSettings,
    ratificationSummary,
    updatedAt: now,
  };

  await setPolicyByRule(reviewedPolicy);
  await savePolicyVersion(reviewedPolicy, reviewedVersion);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy: reviewedPolicy,
      version: reviewedVersion,
      changeType: 'reviewed',
      changedAt: now,
      changedBy: input.reviewer,
      changeReason: input.decision,
      changeSummary: input.note,
    })
  );

  return reviewedPolicy;
}

export async function adoptPolicyVersion(
  subreddit: string,
  policyId: string,
  input: PolicyAdoptInput
): Promise<RulePolicy | undefined> {
  validateAdoptInput(input);
  const policy = await getPolicyById(subreddit, policyId);
  if (!policy) {
    return undefined;
  }

  const version = await getReviewableVersion(policy, input.policyVersionId);
  if (!version) {
    throw new Error('No proposed policy version is available for adoption');
  }
  if (!['proposed', 'under_review'].includes(version.lifecycleState ?? '')) {
    throw new Error('Only proposed or reviewed policy versions can be adopted');
  }

  const now = new Date().toISOString();
  const ratificationSettings = normalizeRatificationSettings(
    version.ratificationSettings ?? policy.ratificationSettings
  );
  const ratificationSummary = summarizePolicyRatification({
    reviewRecords: version.reviewRecords,
    settings: ratificationSettings,
  });
  if (input.quickAdoption && !ratificationSettings.allowSingleModAdoption) {
    throw new Error('Single-mod quick adoption is disabled for this policy');
  }
  if (!input.quickAdoption && !ratificationSummary.canAdopt) {
    throw new Error(
      ratificationSummary.adoptionBlockedReason ??
        `Requires ${ratificationSettings.requiredApprovals} approval vote(s) before adoption.`
    );
  }

  const previousVersion = await getStoredPolicyVersion(policy, policy.activeVersionId);
  if (previousVersion !== undefined) {
    await savePolicyVersion(policy, {
      ...previousVersion,
      active: false,
      lifecycleState: 'superseded',
      supersededByVersionId: version.id,
      supersededAt: now,
      supersededBy: input.adoptedBy,
    });
    await savePolicyChangeEvent(
      buildPolicyChangeEvent({
        policy,
        version: previousVersion,
        changeType: 'superseded',
        changedAt: now,
        changedBy: input.adoptedBy,
        changeReason: 'replaced_by_adopted_policy',
        changeSummary: `Superseded by version ${version.versionNumber}.`,
      })
    );
  }

  const adoptedVersion: PolicyVersion = {
    ...version,
    active: true,
    lifecycleState: 'adopted',
    adoptedBy: input.adoptedBy,
    adoptedAt: now,
    ratificationSettings,
    ratificationSummary,
  };
  const adoptedPolicy: RulePolicy = {
    ...policy,
    activeVersionId: adoptedVersion.id,
    activeVersionNumber: adoptedVersion.versionNumber,
    active: true,
    archived: false,
    lifecycleState: 'adopted',
    steps: normalizeSteps(adoptedVersion.steps),
    defaultMessageMode: adoptedVersion.defaultMessageMode,
    updatedAt: now,
    adoptedBy: input.adoptedBy,
    adoptedAt: now,
    reviewRecords: adoptedVersion.reviewRecords ?? [],
    ratificationSettings,
    ratificationSummary,
  };
  delete adoptedPolicy.proposedVersionId;
  delete adoptedPolicy.proposedVersionNumber;

  await setPolicyByRule(adoptedPolicy);
  await savePolicyVersion(adoptedPolicy, adoptedVersion);
  await savePolicyChangeEvent(
    buildPolicyChangeEvent({
      policy: adoptedPolicy,
      version: adoptedVersion,
      changeType: 'adopted',
      changedAt: now,
      changedBy: input.adoptedBy,
      changeReason: input.quickAdoption
        ? 'single_mod_quick_adoption'
        : 'policy_adopted',
      changeSummary:
        input.note ??
        (input.quickAdoption
          ? 'Single-mod quick adoption recorded.'
          : 'Policy version adopted.'),
    })
  );

  return adoptedPolicy;
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

  const versionsById = new Map<string, PolicyVersion>();
  for (const version of rows
    .map((row: { member: string }) => parseJson<PolicyVersion>(row.member))
    .filter((version): version is PolicyVersion => version !== undefined)) {
    const stored = await readJson<PolicyVersion>(
      redisKeys.policyVersion(subreddit, policyId, version.id)
    );
    versionsById.set(version.id, stored ?? version);
  }

  return [...versionsById.values()].sort(
    (left, right) => left.versionNumber - right.versionNumber
  );
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
  if (!isAdoptedPolicy(policy)) {
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

function validateProposeInput(input: PolicyProposeInput): void {
  if (!input.proposedBy.trim()) {
    throw new Error('proposedBy is required');
  }
}

function validateReviewInput(input: PolicyReviewInput): void {
  if (!input.reviewer.trim()) {
    throw new Error('reviewer is required');
  }
  if (!['approve', 'request_changes', 'abstain'].includes(input.decision)) {
    throw new Error('Invalid policy review decision');
  }
}

function validateAdoptInput(input: PolicyAdoptInput): void {
  if (!input.adoptedBy.trim()) {
    throw new Error('adoptedBy is required');
  }
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

      const normalizedStep: PolicyStep = { ...step };
      const responseTemplates = Object.fromEntries(
        RESPONSE_TEMPLATE_KIND_VALUES.map((kind) => [
          kind,
          normalizeResponseTemplate(kind, step.responseTemplates?.[kind]),
        ]).filter(([, template]) => template !== undefined)
      ) as PolicyStep['responseTemplates'];
      if (responseTemplates !== undefined && Object.keys(responseTemplates).length > 0) {
        normalizedStep.responseTemplates = responseTemplates;
      } else {
        delete normalizedStep.responseTemplates;
      }
      if (normalizedStep.removalMessageTemplate !== undefined) {
        normalizedStep.removalMessageTemplate =
          normalizedStep.removalMessageTemplate.trim();
      }
      if (normalizedStep.noteTemplate !== undefined) {
        normalizedStep.noteTemplate = normalizedStep.noteTemplate.trim();
      }

      return normalizedStep;
    });
}

async function getStoredPolicyVersion(
  policy: RulePolicy,
  versionId: string | undefined
): Promise<PolicyVersion | undefined> {
  if (versionId === undefined) {
    return undefined;
  }
  return readJson<PolicyVersion>(
    redisKeys.policyVersion(policy.subreddit, policy.id, versionId)
  );
}

async function getReviewableVersion(
  policy: RulePolicy,
  versionId: string | undefined
): Promise<PolicyVersion | undefined> {
  return getStoredPolicyVersion(
    policy,
    versionId ?? policy.proposedVersionId
  );
}

function isAdoptedPolicy(policy: RulePolicy): boolean {
  return (
    policy.active &&
    policy.activeVersionId !== undefined &&
    policy.archived !== true
  );
}

function withRatificationDefaults(policy: RulePolicy): RulePolicy {
  const ratificationSettings = normalizeRatificationSettings(
    policy.ratificationSettings
  );
  return {
    ...policy,
    ratificationSettings,
    ratificationSummary: summarizePolicyRatification({
      reviewRecords: policy.reviewRecords,
      settings: ratificationSettings,
    }),
  };
}

async function ensurePolicyVersioned(
  policy: RulePolicy,
  changeType: PolicyChangeEvent['changeType']
): Promise<RulePolicy> {
  if (policy.activeVersionId && policy.activeVersionNumber) {
    return policy;
  }
  if (policy.lifecycleState !== undefined) {
    return policy;
  }

  const migrated: RulePolicy = {
    ...policy,
    activeVersionNumber: 1,
    lifecycleState: 'adopted',
    adoptedBy: policy.createdBy,
    adoptedAt: policy.updatedAt,
    ratificationSettings: normalizeRatificationSettings(
      policy.ratificationSettings
    ),
    ratificationSummary: summarizePolicyRatification({
      reviewRecords: policy.reviewRecords,
      settings: policy.ratificationSettings,
    }),
    updatedAt: policy.updatedAt,
  };
  const version = buildPolicyVersion({
    policy: migrated,
    versionNumber: 1,
    createdAt: policy.createdAt,
    createdBy: policy.createdBy,
    changeReason: 'legacy_policy_fallback',
    changeSummary: 'Legacy Wave 3/4 policy treated as version 1.',
    lifecycleState: 'adopted',
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
  lifecycleState?: PolicyVersion['lifecycleState'];
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
  const lifecycleState = options.lifecycleState ?? options.policy.lifecycleState;
  if (lifecycleState !== undefined) {
    version.lifecycleState = lifecycleState;
  }

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
  if (options.policy.proposedBy !== undefined) {
    version.proposedBy = options.policy.proposedBy;
  }
  if (options.policy.proposedAt !== undefined) {
    version.proposedAt = options.policy.proposedAt;
  }
  if (options.policy.proposalNote !== undefined) {
    version.proposalNote = options.policy.proposalNote;
  }
  if (options.policy.proposalRationale !== undefined) {
    version.proposalRationale = options.policy.proposalRationale;
  }
  if (options.policy.proposalSource !== undefined) {
    version.proposalSource = options.policy.proposalSource;
  }
  if (options.policy.reviewRecords !== undefined) {
    version.reviewRecords = options.policy.reviewRecords;
  }
  if (options.policy.ratificationSettings !== undefined) {
    version.ratificationSettings = normalizeRatificationSettings(
      options.policy.ratificationSettings
    );
  } else {
    version.ratificationSettings = normalizeRatificationSettings();
  }
  version.ratificationSummary = summarizePolicyRatification({
    reviewRecords: options.policy.reviewRecords,
    settings: version.ratificationSettings,
  });
  if (options.policy.adoptedBy !== undefined) {
    version.adoptedBy = options.policy.adoptedBy;
  }
  if (options.policy.adoptedAt !== undefined) {
    version.adoptedAt = options.policy.adoptedAt;
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
