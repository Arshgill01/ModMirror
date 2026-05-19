import { describe, expect, it } from 'vitest';
import type {
  ActionEvent,
  ActionReceipt,
  OverrideEvent,
  PolicySnapshot,
  RulePolicy,
} from '../../shared/schema';
import {
  buildCasePacket,
  generateCasePacket,
  getAppealPosture,
  getConsistencyStatus,
  renderCasePacketMarkdown,
} from './casePacket';

const policySnapshot: PolicySnapshot = {
  policyId: 'policy-r2',
  policyVersionId: 'policy-r2-v1',
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
  capturedAt: '2026-05-16T12:00:00.000Z',
};

const action: ActionEvent = {
  id: 'action-current',
  subreddit: 'ExampleLearning',
  modUsername: 'mod_a',
  targetThingId: 't3_current',
  targetAuthor: 'learner_1',
  ruleKey: policySnapshot.ruleKey,
  ruleName: policySnapshot.ruleName,
  policyId: policySnapshot.policyId,
  policyVersionId: policySnapshot.policyVersionId,
  policyVersionNumber: policySnapshot.policyVersionNumber,
  policyVersionStatus: 'active',
  policySnapshot,
  recommendedAction: 'warn',
  selectedAction: 'temporary_ban_suggested',
  deliveryMode: 'log_only',
  source: 'simulator',
  createdAt: '2026-05-16T12:00:00.000Z',
};

const override: OverrideEvent = {
  id: 'override-current',
  subreddit: 'ExampleLearning',
  modUsername: 'mod_a',
  targetThingId: 't3_current',
  targetAuthor: 'learner_1',
  ruleKey: action.ruleKey,
  ruleName: 'Low-effort questions',
  policyId: policySnapshot.policyId,
  policyVersionId: policySnapshot.policyVersionId,
  policyVersionNumber: policySnapshot.policyVersionNumber,
  policyVersionStatus: 'active',
  policySnapshot,
  recommendedAction: action.recommendedAction,
  selectedAction: action.selectedAction,
  overrideReason: 'severe_context',
  reviewStatus: 'accepted_exception',
  reviewedBy: 'lead_mod',
  reviewedAt: '2026-05-16T12:05:00.000Z',
  updatedAt: '2026-05-16T12:05:00.000Z',
  createdAt: '2026-05-16T12:00:30.000Z',
};

const currentPolicy: RulePolicy = {
  id: policySnapshot.policyId,
  subreddit: 'ExampleLearning',
  ruleKey: policySnapshot.ruleKey,
  ruleName: policySnapshot.ruleName,
  activeVersionId: policySnapshot.policyVersionId,
  activeVersionNumber: 1,
  createdAt: '2026-05-10T12:00:00.000Z',
  updatedAt: '2026-05-16T12:00:00.000Z',
  createdBy: 'lead_mod',
  steps: policySnapshot.steps,
  defaultMessageMode: 'log_only',
  active: true,
};

const receipt: ActionReceipt = {
  id: 'receipt-current',
  actionEventId: action.id,
  subreddit: action.subreddit,
  targetThingId: 't3_current',
  targetType: 'post',
  targetSnapshot: {
    targetThingId: action.targetThingId ?? 't3_current',
    targetType: 'post',
    authorName: 'learner_1',
    title: 'Low-effort question',
    source: 'provided',
    warnings: [],
  },
  contentSnapshot: {
    schemaVersion: 1,
    targetThingId: action.targetThingId ?? 't3_current',
    targetType: 'post',
    subreddit: 'ExampleLearning',
    authorName: 'learner_1',
    titleExcerpt: 'Low-effort question',
    bodyExcerpt: 'How do I learn everything fast?',
    fetchedAt: '2026-05-16T12:00:00.000Z',
    fetchStatus: 'captured',
    source: 'receipt',
    warnings: [],
    privacy: {
      retentionCategory: 'moderation_evidence',
      authorStored: true,
      titleExcerptStored: true,
      bodyExcerptStored: true,
      permalinkStored: false,
      redactionNotes: ['Test snapshot stores excerpts only.'],
    },
  },
  modUsername: 'mod_a',
  source: 'dashboard',
  policySnapshot,
  recommendation: {
    ruleKey: action.ruleKey,
    ruleName: policySnapshot.ruleName,
    policyId: policySnapshot.policyId,
    offenseCount: 1,
    recommendedAction: action.recommendedAction,
    messageDeliveryMode: action.deliveryMode,
    requiresOverrideReason: true,
    selectedAction: action.selectedAction,
    deviatesFromPolicy: true,
    fallbackReason: 'policy_found',
    message: 'Team policy recommends warn.',
  },
  selectedAction: action.selectedAction,
  deviatesFromPolicy: true,
  overrideEventId: override.id,
  overrideReason: override.overrideReason,
  executionMode: 'log_only',
  executionAttempted: false,
  executionResult: 'skipped',
  redditOperation: 'none',
  capabilityState: 'not_applicable',
  createdAt: action.createdAt,
};

