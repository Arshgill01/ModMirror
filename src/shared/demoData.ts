import { DEMO_SUBREDDIT_NAME } from './constants';
import type { RulePolicy, SubredditRuleRef } from './schema';

export const DEMO_RULES: SubredditRuleRef[] = [
  {
    ruleKey: 'be-civil-1',
    ruleName: 'Be civil',
    rulePriority: 1,
    ruleKind: 'all',
  },
  {
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    rulePriority: 2,
    ruleKind: 'link',
  },
  {
    ruleKey: 'self-promotion-3',
    ruleName: 'Self-promotion',
    rulePriority: 3,
    ruleKind: 'all',
  },
];

export const DEMO_POLICY: RulePolicy = {
  id: 'demo-policy-low-effort-questions',
  subreddit: DEMO_SUBREDDIT_NAME,
  ruleKey: 'low-effort-questions-2',
  ruleName: 'Low-effort questions',
  rulePriority: 2,
  ruleKind: 'link',
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
  createdBy: 'demo-lead-mod',
  defaultMessageMode: 'log_only',
  active: true,
  steps: [
    {
      offenseCount: 1,
      windowDays: 30,
      recommendedAction: 'warn',
      requireOverrideReasonForDeviation: true,
      removalMessageTemplate:
        'Please add effort, context, and what you have already tried before reposting.',
    },
    {
      offenseCount: 2,
      windowDays: 30,
      recommendedAction: 'note',
      requireOverrideReasonForDeviation: true,
      noteTemplate:
        'Repeat low-effort question after a first-warning policy reminder.',
    },
    {
      offenseCount: 3,
      windowDays: 30,
      recommendedAction: 'temporary_ban_suggested',
      requireOverrideReasonForDeviation: true,
    },
  ],
};
