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
  | 'policy_proposal';

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
  evidence: ApplyPolicyPreviewEvidence[];
  confirmation: ApplyPolicyConfirmationPreview;
}

export interface ApplyPolicyConfirmInput extends ApplyPolicyPreviewInput {
  selectedAction: EnforcementAction;
  confirmed: boolean;
  executionMode?: ModerationExecutionMode;
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
  removalMessageTemplate?: string;
  noteTemplate?: string;
  requireOverrideReasonForDeviation: boolean;
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
