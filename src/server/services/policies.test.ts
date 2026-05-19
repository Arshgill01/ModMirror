import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PolicyStep, RulePolicy } from '../../shared/schema';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  hashes: new Map<string, Record<string, string>>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => redisState.strings.get(key)),
    set: vi.fn((key: string, value: string) => {
      redisState.strings.set(key, value);
      return Promise.resolve();
    }),
    hSet: vi.fn((key: string, values: Record<string, string>) => {
      redisState.hashes.set(key, {
        ...(redisState.hashes.get(key) ?? {}),
        ...values,
      });
      return Promise.resolve();
    }),
    hGetAll: vi.fn((key: string) =>
      Promise.resolve(redisState.hashes.get(key) ?? {})
    ),
    zAdd: vi.fn(
      (key: string, value: { member: string; score: number }) => {
        const rows = redisState.sortedSets.get(key) ?? [];
        rows.push(value);
        redisState.sortedSets.set(key, rows);
        return Promise.resolve();
      }
    ),
    zRange: vi.fn((key: string, start: number, end: number) => {
      const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
        (left, right) => left.score - right.score
      );
      const normalizedEnd = end < 0 ? rows.length : end + 1;
      return Promise.resolve(rows.slice(start, normalizedEnd));
    }),
  },
}));

const baseStep: PolicyStep = {
  offenseCount: 1,
  windowDays: 30,
  recommendedAction: 'warn',
  requireOverrideReasonForDeviation: true,
};

