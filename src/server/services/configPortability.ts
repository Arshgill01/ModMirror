import { randomUUID } from 'node:crypto';
import {
  ENFORCEMENT_ACTION_VALUES,
  DIGEST_DELIVERY_MODE_VALUES,
  MESSAGE_DELIVERY_MODE_VALUES,
  PORTABLE_CONFIG_SCHEMA_VERSION_VALUES,
  PORTABLE_CONFIG_SOURCE_VALUES,
  RESPONSE_TEMPLATE_KIND_VALUES,
} from '../../shared/constants';
import type {
  DigestSettings,
  EnforcementAction,
  MessageDeliveryMode,
  PolicyCreateInput,
  PolicyRatificationSettings,
  PolicyResponseTemplate,
  PolicyStep,
  PortableConfigImportPolicyResult,
  PortableConfigImportRequest,
  PortableConfigImportResult,
  PortableConfigPackage,
  PortableConfigSchemaVersion,
  PortableConfigSource,
  PortableConfigTemplateListResponse,
  PortableDigestSettings,
  PortablePolicyConfig,
  ResponseTemplateKind,
  RulePolicy,
} from '../../shared/schema';
import { getDigestSettings, updateDigestSettings } from './digest';
import { createPolicy, listPolicies, updatePolicy } from './policies';

const CURRENT_SCHEMA_VERSION = 'modmirror.config.v1' satisfies PortableConfigSchemaVersion;

export type ConfigPortabilityDependencies = {
  listPolicies?: (subreddit: string) => Promise<RulePolicy[]>;
  createPolicy?: (input: PolicyCreateInput) => Promise<RulePolicy>;
  updatePolicy?: (
    subreddit: string,
    policyId: string,
    input: Parameters<typeof updatePolicy>[2]
  ) => Promise<RulePolicy | undefined>;
  getDigestSettings?: (subreddit: string) => Promise<DigestSettings>;
  updateDigestSettings?: typeof updateDigestSettings;
  now?: () => string;
  id?: () => string;
};

export type ExportPortableConfigOptions = {
  subreddit: string;
  exportedBy?: string;
  dependencies?: ConfigPortabilityDependencies;
};

export type ImportPortableConfigOptions = {
  subreddit: string;
  importedBy: string;
  request: PortableConfigImportRequest;
  dependencies?: ConfigPortabilityDependencies;
};

type NormalizedPortableConfig = Omit<
  PortableConfigPackage,
  'schemaVersion'
> & {
  schemaVersion: 'modmirror.config.v1';
};

export async function exportPortableConfig(
  options: ExportPortableConfigOptions
): Promise<PortableConfigPackage> {
  const deps = withDependencies(options.dependencies);
  const [policies, digestSettings] = await Promise.all([
    deps.listPolicies(options.subreddit),
    deps.getDigestSettings(options.subreddit),
  ]);

  const portablePackage: PortableConfigPackage = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    packageId: deps.id(),
    source: 'live_config',
    subreddit: options.subreddit,
    exportedAt: deps.now(),
    includePrivateHistory: false,
    policies: policies.map(toPortablePolicy),
    settings: {
      digest: toPortableDigestSettings(digestSettings),
    },
    warnings: [
      'Private history is excluded: receipts, overrides, scans, content snapshots, case packets, evidence boards, delivery receipts, and incident reports are not exported.',
      'Imported policies are saved as drafts or proposed updates and still require normal team review before adoption.',
    ],
  };
  if (options.exportedBy !== undefined) {
    portablePackage.exportedBy = options.exportedBy;
  }
  return portablePackage;
}

export function getPortableConfigTemplates(): PortableConfigTemplateListResponse {
  return {
    templates: [
      buildTemplatePackage({
        packageId: 'template-small-community-baseline',
        subreddit: 'starter-small-community',
        policies: [
          {
            ruleKey: 'be-civil',
            ruleName: 'Be civil',
            steps: [
              policyStep(1, 'warn', 'Civil reminder'),
              policyStep(2, 'remove', 'Repeat civility removal'),
              policyStep(3, 'temporary_ban_suggested', 'Escalation review'),
            ],
            defaultMessageMode: 'log_only',
          },
          {
            ruleKey: 'low-effort',
            ruleName: 'Low-effort questions',
            steps: [
              policyStep(1, 'remove', 'Low-effort removal'),
              policyStep(2, 'note', 'Repeat low-effort note'),
              policyStep(3, 'manual_review', 'Pattern review'),
            ],
            defaultMessageMode: 'log_only',
          },
        ],
      }),
      buildTemplatePackage({
        packageId: 'template-spam-flood-review',
        subreddit: 'starter-spam-flood',
        policies: [
          {
            ruleKey: 'spam',
            ruleName: 'Spam and repeated promotion',
            steps: [
              policyStep(1, 'remove', 'Spam removal'),
              policyStep(2, 'ignore_reports', 'Ignore noisy reports after review'),
              policyStep(3, 'manual_review', 'Manual escalation review'),
            ],
            defaultMessageMode: 'log_only',
            ratificationSettings: {
              requiredApprovals: 2,
              allowSingleModAdoption: false,
            },
          },
        ],
      }),
    ],
  };
}

