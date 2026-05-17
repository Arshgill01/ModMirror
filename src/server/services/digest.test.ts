import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ActionEvent,
  LastScanMetadata,
  OverrideEvent,
  PolicyHealthOverview,
  RulePolicy,
} from '../../shared/schema';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

const listPolicies = vi.hoisted(() => vi.fn());
const getPolicyHealthOverview = vi.hoisted(() => vi.fn());
const listRecentActionEvents = vi.hoisted(() => vi.fn());
const listRecentAuditEvents = vi.hoisted(() => vi.fn());
const getLastScanMetadata = vi.hoisted(() => vi.fn());

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => Promise.resolve(redisState.strings.get(key))),
    set: vi.fn((key: string, value: string) => {
      redisState.strings.set(key, value);
      return Promise.resolve();
    }),
    zAdd: vi.fn((key: string, value: { member: string; score: number }) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      rows.push(value);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve();
    }),
    zRange: vi.fn((key: string, start: number, end: number) => {
      const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
        (left, right) => right.score - left.score
      );
      const normalizedEnd = end < 0 ? rows.length : end + 1;
      return Promise.resolve(rows.slice(start, normalizedEnd));
    }),
  },
}));

vi.mock('./policies', () => ({
  listPolicies,
}));

vi.mock('./policyHealth', () => ({
  getPolicyHealthOverview,
}));

vi.mock('./audit', () => ({
  listRecentActionEvents,
  listRecentAuditEvents,
}));

vi.mock('./scans', () => ({
  getLastScanMetadata,
}));

const policy: RulePolicy = {
  id: 'policy-rule-2',
  subreddit: 'ExampleLearning',
  ruleKey: 'low-effort-questions-2',
  ruleName: 'Low-effort questions',
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  createdBy: 'leadmod',
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

const action: ActionEvent = {
  id: 'action-1',
  subreddit: 'ExampleLearning',
  ruleKey: policy.ruleKey,
  ruleName: policy.ruleName,
  policyId: policy.id,
  recommendedAction: 'warn',
  selectedAction: 'temporary_ban_suggested',
  deliveryMode: 'log_only',
  source: 'simulator',
  createdAt: '2026-05-17T00:00:00.000Z',
};

const override: OverrideEvent = {
  id: 'override-1',
  subreddit: 'ExampleLearning',
  modUsername: 'mod_a',
  ruleKey: policy.ruleKey,
  ruleName: policy.ruleName,
  policyId: policy.id,
  recommendedAction: 'warn',
  selectedAction: 'temporary_ban_suggested',
  overrideReason: 'policy_seems_wrong',
  reviewStatus: 'unresolved',
  updatedAt: '2026-05-17T00:00:00.000Z',
  createdAt: '2026-05-17T00:00:00.000Z',
};

const health: PolicyHealthOverview = {
  totalPolicies: 1,
  stablePolicies: 0,
  policiesNeedingReview: 1,
  unresolvedOverrides: 1,
  summaries: [
    {
      policyId: policy.id,
      ruleKey: policy.ruleKey,
      ruleName: policy.ruleName,
      status: 'needs_review',
      totalActions: 8,
      followedPolicyCount: 5,
      overrideCount: 3,
      unresolvedOverrideCount: 1,
      policySeemsWrongCount: 1,
      adherenceRate: 5 / 8,
      overrideRate: 3 / 8,
      reasons: ['Several overrides say the policy seems wrong.'],
      recommendations: ['Review this policy: overrides indicate the ladder may be wrong.'],
    },
  ],
};

const lastScan: LastScanMetadata = {
  id: 'scan-demo',
  subreddit: 'ExampleLearning',
  createdAt: '2026-05-17T00:00:00.000Z',
  createdBy: 'leadmod',
  source: 'demo',
  totalActionsScanned: 60,
  attributedCount: 56,
  unmatchedCount: 4,
  confidenceBreakdown: {
    high: 40,
    medium: 12,
    low: 4,
    unmatched: 4,
  },
  driftCandidateCount: 1,
};

describe('digest service', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
    listPolicies.mockResolvedValue([policy]);
    getPolicyHealthOverview.mockResolvedValue(health);
    listRecentActionEvents.mockResolvedValue([action]);
    listRecentAuditEvents.mockResolvedValue([override]);
    getLastScanMetadata.mockResolvedValue(lastScan);
  });

  it('generates deterministic markdown and stores digest history', async () => {
    const { generateDigestReport, listDigestHistory } = await import('./digest');

    const response = await generateDigestReport({
      subreddit: 'ExampleLearning',
      generatedBy: 'leadmod',
      request: { source: 'demo' },
    });
    const history = await listDigestHistory('ExampleLearning');

    expect(response.report.overallStatus).toBe('needs_review');
    expect(response.report.summary.activePolicies).toBe(1);
    expect(response.report.summary.unresolvedOverrides).toBe(1);
    expect(response.report.ruleHealth[0]?.topOverrideReason).toBe(
      'policy_seems_wrong'
    );
    expect(response.report.markdown).toContain('# ModMirror Digest');
    expect(response.report.markdown).toContain('Low-effort questions');
    expect(history[0]?.id).toBe(response.report.id);
  });

  it('reports delivery and scheduler as unverified instead of pretending they work', async () => {
    const { getDigestCapabilities } = await import('./digest');

    const capabilities = getDigestCapabilities();

    expect(capabilities.modDiscussion.state).toBe('unverified');
    expect(capabilities.scheduler.state).toBe('unverified');
  });
});
