import { describe, expect, it } from 'vitest';
import type { ActionReceipt, OverrideEvent } from '../../shared/schema';
import { buildEvidenceGraph } from './evidenceGraph';

describe('Evidence Graph', () => {
  it('links receipt, policy, snapshot, and override while filtering names', async () => {
    const graph = await buildEvidenceGraph({
      subreddit: 'ExampleLearning',
      subject: { type: 'receipt', id: 'receipt-1' },
      dependencies: {
        getReceipt: async () => receipt(),
        getOverride: async () => override(),
      },
    });

    expect(graph.nodes.map((node) => node.type)).toEqual(
      expect.arrayContaining(['receipt', 'policy', 'content_snapshot', 'override'])
    );
    expect(graph.edges.map((edge) => edge.label)).toEqual(
      expect.arrayContaining(['used policy', 'captured context', 'created override'])
    );
    expect(graph.missingReferences).toEqual([]);
    expect(JSON.stringify(graph)).not.toContain('learner_a');
    expect(JSON.stringify(graph)).not.toContain('mod_a');
  });

  it('reports missing referenced records', async () => {
    const graph = await buildEvidenceGraph({
      subreddit: 'ExampleLearning',
      subject: { type: 'receipt', id: 'missing' },
      dependencies: {
        getReceipt: async () => undefined,
      },
    });

    expect(graph.missingReferences).toEqual(['receipt:missing']);
  });
});

function receipt(): ActionReceipt {
  return {
    id: 'receipt-1',
    actionEventId: 'action-1',
    subreddit: 'ExampleLearning',
    targetThingId: 't3_target',
    targetType: 'post',
    targetSnapshot: {
      targetThingId: 't3_target',
      targetType: 'post',
      authorName: 'learner_a',
      title: 'Question',
      source: 'provided',
      warnings: [],
    },
    contentSnapshot: {
      schemaVersion: 1,
      targetThingId: 't3_target',
      targetType: 'post',
      subreddit: 'ExampleLearning',
      fetchedAt: '2026-05-21T00:00:00.000Z',
      fetchStatus: 'captured',
      source: 'receipt',
      warnings: [],
      privacy: {
        retentionCategory: 'moderation_evidence',
        authorStored: true,
        titleExcerptStored: false,
        bodyExcerptStored: false,
        permalinkStored: false,
        redactionNotes: [],
      },
    },
    modUsername: 'mod_a',
    source: 'dashboard',
    policySnapshot: {
      policyId: 'policy-1',
      policyVersionId: 'policy-1-v1',
      policyVersionNumber: 1,
      policyVersionStatus: 'active',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      steps: [
        {
          offenseCount: 1,
          windowDays: 30,
          recommendedAction: 'warn',
          requireOverrideReasonForDeviation: true,
        },
      ],
      defaultMessageMode: 'log_only',
      capturedAt: '2026-05-21T00:00:00.000Z',
    },
    recommendation: {
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      policyId: 'policy-1',
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: true,
      selectedAction: 'remove',
      deviatesFromPolicy: true,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warn.',
    },
    selectedAction: 'remove',
    deviatesFromPolicy: true,
    overrideEventId: 'override-1',
    overrideReason: 'severe_context',
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: '2026-05-21T00:00:00.000Z',
  };
}

function override(): OverrideEvent {
  return {
    id: 'override-1',
    subreddit: 'ExampleLearning',
    modUsername: 'mod_a',
    targetAuthor: 'learner_a',
    ruleKey: 'low-effort-questions-2',
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'severe_context',
    reviewStatus: 'unresolved',
    createdAt: '2026-05-21T00:00:00.000Z',
    updatedAt: '2026-05-21T00:00:00.000Z',
  };
}
