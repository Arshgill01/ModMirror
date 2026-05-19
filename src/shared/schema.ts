export type Confidence = 'high' | 'medium' | 'low' | 'unmatched';

export type EnforcementAction =
  | 'remove'
  | 'approve'
  | 'warn'
  | 'note'
  | 'temporary_ban_suggested'
  | 'permanent_ban_suggested'
  | 'ignore_reports'
  | 'manual_review'
  | 'log_only';

export type MessageDeliveryMode =
  | 'public_comment'
  | 'private_message'
  | 'modmail'
  | 'log_only';

export type NativeModNoteMode = 'none' | 'log_only' | 'native';

export type NativeModNoteCapabilityState =
  | 'enabled'
  | 'disabled'
  | 'unverified_disabled'
  | 'receipt_required'
  | 'not_applicable';

export type NativeModNoteStatus = 'sent' | 'skipped' | 'failed';

export type ResponseTemplateKind =
  | 'warning'
  | 'removal_explanation'
  | 'mod_note_summary'
  | 'modmail_draft'
  | 'private_message';

export type OverrideReason =
  | 'severe_context'
  | 'repeat_pattern_not_captured'
  | 'user_history_outside_modmirror'
  | 'edge_case_mod_discretion'
  | 'policy_seems_wrong'
  | 'other';

export type OverrideReviewStatus =
  | 'unresolved'
  | 'accepted_exception'
  | 'policy_needs_update'
  | 'needs_team_discussion'
  | 'no_action_needed';

export type PolicyHealthStatus =
  | 'stable'
  | 'watch'
  | 'at_risk'
  | 'needs_review'
  | 'insufficient_data';

export type CasePacketSubjectType = 'action' | 'user_rule' | 'demo';

export type CasePacketType =
  | 'appeal_context'
  | 'internal_review'
  | 'policy_dispute';

export type CasePacketEvidenceSource =
  | 'verified_receipt'
  | 'verified_modmirror_action'
  | 'inferred_history'
  | 'demo_seed'
  | 'missing';

export type CasePacketConsistencyStatus =
  | 'matched_policy'
  | 'stricter_than_policy'
  | 'looser_than_policy'
  | 'manual_review'
  | 'policy_unavailable'
  | 'policy_changed_since_action'
  | 'insufficient_data';

export type CasePacketActionFamily =
  | 'approve'
  | 'remove'
  | 'warn'
  | 'note'
  | 'temporary_ban_suggested'
  | 'permanent_ban_suggested'
  | 'manual_review'
  | 'ignore_reports'
  | 'unknown';

export type CasePacketOffenseBucket =
  | 'first_offense'
  | 'second_offense'
  | 'third_or_more'
  | 'unknown';

export type EvidenceBoardStatus =
  | 'open'
  | 'needs_policy_change'
  | 'accepted_exception'
  | 'resolved'
  | 'archived';

export type EvidenceBoardEvidenceSource =
  | 'receipt'
  | 'content_snapshot'
  | 'override'
  | 'comparable_case'
  | 'case_packet'
  | 'policy_change'
  | 'manual_note';

export type IncidentModeReason =
  | 'raid'
  | 'spam_flood'
  | 'brigading'
  | 'crisis'
  | 'other';

export type IncidentModeStatus = 'active' | 'ended' | 'expired';

export type AppealPosture =
  | 'policy_consistent'
  | 'justified_override'
  | 'review_recommended'
  | 'insufficient_history'
  | 'policy_changed_since_action'
  | 'unknown';

export type ActionSource = 'live' | 'demo' | 'modmirror';

export type ApplyPolicySource = 'live' | 'demo' | 'simulator';

export type MirrorScanDepth = 'quick' | 'standard' | 'deep';

export type ActionReceiptSource =
  | 'menu'
  | 'dashboard'
  | 'demo'
  | 'simulator';

export type HealthState = 'ok' | 'degraded' | 'blocked';

export type ModerationTargetType = 'post' | 'comment' | 'unknown';

export type ContentSnapshotFetchStatus =
  | 'captured'
  | 'degraded'
  | 'not_provided';

export type ContentSnapshotSource =
  | 'menu'
  | 'dashboard'
  | 'api'
  | 'provided'
  | 'receipt'
  | 'demo';

export type ModerationExecutionMode =
  | 'live'
  | 'log_only'
  | 'dry_run'
  | 'unverified_disabled';

export type ModerationExecutionStatus = 'success' | 'failure' | 'skipped';

export type RedditModerationOperation =
  | 'remove'
  | 'approve'
  | 'ignore_reports'
  | 'none';

export type ModerationExecutionCapabilityState =
  | 'enabled'
  | 'disabled'
  | 'unverified_disabled'
  | 'receipt_required'
  | 'not_applicable';

export type DigestSource = 'manual' | 'scheduled' | 'demo';

export type DigestOverallStatus =
  | 'stable'
  | 'watch'
  | 'at_risk'
  | 'needs_review';

export type DigestRecommendationSeverity = 'info' | 'watch' | 'urgent';

export type DigestDeliveryMode =
  | 'none'
  | 'markdown_copied'
  | 'mod_discussion'
  | 'scheduled';

export type DigestDeliveryState =
  | 'not_configured'
  | 'pending'
  | 'sent'
  | 'failed'
  | 'unavailable';

export type DigestCapabilityState = 'available' | 'unavailable' | 'unverified';

export type DigestScheduleCadence = 'weekly';

export type AiAdvisoryKind =
  | 'drift_explanation'
  | 'policy_draft_suggestion'
  | 'case_packet_summary'
  | 'digest_summary';

export type AiAdvisoryCapabilityState =
  | 'disabled'
  | 'unconfigured'
  | 'type_only'
  | 'available';

export type AiAdvisoryOutputStatus =
  | 'disabled'
  | 'generated'
  | 'rejected';

export type AiAdvisoryEvidenceSource =
  | 'scan'
  | 'receipt'
  | 'case_packet'
  | 'digest'
  | 'policy'
  | 'analytics'
  | 'override'
  | 'action';

export type TeamDeliveryChannel =
  | 'manual_markdown'
  | 'mod_discussion'
  | 'scheduler';

export type TeamDeliverySubjectType =
  | 'digest'
  | 'policy_proposal'
  | 'case_packet';

export type TeamDeliveryCapabilityState =
  | 'unavailable'
  | 'unverified'
  | 'verified_disabled'
  | 'enabled';

export type TeamDeliveryReceiptStatus =
  | 'manual_ready'
  | 'skipped'
  | 'sent'
  | 'failed';

export type ModqueueContentType = 'all' | 'post' | 'comment';

export type ModqueueTriageCapabilityState =
  | 'type_only'
  | 'runtime_verified'
  | 'failed_runtime'
  | 'unsupported'
  | 'disabled';

