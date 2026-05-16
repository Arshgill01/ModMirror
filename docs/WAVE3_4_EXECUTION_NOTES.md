# WAVE3_4_EXECUTION_NOTES.md — Policy Agreement + Apply Policy

## Scope

Wave 3 and Wave 4 are being clubbed together because they form one user-facing loop:

1. A drift candidate exists from Wave 2.
2. A mod creates a policy from that candidate.
3. A mod applies that policy to a post/comment.
4. The action is logged safely.
5. If the chosen action deviates from policy, an override reason is recorded.

This wave should produce a working policy loop, not every possible enforcement action.

## Preconditions

Before starting Wave 3/4, fix or document the Devvit app identity/playtest blocker.

Wave 2 ended with local checks passing but runtime playtest blocked because the Devvit app identity did not exist/bind yet.

Minimum required before product work:

- `npm run build` passes.
- `npm test` passes.
- `npm run type-check` passes if present.
- `npm run lint` passes if present.
- `npx devvit whoami` passes.
- `npm run dev` reaches Playtest ready, OR the exact app identity blocker is documented in `RESEARCH.md` and `TODO.md`.

## Wave 3/4 Goal

Build the first complete ModMirror operational loop:

> Scan drift → create policy → apply policy → nudge on deviation → audit override.

## Must Build

### Policy Agreement Flow

- Create policy from a drift candidate.
- Create policy manually if needed.
- Edit policy.
- List policies.
- Empty-policy fallback.
- Small-subreddit/no-drift fallback.
- Persist policies in Redis through existing data layer.

### Apply Policy Flow

- Post/comment menu action if Wave 0 verified it.
- Dashboard fallback apply-policy simulator if runtime menu flow is blocked.
- Choose rule/policy.
- Resolve offense count using ModMirror action history where possible.
- Show recommended action.
- Confirm selected action.
- Use `log_only` as safe default delivery mode until live comment behavior is verified.
- Store action event in Redis.

### Consistency Nudge + Override Audit

- If selected action differs from recommendation, require override reason.
- Store override event.
- Show aggregate override summary in dashboard.
- Do not expose per-mod breakdowns unless strong permission-gating is verified.

## Safe Defaults

- Default message delivery: `log_only`.
- Do not auto-ban.
- Do not auto-remove unless runtime proof exists and the behavior is documented.
- Keep all serious actions human-confirmed.
- Prefer simulator/fallback UI over broken live action flow.

## Out of Scope

Do not build:

- appeal packet generator,
- queue dashboard,
- LLM classifier,
- automatic ban engine,
- cross-subreddit analytics,
- external services,
- full Devpost submission.

## Acceptance Criteria

The wave is complete only when:

- A policy can be created and persisted.
- A policy can be edited.
- A policy can be loaded from dashboard.
- A policy can be selected in apply flow.
- The recommended action is computed.
- Deviations require override reason.
- Action events are stored.
- Override events are stored.
- Dashboard shows at least basic policy and override state.
- Demo mode supports the policy/apply flow.
- Local tests/build/typecheck/lint pass.
- Playtest is attempted and result documented.
- `RESEARCH.md`, `TODO.md`, and docs are updated.

## Completion Report

Status: implemented locally and CLI playtest-ready.

### Summary

- Added policy create/list/edit APIs and dashboard Policy Agreement Flow.
- Added create-from-drift behavior for Mirror Scan drift candidates.
- Added policy recommendation helpers and no-policy/small-subreddit states.
- Added action event and override event services backed by Redis sorted sets.
- Added Apply Policy preview/confirm endpoints and dashboard simulator.
- Enforced override reason on deviating selected actions.
- Added a moderator-only subreddit menu launcher that opens a confirmation form
  before creating and opening the dashboard custom post.
- Kept delivery mode `log_only` and avoided unverified live enforcement.

### Commands Run

- `npm install`
- `npm run build`
- `npm test`
- `npm run type-check || true`
- `npm run lint || true`
- `npx devvit whoami`
- `npm audit || true`
- `npm run dev`

### Pass/Fail Status

- PASS: build.
- PASS: tests, 8 files and 35 tests.
- PASS: typecheck.
- PASS: lint.
- PASS: `npx devvit whoami` as `u/BrightyBrainiac`.
- PASS: `npm run dev` reached Playtest ready for `r/modmirror_dev`.
- PARTIAL: Safari is signed in, opens the playtest subreddit, shows the
  dashboard launcher in the moderator overflow menu, and opens the confirmation
  form without creating a visible custom post.
- PARTIAL: `npm audit` reports 31 known vulnerabilities; no force fix applied.

### Runtime Status

`npm run dev` reached:

```txt
https://www.reddit.com/r/modmirror_dev/?playtest=modmirror
v0.0.1.11
```

### Open Risks

- Redis route behavior, dashboard custom-post rendering, and post/comment
  Reddit menu/form behavior still need browser proof. The dashboard launch
  surface is visible and now gates visible post creation behind a confirmation
  form.
- Public comment/private message/modmail/native Mod Notes delivery remain
  disabled/unverified.
- `npm audit` includes Devvit transitive `protobufjs` advisories with no fix
  available through the installed package chain.

### Next Recommended Wave

Wave 5 should focus on browser QA, route smoke verification, menu action proof,
screenshots, and hackathon polish without enabling unverified destructive
moderation actions.
