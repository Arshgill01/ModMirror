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

export type ActionSource = 'live' | 'demo' | 'modmirror';

export type ApplyPolicySource = 'live' | 'demo' | 'simulator';

export type HealthState = 'ok' | 'degraded' | 'blocked';

export interface SubredditRuleRef {
  ruleKey: string;
  ruleName: string;
  rulePriority?: number;
  ruleKind?: 'all' | 'link' | 'comment';
}

export interface RulePolicy extends SubredditRuleRef {
  id: string;
  subreddit: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  active: boolean;
}

export interface PolicyCreateInput extends SubredditRuleRef {
  subreddit: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode?: MessageDeliveryMode;
  active?: boolean;
}

export interface PolicyUpdateInput {
  ruleName?: string;
  rulePriority?: number;
  ruleKind?: 'all' | 'link' | 'comment';
  steps?: PolicyStep[];
  defaultMessageMode?: MessageDeliveryMode;
  active?: boolean;
}

export interface ApplyPolicyContext {
  subreddit: string;
  ruleKey: string;
  targetThingId?: string;
  targetAuthor?: string;
  selectedAction?: EnforcementAction;
  source?: ApplyPolicySource;
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
  targetAuthor?: string;
  selectedAction?: EnforcementAction;
  source?: ApplyPolicySource;
}

export interface ApplyPolicyPreview {
  recommendation: PolicyRecommendation;
  policy?: RulePolicy;
}

export interface ApplyPolicyConfirmInput extends ApplyPolicyPreviewInput {
  selectedAction: EnforcementAction;
  overrideReason?: OverrideReason;
  overrideNote?: string;
}

export interface ApplyPolicyConfirmResult {
  recommendation: PolicyRecommendation;
  actionEvent: ActionEvent;
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
  warnings: string[];
}

export interface AttributionResult {
  actionId: string;
  inferredRuleKey?: string;
  inferredRuleName?: string;
  confidence: Confidence;
  score: number;
  evidence: string[];
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
  warnings: string[];
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
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  overrideReason: OverrideReason;
  overrideNote?: string;
  createdAt: string;
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
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  deliveryMode: MessageDeliveryMode;
  source: ApplyPolicySource;
  createdAt: string;
}

export interface OverrideSummary {
  totalOverrides: number;
  overridesByRule: Record<string, number>;
  overridesByReason: Record<OverrideReason, number>;
  recentOverrides: Array<Omit<OverrideEvent, 'modUsername'>>;
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
