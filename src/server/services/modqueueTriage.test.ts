import { describe, expect, it, vi } from 'vitest';
import type { ActionEvent, PolicyStep, RulePolicy } from '../../shared/schema';
import {
  buildModqueueTriageItem,
  getModqueueTriageCapability,
  loadModqueueTriage,
} from './modqueueTriage';

const baseStep: PolicyStep = {
  offenseCount: 1,
  windowDays: 30,
  recommendedAction: 'remove',
  requireOverrideReasonForDeviation: true,
};

const lowEffortPolicy: RulePolicy = {
  id: 'policy-low-effort',
  subreddit: 'ExampleLearning',
  ruleKey: 'rule-2-low-effort',
  ruleName: 'Rule 2: Low-effort questions',
  createdAt: '2026-05-18T10:00:00.000Z',
  updatedAt: '2026-05-18T10:00:00.000Z',
  createdBy: 'leadmod',
  steps: [baseStep],
  defaultMessageMode: 'log_only',
  active: true,
  lifecycleState: 'adopted',
};

const priorAction: ActionEvent = {
  id: 'action-prior',
  subreddit: 'ExampleLearning',
  targetAuthor: 'learner_1',
  ruleKey: lowEffortPolicy.ruleKey,
  ruleName: lowEffortPolicy.ruleName,
  recommendedAction: 'remove',
  selectedAction: 'remove',
  deliveryMode: 'log_only',
  source: 'live',
  createdAt: '2026-05-17T10:00:00.000Z',
};

describe('modqueue triage', () => {
  it('records type-only capability without claiming runtime proof', () => {
    const capability = getModqueueTriageCapability();

    expect(capability.state).toBe('type_only');
    expect(capability.runtimeProof).toBe('type_only');
    expect(capability.safeToUseForReadOnlyTriage).toBe(true);
    expect(capability.evidence.join(' ')).toContain('getModQueue');
  });

  it('normalizes queue items into policy-linked Apply Policy targets', async () => {
    const item = await buildModqueueTriageItem({
      subreddit: 'ExampleLearning',
      policies: [lowEffortPolicy],
      recentActions: [priorAction],
      generatedAt: '2026-05-18T12:00:00.000Z',
      item: {
        id: 't3_queue_post',
        authorName: 'learner_1',
        subredditName: 'ExampleLearning',
        title: 'Low effort question',
        body: 'Can someone do my homework?',
        permalink: '/r/ExampleLearning/comments/queue_post/low_effort/',
        numberOfReports: 3,
        userReportReasons: ['Rule 2 low effort', 'homework'],
      },
    });

    expect(item).toEqual(
      expect.objectContaining({
        targetThingId: 't3_queue_post',
        targetType: 'post',
        authorName: 'learner_1',
        reportCount: 3,
        riskState: 'high_report_volume',
        source: 'reddit_modqueue',
      })
    );
    expect(item.policyHint).toEqual(
      expect.objectContaining({
        status: 'possible_match',
        ruleKey: lowEffortPolicy.ruleKey,
        confidence: 'low',
      })
    );
    expect(item.historySummary.modmirrorActionsForAuthor).toBe(1);
    expect(item.contentSnapshot.fetchStatus).toBe('captured');
    expect(item.applyPolicyHash).toContain('#act?');
    expect(item.applyPolicyHash).toContain('targetThingId=t3_queue_post');
    expect(item.applyPolicyHash).toContain('ruleKey=rule-2-low-effort');
  });

  it('does not synthesize queue items when the adapter fails', async () => {
    const response = await loadModqueueTriage({
      subreddit: 'ExampleLearning',
      type: 'all',
      limit: 10,
      dependencies: {
        fetchQueueItems: vi.fn(() => Promise.reject(new Error('forbidden'))),
        listPolicies: vi.fn(() => Promise.resolve([lowEffortPolicy])),
        listRecentActions: vi.fn(() => Promise.resolve([priorAction])),
        now: () => '2026-05-18T12:00:00.000Z',
      },
    });

    expect(response.capability.state).toBe('failed_runtime');
    expect(response.source).toBe('unavailable');
    expect(response.items).toEqual([]);
    expect(response.warnings[0]).toContain('forbidden');
  });

  it('returns an unsupported state without subreddit context', async () => {
    const response = await loadModqueueTriage({
      dependencies: {
        fetchQueueItems: vi.fn(),
        listPolicies: vi.fn(),
        listRecentActions: vi.fn(),
        now: () => '2026-05-18T12:00:00.000Z',
      },
    });

    expect(response.capability.state).toBe('unsupported');
    expect(response.items).toEqual([]);
    expect(response.warnings[0]).toContain('No subreddit context');
  });
});