export async function importPortableConfig(
  options: ImportPortableConfigOptions
): Promise<PortableConfigImportResult> {
  const deps = withDependencies(options.dependencies);
  const migrated = migratePortableConfigPackage(options.request.package, deps);
  const portablePackage = normalizePortableConfigPackage(migrated);
  const dryRun = options.request.dryRun ?? false;
  const existingPolicies = await deps.listPolicies(options.subreddit);
  const existingByRule = new Map(
    existingPolicies.map((policy) => [policy.ruleKey, policy])
  );
  const policyResults: PortableConfigImportPolicyResult[] = portablePackage.policies.map(
    (policy) => buildPolicyImportResult(policy, existingByRule.get(policy.ruleKey))
  );
  const digestWillUpdate =
    portablePackage.settings.digest !== undefined &&
    shouldUpdateDigestSettings(
      portablePackage.settings.digest,
      await deps.getDigestSettings(options.subreddit)
    );

  if (!dryRun) {
    for (const policy of portablePackage.policies) {
      const existing = existingByRule.get(policy.ruleKey);
      if (existing === undefined) {
        await deps.createPolicy({
          subreddit: options.subreddit,
          createdBy: options.importedBy,
          ruleKey: policy.ruleKey,
          ruleName: policy.ruleName,
          steps: policy.steps,
          defaultMessageMode: policy.defaultMessageMode,
          active: false,
          proposalRationale: `Imported from portable config package ${portablePackage.packageId}.`,
          ...(policy.rulePriority !== undefined
            ? { rulePriority: policy.rulePriority }
            : {}),
          ...(policy.ruleKind !== undefined ? { ruleKind: policy.ruleKind } : {}),
          ...(policy.ratificationSettings !== undefined
            ? { ratificationSettings: policy.ratificationSettings }
            : {}),
        });
      } else if (!portablePolicyEquals(policy, toPortablePolicy(existing))) {
        await deps.updatePolicy(options.subreddit, existing.id, {
          ruleName: policy.ruleName,
          steps: policy.steps,
          defaultMessageMode: policy.defaultMessageMode,
          updatedBy: options.importedBy,
          changeReason: 'portable_config_import',
          changeSummary: `Imported from portable config package ${portablePackage.packageId}.`,
          ...(policy.rulePriority !== undefined
            ? { rulePriority: policy.rulePriority }
            : {}),
          ...(policy.ruleKind !== undefined ? { ruleKind: policy.ruleKind } : {}),
          ...(policy.ratificationSettings !== undefined
            ? { ratificationSettings: policy.ratificationSettings }
            : {}),
        });
      }
    }

    if (portablePackage.settings.digest !== undefined && digestWillUpdate) {
      await deps.updateDigestSettings({
        subreddit: options.subreddit,
        updatedBy: options.importedBy,
        deliveryMode: portablePackage.settings.digest.deliveryMode,
        scheduleEnabled: portablePackage.settings.digest.scheduleEnabled,
      });
    }
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    accepted: true,
    dryRun,
    importedPolicyCount: policyResults.filter(
      (item) => item.status === 'created' || item.status === 'updated'
    ).length,
    skippedPolicyCount: policyResults.filter((item) => item.status === 'skipped')
      .length,
    updatedSettings: digestWillUpdate,
    policies: policyResults,
    warnings: [
      ...portablePackage.warnings,
      'Private history was not imported.',
      'Imported policies remain drafts or proposed updates until reviewed and adopted.',
    ],
  };
}

