import type {
  PolicyReplayActionInput,
  PolicyStep,
  RulePolicy,
} from '../../../shared/schema';

export const replayPolicySteps: PolicyStep[] = [
  {
    offenseCount: 1,
    windowDays: 30,
    recommendedAction: 'warn',
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 2,
    windowDays: 30,
    recommendedAction: 'remove',
    requireOverrideReasonForDeviation: true,
  },
  {
    offenseCount: 3,
    windowDays: 30,
    recommendedAction: 'temporary_ban_suggested',
    requireOverrideReasonForDeviation: true,
  },
];

export const replayPolicyFixture: RulePolicy = {
  id: 'policy-low-effort',
  subreddit: 'ExampleLearning',
  ruleKey: 'low-effort-questions-2',
  ruleName: 'Low-effort questions',
  activeVersionId: 'policy-version-1',
  activeVersionNumber: 1,
  lifecycleState: 'adopted',
  createdAt: '2026-05-18T00:00:00.000Z',
  updatedAt: '2026-05-18T00:00:00.000Z',
  createdBy: 'leadmod',
  defaultMessageMode: 'log_only',
  active: true,
  steps: replayPolicySteps,
};

export const replayActionFixtures: PolicyReplayActionInput[] = [
  {
    id: 'action-1',
    subreddit: 'ExampleLearning',
    rawActionType: 'remove',
    normalizedAction: 'remove',
    targetThingId: 't3_case_1',
    targetAuthor: 'learner_a',
    createdAt: '2026-05-18T00:00:00.000Z',
    inferredRuleKey: 'low-effort-questions-2',
    inferredRuleName: 'Low-effort questions',
    confidence: 'high',
    evidence: ['Matched removal reason title.'],
  },
  {
    id: 'action-2',
    subreddit: 'ExampleLearning',
    rawActionType: 'remove',
    normalizedAction: 'remove',
    targetThingId: 't3_case_2',
    targetAuthor: 'learner_a',
    createdAt: '2026-05-18T00:10:00.000Z',
    inferredRuleKey: 'low-effort-questions-2',
    inferredRuleName: 'Low-effort questions',
    confidence: 'medium',
    evidence: ['Matched moderator note text.'],
  },
  {
    id: 'action-3',
    subreddit: 'ExampleLearning',
    rawActionType: 'approve',
    normalizedAction: 'approve',
    targetThingId: 't3_case_3',
    targetAuthor: 'learner_b',
    createdAt: '2026-05-18T00:20:00.000Z',
    inferredRuleKey: 'self-promotion-3',
    inferredRuleName: 'Self-promotion',
    confidence: 'high',
    evidence: ['Different rule bucket.'],
  },
];
