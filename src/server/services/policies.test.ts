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

describe('policy version history', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.hashes.clear();
    redisState.sortedSets.clear();
  });

  it('creates an initial immutable version for a new policy', async () => {
    const { createPolicy, listPolicyVersions } = await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

    const versions = await listPolicyVersions(policy.subreddit, policy.id);

    expect(policy.activeVersionNumber).toBe(1);
    expect(policy.activeVersionId).toBe(versions[0]?.id);
    expect(versions).toHaveLength(1);
    expect(versions[0]?.steps[0]?.recommendedAction).toBe('warn');
  });

  it('creates a new version on edit and preserves the old version', async () => {
    const { createPolicy, listPolicyVersions, updatePolicy } = await import(
      './policies'
    );
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

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

    expect(updated?.activeVersionNumber).toBe(2);
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

  it('captures action snapshots from the active policy version', async () => {
    const { capturePolicySnapshot, createPolicy } = await import('./policies');
    const policy = await createPolicy({
      subreddit: 'ExampleLearning',
      createdBy: 'leadmod',
      ruleKey: 'rule-2-low-effort-questions-2',
      ruleName: 'Rule 2: Low-effort questions',
      steps: [baseStep],
    });

    const snapshot = capturePolicySnapshot(policy);

    expect(snapshot?.policyVersionStatus).toBe('active');
    expect(snapshot?.policyVersionId).toBe(policy.activeVersionId);
    expect(snapshot?.steps[0]?.recommendedAction).toBe('warn');
  });
});
