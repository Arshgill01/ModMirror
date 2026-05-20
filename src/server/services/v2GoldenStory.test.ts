import { describe, expect, it } from 'vitest';
import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import { DEMO_POLICY } from '../../shared/demoData';
import type { ActionReceipt, AttributedModAction, MirrorScanRecord, OverrideEvent } from '../../shared/schema';
import { buildDriftCandidates } from './mirrorScan';
import { buildCommandCenterV2 } from './v2CommandCenter';
import { buildDriftRadar } from './driftRadar';
import { simulatePolicyDraft } from './policySimulator';
import { buildDemoCalibrationScenarios } from './calibration';
import { buildEvidenceGraph } from './evidenceGraph';

describe('V2 golden story contract', () => {
  it('keeps the Rule 2 demo loop deterministic and guardrailed', async () => {
    const record = goldenRecord();
    const driftRadar = buildDriftRadar(record);
    const commandCenter = buildCommandCenterV2({
      subreddit: DEMO_SUBREDDIT_NAME,
      generatedAt: '2026-05-21T12:00:00.000Z',
      scan: record,
      policies: [DEMO_POLICY],
    });
    const simulation = simulatePolicyDraft({
      subreddit: DEMO_SUBREDDIT_NAME,
      activePolicy: DEMO_POLICY,
      draftPolicy: {
        ...DEMO_POLICY,
        id: 'demo-policy-low-effort-draft',
        steps: [
          {
            offenseCount: 1,
            windowDays: 30,
            recommendedAction: 'remove',
            requireOverrideReasonForDeviation: true,
          },
        ],
      },
      actions: record.attributedActions,
      generatedAt: '2026-05-21T12:00:00.000Z',
    });
    const graph = await buildEvidenceGraph({
      subreddit: DEMO_SUBREDDIT_NAME,
      subject: { type: 'receipt', id: 'golden-receipt' },
      dependencies: {
        getReceipt: async () => goldenReceipt(),
        getOverride: async () => goldenOverride(),
      },
    });
    const scenarios = buildDemoCalibrationScenarios();

    expect(record.totalActionsScanned).toBe(10);
    expect(record.driftCandidates[0]).toEqual(
      expect.objectContaining({
        ruleKey: DEMO_POLICY.ruleKey,
        confidence: 'high',
      })
    );
    expect(driftRadar.details[0]?.policyQuestions[0]).toContain('first-offense');
    expect(commandCenter.trustLabels.map((label) => label.label)).toEqual(
      expect.arrayContaining(['Demo data', 'Aggregate privacy'])
    );
    expect(simulation.summary.stricter).toBeGreaterThan(0);
    expect(graph.nodes.map((node) => node.type)).toEqual(
      expect.arrayContaining(['receipt', 'policy', 'override', 'content_snapshot'])
    );
    expect(scenarios).toHaveLength(5);
    expect(JSON.stringify({ commandCenter, graph, scenarios })).toContain(
      'avoid per-mod leaderboards'
    );
    expect(JSON.stringify({ commandCenter, graph })).not.toContain('mod-alpha');
  });
});

function goldenRecord(): MirrorScanRecord {
  const actions = goldenActions();
  return {
    id: 'golden-v2-scan',
    subreddit: DEMO_SUBREDDIT_NAME,
    createdAt: '2026-05-21T12:00:00.000Z',
    createdBy: 'golden-test',
    source: 'demo',
    totalActionsScanned: actions.length,
    attributedCount: actions.length,
    unmatchedCount: 0,
    confidenceBreakdown: {
      high: actions.length,
      medium: 0,
      low: 0,
      unmatched: 0,
    },
    driftCandidates: buildDriftCandidates(actions),
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: actions.length,
      minimumActions: 8,
      message: 'Enough action history for demo drift review.',
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 120,
      pageSize: 60,
      fetchedActions: actions.length,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: true,
    },
    warnings: ['Golden V2 demo fixture.'],
    attributedActions: actions,
    unmatchedActions: [],
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: actions.length,
    },
  };
}

function goldenActions(): AttributedModAction[] {
  const selected = [
    'warn',
    'remove',
    'temporary_ban_suggested',
    'warn',
    'remove',
    'warn',
    'remove',
    'temporary_ban_suggested',
    'warn',
    'remove',
  ] as const;
  return selected.map((action, index) => ({
    id: `golden-action-${index}`,
    subreddit: DEMO_SUBREDDIT_NAME,
    source: 'demo',
    rawActionType: action,
    normalizedAction: action,
    targetThingId: `t3_golden_${index}`,
    targetAuthor: `demo-author-${index}`,
    moderator: `mod-alpha`,
    createdAt: `2026-05-21T12:${String(index).padStart(2, '0')}:00.000Z`,
    inferredRuleKey: DEMO_POLICY.ruleKey,
    inferredRuleName: DEMO_POLICY.ruleName,
    confidence: 'high',
    evidence: ['Matched demo Rule 2 removal reason.'],
    attributionKind: 'inferred',
  }));
}

function goldenReceipt(): ActionReceipt {
  return {
    id: 'golden-receipt',
    actionEventId: 'golden-action',
    subreddit: DEMO_SUBREDDIT_NAME,
    targetThingId: 't3_golden_receipt',
    targetType: 'post',
    targetSnapshot: {
      targetThingId: 't3_golden_receipt',
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    contentSnapshot: {
      schemaVersion: 1,
      targetThingId: 't3_golden_receipt',
      targetType: 'post',
      subreddit: DEMO_SUBREDDIT_NAME,
      fetchedAt: '2026-05-21T12:00:00.000Z',
      fetchStatus: 'captured',
      source: 'demo',
      warnings: ['Golden demo snapshot.'],
      privacy: {
        retentionCategory: 'moderation_evidence',
        authorStored: false,
        titleExcerptStored: true,
        bodyExcerptStored: false,
        permalinkStored: false,
        redactionNotes: ['No real user data.'],
      },
    },
    modUsername: 'mod-alpha',
    source: 'demo',
    policySnapshot: {
      policyId: DEMO_POLICY.id,
      policyVersionId: DEMO_POLICY.activeVersionId ?? 'demo-policy-low-effort-v2',
      policyVersionNumber: DEMO_POLICY.activeVersionNumber ?? 2,
      policyVersionStatus: 'active',
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      steps: DEMO_POLICY.steps,
      defaultMessageMode: 'log_only',
      capturedAt: '2026-05-21T12:00:00.000Z',
    },
    recommendation: {
      ruleKey: DEMO_POLICY.ruleKey,
      ruleName: DEMO_POLICY.ruleName,
      policyId: DEMO_POLICY.id,
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
    overrideEventId: 'golden-override',
    overrideReason: 'severe_context',
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: '2026-05-21T12:00:00.000Z',
  };
}

function goldenOverride(): OverrideEvent {
  return {
    id: 'golden-override',
    subreddit: DEMO_SUBREDDIT_NAME,
    modUsername: 'mod-alpha',
    ruleKey: DEMO_POLICY.ruleKey,
    ruleName: DEMO_POLICY.ruleName,
    recommendedAction: 'warn',
    selectedAction: 'remove',
    overrideReason: 'severe_context',
    reviewStatus: 'unresolved',
    updatedAt: '2026-05-21T12:00:00.000Z',
    createdAt: '2026-05-21T12:00:00.000Z',
  };
}
