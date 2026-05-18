import type {
  ActionSource,
  AiAdvisoryEvidenceSource,
  AiAdvisoryKind,
  ActionReceiptSource,
  ApplyPolicySource,
  AppealPosture,
  CasePacketActionFamily,
  CasePacketConsistencyStatus,
  CasePacketType,
  CasePacketOffenseBucket,
  Confidence,
  ContentSnapshotFetchStatus,
  ContentSnapshotSource,
  DigestDeliveryMode,
  DigestDeliveryState,
  DigestOverallStatus,
  DigestRecommendationSeverity,
  DigestScheduleCadence,
  DigestSource,
  EnforcementAction,
  EvidenceBoardEvidenceSource,
  EvidenceBoardStatus,
  MessageDeliveryMode,
  MirrorScanDepth,
  ModqueueContentType,
  ModqueueTriageCapabilityState,
  ModqueueTriagePolicyMatchStatus,
  ModqueueTriageRiskState,
  NativeModNoteMode,
  ModerationExecutionCapabilityState,
  ModerationExecutionMode,
  ModerationExecutionStatus,
  OverrideReason,
  OverrideReviewStatus,
  PolicyHealthStatus,
  ResponseTemplateKind,
  RedditModerationOperation,
  TeamDeliveryChannel,
  TeamDeliverySubjectType,
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

export const RESPONSE_TEMPLATE_KIND_VALUES = [
  'warning',
  'removal_explanation',
  'mod_note_summary',
  'modmail_draft',
  'private_message',
] as const satisfies readonly ResponseTemplateKind[];

export const NATIVE_MOD_NOTE_MODE_VALUES = [
  'none',
  'log_only',
  'native',
] as const satisfies readonly NativeModNoteMode[];

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

export const CASE_PACKET_TYPE_VALUES = [
  'appeal_context',
  'internal_review',
  'policy_dispute',
] as const satisfies readonly CasePacketType[];

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

export const EVIDENCE_BOARD_STATUS_VALUES = [
  'open',
  'needs_policy_change',
  'accepted_exception',
  'resolved',
  'archived',
] as const satisfies readonly EvidenceBoardStatus[];

export const EVIDENCE_BOARD_EVIDENCE_SOURCE_VALUES = [
  'receipt',
  'content_snapshot',
  'override',
  'comparable_case',
  'case_packet',
  'policy_change',
  'manual_note',
] as const satisfies readonly EvidenceBoardEvidenceSource[];

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

export const CONTENT_SNAPSHOT_FETCH_STATUS_VALUES = [
  'captured',
  'degraded',
  'not_provided',
] as const satisfies readonly ContentSnapshotFetchStatus[];

export const CONTENT_SNAPSHOT_SOURCE_VALUES = [
  'menu',
  'dashboard',
  'api',
  'provided',
  'receipt',
  'demo',
] as const satisfies readonly ContentSnapshotSource[];

export const MIRROR_SCAN_DEPTH_VALUES = [
  'quick',
  'standard',
  'deep',
] as const satisfies readonly MirrorScanDepth[];

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

export const AI_ADVISORY_KIND_VALUES = [
  'drift_explanation',
  'policy_draft_suggestion',
  'case_packet_summary',
  'digest_summary',
] as const satisfies readonly AiAdvisoryKind[];

export const AI_ADVISORY_EVIDENCE_SOURCE_VALUES = [
  'scan',
  'receipt',
  'case_packet',
  'digest',
  'policy',
  'analytics',
  'override',
  'action',
] as const satisfies readonly AiAdvisoryEvidenceSource[];

export const TEAM_DELIVERY_CHANNEL_VALUES = [
  'manual_markdown',
  'mod_discussion',
  'scheduler',
] as const satisfies readonly TeamDeliveryChannel[];

export const TEAM_DELIVERY_SUBJECT_TYPE_VALUES = [
  'digest',
  'policy_proposal',
  'case_packet',
] as const satisfies readonly TeamDeliverySubjectType[];

export const MODQUEUE_CONTENT_TYPE_VALUES = [
  'all',
  'post',
  'comment',
] as const satisfies readonly ModqueueContentType[];

export const MODQUEUE_TRIAGE_CAPABILITY_STATE_VALUES = [
  'type_only',
  'runtime_verified',
  'failed_runtime',
  'unsupported',
  'disabled',
] as const satisfies readonly ModqueueTriageCapabilityState[];

export const MODQUEUE_TRIAGE_RISK_STATE_VALUES = [
  'needs_review',
  'reported',
  'high_report_volume',
  'already_actioned',
] as const satisfies readonly ModqueueTriageRiskState[];

export const MODQUEUE_TRIAGE_POLICY_MATCH_STATUS_VALUES = [
  'matched',
  'possible_match',
  'no_policy',
  'unmatched',
] as const satisfies readonly ModqueueTriagePolicyMatchStatus[];

export const DEFAULT_POLICY_WINDOW_DAYS = 30;
export const DEFAULT_POLICY_REQUIRED_APPROVALS = 1;
export const DEFAULT_DIGEST_PERIOD_DAYS = 7;
export const DIGEST_HISTORY_LIMIT = 10;
export const SCAN_HISTORY_LIMIT = 10;
export const MIRROR_SCAN_DEPTH_CONFIG = {
  quick: {
    requestedLimit: 25,
    pageSize: 25,
  },
  standard: {
    requestedLimit: 60,
    pageSize: 60,
  },
  deep: {
    requestedLimit: 250,
    pageSize: 100,
  },
} as const satisfies Record<
  MirrorScanDepth,
  { requestedLimit: number; pageSize: number }
>;
export const MINIMUM_ACTIONS_FOR_DRIFT_DISPLAY = 8;
export const MINIMUM_RULE_ACTIONS_FOR_DRIFT_DISPLAY = 3;
export const DEMO_SUBREDDIT_NAME = 'ExampleLearning';

export const API_ROUTES = {
  health: '/api/health',
  scan: '/api/scan',
  scans: '/api/scans',
  consistencyAnalytics: '/api/analytics/consistency',
  communityHealth: '/api/community-health',
  modqueueTriage: '/api/modqueue/triage',
  attributionCorrections: '/api/attribution/corrections',
  policies: '/api/policies',
  policyFromDrift: '/api/policies/from-drift',
  policyReplay: '/api/policies/:id/replay',
  policyImpact: '/api/policies/:id/impact',
  actions: '/api/actions',
  receipts: '/api/receipts',
  overrides: '/api/overrides',
  overrideSummary: '/api/overrides/summary',
  policyHealth: '/api/policy-health',
  casePacket: '/api/case-packet',
  evidenceBoards: '/api/evidence-boards',
  digestGenerate: '/api/digest/generate',
  digestHistory: '/api/digest/history',
  digestCapabilities: '/api/digest/capabilities',
  digestSettings: '/api/digest/settings',
  aiAdvisoryCapabilities: '/api/ai/capabilities',
  aiAdvisoryGenerate: '/api/ai/advisory',
  teamDeliveryCapabilities: '/api/delivery/capabilities',
  teamDeliveryPreview: '/api/delivery/preview',
  teamDeliveryConfirm: '/api/delivery/confirm',
  runtimeVerification: '/api/runtime-verification',
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
