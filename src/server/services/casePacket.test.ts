import { describe, expect, it } from 'vitest';
import type {
  ActionEvent,
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