export type ModqueueTriageRiskState =
  | 'needs_review'
  | 'reported'
  | 'high_report_volume'
  | 'already_actioned';

export type ModqueueTriagePolicyMatchStatus =
  | 'matched'
  | 'possible_match'
  | 'no_policy'
  | 'unmatched';

export interface SubredditRuleRef {
  ruleKey: string;
  ruleName: string;
  rulePriority?: number;
  ruleKind?: 'all' | 'link' | 'comment';
}

export type PolicyLifecycleState =
  | 'draft'
  | 'proposed'
  | 'under_review'
  | 'adopted'
  | 'superseded'
  | 'archived';

export type PolicyReviewDecision =
  | 'approve'
  | 'request_changes'
  | 'abstain';

export interface PolicyProposalSource {
  scanId?: string;
  driftRuleKey?: string;
  driftRuleName?: string;
  driftCandidateSummary?: string;
}

export interface PolicyReviewRecord {
  id: string;
  reviewer: string;
  decision: PolicyReviewDecision;
  createdAt: string;
  note?: string;
}

export interface PolicyRatificationSettings {
  requiredApprovals: number;
  allowSingleModAdoption: boolean;
}

export interface PolicyRatificationSummary {
  requiredApprovals: number;
  approvals: number;
  requestsForChanges: number;
  abstentions: number;
  latestReviewCount: number;
  canAdopt: boolean;
  adoptionBlockedReason?: string;
}

export interface RulePolicy extends SubredditRuleRef {
  id: string;
  subreddit: string;
  activeVersionId?: string;
  activeVersionNumber?: number;
  proposedVersionId?: string;
  proposedVersionNumber?: number;
  lifecycleState?: PolicyLifecycleState;
  proposedBy?: string;
  proposedAt?: string;
  proposalNote?: string;
  proposalRationale?: string;
  proposalSource?: PolicyProposalSource;
  reviewRecords?: PolicyReviewRecord[];
  ratificationSettings?: PolicyRatificationSettings;
  ratificationSummary?: PolicyRatificationSummary;
  adoptedBy?: string;
  adoptedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  active: boolean;
  archived?: boolean;
}

export interface PolicyCreateInput extends SubredditRuleRef {
  subreddit: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode?: MessageDeliveryMode;
  active?: boolean;
  proposalRationale?: string;
  proposalSource?: PolicyProposalSource;
  ratificationSettings?: Partial<PolicyRatificationSettings>;
}

export interface PolicyUpdateInput {
  ruleName?: string;
  rulePriority?: number;
  ruleKind?: 'all' | 'link' | 'comment';
  steps?: PolicyStep[];
  defaultMessageMode?: MessageDeliveryMode;
  active?: boolean;
  updatedBy?: string;
  changeReason?: string;
  changeSummary?: string;
  proposalRationale?: string;
  proposalSource?: PolicyProposalSource;
  ratificationSettings?: Partial<PolicyRatificationSettings>;
}

export interface PolicyReviewInput {
  reviewer: string;
  decision: PolicyReviewDecision;
  note?: string;
  policyVersionId?: string;
}

export interface PolicyProposeInput {
  proposedBy: string;
  note?: string;
  policyVersionId?: string;
}

export interface PolicyAdoptInput {
  adoptedBy: string;
  policyVersionId?: string;
  note?: string;
  quickAdoption?: boolean;
}

export interface PolicyVersion extends SubredditRuleRef {
  id: string;
  policyId: string;
  versionNumber: number;
  subreddit: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  active: boolean;
  createdAt: string;
  createdBy: string;
  changeReason?: string;
  changeSummary?: string;
  lifecycleState?: PolicyLifecycleState;
  proposedBy?: string;
  proposedAt?: string;
  proposalNote?: string;
  proposalRationale?: string;
  proposalSource?: PolicyProposalSource;
  reviewRecords?: PolicyReviewRecord[];
  ratificationSettings?: PolicyRatificationSettings;
  ratificationSummary?: PolicyRatificationSummary;
  adoptedBy?: string;
  adoptedAt?: string;
  supersededByVersionId?: string;
  supersededAt?: string;
  supersededBy?: string;
}

export interface PolicyChangeEvent {
  id: string;
  policyId: string;
  policyVersionId: string;
  policyVersionNumber: number;
  subreddit: string;
  ruleKey: string;
  ruleName: string;
  changeType:
    | 'created'
    | 'updated'
    | 'reviewed'
    | 'adopted'
    | 'superseded'
    | 'archived'
    | 'legacy_migrated';
  changedAt: string;
  changedBy: string;
  changeReason?: string;
  changeSummary?: string;
}

export type PolicyVersionStatus = 'active' | 'missing' | 'legacy';

export interface PolicySnapshot {
  policyId: string;
  policyVersionId: string;
  policyVersionNumber: number;
  policyVersionStatus: PolicyVersionStatus;
  ruleKey: string;
  ruleName: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  capturedAt: string;
}

export interface ApplyPolicyContext {
  subreddit: string;
  ruleKey: string;
  targetThingId?: string;
  targetAuthor?: string;
  selectedAction?: EnforcementAction;
  source?: ApplyPolicySource;
}

export interface ModerationTargetContext {
  targetThingId: string;
  targetType: ModerationTargetType;
  subreddit?: string;
  authorName?: string;
  title?: string;
  body?: string;
  permalink?: string;
  currentModerator?: string;
  modPermissions?: string[];
  warnings: string[];
}

export interface LaunchContextResponse {
  target?: ModerationTargetContext;
  source?: 'apply_policy_menu';
  createdAt?: string;
  warnings: string[];
}

export interface ContentSnapshotPrivacyMetadata {
  retentionCategory: 'moderation_evidence';
  authorStored: boolean;
  titleExcerptStored: boolean;
  bodyExcerptStored: boolean;
  permalinkStored: boolean;
  redactionNotes: string[];
}

export interface ContentSnapshot {
  schemaVersion: 1;
  targetThingId?: string;
  targetType: ModerationTargetType;
  subreddit?: string;
  authorName?: string;
  titleExcerpt?: string;
  bodyExcerpt?: string;
  permalink?: string;
  fetchedAt: string;
  fetchStatus: ContentSnapshotFetchStatus;
  source: ContentSnapshotSource;
  warnings: string[];
  privacy: ContentSnapshotPrivacyMetadata;
}

export interface ModqueueTriageCapability {
  state: ModqueueTriageCapabilityState;
  label: string;
  detail: string;
  runtimeProof: 'runtime_verified' | 'type_only' | 'not_verified';
  evidence: string[];
  nextAction: string;
  safeToUseForReadOnlyTriage: boolean;
}

export interface ModqueuePolicyHint {
  status: ModqueueTriagePolicyMatchStatus;
  ruleKey?: string;
  ruleName?: string;
  confidence: Confidence;
  matchReasons: string[];
}

