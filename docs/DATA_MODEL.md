# DATA_MODEL.md — ModMirror Data Model

This is the draft data model. Update after Wave 0 confirms Devvit/Redis constraints.

## Key Principles

- Namespace all Redis keys by subreddit/install context.
- Store only necessary data.
- Prefer aggregate analytics over unnecessary per-mod surveillance.
- Historical mod-log attribution is inferred, not guaranteed.
- ModMirror-created actions should be more structured than historical imports.

## Redis Key Helper

```ts
export function mmKey(subreddit: string, suffix: string): string {
  return `modmirror:${subreddit}:${suffix}`;
}
```

## Keys

```txt
modmirror:{subreddit}:config
modmirror:{subreddit}:policies
modmirror:{subreddit}:policy:{ruleId}
modmirror:{subreddit}:scan:last
modmirror:{subreddit}:scan:{scanId}
modmirror:{subreddit}:actions
modmirror:{subreddit}:actions:user:{username}
modmirror:{subreddit}:overrides
modmirror:{subreddit}:demo
```

## Types

```ts
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

export interface RulePolicy {
  id: string;
  subreddit: string;
  ruleId: string;
  ruleName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: 'public_comment' | 'private_message' | 'log_only';
  active: boolean;
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
  rawActionType: string;
  targetThingId?: string;
  targetAuthor?: string;
  moderator?: string;
  createdAt: string;
  inferredRuleId?: string;
  inferredRuleName?: string;
  confidence: Confidence;
  evidence: string[];
}

export interface MirrorScan {
  id: string;
  subreddit: string;
  createdAt: string;
  createdBy: string;
  source: 'live' | 'demo';
  totalActionsScanned: number;
  attributedCount: number;
  unmatchedCount: number;
  confidenceBreakdown: Record<Confidence, number>;
  driftCandidates: DriftCandidate[];
}

export interface DriftCandidate {
  ruleId?: string;
  ruleName: string;
  confidence: Confidence;
  summary: string;
  totalActions: number;
  actionDistribution: Record<string, number>;
  recommendation: string;
}

export interface OverrideEvent {
  id: string;
  subreddit: string;
  modUsername: string;
  targetThingId?: string;
  targetAuthor?: string;
  ruleId: string;
  recommendedAction: EnforcementAction;
  selectedAction: EnforcementAction;
  overrideReason:
    | 'severe_context'
    | 'repeat_pattern_not_captured'
    | 'user_history_outside_modmirror'
    | 'edge_case_mod_discretion'
    | 'policy_seems_wrong'
    | 'other';
  overrideNote?: string;
  createdAt: string;
}
```

## Attribution Scoring Draft

Use deterministic scoring.

Possible signals:

| Signal | Example | Weight |
|---|---|---:|
| Exact removal reason title equals rule title | "Low Effort" = "Low Effort" | High |
| Removal reason title includes rule keyword | "Low-effort questions" includes "low effort" | High |
| Removal reason message overlaps rule text | "beginner question without code" | Medium |
| Mod log note contains rule number | "Rule 2" | High |
| ModMirror-created action has rule ID | direct | Certain |
| No useful text | unmatched | None |

Return:

- rule candidate,
- confidence,
- evidence strings.

Never silently force a rule match.
