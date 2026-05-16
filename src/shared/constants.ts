import type { Confidence, EnforcementAction, OverrideReason } from './schema';

export const CONFIDENCE_LEVELS = [
  'high',
  'medium',
  'low',
  'unmatched',
] as const satisfies readonly Confidence[];

export const ENFORCEMENT_ACTIONS = [
  'remove',
  'approve',
  'warn',
  'note',
  'temporary_ban_suggested',
  'permanent_ban_suggested',
  'ignore_reports',
  'manual_review',
] as const satisfies readonly EnforcementAction[];

export const OVERRIDE_REASONS = [
  'severe_context',
  'repeat_pattern_not_captured',
  'user_history_outside_modmirror',
  'edge_case_mod_discretion',
  'policy_seems_wrong',
  'other',
] as const satisfies readonly OverrideReason[];
