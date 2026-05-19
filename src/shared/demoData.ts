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
  activeVersionId: 'demo-policy-low-effort-v2',
  activeVersionNumber: 2,
  lifecycleState: 'adopted',
  adoptedBy: 'demo-lead-mod',
  adoptedAt: '2026-05-16T10:30:00.000Z',
  ratificationSettings: {
    requiredApprovals: 1,
    allowSingleModAdoption: true,
  },
  ratificationSummary: {
    requiredApprovals: 1,
    approvals: 1,
    requestsForChanges: 0,
    abstentions: 0,
    latestReviewCount: 1,
    canAdopt: true,
  },
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
      responseTemplates: {
        warning: {
          kind: 'warning',
          title: 'Low-effort question reminder',
          body: 'Hi {{target_author}}, please add effort, context, and what you have already tried before reposting. This maps to {{rule_name}}.',
          deliveryMode: 'log_only',
          enabled: true,
        },
      },
    },
    {
      offenseCount: 2,
      windowDays: 30,
      recommendedAction: 'note',
      requireOverrideReasonForDeviation: true,
      noteTemplate:
        'Repeat low-effort question after a first-warning policy reminder.',
      responseTemplates: {
        mod_note_summary: {
          kind: 'mod_note_summary',
          body: 'Repeat {{rule_name}} case after a first-warning policy reminder.',
          deliveryMode: 'log_only',
          enabled: true,
        },
      },
    },
    {
      offenseCount: 3,
      windowDays: 30,
      recommendedAction: 'temporary_ban_suggested',
      requireOverrideReasonForDeviation: true,
      responseTemplates: {
        modmail_draft: {
          kind: 'modmail_draft',
          title: 'Escalation review',
          body: '{{target_author}} has reached offense {{offense_count}} for {{rule_name}}. Review the case packet before confirming any ban outside ModMirror.',
          deliveryMode: 'log_only',
          enabled: true,
        },
      },
    },
  ],
};
