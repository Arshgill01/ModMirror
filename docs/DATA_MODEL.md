# DATA_MODEL.md — ModMirror Data Model

This is the draft data model after Wave 0 local SDK/build proof. Runtime playtest is still blocked by Devvit auth, so anything involving live Reddit side effects remains unverified.

## Key Principles

- Namespace all Redis keys by subreddit/install context.
- Store only necessary data.
- Prefer aggregate analytics over unnecessary per-mod surveillance.
- Historical mod-log attribution is inferred, not guaranteed.
- ModMirror-created actions should be more structured than historical imports.
- Use local derived rule keys because the installed Devvit `Rule` type does not expose a stable rule ID.
- Default outbound message delivery to `log_only` until public comment behavior before/after removal is playtest-verified.

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
modmirror:{subreddit}:policy:{localRuleKey}
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

export type MessageDeliveryMode =
  | 'log_only'
  | 'public_comment'
  | 'modmail';

export interface RuleReference {
  localRuleKey: string;
  shortName: string;
  priority?: number;
  descriptionSnapshot?: string;
  violationReasonSnapshot?: string;
}

export interface RulePolicy {
  id: string;
  subreddit: string;
  rule: RuleReference;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
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
  inferredLocalRuleKey?: string;
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
  localRuleKey?: string;
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
  localRuleKey: string;
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
| ModMirror-created action has local rule key | direct | High |
| No useful text | unmatched | None |

Return:

- rule candidate,
- confidence,
- evidence strings.

Never silently force a rule match.

## Runtime-Dependent Fields

- `public_comment` delivery is allowed in the model, but the default remains `log_only` until playtest proves comment delivery before/after removal.
- `modmail` is allowed as a future private delivery path because SDK typings expose modmail creation. It is not runtime-verified.
- `private_message` is intentionally excluded from the preferred model because subreddit private message sending is deprecated in the installed typings.
- Per-mod aggregate analytics should not be added to shared response types until permission gating is runtime-verified.
