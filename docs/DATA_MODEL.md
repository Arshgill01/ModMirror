# DATA_MODEL.md — ModMirror Data Model

This is the Wave 2 shared data model. Keep `src/shared/schema.ts` as the
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
modmirror:{subreddit}:policy:{policyId}:versions
modmirror:{subreddit}:policy:{policyId}:version:{versionId}
modmirror:{subreddit}:policy:{policyId}:changes
modmirror:{subreddit}:scan:last
modmirror:{subreddit}:scan:{scanId}
modmirror:{subreddit}:actions
modmirror:{subreddit}:actions:user:{username}
modmirror:{subreddit}:overrides
modmirror:{subreddit}:override:{overrideId}:review
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

export type ActionSource = 'live' | 'demo' | 'modmirror';

export type MirrorScanSource = 'live' | 'demo';

export type NormalizedRuleSource = 'reddit_rule' | 'manual' | 'demo';

export type NormalizedRemovalReasonSource = 'reddit_removal_reason' | 'demo';

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
  activeVersionId?: string;
  activeVersionNumber?: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  active: boolean;
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
}

export interface PolicySnapshot {
  policyId: string;
  policyVersionId: string;
  policyVersionNumber: number;
  policyVersionStatus: 'active' | 'missing' | 'legacy';
  ruleKey: string;
  ruleName: string;
  steps: PolicyStep[];
  defaultMessageMode: MessageDeliveryMode;
  capturedAt: string;
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
  policyId?: string;
  policyVersionId?: string;
  policyVersionNumber?: number;
  policySnapshot?: PolicySnapshot;
  reviewStatus: OverrideReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNote?: string;
  updatedAt: string;
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

Pure shared helpers live in `src/shared/scoring.ts`:

- `confidenceLabel(score)`
- `isOverrideAction(recommendedAction, selectedAction)`
- `getSmallSubredditThresholdStatus(observedActions, minimumActions?)`
- normalization helpers used by deterministic attribution

Full deterministic attribution lives in `src/server/services/attribution.ts`.

## Attribution Scoring

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

Wave 2 thresholds:

- `score >= 0.8`: high
- `score >= 0.5`: medium
- `score > 0`: low
- `score === 0`: unmatched

## Runtime-Dependent Fields

- `public_comment` delivery is allowed in the model, but the default remains `log_only` until playtest proves comment delivery before/after removal.

## Wave 3/4 Additions

Policies now have create/update input contracts, recommendation output, and Apply
Policy preview/confirm contracts in `src/shared/schema.ts`.

Additional Redis-backed records:

```txt
modmirror:{subreddit}:actions
modmirror:{subreddit}:actions:user:{username}
modmirror:{subreddit}:overrides
```

`ActionEvent` stores the confirmed Apply Policy decision with target, rule,
policy, recommended action, selected action, delivery mode, source, and
timestamp. The default delivery mode remains `log_only`.

`OverrideEvent` stores deviations from policy only when an override reason is
provided. Aggregate summaries count overrides by rule and reason, and the
dashboard/API intentionally avoid per-mod breakdowns until permission gating is
runtime-verified.

## Wave 5 Additions

Policy edits are versioned. `RulePolicy` stores the active version pointer, and
each `PolicyVersion` stores immutable policy steps, delivery mode, change
metadata, creator, and timestamp. Legacy Wave 3/4 policies are lazily treated as
version 1 instead of being deleted.

`ActionEvent` and `OverrideEvent` include policy version fields and
`PolicySnapshot` when a policy exists at Apply Policy confirmation time. If a
policy/version is missing, records use `policyVersionStatus: 'missing'` so the
audit trail does not crash or pretend certainty.

Overrides are reviewable. New override events default to
`reviewStatus: 'unresolved'`, and review updates store reviewer, timestamp,
status, and optional note while preserving the original selected/recommended
actions and override reason.

Policy health is deterministic. It uses tracked action count, adherence rate,
override rate, unresolved override count, and `policy_seems_wrong` override
count to return:

- `stable`
- `watch`
- `at_risk`
- `needs_review`
- `insufficient_data`

Apply Policy uses the dashboard simulator as the safe primary surface for this
wave. The dashboard launch surface is a moderator-only subreddit menu item that
opens a confirmation form before creating a custom post and navigating to it.
Post/comment menu UX remains runtime-unverified in browser playtest.
- `modmail` is allowed as a future private delivery path because SDK typings expose modmail creation. It is not runtime-verified.
- `private_message` is intentionally excluded from the preferred model because subreddit private message sending is deprecated in the installed typings.
- Per-mod aggregate analytics should not be added to shared response types until permission gating is runtime-verified.
