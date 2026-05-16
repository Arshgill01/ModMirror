# AGENTS.md — ModMirror Agent Context

## Project

ModMirror is a Reddit Devvit moderation app for the Reddit Mod Tools and Migrated Apps Hackathon.

Core tagline:

> Find enforcement drift before your users do.

Core thesis:

> Most moderation tools help moderators act faster. ModMirror helps moderator teams act consistently.

ModMirror scans recent moderation actions, maps them to subreddit rules/removal reasons where possible, surfaces enforcement drift, helps moderators define rule policies, and gives live consistency nudges when moderators apply actions.

## Hackathon Category

Best New Mod Tool.

Do not position this as:

- a ported bot,
- a Toolbox clone,
- a generic queue dashboard,
- a strike bot,
- an AI moderator.

Position it as:

- a policy consistency layer,
- a moderation governance tool,
- a guided enforcement workflow system.

## Non-negotiable Product Decisions

These are locked. Do not reopen unless the user explicitly asks.

1. Name: ModMirror.
2. Thesis: consistency-first, speed-second.
3. MVP scope:
   - Mirror Scan
   - Policy Agreement Flow
   - Apply Policy Action
   - Consistency Nudge + Override Audit
4. No LLM/AI judging in v1.
5. No automatic bans as the default demo.
6. Human confirmation is required for meaningful enforcement actions.
7. Demo seed data is mandatory.
8. Rule attribution must be confidence-scored and honest.
9. The app must not pretend that historical mod-log attribution is perfect.
10. Aggregate dashboard data can be visible to all mods; per-mod breakdowns require stronger moderator/manage-level permission if available.
11. Use TypeScript.
12. Prefer deterministic logic over probabilistic black boxes.
13. Prefer Devvit-native capabilities and Redis. Avoid external services unless absolutely required.
14. Do not use deprecated APIs if a current replacement exists.
15. Every wave must leave the repo buildable or clearly document why not.

## Product Story

The demo story should follow this arc:

1. A mod team installs ModMirror.
2. ModMirror runs a Mirror Scan over recent mod actions.
3. It finds enforcement drift.
4. The lead mod creates a policy ladder for a rule.
5. A new post/comment needs moderation.
6. A moderator uses Apply Policy.
7. ModMirror recommends the team-aligned action.
8. If the mod chooses a stricter/looser action, ModMirror asks for an override reason.
9. The override is logged so the team can improve policy later.

The central line:

> Your team thought Rule 2 was simple. ModMirror showed that it was not.

## Core Features

### 1. Mirror Scan

Purpose:

- Read recent moderation activity.
- Fetch subreddit rules and removal reasons if Devvit supports it.
- Attribute historical actions to rules/removal reasons using deterministic matching.
- Surface likely policy drift.

Required output:

- actions scanned,
- likely rule buckets,
- confidence levels,
- unmatched count,
- drift candidates,
- small-subreddit fallback state.

Attribution must use confidence labels:

- high confidence,
- medium confidence,
- low confidence,
- unmatched.

Never present inferred labels as certain.

### 2. Policy Agreement Flow

Purpose:

- Turn drift findings into explicit team policy.

Policy examples:

- First offense: remove + warning
- Second offense within window: remove + formal note
- Third offense: suggest temporary ban
- Severe case: manual escalation

Must include:

- no-policy fallback,
- create/edit policy,
- small-subreddit mode,
- Redis persistence.

### 3. Apply Policy Action

Purpose:

- Allow moderators to apply a rule policy from a post/comment context.

Flow:

1. Moderator selects ModMirror menu action.
2. Moderator chooses rule.
3. App loads policy and user/action history.
4. App recommends action.
5. Moderator confirms.
6. App performs stable configured actions if supported.
7. App logs the decision.

If no policy exists:

- route into policy creation instead of erroring.

### 4. Consistency Nudge + Override Audit

Purpose:

- Warn when a mod's selected action differs from the team policy or recent team norm.

Example message:

