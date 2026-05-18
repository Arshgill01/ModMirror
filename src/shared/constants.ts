import type {
  ActionSource,
  ActionReceiptSource,
  ApplyPolicySource,
  AppealPosture,
  CasePacketActionFamily,
  CasePacketConsistencyStatus,
  CasePacketOffenseBucket,
  Confidence,
  DigestDeliveryMode,
  DigestDeliveryState,
  DigestOverallStatus,
  DigestRecommendationSeverity,
  DigestScheduleCadence,
  DigestSource,
  EnforcementAction,
  MessageDeliveryMode,
  ModerationExecutionCapabilityState,
  ModerationExecutionMode,
  ModerationExecutionStatus,
  OverrideReason,
  OverrideReviewStatus,
  PolicyHealthStatus,
  RedditModerationOperation,
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

export const APPLY_POLICY_SOURCE_VALUES = [
  'live',
  'demo',
  'simulator',
] as const satisfies readonly ApplyPolicySource[];

export const ACTION_RECEIPT_SOURCE_VALUES = [
  'menu',
  'dashboard',
  'demo',
  'simulator',
] as const satisfies readonly ActionReceiptSource[];

export const MODERATION_EXECUTION_MODE_VALUES = [
  'live',
  'log_only',
  'dry_run',
  'unverified_disabled',
] as const satisfies readonly ModerationExecutionMode[];

export const MODERATION_EXECUTION_STATUS_VALUES = [
  'success',
  'failure',
  'skipped',
] as const satisfies readonly ModerationExecutionStatus[];

export const REDDIT_MODERATION_OPERATION_VALUES = [
  'remove',
  'approve',
  'ignore_reports',
  'none',
] as const satisfies readonly RedditModerationOperation[];

export const MODERATION_EXECUTION_CAPABILITY_STATE_VALUES = [
  'enabled',
  'disabled',
  'unverified_disabled',
  'receipt_required',
  'not_applicable',
] as const satisfies readonly ModerationExecutionCapabilityState[];

export const DIGEST_SOURCE_VALUES = [
  'manual',
  'scheduled',
  'demo',
] as const satisfies readonly DigestSource[];

export const DIGEST_OVERALL_STATUS_VALUES = [
  'stable',
  'watch',
  'at_risk',
  'needs_review',
] as const satisfies readonly DigestOverallStatus[];

export const DIGEST_RECOMMENDATION_SEVERITY_VALUES = [
  'info',
  'watch',
  'urgent',
] as const satisfies readonly DigestRecommendationSeverity[];

export const DIGEST_DELIVERY_MODE_VALUES = [
  'none',
  'markdown_copied',
  'mod_discussion',
  'scheduled',
] as const satisfies readonly DigestDeliveryMode[];

export const DIGEST_DELIVERY_STATE_VALUES = [
  'not_configured',
  'pending',
  'sent',
  'failed',
  'unavailable',
] as const satisfies readonly DigestDeliveryState[];

export const DIGEST_SCHEDULE_CADENCE_VALUES = [
  'weekly',
] as const satisfies readonly DigestScheduleCadence[];

export const DEFAULT_POLICY_WINDOW_DAYS = 30;
export const DEFAULT_DIGEST_PERIOD_DAYS = 7;
export const DIGEST_HISTORY_LIMIT = 10;
export const MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY = 8;
export const MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY = 3;
export const DEMO_SUBREDDIT_NAME = 'ExampleLearning';

export const API_ROUTES = {
  health: '/api/health',
  scan: '/api/scan',
  policies: '/api/policies',
  policyFromDrift: '/api/policies/from-drift',
  actions: '/api/actions',
  receipts: '/api/receipts',
  overrides: '/api/overrides',
  overrideSummary: '/api/overrides/summary',
  policyHealth: '/api/policy-health',
  casePacket: '/api/case-packet',
  digestGenerate: '/api/digest/generate',
  digestHistory: '/api/digest/history',
  digestCapabilities: '/api/digest/capabilities',
  digestSettings: '/api/digest/settings',
  applyPolicyPreview: '/api/apply-policy/preview',
  applyPolicyConfirm: '/api/apply-policy/confirm',
  redisSmoke: '/api/smoke/redis',
  redditSmoke: '/api/smoke/reddit',
} as const;

export const INTERNAL_ROUTES = {
  menuApplyPolicyComment: '/internal/menu/apply-policy-comment',
  menuApplyPolicyPost: '/internal/menu/apply-policy-post',
  formApplyPolicyTargetSubmit: '/internal/form/apply-policy-target-submit',
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
