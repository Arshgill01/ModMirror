import { describe, expect, it, vi } from 'vitest';
import type {
  DigestSettings,
  PortableConfigPackage,
  RulePolicy,
} from '../../shared/schema';
import {
  exportPortableConfig,
  getPortableConfigTemplates,
  importPortableConfig,
} from './configPortability';

describe('config portability service', () => {
  it('exports policies and settings without private history', async () => {
    const exported = await exportPortableConfig({
      subreddit: 'ExampleLearning',
      exportedBy: 'lead_mod',
      dependencies: {
        now: () => '2026-05-18T10:00:00.000Z',
        id: () => 'config-1',
        listPolicies: vi.fn().mockResolvedValue([policyFixture()]),
        getDigestSettings: vi.fn().mockResolvedValue(digestSettings()),
      },
    });

    expect(exported).toMatchObject({
      schemaVersion: 'modmirror.config.v1',
      packageId: 'config-1',
      source: 'live_config',
      includePrivateHistory: false,
      exportedBy: 'lead_mod',
    });
    expect(exported.policies[0]).toMatchObject({
      ruleKey: 'low-effort',
      ruleName: 'Low-effort questions',
      defaultMessageMode: 'log_only',
    });
    expect(JSON.stringify(exported.policies)).not.toContain('receipt');
    expect(JSON.stringify(exported.policies)).not.toContain('override');
    expect(exported.warnings.join(' ')).toContain('Private history is excluded');
  });

  it('dry-runs imports and validates the full package before writing', async () => {
    const createPolicy = vi.fn();
    const updatePolicy = vi.fn();
    const updateDigestSettings = vi.fn();
    const result = await importPortableConfig({
      subreddit: 'TargetSub',
      importedBy: 'lead_mod',
      request: {
        dryRun: true,
        package: portablePackage(),
      },
      dependencies: {
        listPolicies: vi.fn().mockResolvedValue([]),
        createPolicy,
        updatePolicy,
        getDigestSettings: vi.fn().mockResolvedValue(digestSettings('TargetSub')),
        updateDigestSettings,
      },
    });

    expect(result.accepted).toBe(true);
    expect(result.dryRun).toBe(true);
    expect(result.importedPolicyCount).toBe(1);
    expect(result.policies[0]?.status).toBe('created');
    expect(createPolicy).not.toHaveBeenCalled();
    expect(updatePolicy).not.toHaveBeenCalled();
    expect(updateDigestSettings).not.toHaveBeenCalled();
  });

  it('fails unsafe imports without partial writes', async () => {
    const createPolicy = vi.fn();
    const updateDigestSettings = vi.fn();
    await expect(
      importPortableConfig({
        subreddit: 'TargetSub',
        importedBy: 'lead_mod',
        request: {
          package: {
            ...portablePackage(),
            includePrivateHistory: true,
          },
        },
        dependencies: {
          listPolicies: vi.fn().mockResolvedValue([]),
          createPolicy,
          getDigestSettings: vi.fn().mockResolvedValue(digestSettings('TargetSub')),
          updateDigestSettings,
        },
      })
    ).rejects.toThrow('exclude private history');

    expect(createPolicy).not.toHaveBeenCalled();
    expect(updateDigestSettings).not.toHaveBeenCalled();
  });

  it('migrates legacy v0 packages through v1 validation', async () => {
    const createPolicy = vi.fn().mockResolvedValue(policyFixture());
    const result = await importPortableConfig({
      subreddit: 'TargetSub',
      importedBy: 'lead_mod',
      request: {
        package: {
          version: 0,
          subreddit: 'LegacySub',
          policies: portablePackage().policies,
          settings: portablePackage().settings,
        },
      },
      dependencies: {
        now: () => '2026-05-18T10:00:00.000Z',
        id: () => 'config-legacy',
        listPolicies: vi.fn().mockResolvedValue([]),
        createPolicy,
        getDigestSettings: vi.fn().mockResolvedValue(digestSettings('TargetSub')),
        updateDigestSettings: vi.fn(),
      },
    });

    expect(result.schemaVersion).toBe('modmirror.config.v1');
    expect(result.importedPolicyCount).toBe(1);
    expect(result.warnings.join(' ')).toContain('legacy');
    expect(createPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        subreddit: 'TargetSub',
        active: false,
        proposalRationale: expect.stringContaining('Imported from portable config'),
      })
    );
  });

  it('provides starter templates without private history', () => {
    const templates = getPortableConfigTemplates();

    expect(templates.templates.length).toBeGreaterThan(0);
    expect(templates.templates.every((item) => item.source === 'starter_template')).toBe(
      true
    );
    expect(
      templates.templates.every((item) => item.includePrivateHistory === false)
    ).toBe(true);
  });
});

function policyFixture(subreddit = 'ExampleLearning'): RulePolicy {
  return {
    id: 'policy-1',
    subreddit,
    ruleKey: 'low-effort',
    ruleName: 'Low-effort questions',
    activeVersionId: 'version-1',
    activeVersionNumber: 1,
    lifecycleState: 'adopted',
    createdAt: '2026-05-18T09:00:00.000Z',
    updatedAt: '2026-05-18T09:30:00.000Z',
    createdBy: 'lead_mod',
    steps: [
      {
        offenseCount: 1,
        windowDays: 30,
        recommendedAction: 'remove',
        requireOverrideReasonForDeviation: true,
        responseTemplates: {
          removal_explanation: {
            kind: 'removal_explanation',
            body: 'Removed under {{rule_name}}.',
            deliveryMode: 'log_only',
            enabled: true,
          },
        },
      },
    ],
    defaultMessageMode: 'log_only',
    active: true,
    ratificationSettings: {
      requiredApprovals: 2,
      allowSingleModAdoption: false,
    },
  };
}

function digestSettings(subreddit = 'ExampleLearning'): DigestSettings {
  return {
    subreddit,
    updatedAt: '2026-05-18T09:00:00.000Z',
    deliveryMode: 'none',
    scheduleEnabled: false,
    scheduleCadence: 'weekly',
  };
}

function portablePackage(): PortableConfigPackage {
  return {
    schemaVersion: 'modmirror.config.v1',
    packageId: 'config-source',
    source: 'live_config',
    subreddit: 'SourceSub',
    exportedAt: '2026-05-18T10:00:00.000Z',
    includePrivateHistory: false,
    policies: [
      {
        ruleKey: 'low-effort',
        ruleName: 'Low-effort questions',
        steps: [
          {
            offenseCount: 1,
            windowDays: 30,
            recommendedAction: 'remove',
            requireOverrideReasonForDeviation: true,
            responseTemplates: {
              removal_explanation: {
                kind: 'removal_explanation',
                body: 'Removed under {{rule_name}}.',
                deliveryMode: 'log_only',
                enabled: true,
              },
            },
          },
        ],
        defaultMessageMode: 'log_only',
        ratificationSettings: {
          requiredApprovals: 2,
          allowSingleModAdoption: false,
        },
      },
    ],
    settings: {
      digest: {
        deliveryMode: 'mod_discussion',
        scheduleEnabled: false,
        scheduleCadence: 'weekly',
      },
      demoMode: {
        enabled: false,
      },
    },
    warnings: ['Source warning.'],
  };
}