> You selected 3-day ban. For first-time Rule 2 violations, your team policy recommends remove + warning. Continue with override?

Override reason options:

- Severe context
- Repeat pattern not captured
- User history outside ModMirror
- Edge case / moderator discretion
- Policy seems wrong
- Other

Store override events in Redis.

## Technical Principles

1. Verify Devvit APIs against the current docs or generated project typings before use.
2. Do not hallucinate API names.
3. If an API is uncertain, create a minimal proof and document the result in RESEARCH.md.
4. Use Redis as the persistence layer for ModMirror app state.
5. Use native Reddit mod notes/removal APIs only if verified.
6. Avoid external API calls for v1.
7. Keep server endpoints under `/api/` if using Devvit Web.
8. Keep product logic in server/services and shared pure functions.
9. Keep UI thin and readable.
10. Add testable pure functions for attribution/scoring.

## Expected Devvit Architecture

Expected high-level structure after scaffold:

```txt
src/
  client/
    App.tsx
    components/
    pages/
    styles/
  server/
    index.ts
    routes/
    services/
      reddit.ts
      redis.ts
      mirrorScan.ts
      attribution.ts
      policies.ts
      audit.ts
    types/
  shared/
    schema.ts
    constants.ts
    scoring.ts
```

Use the actual scaffold structure if Devvit generates something different, but preserve this separation conceptually.

## Redis Key Strategy

All keys must be namespaced by subreddit/install context.

Use a helper like:

```ts
function key(subredditIdOrName: string, suffix: string): string {
  return `modmirror:${subredditIdOrName}:${suffix}`;
}
```

Suggested keys:

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

Do not store unnecessary sensitive data. Store the minimum needed for product value.

## Initial Data Shapes

These are draft shapes. Adjust based on actual Devvit types discovered in Wave 0.

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

## Visibility Decision

Default:

- All moderators can view aggregate policy drift and policy configuration.
- Per-mod breakdowns should be hidden unless the current moderator has sufficiently strong permissions.
- If exact permission checks are hard in v1, hide per-mod analytics entirely and store moderator names only for audit events.

Rationale:

- Avoid turning ModMirror into a surveillance tool.
- Keep the pitch about team consistency, not blaming individual moderators.

## Demo Mode

Demo mode is mandatory.

It must provide a realistic seeded dataset so screenshots/video work even if the test subreddit has no history.

Demo dataset should include:

- r/ExampleLearning or similar fake subreddit name.
- Rules:
  - Rule 1: Be civil
  - Rule 2: Low-effort questions
  - Rule 3: Self-promotion
- 50-80 historical actions.
- Intentional drift:
  - Rule 2 first-time cases: warnings, removal-only, and temporary bans.
  - Rule 3: mostly consistent.
  - Rule 1: severe cases escalated.

Demo mode must be clearly labeled so it is not mistaken for real subreddit data.

## Coding Standards

- TypeScript strict where possible.
- Small pure functions.
- No giant files if avoidable.
- Keep server-side Reddit/Redis calls isolated.
- Keep attribution scoring deterministic and testable.
- Use clear names over clever names.
- Prefer boring reliable UI over fancy unfinished UI.
- No large dependency unless justified.
- Do not add external services.
- Document any Devvit limitation in RESEARCH.md and TODO.md.

## Git / Commit Rules

Make granular commits.

Preferred commit style:

- chore: add agent docs
- feat: scaffold Devvit app
- feat: add mirror scan endpoint
- feat: add deterministic attribution scoring
- feat: add policy editor
- feat: add apply policy action
- fix: handle empty policy fallback
- docs: update research findings

Do not make one giant commit for a whole wave.

## Wave Reporting

At the end of every wave, create or update:

- TODO.md
- RESEARCH.md if new platform facts were discovered
- docs/DECISIONS.md if product/technical decisions changed

Every wave completion report should include:

1. What changed
2. Files touched
3. Commands run
4. Tests/checks run
5. Known issues
6. Next recommended wave
