import type {
  ActionSource,
  AppealPosture,
  CasePacketActionFamily,
  CasePacketConsistencyStatus,
  CasePacketOffenseBucket,
  Confidence,
  EnforcementAction,
  MessageDeliveryMode,
  OverrideReason,
  OverrideReviewStatus,
  PolicyHealthStatus,
} from './schema';

export const APP_NAME = 'ModMirror';
export const APP_TAGLINE = 'Find enforcement drift before your users do.';

export const CONFIDENCE_VALUES = [
  'high',
  'medium',
  'low',
  'unmatched',
] as const satisfies readonly Confidence[];

export const ENFORCEMENT_ACTION_VALUES = [
  'remove',
  'approve',
  'warn',
  'note',
  'temporary_ban_suggested',
  'permanent_ban_suggested',
  'ignore_reports',
  'manual_review',
  'log_only',
] as const satisfies readonly EnforcementAction[];

export const MESSAGE_DELIVERY_MODE_VALUES = [
  'public_comment',
  'private_message',
  'modmail',
  'log_only',
] as const satisfies readonly MessageDeliveryMode[];

export const OVERRIDE_REASON_VALUES = [
  'severe_context',
  'repeat_pattern_not_captured',
  'user_history_outside_modmirror',
  'edge_case_mod_discretion',
  'policy_seems_wrong',
  'other',
] as const satisfies readonly OverrideReason[];

export const OVERRIDE_REVIEW_STATUS_VALUES = [
  'unresolved',
  'accepted_exception',
  'policy_needs_update',
  'needs_team_discussion',
  'no_action_needed',
] as const satisfies readonly OverrideReviewStatus[];

export const POLICY_HEALTH_STATUS_VALUES = [
  'stable',
  'watch',
  'at_risk',
  'needs_review',
  'insufficient_data',
] as const satisfies readonly PolicyHealthStatus[];

export const CASE_PACKET_CONSISTENCY_STATUS_VALUES = [
  'matched_policy',
  'stricter_than_policy',
  'looser_than_policy',
  'manual_review',
  'policy_unavailable',
  'policy_changed_since_action',
  'insufficient_data',
] as const satisfies readonly CasePacketConsistencyStatus[];

export const CASE_PACKET_ACTION_FAMILY_VALUES = [
  'approve',
  'remove',
  'warn',
  'note',
  'temporary_ban_suggested',
  'permanent_ban_suggested',
  'manual_review',
  'ignore_reports',
  'unknown',
] as const satisfies readonly CasePacketActionFamily[];

export const CASE_PACKET_OFFENSE_BUCKET_VALUES = [
  'first_offense',
  'second_offense',
  'third_or_more',
  'unknown',
] as const satisfies readonly CasePacketOffenseBucket[];

export const APPEAL_POSTURE_VALUES = [
  'policy_consistent',
  'justified_override',
  'review_recommended',
  'insufficient_history',
  'policy_changed_since_action',
  'unknown',
] as const satisfies readonly AppealPosture[];

export const ACTION_SOURCE_VALUES = [
  'live',
  'demo',
  'modmirror',
] as const satisfies readonly ActionSource[];

export const DEFAULT_POLICY_WINDOW_DAYS = 30;
export const MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY = 8;
export const MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY = 3;
export const DEMO_SUBREDDIT_NAME = 'ExampleLearning';

export const API_ROUTES = {
  health: '/api/health',
  scan: '/api/scan',
  policies: '/api/policies',
  policyFromDrift: '/api/policies/from-drift',
  actions: '/api/actions',
  overrides: '/api/overrides',
  overrideSummary: '/api/overrides/summary',
  policyHealth: '/api/policy-health',
  casePacket: '/api/case-packet',
  applyPolicyPreview: '/api/apply-policy/preview',
  applyPolicyConfirm: '/api/apply-policy/confirm',
  redisSmoke: '/api/smoke/redis',
  redditSmoke: '/api/smoke/reddit',
} as const;

export const INTERNAL_ROUTES = {
  menuSmokeComment: '/internal/menu/smoke-comment',
  menuSmokePost: '/internal/menu/smoke-post',
  formSmokeTargetSubmit: '/internal/form/smoke-target-submit',
  formSmokeChainedSubmit: '/internal/form/smoke-chained-submit',
  triggerOnAppInstall: '/internal/triggers/on-app-install',
} as const;

export const REDIS_KEY_PREFIX = 'modmirror';

export function mmKey(subreddit: string, suffix: string): string {
  const subredditPart = normalizeKeyPart(subreddit);
  const suffixPart = suffix
    .split(':')
    .map((part) => normalizeKeyPart(part))
    .join(':');

  return `${REDIS_KEY_PREFIX}:${subredditPart}:${suffixPart}`;
}

export function normalizeKeyPart(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-');
  return normalized || 'unknown';
}
