import { toRuleKey } from '../../shared/scoring';
import type {
  EnforcementAction,
  NormalizedModAction,
  NormalizedRemovalReason,
  NormalizedRule,
} from '../../shared/schema';

export type RedditRuleLike = {
  shortName?: string;
  description?: string;
  violationReason?: string;
  priority?: number;
  kind?: 'all' | 'link' | 'comment';
  toJSON?: () => {
    shortName?: string;
    description?: string;
    violationReason?: string;
    priority?: number;
    kind?: 'all' | 'link' | 'comment';
  };
};

export type RedditRemovalReasonLike = {
  id: string;
  title: string;
  message?: string;
};

export type RedditModActionLike = {
  id: string;
  type: string;
  moderatorName?: string;
  createdAt: Date | string;
  subredditName?: string;
  description?: string;
  details?: string;
  target?: {
    id?: string;
    author?: string;
    title?: string;
  };
};

export function normalizeRedditRule(rule: RedditRuleLike): NormalizedRule {
  const json = rule.toJSON?.() ?? rule;
  const ruleName = json.shortName?.trim() || 'Untitled rule';
  const normalized: NormalizedRule = {
    ruleKey: toRuleKey(ruleName, json.priority),
    ruleName,
    source: 'reddit_rule',
  };

  if (json.description) {
    normalized.description = json.description;
  }
  if (json.violationReason) {
    normalized.violationReason = json.violationReason;
  }
  if (typeof json.priority === 'number') {
    normalized.priority = json.priority;
  }
  if (json.kind) {
    normalized.kind = json.kind;
  }

  return normalized;
}

export function normalizeRemovalReason(
  reason: RedditRemovalReasonLike
): NormalizedRemovalReason {
  const normalized: NormalizedRemovalReason = {
    id: reason.id,
    title: reason.title,
    source: 'reddit_removal_reason',
  };

  if (reason.message) {
    normalized.message = reason.message;
  }

  return normalized;
}

export function normalizeModAction(
  action: RedditModActionLike,
  fallbackSubreddit: string
): NormalizedModAction {
  const normalized: NormalizedModAction = {
    id: action.id,
    subreddit: action.subredditName ?? fallbackSubreddit,
    source: 'live',
    rawActionType: action.type,
    createdAt:
      action.createdAt instanceof Date
        ? action.createdAt.toISOString()
        : action.createdAt,
  };
  const normalizedAction = normalizeEnforcementAction(action.type);
  const detailsText = [action.description, action.details, action.target?.title]
    .filter(Boolean)
    .join(' ');

  if (normalizedAction) {
    normalized.normalizedAction = normalizedAction;
  }
  if (action.moderatorName) {
    normalized.moderator = action.moderatorName;
  }
  if (action.target?.id && isContentThingId(action.target.id)) {
    normalized.targetThingId = action.target.id;
  }
  if (action.target?.author) {
    normalized.targetAuthor = action.target.author;
  }
  if (detailsText) {
    normalized.detailsText = detailsText;
  }

  return normalized;
}

function isContentThingId(value: string): boolean {
  return value.startsWith('t1_') || value.startsWith('t3_');
}

export function normalizeEnforcementAction(
  rawActionType: string
): EnforcementAction | undefined {
  const value = rawActionType.toLowerCase();

  if (value.includes('approve')) {
    return 'approve';
  }
  if (value.includes('ignorereports') || value.includes('ignore_reports')) {
    return 'ignore_reports';
  }
  if (value.includes('ban')) {
    return value.includes('permanent')
      ? 'permanent_ban_suggested'
      : 'temporary_ban_suggested';
  }
  if (value.includes('warn')) {
    return 'warn';
  }
  if (value.includes('note')) {
    return 'note';
  }
  if (value.includes('remove') || value.includes('spam')) {
    return 'remove';
  }

  return undefined;
}