export interface ModqueueHistorySummary {
  modmirrorActionsForAuthor: number;
  recentRules: string[];
  lastActionAt?: string;
  summary: string;
}

export interface ModqueueTriageItem {
  id: string;
  targetThingId: string;
  targetType: ModerationTargetType;
  subreddit: string;
  authorName?: string;
  title?: string;
  bodyExcerpt?: string;
  permalink?: string;
  createdAt?: string;
  reportCount: number;
  reportReasons: string[];
  riskState: ModqueueTriageRiskState;
  policyHint: ModqueuePolicyHint;
  historySummary: ModqueueHistorySummary;
  contentSnapshot: ContentSnapshot;
  applyPolicyHash: string;
  source: 'reddit_modqueue';
  warnings: string[];
}

export interface ModqueueTriageResponse {
  generatedAt: string;
  subreddit?: string;
  requestedType: ModqueueContentType;
  capability: ModqueueTriageCapability;
  items: ModqueueTriageItem[];
  source: 'reddit_modqueue' | 'unavailable';
  warnings: string[];
}

export type ApplyPolicyTargetSnapshotSource = 'provided' | 'not_provided';

export interface ApplyPolicyTargetSnapshot {
  targetThingId?: string;
  targetType: ModerationTargetType;
  subreddit?: string;
  authorName?: string;
  title?: string;
  body?: string;
  permalink?: string;
  source: ApplyPolicyTargetSnapshotSource;
  warnings: string[];
  contentSnapshot?: ContentSnapshot;
}

export type ApplyPolicyPreviewEvidenceKind =
  | 'policy'
  | 'target'
  | 'history'
  | 'safety'
  | 'fallback';

export interface ApplyPolicyPreviewEvidence {
  kind: ApplyPolicyPreviewEvidenceKind;
  label: string;
  detail: string;
}

export interface ApplyPolicyConfirmationPreview {
  executionMode: ModerationExecutionMode;
  willExecuteRedditAction: boolean;
  actionLabel: string;
  requiresOverrideReason: boolean;
  message: string;
  caveats: string[];
}

export type PolicyFallbackReason =
  | 'policy_found'
  | 'no_policy'
  | 'no_scan_data'
  | 'small_subreddit';

export interface PolicyRecommendation {
  ruleKey: string;
  ruleName?: string;
  policyId?: string;
  offenseCount: number;
  recommendedAction: EnforcementAction;
  messageDeliveryMode: MessageDeliveryMode;
  requiresOverrideReason: boolean;
  selectedAction?: EnforcementAction;
  deviatesFromPolicy: boolean;
  fallbackReason: PolicyFallbackReason;
  message: string;
}

export type PolicyReplaySource = 'scan' | 'synthetic';

export interface PolicyReplayActionInput {
  id: string;
  subreddit: string;
  rawActionType: string;
  normalizedAction?: EnforcementAction;
  targetThingId?: string;
  targetAuthor?: string;
  createdAt: string;
  inferredRuleKey?: string;
  inferredRuleName?: string;
  confidence: Confidence;
  evidence: string[];
}

export interface PolicyReplayInput {
  subreddit: string;
  policy: RulePolicy;
  source: PolicyReplaySource;
  scanId?: string;
  actions: PolicyReplayActionInput[];
  generatedAt?: string;
}

export interface PolicyReplayItem {
  actionId: string;
  targetThingId?: string;
  targetAuthor?: string;
  createdAt: string;
  confidence: Confidence;
  historicalAction: EnforcementAction;
  recommendedAction: EnforcementAction;
  offenseCount: number;
  wouldChangeOutcome: boolean;
  evidence: string[];
}

export interface PolicyReplayResult {
  id: string;
  subreddit: string;
  policyId: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  ruleKey: string;
  ruleName: string;
  source: PolicyReplaySource;
  scanId?: string;
  generatedAt: string;
  totalActionsEvaluated: number;
  matchedPolicyCount: number;
  changedRecommendationCount: number;
  skippedActionCount: number;
  items: PolicyReplayItem[];
  warnings: string[];
}

export interface ApplyPolicyPreviewInput {
  subreddit?: string;
  ruleKey: string;
  targetThingId?: string;
  targetType?: ModerationTargetType;
  targetAuthor?: string;
  targetTitle?: string;
  targetBody?: string;
  targetPermalink?: string;
  selectedAction?: EnforcementAction;
  source?: ApplyPolicySource;
  contentSnapshot?: ContentSnapshot;
}

export interface ApplyPolicyPreview {
  recommendation: PolicyRecommendation;
  policy?: RulePolicy;
  policySnapshot?: PolicySnapshot;
  targetSnapshot: ApplyPolicyTargetSnapshot;
  contentSnapshot?: ContentSnapshot;
  responsePreview?: ApplyPolicyResponsePreview;
  evidence: ApplyPolicyPreviewEvidence[];
  confirmation: ApplyPolicyConfirmationPreview;
}

export interface ApplyPolicyConfirmInput extends ApplyPolicyPreviewInput {
  selectedAction: EnforcementAction;
  confirmed: boolean;
  executionMode?: ModerationExecutionMode;
  modNoteMode?: NativeModNoteMode;
  overrideReason?: OverrideReason;
  overrideNote?: string;
}

export interface ApplyPolicyConfirmResult {
  recommendation: PolicyRecommendation;
  actionEvent: ActionEvent;
  execution: ModerationExecutionResult;
  receipt: ActionReceipt;
  overrideEvent?: OverrideEvent;
}

export interface PolicyReadinessState {
  reason: PolicyFallbackReason;
  message: string;
  canCreatePolicy: boolean;
}

