export type Confidence = 'high' | 'medium' | 'low' | 'unmatched';

export type EnforcementAction =
  | 'remove'
  | 'approve'
  | 'warn'
  | 'note'
  | 'temporary_ban_suggested'
  | 'permanent_ban_suggested'
  | 'ignore_reports'
  | 'manual_review';

export type MessageMode = 'public_comment' | 'private_message' | 'log_only';

export type ScanSource = 'live' | 'demo';

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

export interface PolicyStep {
  offenseCount: number;
  windowDays: number;
  recommendedAction: EnforcementAction;
  removalMessageTemplate?: string;
  noteTemplate?: string;
  requireOverrideReasonForDeviation: boolean;
}

export interface RulePolicy {
  id: string;
  subreddit: string;
  ruleId: string;
  ruleName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageMode;
  active: boolean;
}

export interface LastScanMetadata {
  id: string;
  subreddit: string;
  createdAt: string;
  createdBy: string;
  source: ScanSource;
  totalActionsScanned: number;
  attributedCount: number;
  unmatchedCount: number;
  confidenceBreakdown: Record<Confidence, number>;
  driftCandidateCount: number;
}

export type OverrideReason =
  | 'severe_context'
  | 'repeat_pattern_not_captured'
  | 'user_history_outside_modmirror'
  | 'edge_case_mod_discretion'
  | 'policy_seems_wrong'
  | 'other';

export interface OverrideEvent {
  id: string;
  subreddit: string;
  modUsername: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleId: string;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  overrideReason: OverrideReason;
  overrideNote?: string;
  createdAt: string;
}

export interface RedisSmokeResult {
  key: string;
  value: string;
  readBack?: string;
  ok: boolean;
}