export function migratePortableConfigPackage(
  input: unknown,
  dependencies?: ConfigPortabilityDependencies
): PortableConfigPackage {
  const deps = withDependencies(dependencies);
  if (!isRecord(input)) {
    throw new Error('Portable config package must be an object.');
  }

  if (
    input.schemaVersion === CURRENT_SCHEMA_VERSION ||
    input.schemaVersion === 'modmirror.config.v0'
  ) {
    return input as unknown as PortableConfigPackage;
  }

  if (input.version === 0 || input.schemaVersion === 0) {
    return {
      schemaVersion: 'modmirror.config.v0',
      packageId: typeof input.packageId === 'string' ? input.packageId : deps.id(),
      source: 'live_config',
      subreddit: typeof input.subreddit === 'string' ? input.subreddit : 'legacy',
      exportedAt: typeof input.exportedAt === 'string' ? input.exportedAt : deps.now(),
      includePrivateHistory: false,
      policies: Array.isArray(input.policies)
        ? (input.policies as PortablePolicyConfig[])
        : [],
      settings: isRecord(input.settings)
        ? (input.settings as PortableConfigPackage['settings'])
        : {},
      warnings: ['Migrated legacy ModMirror config v0 package to v1 validation.'],
    };
  }

  throw new Error('Unsupported portable config schema version.');
}

function normalizePortableConfigPackage(
  input: PortableConfigPackage
): NormalizedPortableConfig {
  validateSchemaVersion(input.schemaVersion);
  validateSource(input.source);
  if (input.includePrivateHistory !== false) {
    throw new Error('Portable config must exclude private history.');
  }
  if (!input.packageId || typeof input.packageId !== 'string') {
    throw new Error('Portable config packageId is required.');
  }
  if (!input.subreddit || typeof input.subreddit !== 'string') {
    throw new Error('Portable config subreddit is required.');
  }
  if (!Array.isArray(input.policies)) {
    throw new Error('Portable config policies must be an array.');
  }

  return {
    ...input,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    policies: input.policies.map(normalizePortablePolicy),
    settings: normalizePortableSettings(input.settings),
    warnings: Array.isArray(input.warnings)
      ? input.warnings.filter((warning): warning is string => typeof warning === 'string')
      : [],
  };
}

function normalizePortablePolicy(policy: unknown): PortablePolicyConfig {
  if (!isRecord(policy)) {
    throw new Error('Portable policy must be an object.');
  }
  if (!isNonEmptyString(policy.ruleKey) || !isNonEmptyString(policy.ruleName)) {
    throw new Error('Portable policy requires ruleKey and ruleName.');
  }
  if (
    typeof policy.defaultMessageMode !== 'string' ||
    !MESSAGE_DELIVERY_MODE_VALUES.includes(
      policy.defaultMessageMode as MessageDeliveryMode
    )
  ) {
    throw new Error('Portable policy defaultMessageMode is invalid.');
  }
  if (!Array.isArray(policy.steps) || policy.steps.length === 0) {
    throw new Error('Portable policy requires at least one step.');
  }

  const defaultMessageMode = policy.defaultMessageMode as MessageDeliveryMode;
  const portablePolicy: PortablePolicyConfig = {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    defaultMessageMode,
    steps: policy.steps.map(normalizePortableStep),
  };
  if (typeof policy.rulePriority === 'number') {
    portablePolicy.rulePriority = policy.rulePriority;
  }
  if (
    policy.ruleKind === 'all' ||
    policy.ruleKind === 'link' ||
    policy.ruleKind === 'comment'
  ) {
    portablePolicy.ruleKind = policy.ruleKind;
  }
  if (isRecord(policy.ratificationSettings)) {
    portablePolicy.ratificationSettings = normalizePortableRatificationSettings(
      policy.ratificationSettings
    );
  }
  return portablePolicy;
}

function normalizePortableStep(step: unknown): PolicyStep {
  if (!isRecord(step)) {
    throw new Error('Portable policy step must be an object.');
  }
  if (
    typeof step.offenseCount !== 'number' ||
    !Number.isInteger(step.offenseCount) ||
    step.offenseCount < 1
  ) {
    throw new Error('Portable policy step offenseCount must be a positive integer.');
  }
  if (
    typeof step.windowDays !== 'number' ||
    !Number.isInteger(step.windowDays) ||
    step.windowDays < 1
  ) {
    throw new Error('Portable policy step windowDays must be a positive integer.');
  }
  if (
    typeof step.recommendedAction !== 'string' ||
    !ENFORCEMENT_ACTION_VALUES.includes(step.recommendedAction as EnforcementAction)
  ) {
    throw new Error('Portable policy step recommendedAction is invalid.');
  }
  const recommendedAction = step.recommendedAction as EnforcementAction;
  const normalized: PolicyStep = {
    offenseCount: step.offenseCount,
    windowDays: step.windowDays,
    recommendedAction,
    requireOverrideReasonForDeviation:
      step.requireOverrideReasonForDeviation === true,
  };
  if (typeof step.removalMessageTemplate === 'string') {
    normalized.removalMessageTemplate = step.removalMessageTemplate;
  }
  if (typeof step.noteTemplate === 'string') {
    normalized.noteTemplate = step.noteTemplate;
  }
  if (isRecord(step.responseTemplates)) {
    normalized.responseTemplates = normalizePortableResponseTemplates(
      step.responseTemplates
    );
  }
  return normalized;
}