export interface AppConfig {
  subreddit: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface DemoModeState {
  enabled: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface LastScanMetadata {
  id: string;
  subreddit: string;
  createdAt: string;
  createdBy: string;
  source: ActionSource;
  totalActionsScanned: number;
  attributedCount: number;
  unmatchedCount: number;
  confidenceBreakdown: Record<Confidence, number>;
  driftCandidateCount: number;
}

export interface PolicyStep {
  offenseCount: number;
  windowDays: number;
  recommendedAction: EnforcementAction;
  responseTemplates?: Partial<Record<ResponseTemplateKind, PolicyResponseTemplate>>;
  removalMessageTemplate?: string;
  noteTemplate?: string;
  requireOverrideReasonForDeviation: boolean;
}

export interface NativeModNoteAttempt {
  mode: NativeModNoteMode;
  status: NativeModNoteStatus;
  deliveryAttempted: boolean;
  capabilityState: NativeModNoteCapabilityState;
  subreddit: string;
  targetAuthor?: string;
  targetThingId?: string;
  noteBody?: string;
  noteId?: string;
  errorCode?: string;
  errorMessage?: string;
  startedAt: string;
  completedAt: string;
}

export interface PolicyResponseTemplate {
  kind: ResponseTemplateKind;
  title?: string;
  body: string;
  deliveryMode: MessageDeliveryMode;
  enabled: boolean;
}

export interface RenderedResponseTemplate {
  kind: ResponseTemplateKind;
  title: string;
  body: string;
  deliveryMode: MessageDeliveryMode;
  source: 'policy_template' | 'legacy_template' | 'fallback';
  missingVariables: string[];
  deliveryGated: true;
}

export interface ApplyPolicyResponsePreview {
  stepOffenseCount: number;
  templates: RenderedResponseTemplate[];
  deliveryWillBeAttempted: false;
  warnings: string[];
}

export interface AttributedModAction {
  id: string;
  subreddit: string;
  source: ActionSource;
  rawActionType: string;
  normalizedAction?: EnforcementAction;
  targetThingId?: string;
  targetAuthor?: string;
  moderator?: string;
  createdAt: string;
  inferredRuleKey?: string;
  inferredRuleName?: string;
  confidence: Confidence;
  evidence: string[];
  attributionKind?: 'direct' | 'inferred' | 'corrected' | 'unmatched';
  correction?: AttributionCorrectionSnapshot;
}

export interface AttributionCorrectionSnapshot {
  correctionId: string;
  correctedRuleKey: string;
  correctedRuleName?: string;
  correctedBy: string;
  correctedAt: string;
  originalRuleKey?: string;
  originalRuleName?: string;
  originalConfidence: Confidence;
  note?: string;
}

export interface AttributionCorrection {
  id: string;
  subreddit: string;
  actionId: string;
  targetThingId?: string;
  sourceScanId?: string;
  originalRuleKey?: string;
  originalRuleName?: string;
  originalConfidence: Confidence;
  correctedRuleKey: string;
  correctedRuleName?: string;
  correctedBy: string;
  correctedAt: string;
  note?: string;
}

export interface AttributionCorrectionInput {
  subreddit: string;
  actionId: string;
  targetThingId?: string;
  sourceScanId?: string;
  originalRuleKey?: string;
  originalRuleName?: string;
  originalConfidence: Confidence;
  correctedRuleKey: string;
  correctedRuleName?: string;
  correctedBy: string;
  note?: string;
}

export type MirrorScanSource = 'live' | 'demo';

export type NormalizedRuleSource = 'reddit_rule' | 'manual' | 'demo';

export type NormalizedRemovalReasonSource = 'reddit_removal_reason' | 'demo';

export interface NormalizedRule {
  ruleKey: string;
  ruleName: string;
  description?: string;
  violationReason?: string;
  priority?: number;
  kind?: 'all' | 'link' | 'comment';
  source: NormalizedRuleSource;
}

export interface NormalizedRemovalReason {
  id: string;
  title: string;
  message?: string;
  source: NormalizedRemovalReasonSource;
}

export interface NormalizedModAction {
  id: string;
  subreddit: string;
  source: ActionSource;
  rawActionType: string;
  normalizedAction?: EnforcementAction;
  createdAt: string;
  moderator?: string;
  targetThingId?: string;
  targetAuthor?: string;
  detailsText?: string;
  removalReasonId?: string;
  removalReasonTitle?: string;
  directRuleKey?: string;
  directRuleName?: string;
}

export interface MirrorScanSources {
  subreddit: string;
  source: MirrorScanSource;
  rules: NormalizedRule[];
  removalReasons: NormalizedRemovalReason[];
  actions: NormalizedModAction[];
  scanDepth?: MirrorScanDepthMetadata;
  warnings: string[];
}

export interface AttributionResult {
  actionId: string;
  inferredRuleKey?: string;
  inferredRuleName?: string;
  confidence: Confidence;
  score: number;
  evidence: string[];
  attributionKind?: 'direct' | 'inferred' | 'corrected' | 'unmatched';
  correction?: AttributionCorrectionSnapshot;
}

export interface MirrorScan {
  id: string;
  subreddit: string;
  createdAt: string;
  createdBy?: string;
  source: ActionSource;
  totalActionsScanned: number;
  attributedCount: number;
  unmatchedCount: number;
  confidenceBreakdown: Record<Confidence, number>;
  driftCandidates: DriftCandidate[];
  smallSubredditStatus: SmallSubredditThresholdStatus;
  scanDepth: MirrorScanDepthMetadata;
  warnings: string[];
}

export interface MirrorScanDepthMetadata {
  depth: MirrorScanDepth;
  requestedLimit: number;
  pageSize: number;
  fetchedActions: number;
  hitLimit: boolean;
  paginationStrategy: 'listing_all';
  runtimeVerified: boolean;
}

export interface MirrorScanRecord extends MirrorScan {
  attributedActions: AttributedModAction[];
  unmatchedActions: AttributedModAction[];
  retention: {
    maxScansPerSubreddit: number;
    storedActionCount: number;
  };
}

export interface MirrorScanComparison {
  leftScanId: string;
  rightScanId: string;
  subreddit: string;
  totalActionsDelta: number;
  attributedDelta: number;
  unmatchedDelta: number;
  driftCandidateDelta: number;
  confidenceDelta: Record<Confidence, number>;
}

export type ConsistencyAnalyticsDataQuality =
  | 'insufficient'
  | 'limited'
  | 'usable';

export type TrendDirection =
  | 'insufficient_data'
  | 'improving'
  | 'stable'
  | 'regressing';

export type PolicyImpactStatus =
  | 'insufficient_data'
  | 'new_policy_tracking'
  | TrendDirection;

export interface RuleDriftTrendPoint {
  scanId: string;
  createdAt: string;
  source: ActionSource;
  depth: MirrorScanDepth;
  totalActions: number;
  distinctActions: number;
  confidence: Confidence;
  actionDistribution: Partial<Record<EnforcementAction, number>>;
}

export interface RuleDriftTrend {
  ruleKey?: string;
  ruleName: string;
  status: TrendDirection;
  points: RuleDriftTrendPoint[];
  latestDistribution: Partial<Record<EnforcementAction, number>>;
  caveats: string[];
}

export interface PolicyImpactWindow {
  receiptCount: number;
  adherenceRate: number;
  overrideRate: number;
  unresolvedOverrideCount: number;
}

export interface PolicyImpactSummary {
  policyId: string;
  ruleKey: string;
  ruleName: string;
  policyVersionId?: string;
  adoptedAt: string;
  status: PolicyImpactStatus;
  before: PolicyImpactWindow;
  after: PolicyImpactWindow;
  caveats: string[];
}

export interface PolicyImpactEvidenceWindow {
  startAt?: string;
  endAt?: string;
  receiptCount: number;
  scanCount: number;
  consistencyRate: number;
  overrideRate: number;
  driftCandidateCount: number;
}

export interface PolicyImpactTimelineEvent {
  id: string;
  occurredAt: string;
  label: string;
  detail: string;
  source: 'policy_version' | 'receipt' | 'scan';
}

export interface PolicyImpactMeasurement {
  policyId: string;
  ruleKey: string;
  ruleName: string;
  generatedAt: string;
  dataQuality: ConsistencyAnalyticsDataQuality;
  status: PolicyImpactStatus;
  adoptedAt?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  before: PolicyImpactEvidenceWindow;
  after: PolicyImpactEvidenceWindow;
  timeline: PolicyImpactTimelineEvent[];
  caveats: string[];
  source: 'stored' | 'demo';
}

export interface ConsistencyAnalyticsSummary {
  subreddit: string;
  generatedAt: string;
  scanCount: number;
  receiptCount: number;
  dataQuality: ConsistencyAnalyticsDataQuality;
  caveats: string[];
  ruleTrends: RuleDriftTrend[];
  policyImpacts: PolicyImpactSummary[];
}

export type CommunityHealthDataQuality = 'empty' | 'small_sample' | 'usable';

export type CommunityHealthStatus =
  | 'insufficient_data'
  | 'stable'
  | 'watch'
  | 'needs_review';

export type DriftStabilityStatus =
  | 'insufficient_data'
  | 'improving'
  | 'stable'
  | 'regressing';

export interface CommunityHealthRuleSignal {
  ruleKey: string;
  ruleName?: string;
  actionCount: number;
  consistentActionCount: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  repeatAuthorCount: number;
  consistencyRate: number;
  overrideRate: number;
  status: CommunityHealthStatus;
  notes: string[];
}

export interface CommunityHealthCasePacketVolume {
  eligibleReceiptCount: number;
  persistedPacketCount: number;
  source: 'receipts_only' | 'not_persisted';
  note: string;
}

export interface CommunityHealthSummary {
  subreddit: string;
  generatedAt: string;
  dataQuality: CommunityHealthDataQuality;
  status: CommunityHealthStatus;
  scanCount: number;
  receiptCount: number;
  actionCount: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  policyChurnCount: number;
  driftStability: DriftStabilityStatus;
  casePacketVolume: CommunityHealthCasePacketVolume;
  ruleSignals: CommunityHealthRuleSignal[];
  privacyGuardrails: string[];
  caveats: string[];
}

export interface DriftCandidate {
  ruleKey?: string;
  ruleName: string;
  confidence: Confidence;
  summary: string;
  totalActions: number;
  actionDistribution: Partial<Record<EnforcementAction, number>>;
  recommendation: string;
}

export interface OverrideEvent {
  id: string;
  subreddit: string;
  modUsername: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey: string;
  ruleName?: string;
  policyId?: string;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  overrideReason: OverrideReason;
  overrideNote?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  policyVersionStatus?: PolicyVersionStatus;
  policySnapshot?: PolicySnapshot;
  reviewStatus: OverrideReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  updatedAt: string;
  createdAt: string;
}

export interface OverrideReviewUpdateInput {
  reviewStatus: OverrideReviewStatus;
  reviewedBy: string;
  reviewNote?: string;
}

export interface ActionEvent {
  id: string;
  subreddit: string;
  modUsername?: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey: string;
  ruleName?: string;
  policyId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  policyVersionStatus?: PolicyVersionStatus;
  policySnapshot?: PolicySnapshot;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  deliveryMode: MessageDeliveryMode;
  source: ApplyPolicySource;
  execution?: ModerationExecutionResult;
  createdAt: string;
}

export interface ModerationExecutionResult {
  executionMode: ModerationExecutionMode;
  executionAttempted: boolean;
  executionResult: ModerationExecutionStatus;
  redditOperation: RedditModerationOperation;
  selectedAction: EnforcementAction;
  targetThingId?: string;
  targetType: ModerationTargetType;
  capabilityState: ModerationExecutionCapabilityState;
  errorCode?: string;
  errorMessage?: string;
  redditResultMetadata?: Record<string, string | number | boolean>;
  startedAt: string;
  completedAt: string;
}

export interface ActionReceipt {
  id: string;
  actionEventId: string;
  subreddit: string;
  targetThingId?: string;
  targetType: ModerationTargetType;
  targetSnapshot: ApplyPolicyTargetSnapshot;
  contentSnapshot?: ContentSnapshot;
  modUsername: string;
  source: ActionReceiptSource;
  policySnapshot?: PolicySnapshot;
  recommendation: PolicyRecommendation;
  responsePreview?: ApplyPolicyResponsePreview;
  nativeModNote?: NativeModNoteAttempt;
  selectedAction: EnforcementAction;
  deviatesFromPolicy: boolean;
  overrideEventId?: string;
  overrideReason?: OverrideReason;
  overrideNote?: string;
  executionMode: ModerationExecutionMode;
  executionAttempted: boolean;
  executionResult: ModerationExecutionStatus;
  redditOperation: RedditModerationOperation;
  redditResultMetadata?: Record<string, string | number | boolean>;
  errorCode?: string;
  errorMessage?: string;
  capabilityState: ModerationExecutionCapabilityState;
  incidentId?: string;
  createdAt: string;
}

export interface OverrideSummary {
  totalOverrides: number;
  overridesByRule: Record<string, number>;
  overridesByReason: Record<OverrideReason, number>;
  recentOverrides: Array<Omit<OverrideEvent, 'modUsername'>>;
}

export interface PolicyHealthSummary {
  policyId: string;
  ruleKey: string;
  ruleName: string;
  status: PolicyHealthStatus;
  totalActions: number;
  followedPolicyCount: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  policySeemsWrongCount: number;
  adherenceRate: number;
  overrideRate: number;
  reasons: string[];
  recommendations: string[];
  sampleWarning?: string;
}

export interface PolicyHealthOverview {
  totalPolicies: number;
  stablePolicies: number;
  policiesNeedingReview: number;
  unresolvedOverrides: number;
  summaries: PolicyHealthSummary[];
}

export interface CasePacketSubject {
  type: CasePacketSubjectType;
  actionId?: string;
  receiptId?: string;
  username?: string;
  ruleKey?: string;
  targetThingId?: string;
}

export interface CasePacketAction {
  actionId?: string;
  receiptId?: string;
  createdAt?: string;
  moderator?: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleKey?: string;
  ruleName?: string;
  recommendedAction?: EnforcementAction;
  selectedAction?: EnforcementAction;
  deliveryMode?: MessageDeliveryMode;
  source?: ActionSource | ApplyPolicySource;
  targetSnapshot?: ApplyPolicyTargetSnapshot;
  contentSnapshot?: ContentSnapshot;
  execution?: ModerationExecutionResult;
  evidenceSource?: CasePacketEvidenceSource;
}

export interface CasePacketPolicyContext {
  policyId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  policyVersionStatus?: PolicyVersionStatus;
  policyName?: string;
  ruleKey?: string;
  ruleName?: string;
  policySnapshot?: PolicySnapshot;
  activeAtActionTime?: boolean;
  changedSinceAction?: boolean;
}

export interface CasePacketOverrideContext {
  overrideId?: string;
  reason?: OverrideReason;
  note?: string;
  reviewStatus?: OverrideReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface CasePacketUserHistoryItem {
  actionId: string;
  createdAt: string;
  ruleKey?: string;
  ruleName?: string;
  selectedAction?: EnforcementAction;
  recommendedAction?: EnforcementAction;
  consistencyStatus?: CasePacketConsistencyStatus;
  policyVersionNumber?: number;
}

export interface ComparableCase {
  actionId: string;
  receiptId?: string;
  createdAt: string;
  ruleKey?: string;
  ruleName?: string;
  selectedAction?: EnforcementAction;
  recommendedAction?: EnforcementAction;
  offenseBucket: CasePacketOffenseBucket;
  selectedActionFamily: CasePacketActionFamily;
  recommendedActionFamily: CasePacketActionFamily;
  targetType?: 'post' | 'comment' | 'unknown';
  matchReasons: string[];
  anonymizedTargetAuthor?: string;
  evidenceSource?: CasePacketEvidenceSource;
}

export interface CasePacketEvidenceItem {
  label: string;
  source: CasePacketEvidenceSource;
  detail: string;
}

export interface CasePacket {
  id: string;
  generatedAt: string;
  generatedBy?: string;
  subreddit: string;
  packetType: CasePacketType;
  subject: CasePacketSubject;
  action?: CasePacketAction;
  policyContext: CasePacketPolicyContext;
  consistencyStatus: CasePacketConsistencyStatus;
  overrideContext?: CasePacketOverrideContext;
  userHistory: CasePacketUserHistoryItem[];
  comparableCases: ComparableCase[];
  evidence: CasePacketEvidenceItem[];
  appealPosture: AppealPosture;
  caveats: string[];
  markdown: string;
}

export interface GenerateCasePacketRequest {
  subject: CasePacketSubject;
  packetType?: CasePacketType;
  timeWindowDays?: number;
  maxComparableCases?: number;
}

export interface GenerateCasePacketResponse {
  packet: CasePacket;
}

export interface EvidenceBoardSubject {
  targetThingId?: string;
  ruleKey?: string;
  receiptId?: string;
  casePacketId?: string;
  policyId?: string;
  policyVersionId?: string;
}

export interface EvidenceBoardEvidencePrivacy {
  sourceContainsAuthor: boolean;
  authorCopiedToBoard: false;
  contentExcerptCopiedToBoard: boolean;
  moderatorNameCopiedToBoard: false;
  retentionCategory: 'moderation_evidence';
  redactionNotes: string[];
}

export interface EvidenceBoardEvidenceItem {
  id: string;
  source: EvidenceBoardEvidenceSource;
  sourceId?: string;
  label: string;
  summary: string;
  occurredAt?: string;
  addedAt: string;
  privacy: EvidenceBoardEvidencePrivacy;
}

export interface EvidenceBoardStatusChange {
  fromStatus?: EvidenceBoardStatus;
  toStatus: EvidenceBoardStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface EvidenceBoardThread {
  id: string;
  subreddit: string;
  title: string;
  status: EvidenceBoardStatus;
  subject: EvidenceBoardSubject;
  evidence: EvidenceBoardEvidenceItem[];
  statusHistory: EvidenceBoardStatusChange[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface EvidenceBoardSourceRef {
  source: Extract<
    EvidenceBoardEvidenceSource,
    'receipt' | 'override' | 'policy_change'
  >;
  id: string;
  policyId?: string;
}

export interface EvidenceBoardCreateRequest {
  subreddit?: string;
  title: string;
  subject?: EvidenceBoardSubject;
  sourceRefs?: EvidenceBoardSourceRef[];
  casePacket?: CasePacket;
  note?: string;
}

export interface EvidenceBoardStatusUpdateRequest {
  status: EvidenceBoardStatus;
  note?: string;
}

export interface EvidenceBoardListResponse {
  boards: EvidenceBoardThread[];
}

export interface IncidentPolicyPresetSuggestion {
  id: string;
  label: string;
  detail: string;
  recommendedAction: EnforcementAction;
  safetyNote: string;
}

export interface IncidentTriageGroup {
  id: string;
  label: string;
  detail: string;
  priority: 'high' | 'medium' | 'low';
  suggestedQueueFilter: string;
}

export interface IncidentMode {
  id: string;
  subreddit: string;
  status: IncidentModeStatus;
  reason: IncidentModeReason;
  description?: string;
  startedAt: string;
  startedBy?: string;
  expiresAt: string;
  endedAt?: string;
  endedBy?: string;
  reviewNote?: string;
  presetSuggestions: IncidentPolicyPresetSuggestion[];
  triageGroups: IncidentTriageGroup[];
}

export interface IncidentModeStartRequest {
  subreddit?: string;
  reason: IncidentModeReason;
  description?: string;
  durationMinutes?: number;
}

export interface IncidentModeEndRequest {
  subreddit?: string;
  reviewNote?: string;
}

export interface IncidentModeStateResponse {
  active?: IncidentMode;
  incidents: IncidentMode[];
}

export interface IncidentModeReport {
  incident: IncidentMode;
  receiptCount: number;
  overrideCount: number;
  executionResults: Record<ModerationExecutionStatus, number>;
  taggedReceiptIds: string[];
  caveats: string[];
}

export interface DigestReport {
  id: string;
  subreddit: string;
  generatedAt: string;
  generatedBy: string;
  source: DigestSource;
  periodStart: string;
  periodEnd: string;
  overallStatus: DigestOverallStatus;
  summary: DigestSummary;
  ruleHealth: DigestRuleHealthItem[];
  overrideSummary: DigestOverrideSummary;
  recommendations: DigestRecommendation[];
  caveats: string[];
  markdown: string;
  delivery: DigestDeliveryStatus;
}

export interface DigestSummary {
  activePolicies: number;
  policyTrackedActions: number;
  unresolvedOverrides: number;
  rulesNeedingReview: number;
  lastScanAt?: string;
}

export interface DigestRuleHealthItem {
  ruleKey: string;
  ruleName: string;
  status: DigestOverallStatus | 'insufficient_data';
  adherenceRate?: number;
  trackedActions: number;
  overrideCount: number;
  unresolvedOverrideCount: number;
  topOverrideReason?: OverrideReason;
  recommendation: string;
}

export interface DigestOverrideSummary {
  total: number;
  unresolved: number;
  acceptedExceptions: number;
  policyNeedsUpdate: number;
  needsDiscussion: number;
}

export interface DigestRecommendation {
  id: string;
  severity: DigestRecommendationSeverity;
  title: string;
  detail: string;
  actionLabel?: string;
  targetRuleKey?: string;
}

export interface DigestDeliveryStatus {
  mode: DigestDeliveryMode;
  status: DigestDeliveryState;
  message?: string;
  deliveredAt?: string;
}

export interface DigestCapabilities {
  modDiscussion: DigestCapabilityStatus;
  scheduler: DigestCapabilityStatus;
}

export interface DigestCapabilityStatus {
  state: DigestCapabilityState;
  label: string;
  detail: string;
}

export interface DigestSettings {
  subreddit: string;
  updatedAt: string;
  updatedBy?: string;
  deliveryMode: DigestDeliveryMode;
  scheduleEnabled: boolean;
  scheduleCadence: DigestScheduleCadence;
  scheduledJobId?: string;
  lastGeneratedAt?: string;
  nextScheduledAt?: string;
}

export interface GenerateDigestRequest {
  subreddit?: string;
  source?: DigestSource;
  periodDays?: number;
}

export interface GenerateDigestResponse {
  report: DigestReport;
  history: DigestReport[];
  capabilities: DigestCapabilities;
  settings: DigestSettings;
}

export interface DigestHistoryResponse {
  history: DigestReport[];
  capabilities: DigestCapabilities;
  settings: DigestSettings;
}

export type PortableConfigSchemaVersion =
  | 'modmirror.config.v1'
  | 'modmirror.config.v0';

export type PortableConfigSource =
  | 'live_config'
  | 'starter_template'
  | 'demo_test_config';

export type PortableConfigImportStatus =
  | 'created'
  | 'updated'
  | 'skipped'
  | 'invalid';

export interface PortablePolicyConfig extends SubredditRuleRef {
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  ratificationSettings?: PolicyRatificationSettings;
}

export interface PortableDigestSettings {
  deliveryMode: DigestDeliveryMode;
  scheduleEnabled: boolean;
  scheduleCadence: DigestScheduleCadence;
}

export interface PortableConfigSettings {
  digest?: PortableDigestSettings;
  demoMode?: {
    enabled: boolean;
  };
}

export interface PortableConfigPackage {
  schemaVersion: PortableConfigSchemaVersion;
  packageId: string;
  source: PortableConfigSource;
  subreddit: string;
  exportedAt: string;
  exportedBy?: string;
  includePrivateHistory: false;
  policies: PortablePolicyConfig[];
  settings: PortableConfigSettings;
  warnings: string[];
}

export interface PortableConfigTemplateListResponse {
  templates: PortableConfigPackage[];
}

export interface PortableConfigImportRequest {
  subreddit?: string;
  package: unknown;
  dryRun?: boolean;
}

export interface PortableConfigImportPolicyResult extends SubredditRuleRef {
  status: PortableConfigImportStatus;
  message: string;
}

export interface PortableConfigImportResult {
  schemaVersion: PortableConfigSchemaVersion;
  accepted: boolean;
  dryRun: boolean;
  importedPolicyCount: number;
  skippedPolicyCount: number;
  updatedSettings: boolean;
  policies: PortableConfigImportPolicyResult[];
  warnings: string[];
}

export type PrivacyRetentionCategory =
  | 'scan_history'
  | 'action_receipts'
  | 'evidence_boards'
  | 'team_delivery_receipts'
  | 'case_packets'
  | 'ai_advisory_logs';

export interface PrivacyRetentionSettings {
  subreddit: string;
  updatedAt: string;
  updatedBy?: string;
  scanHistoryDays: number;
  actionReceiptDays: number;
  evidenceBoardDays: number;
  teamDeliveryReceiptDays: number;
  aiAdvisoryLogDays: number;
  casePacketDays: number;
  protectPolicyHistory: true;
}

export interface PrivacyRetentionUpdateRequest {
  subreddit?: string;
  scanHistoryDays?: number;
  actionReceiptDays?: number;
  evidenceBoardDays?: number;
  teamDeliveryReceiptDays?: number;
  aiAdvisoryLogDays?: number;
  casePacketDays?: number;
}

export interface PrivacyRetentionCategoryReport {
  category: PrivacyRetentionCategory | 'policy_history';
  retainedCount: number;
  deletedCount: number;
  protected: boolean;
  detail: string;
}

export interface PrivacyRetentionExport {
  subreddit: string;
  exportedAt: string;
  settings: PrivacyRetentionSettings;
  categories: PrivacyRetentionCategoryReport[];
  warnings: string[];
}

export interface PrivacyDeletionRequest {
  subreddit?: string;
  categories?: PrivacyRetentionCategory[];
  dryRun?: boolean;
  expiredOnly?: boolean;
}

export interface PrivacyDeletionResult {
  subreddit: string;
  dryRun: boolean;
  deletedAt: string;
  categories: PrivacyRetentionCategoryReport[];
  warnings: string[];
}

export interface AiAdvisoryCapabilityStatus {
  state: AiAdvisoryCapabilityState;
  label: string;
  detail: string;
  runtimeProof: 'not_verified' | 'type_only' | 'verified';
}

export interface AiAdvisoryCapabilities {
  overall: AiAdvisoryCapabilityStatus;
  externalFetch: AiAdvisoryCapabilityStatus;
  secretStorage: AiAdvisoryCapabilityStatus;
  enforcementUse: AiAdvisoryCapabilityStatus;
  supportedKinds: AiAdvisoryKind[];
  providerConfigured: boolean;
}

export interface AiAdvisoryEvidenceInput {
  id: string;
  source: AiAdvisoryEvidenceSource;
  label: string;
  summary: string;
  createdAt?: string;
}

export interface AiAdvisoryRequest {
  kind: AiAdvisoryKind;
  subreddit?: string;
  prompt?: string;
  evidence: AiAdvisoryEvidenceInput[];
  maxWords?: number;
}

export interface AiAdvisoryProviderMetadata {
  id: string;
  label: string;
  state: AiAdvisoryCapabilityState;
}

export interface AiAdvisoryResponse {
  kind: AiAdvisoryKind;
  status: AiAdvisoryOutputStatus;
  generatedAt: string;
  advisoryText: string;
  citedEvidenceIds: string[];
  caveats: string[];
  provider: AiAdvisoryProviderMetadata;
  moderatorReviewRequired: true;
  mayDecideEnforcement: false;
}

export interface TeamDeliveryCapabilityStatus {
  state: TeamDeliveryCapabilityState;
  label: string;
  detail: string;
  runtimeProof: 'not_verified' | 'type_only' | 'verified';
}

export interface TeamDeliveryCapabilities {
  manualMarkdown: TeamDeliveryCapabilityStatus;
  modDiscussion: TeamDeliveryCapabilityStatus;
  scheduler: TeamDeliveryCapabilityStatus;
}

export interface TeamDeliveryPreviewRequest {
  subreddit?: string;
  channel: TeamDeliveryChannel;
  subjectType: TeamDeliverySubjectType;
  subjectId?: string;
  title: string;
  markdown: string;
}

export interface TeamDeliveryPreview {
  subreddit: string;
  channel: TeamDeliveryChannel;
  subjectType: TeamDeliverySubjectType;
  subjectId?: string;
  title: string;
  markdown: string;
  capability: TeamDeliveryCapabilityStatus;
  warnings: string[];
  requiresExplicitConfirmation: true;
  deliveryWillBeAttempted: boolean;
}

export interface TeamDeliveryConfirmRequest extends TeamDeliveryPreviewRequest {
  confirmed: boolean;
}

export interface TeamDeliveryReceipt {
  id: string;
  subreddit: string;
  channel: TeamDeliveryChannel;
  subjectType: TeamDeliverySubjectType;
  subjectId?: string;
  title: string;
  status: TeamDeliveryReceiptStatus;
  requestedBy: string;
  createdAt: string;
  deliveryAttempted: boolean;
  runtimeVerified: boolean;
  previewMarkdown: string;
  destination?: string;
  providerReferenceId?: string;
  errorMessage?: string;
}

export interface TeamDeliveryConfirmResponse {
  preview: TeamDeliveryPreview;
  receipt: TeamDeliveryReceipt;
}

export interface SmallSubredditThresholdStatus {
  meetsThreshold: boolean;
  observedActions: number;
  minimumActions: number;
  message: string;
}

export interface HealthStatus {
  ok: boolean;
  state: HealthState;
  appName: string;
  appSlug?: string;
  appVersion?: string;
  subredditId?: string;
  subredditName?: string;
  username?: string;
  checkedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export type RuntimeVerificationStatus =
  | 'runtime_verified'
  | 'local_verified'
  | 'static_verified'
  | 'type_only'
  | 'unverified'
  | 'disabled'
  | 'blocked';

export type RuntimeVerificationCategory =
  | 'entrypoint'
  | 'target_context'
  | 'data_persistence'
  | 'moderation_execution'
  | 'policy_workflow'
  | 'evidence'
  | 'delivery'
  | 'ai'
  | 'access_control'
  | 'ui_runtime';

export interface RuntimeVerificationItem {
  id: string;
  category: RuntimeVerificationCategory;
  capability: string;
  status: RuntimeVerificationStatus;
  evidence: string[];
  diagnosticRoute?: string;
  proofCommand?: string;
  safeToRunInPlaytest: boolean;
  destructive: boolean;
  nextAction: string;
}

export interface RuntimeVerificationSummary {
  total: number;
  runtimeVerified: number;
  localVerified: number;
  staticVerified: number;
  typeOnly: number;
  unverified: number;
  disabled: number;
  blocked: number;
}

export interface RuntimeVerificationMatrix {
  generatedAt: string;
  context: {
    appSlug?: string;
    appVersion?: string;
    subredditId?: string;
    subredditName?: string;
    username?: string;
  };
  items: RuntimeVerificationItem[];
  summary: RuntimeVerificationSummary;
  criticalBlockers: string[];
}

export type RuntimeCapabilityState =
  | 'verified_runtime'
  | 'verified_static'
  | 'type_only'
  | 'demo_only'
  | 'disabled'
  | 'unsupported'
  | 'failed_runtime'
  | 'deferred';

export type RuntimeCapabilityDomain =
  | 'reddit_api'
  | 'redis'
  | 'menus'
  | 'execution_operations'
  | 'comments'
  | 'mod_notes'
  | 'modmail'
  | 'ai'
  | 'scheduler'
  | 'retention_cleanup'
  | 'access_control'
  | 'demo_fallbacks';

export type RuntimeCapabilityHealthStatus = 'passed' | 'failed' | 'skipped';

export type RuntimeCapabilityEvidenceKind =
  | 'runtime'
  | 'static'
  | 'type'
  | 'demo'
  | 'disabled'
  | 'failed';

export interface RuntimeCapabilityHealthEvent {
  id: string;
  subreddit: string;
  capabilityId: string;
  status: RuntimeCapabilityHealthStatus;
  observedAt: string;
  source: 'smoke_route' | 'playtest' | 'manual_qa' | 'unit_test' | 'system';
  message: string;
  diagnosticRoute?: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface RuntimeCapabilityHealthEventInput {
  subreddit: string;
  capabilityId: string;
  status: RuntimeCapabilityHealthStatus;
  source: RuntimeCapabilityHealthEvent['source'];
  message: string;
  diagnosticRoute?: string;
  errorCode?: string;
  errorMessage?: string;
  observedAt?: string;
}

export interface RuntimeCapabilityMatrixEntry {
  id: string;
  domain: RuntimeCapabilityDomain;
  label: string;
  state: RuntimeCapabilityState;
  evidenceKind: RuntimeCapabilityEvidenceKind;
  summary: string;
  evidence: string[];
  diagnosticRoute?: string;
  proofCommand?: string;
  destructive: boolean;
  safeToTest: boolean;
  canUpdateFromHealthEvents: boolean;
  nextAction: string;
  lastHealthEvent?: RuntimeCapabilityHealthEvent;
}

export interface RuntimeCapabilityMatrixSummary {
  total: number;
  verifiedRuntime: number;
  verifiedStatic: number;
  typeOnly: number;
  demoOnly: number;
  disabled: number;
  unsupported: number;
  failedRuntime: number;
  deferred: number;
}

export interface RuntimeCapabilityMatrix {
  generatedAt: string;
  subreddit: string;
  entries: RuntimeCapabilityMatrixEntry[];
  healthEvents: RuntimeCapabilityHealthEvent[];
  summary: RuntimeCapabilityMatrixSummary;
  warnings: string[];
}

export type ModeratorVisibilityLevel = 'aggregate_only' | 'full_moderator';

export interface ModeratorAccessDiagnostic {
  subreddit?: string;
  username?: string;
  evidence:
    | 'skipped_no_subreddit_context'
    | 'moderator_permissions_verified';
  permissionCount: number;
  permissions: string[];
  moderatorVisibilityLevel: ModeratorVisibilityLevel;
  source: 'current_user_permissions';
}

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface RedisSmokeResult {
  key: string;
  value: string;
  readBack?: string;
  ok: boolean;
}

export interface RedisSortedSetSmokeResult {
  key: string;
  addCount: number;
  cardinality: number;
  expectedOrder: string[];
  observedOrder: string[];
  observedScores: number[];
  scoreChecks: Record<string, number | undefined>;
  ok: boolean;
}

export interface RedisStorageSmokeResult {
  keys: {
    scanRecord: string;
    scanIndex: string;
    actions: string;
    overrides: string;
  };
  expected: {
    scanMetadataCount: number;
    actionEventCount: number;
    overrideEventCount: number;
  };
  observed: {
    scanRecordBytes?: number;
    scanIndexCardinality: number;
    actionIndexCardinality: number;
    overrideIndexCardinality: number;
    postCleanupExistingKeys: number;
  };
  ok: boolean;
}