describe('policy version lifecycle', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.hashes.clear();
    redisState.sortedSets.clear();
  });

  it('creates an initial draft version for a new policy', async () => {
    const { createPolicy, getPolicyByRule, listPolicyVersions } = await import(
      './policies'
    );
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

    const versions = await listPolicyVersions(policy.subreddit, policy.id);
    const activePolicy = await getPolicyByRule(policy.subreddit, policy.ruleKey);

    expect(policy.lifecycleState).toBe('draft');
    expect(policy.activeVersionNumber).toBeUndefined();
    expect(policy.proposedVersionNumber).toBe(1);
    expect(activePolicy).toBeUndefined();
    expect(versions).toHaveLength(1);
    expect(versions[0]?.lifecycleState).toBe('draft');
    expect(versions[0]?.steps[0]?.recommendedAction).toBe('warn');
  });

  it('reviews and adopts a policy, then drafts a later revision', async () => {
    const {
      addPolicyReview,
      adoptPolicyVersion,
      createPolicy,
      getPolicyByRule,
      listPolicyVersions,
      proposePolicyVersion,
      updatePolicy,
    } = await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

    await proposePolicyVersion(policy.subreddit, policy.id, {
      proposedBy: 'leadmod',
    });
    const reviewed = await addPolicyReview(policy.subreddit, policy.id, {
      reviewer: 'secondmod',
      decision: 'approve',
      note: 'Matches team expectation.',
    });
    const adopted = await adoptPolicyVersion(policy.subreddit, policy.id, {
      adoptedBy: 'leadmod',
      quickAdoption: false,
    });
    const activePolicy = await getPolicyByRule(policy.subreddit, policy.ruleKey);

    expect(reviewed?.lifecycleState).toBe('under_review');
    expect(adopted?.lifecycleState).toBe('adopted');
    expect(activePolicy?.activeVersionNumber).toBe(1);

    const updated = await updatePolicy(policy.subreddit, policy.id, {
      steps: [
        {
          ...baseStep,
          recommendedAction: 'remove',
        },
      ],
      updatedBy: 'leadmod',
      changeReason: 'team_alignment',
      changeSummary: 'Escalate first offense to remove.',
    });
    const versions = await listPolicyVersions(policy.subreddit, policy.id);

    expect(updated?.lifecycleState).toBe('draft');
    expect(updated?.activeVersionNumber).toBe(1);
    expect(updated?.proposedVersionNumber).toBe(2);
    expect(versions).toHaveLength(2);
    expect(versions[0]?.steps[0]?.recommendedAction).toBe('warn');
    expect(versions[1]?.steps[0]?.recommendedAction).toBe('remove');
    expect(versions[1]?.changeSummary).toBe(
      'Escalate first offense to remove.'
    );
  });

  it('lazily treats legacy policies as version 1', async () => {
    const { getPolicyByRule, listPolicyVersions, setPolicyByRule } =
      await import('./policies');
    const legacyPolicy: RulePolicy = {
      id: 'policy-legacy',
      subreddit: 'ExampleLearning',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
      createdBy: 'leadmod',
      steps: [baseStep],
      defaultMessageMode: 'log_only',
      active: true,
    };
    await setPolicyByRule(legacyPolicy);

    const migrated = await getPolicyByRule(
      legacyPolicy.subreddit,
      legacyPolicy.ruleKey
    );
    const versions = await listPolicyVersions(
      legacyPolicy.subreddit,
      legacyPolicy.id
    );

    expect(migrated?.activeVersionNumber).toBe(1);
    expect(migrated?.activeVersionId).toBe(versions[0]?.id);
    expect(versions[0]?.changeReason).toBe('legacy_policy_fallback');
  });

  it('rejects invalid lifecycle transitions', async () => {
    const { addPolicyReview, adoptPolicyVersion, createPolicy } = await import(
      './policies'
    );
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

    await expect(
      adoptPolicyVersion(policy.subreddit, policy.id, {
        adoptedBy: 'leadmod',
      })
    ).rejects.toThrow(/Only proposed or reviewed policy versions/);
    await expect(
      addPolicyReview(policy.subreddit, policy.id, {
        reviewer: 'secondmod',
        decision: 'approve',
      })
    ).rejects.toThrow(/Only proposed policy versions/);
  });

  it('requires configured approval thresholds before reviewed adoption', async () => {
    const {
      addPolicyReview,
      adoptPolicyVersion,
      createPolicy,
      proposePolicyVersion,
    } = await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
      ratificationSettings: {
        requiredApprovals: 2,
        allowSingleModAdoption: false,
      },
    });

    await proposePolicyVersion(policy.subreddit, policy.id, {
      proposedBy: 'leadmod',
      note: 'Escalation needs team ratification.',
    });
    await addPolicyReview(policy.subreddit, policy.id, {
      reviewer: 'secondmod',
      decision: 'approve',
    });

    await expect(
      adoptPolicyVersion(policy.subreddit, policy.id, {
        adoptedBy: 'leadmod',
      })
    ).rejects.toThrow(/Requires 2 approval/);

    const reviewed = await addPolicyReview(policy.subreddit, policy.id, {
      reviewer: 'thirdmod',
      decision: 'approve',
    });
    const adopted = await adoptPolicyVersion(policy.subreddit, policy.id, {
      adoptedBy: 'leadmod',
    });

    expect(reviewed?.ratificationSummary?.approvals).toBe(2);
    expect(adopted?.lifecycleState).toBe('adopted');
    expect(adopted?.proposalNote).toBe('Escalation needs team ratification.');
  });

  it('blocks quick adoption when the policy disables it', async () => {
    const { adoptPolicyVersion, createPolicy, proposePolicyVersion } =
      await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
      ratificationSettings: {
        requiredApprovals: 1,
        allowSingleModAdoption: false,
      },
    });

    await proposePolicyVersion(policy.subreddit, policy.id, {
      proposedBy: 'leadmod',
    });

    await expect(
      adoptPolicyVersion(policy.subreddit, policy.id, {
        adoptedBy: 'leadmod',
        quickAdoption: true,
      })
    ).rejects.toThrow(/Single-mod quick adoption is disabled/);
  });

  it('finds a policy from the policy index if the direct rule key is missing', async () => {
    const { getPolicyByRule } = await import('./policies');
    const indexedPolicy: RulePolicy = {
      id: 'policy-indexed-only',
      subreddit: 'ExampleLearning',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      activeVersionId: 'version-1',
      activeVersionNumber: 1,
      createdAt: '2026-05-16T00:00:00.000Z',
      updatedAt: '2026-05-16T00:00:00.000Z',
      createdBy: 'leadmod',
      steps: [baseStep],
      defaultMessageMode: 'log_only',
      active: true,
    };
    redisState.hashes.set('modmirror:ExampleLearning:policies', {
      [indexedPolicy.ruleKey]: JSON.stringify(indexedPolicy),
    });

    const policy = await getPolicyByRule(
      indexedPolicy.subreddit,
      indexedPolicy.ruleKey
    );

    expect(policy?.id).toBe(indexedPolicy.id);
    expect(policy?.ruleName).toBe(indexedPolicy.ruleName);
  });

  it('captures action snapshots from the active policy version', async () => {
    const { adoptPolicyVersion, capturePolicySnapshot, createPolicy, proposePolicyVersion } =
      await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });
    await proposePolicyVersion(policy.subreddit, policy.id, {
      proposedBy: 'leadmod',
    });
    const adopted = await adoptPolicyVersion(policy.subreddit, policy.id, {
      adoptedBy: 'leadmod',
      quickAdoption: true,
    });

    const snapshot = capturePolicySnapshot(adopted);

    expect(snapshot?.policyVersionStatus).toBe('active');
    expect(snapshot?.policyVersionId).toBe(adopted?.activeVersionId);
    expect(snapshot?.steps[0]?.recommendedAction).toBe('warn');
  });
});