function normalizePortableResponseTemplates(
  templates: Record<string, unknown>
): Partial<Record<ResponseTemplateKind, PolicyResponseTemplate>> {
  const normalized: Partial<Record<ResponseTemplateKind, PolicyResponseTemplate>> = {};
  for (const [key, value] of Object.entries(templates)) {
    if (!RESPONSE_TEMPLATE_KIND_VALUES.includes(key as ResponseTemplateKind)) {
      throw new Error(`Unsupported response template kind: ${key}`);
    }
    if (!isRecord(value)) {
      throw new Error('Response template must be an object.');
    }
    if (value.kind !== key) {
      throw new Error('Response template kind must match its key.');
    }
    if (typeof value.body !== 'string' || value.body.trim() === '') {
      throw new Error('Response template body is required.');
    }
    if (
      typeof value.deliveryMode !== 'string' ||
      !MESSAGE_DELIVERY_MODE_VALUES.includes(value.deliveryMode as MessageDeliveryMode)
    ) {
      throw new Error('Response template deliveryMode is invalid.');
    }
    const templateKind = key as ResponseTemplateKind;
    const deliveryMode = value.deliveryMode as MessageDeliveryMode;
    normalized[templateKind] = {
      kind: templateKind,
      body: value.body,
      deliveryMode,
      enabled: value.enabled === true,
      ...(typeof value.title === 'string' ? { title: value.title } : {}),
    };
  }
  return normalized;
}

function normalizePortableRatificationSettings(
  settings: Record<string, unknown>
): PolicyRatificationSettings {
  const requiredApprovals =
    typeof settings.requiredApprovals === 'number' &&
    Number.isInteger(settings.requiredApprovals) &&
    settings.requiredApprovals > 0
      ? settings.requiredApprovals
      : 1;
  return {
    requiredApprovals,
    allowSingleModAdoption: settings.allowSingleModAdoption === true,
  };
}

function normalizePortableSettings(
  settings: unknown
): PortableConfigPackage['settings'] {
  if (settings === undefined) {
    return {};
  }
  if (!isRecord(settings)) {
    throw new Error('Portable config settings must be an object.');
  }
  const normalized: PortableConfigPackage['settings'] = {};
  if (isRecord(settings.digest)) {
    normalized.digest = normalizePortableDigestSettings(settings.digest);
  }
  if (isRecord(settings.demoMode) && typeof settings.demoMode.enabled === 'boolean') {
    normalized.demoMode = {
      enabled: settings.demoMode.enabled,
    };
  }
  return normalized;
}

function normalizePortableDigestSettings(
  settings: Record<string, unknown>
): PortableDigestSettings {
  if (
    typeof settings.deliveryMode !== 'string' ||
    !DIGEST_DELIVERY_MODE_VALUES.includes(
      settings.deliveryMode as PortableDigestSettings['deliveryMode']
    )
  ) {
    throw new Error('Portable digest deliveryMode is invalid.');
  }
  return {
    deliveryMode: settings.deliveryMode as PortableDigestSettings['deliveryMode'],
    scheduleEnabled: settings.scheduleEnabled === true,
    scheduleCadence: 'weekly',
  };
}

function validateSchemaVersion(version: PortableConfigSchemaVersion): void {
  if (!PORTABLE_CONFIG_SCHEMA_VERSION_VALUES.includes(version)) {
    throw new Error('Unsupported portable config schema version.');
  }
}

function validateSource(source: PortableConfigSource): void {
  if (!PORTABLE_CONFIG_SOURCE_VALUES.includes(source)) {
    throw new Error('Unsupported portable config source.');
  }
}

