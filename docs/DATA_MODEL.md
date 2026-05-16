# DATA_MODEL.md — ModMirror Data Model

This is the Wave 1 shared data model. Keep `src/shared/schema.ts` as the
implementation source of truth and update this document when contract behavior
changes.

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

Devvit's current `Rule` type does not expose a stable rule ID. ModMirror uses a
derived local `ruleKey` plus rule name/priority metadata instead of assuming a
platform rule ID exists.

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
```

## Shared Constants And Helpers

Wave 1 adds shared constants in `src/shared/constants.ts` for app name/tagline,
confidence values, enforcement action values, delivery modes, override reasons,
demo subreddit name, drift thresholds, and route names.

Pure helper stubs live in `src/shared/scoring.ts`:

- `confidenceLabel(score)`
- `isOverrideAction(recommendedAction, selectedAction)`
- `getSmallSubredditThresholdStatus(observedActions, minimumActions?)`
- normalization helpers for future deterministic attribution

Full attribution scoring remains Wave 2 scope.

## Attribution Scoring Draft

Use deterministic scoring.

Possible signals:

| Signal                                       | Example                                      |  Weight |
| -------------------------------------------- | -------------------------------------------- | ------: |
| Exact removal reason title equals rule title | "Low Effort" = "Low Effort"                  |    High |
| Removal reason title includes rule keyword   | "Low-effort questions" includes "low effort" |    High |
| Removal reason message overlaps rule text    | "beginner question without code"             |  Medium |
| Mod log note contains rule number            | "Rule 2"                                     |    High |
| ModMirror-created action has ruleKey         | direct                                       | Certain |
| No useful text                               | unmatched                                    |    None |

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