describe('case packet engine', () => {
  it('maps consistency status by policy recommendation severity', () => {
    expect(getConsistencyStatus({ ...action, selectedAction: 'warn' })).toBe(
      'matched_policy'
    );
    expect(getConsistencyStatus(action)).toBe('stricter_than_policy');
    expect(getConsistencyStatus({ ...action, selectedAction: 'approve' })).toBe(
      'looser_than_policy'
    );
    expect(
      getConsistencyStatus(actionWithoutPolicyVersion())
    ).toBe('policy_unavailable');
  });

  it('maps deterministic appeal posture', () => {
    expect(
      getAppealPosture({
        consistencyStatus: 'matched_policy',
        override: undefined,
        policyContext: {},
        userHistoryCount: 0,
        comparableCasesCount: 0,
      })
    ).toBe('policy_consistent');
    expect(
      getAppealPosture({
        consistencyStatus: 'stricter_than_policy',
        override,
        policyContext: {},
        userHistoryCount: 1,
        comparableCasesCount: 1,
      })
    ).toBe('justified_override');
  });

  it('builds packet with policy version, override, history, comparables, and markdown', () => {
    const prior: ActionEvent = {
      ...action,
      id: 'action-prior',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      createdAt: '2026-05-10T12:00:00.000Z',
    };
    const comparablePrior: ActionEvent = {
      ...action,
      id: 'action-comparable-prior',
      targetAuthor: 'learner_2',
      selectedAction: 'warn',
      recommendedAction: 'warn',
      createdAt: '2026-05-11T12:00:00.000Z',
    };
    const comparable: ActionEvent = {
      ...action,
      id: 'action-comparable',
      targetAuthor: 'learner_2',
      createdAt: '2026-05-15T12:00:00.000Z',
    };

    const packet = buildCasePacket({
      request: {
        subject: { type: 'action', actionId: action.id },
        timeWindowDays: 30,
        maxComparableCases: 5,
      },
      subreddit: 'ExampleLearning',
      generatedBy: 'mod_a',
      action,
      dataSet: {
        actions: [prior, comparablePrior, comparable, action],
        overrides: [override],
        currentPolicy,
        demoMode: false,
      },
    });

    expect(packet.policyContext.policyVersionNumber).toBe(1);
    expect(packet.overrideContext?.reviewStatus).toBe('accepted_exception');
    expect(packet.userHistory).toHaveLength(1);
    expect(packet.comparableCases).toHaveLength(1);
    expect(packet.markdown).toContain('## Suggested Appeal Posture');
  });

  it('prefers receipt evidence when a receipt is available', () => {
    const packet = buildCasePacket({
      request: {
        subject: { type: 'action', actionId: action.id },
        packetType: 'internal_review',
      },
      subreddit: 'ExampleLearning',
      generatedBy: 'mod_a',
      action,
      receipt,
      dataSet: {
        actions: [action],
        receipts: [receipt],
        overrides: [override],
        currentPolicy,
        demoMode: false,
      },
    });

    expect(packet.packetType).toBe('internal_review');
    expect(packet.action?.receiptId).toBe(receipt.id);
    expect(packet.action?.contentSnapshot?.fetchStatus).toBe('captured');
    expect(packet.action?.evidenceSource).toBe('verified_receipt');
    expect(packet.action?.execution?.executionResult).toBe('skipped');
    expect(packet.evidence).toContainEqual(
      expect.objectContaining({
        label: 'Action receipt',
        source: 'verified_receipt',
      })
    );
    expect(packet.evidence).toContainEqual(
      expect.objectContaining({
        label: 'Content snapshot',
        source: 'verified_receipt',
      })
    );
    expect(packet.markdown).toContain('Content snapshot: captured');
    expect(packet.markdown).toContain('Receipt ID: receipt-current');
  });

  it('flags policy changed since action when active version differs', () => {
    const packet = buildCasePacket({
      request: { subject: { type: 'action', actionId: action.id } },
      subreddit: 'ExampleLearning',
      generatedBy: undefined,
      action,
      dataSet: {
        actions: [action],
        overrides: [],
        currentPolicy: {
          ...currentPolicy,
          activeVersionId: 'policy-r2-v2',
          activeVersionNumber: 2,
        },
        demoMode: false,
      },
    });

    expect(packet.policyContext.changedSinceAction).toBe(true);
    expect(packet.appealPosture).toBe('policy_changed_since_action');
  });

  it('returns useful missing data fallback and markdown', () => {
    const packet = buildCasePacket({
      request: { subject: { type: 'action', actionId: 'missing' } },
      subreddit: 'ExampleLearning',
      generatedBy: undefined,
      action: undefined,
      dataSet: {
        actions: [],
        overrides: [],
        currentPolicy: undefined,
        demoMode: false,
      },
    });

    expect(packet.consistencyStatus).toBe('insufficient_data');
    expect(renderCasePacketMarkdown(packet)).toContain(
      'Action data was not found'
    );
  });

  it('generates a demo case packet without Redis data', async () => {
    const response = await generateCasePacket({
      request: { subject: { type: 'demo' } },
      subreddit: 'ExampleLearning',
      generatedBy: 'demo_mod',
    });

    expect(response.packet.action?.actionId).toBe('demo-case-r2-appeal');
    expect(response.packet.policyContext.policyVersionNumber).toBe(2);
    expect(response.packet.overrideContext?.reviewStatus).toBe(
      'accepted_exception'
    );
    expect(response.packet.comparableCases.length).toBeGreaterThan(0);
    expect(response.packet.caveats.join(' ')).toContain('demo seed data');
  });
});

function actionWithoutPolicyVersion(): ActionEvent {
  const {
    policyVersionId: _policyVersionId,
    policyVersionNumber: _policyVersionNumber,
    policySnapshot: _policySnapshot,
    ...withoutVersion
  } = action;

  return {
    ...withoutVersion,
    policyVersionStatus: 'missing',
  };
}