function buildPolicyImportResult(
  policy: PortablePolicyConfig,
  existing: RulePolicy | undefined
): PortableConfigImportPolicyResult {
  if (existing === undefined) {
    return {
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      status: 'created',
      message: 'Policy will be imported as a new draft.',
      ...buildPolicyImportDiff(policy, 'New inactive draft policy.'),
    };
  }
  if (portablePolicyEquals(policy, toPortablePolicy(existing))) {
    return {
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      status: 'skipped',
      message: 'Existing policy already matches this portable policy.',
      ...buildPolicyImportDiff(policy, 'No write needed.'),
    };
  }
  return {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    status: 'updated',
    message: 'Policy will be saved as a draft update for review.',
    ...buildPolicyImportDiff(policy, 'Draft update requiring team review.'),
  };
}

function buildPolicyImportDiff(
  policy: PortablePolicyConfig,
  reviewDisposition: string
): Pick<
  PortableConfigImportPolicyResult,
  'stepCount' | 'defaultMessageMode' | 'actionSummary' | 'reviewDisposition'
> {
  return {
    stepCount: policy.steps.length,
    defaultMessageMode: policy.defaultMessageMode,
    actionSummary: policy.steps.map(
      (step) =>
        `Offense ${step.offenseCount}: ${step.recommendedAction} within ${step.windowDays} day${step.windowDays === 1 ? '' : 's'}`
    ),
    reviewDisposition,
  };
}

function toPortablePolicy(policy: RulePolicy): PortablePolicyConfig {
  const portable: PortablePolicyConfig = {
    ruleKey: policy.ruleKey,
    ruleName: policy.ruleName,
    steps: structuredClone(policy.steps),
    defaultMessageMode: policy.defaultMessageMode,
  };
  if (policy.rulePriority !== undefined) {
    portable.rulePriority = policy.rulePriority;
  }
  if (policy.ruleKind !== undefined) {
    portable.ruleKind = policy.ruleKind;
  }
  if (policy.ratificationSettings !== undefined) {
    portable.ratificationSettings = { ...policy.ratificationSettings };
  }
  return portable;
}

function toPortableDigestSettings(settings: DigestSettings): PortableDigestSettings {
  return {
    deliveryMode: settings.deliveryMode,
    scheduleEnabled: settings.scheduleEnabled,
    scheduleCadence: settings.scheduleCadence,
  };
}

function shouldUpdateDigestSettings(
  portable: PortableDigestSettings,
  current: DigestSettings
): boolean {
  return (
    portable.deliveryMode !== current.deliveryMode ||
    portable.scheduleEnabled !== current.scheduleEnabled ||
    portable.scheduleCadence !== current.scheduleCadence
  );
}

function portablePolicyEquals(
  left: PortablePolicyConfig,
  right: PortablePolicyConfig
): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function buildTemplatePackage(options: {
  packageId: string;
  subreddit: string;
  policies: PortablePolicyConfig[];
}): PortableConfigPackage {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    packageId: options.packageId,
    source: 'starter_template',
    subreddit: options.subreddit,
    exportedAt: new Date(0).toISOString(),
    includePrivateHistory: false,
    policies: options.policies,
    settings: {
      digest: {
        deliveryMode: 'none',
        scheduleEnabled: false,
        scheduleCadence: 'weekly',
      },
      demoMode: {
        enabled: false,
      },
    },
    warnings: [
      'Starter template only. Review and ratify imported drafts before adoption.',
      'No private history, receipts, scans, or moderator activity are included.',
    ],
  };
}

function policyStep(
  offenseCount: number,
  recommendedAction: EnforcementAction,
  title: string
): PolicyStep {
  return {
    offenseCount,
    windowDays: 30,
    recommendedAction,
    requireOverrideReasonForDeviation: true,
    responseTemplates: {
      mod_note_summary: {
        kind: 'mod_note_summary',
        title,
        body: '{{rule_name}} offense {{offense_count}}. Recommended action: {{recommended_action}}.',
        deliveryMode: 'log_only',
        enabled: true,
      },
    },
  };
}

function withDependencies(
  dependencies: ConfigPortabilityDependencies | undefined
): Required<ConfigPortabilityDependencies> {
  return {
    listPolicies: dependencies?.listPolicies ?? listPolicies,
    createPolicy: dependencies?.createPolicy ?? createPolicy,
    updatePolicy: dependencies?.updatePolicy ?? updatePolicy,
    getDigestSettings: dependencies?.getDigestSettings ?? getDigestSettings,
    updateDigestSettings: dependencies?.updateDigestSettings ?? updateDigestSettings,
    now: dependencies?.now ?? (() => new Date().toISOString()),
    id: dependencies?.id ?? (() => `config-${randomUUID()}`),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
