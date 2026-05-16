# TODO.md — Current Work Queue

## Current Phase

Wave 2 — Mirror Scan + deterministic attribution.

Status: Wave 2 is being integrated across dedicated branches for attribution, demo seed data, live sources, dashboard scan UI, and tests/docs. Runtime playtest remains blocked until `devvit login` is completed.

## Wave 2 Integration Checklist

- [ ] Merge deterministic attribution engine.
- [ ] Merge mandatory `r/ExampleLearning` demo seed data.
- [ ] Merge live source adapters for mod log, rules, and removal reasons.
- [ ] Merge Mirror Scan dashboard states.
- [ ] Wire demo and live scan through the same scan service.
- [ ] Verify confidence breakdown totals.
- [ ] Verify demo Rule 2 drift candidate.
- [ ] Complete `docs/WAVE2_COMPLETION_REPORT.md`.
- [ ] Keep Policy Agreement Flow out of Wave 2.
- [ ] Keep Apply Policy and Override Audit out of Wave 2.

## Wave 1 Completed Locally

- [x] Create shared TypeScript data contracts in `src/shared/schema.ts`.
- [x] Create shared constants for confidence levels, enforcement actions, and override reasons.
- [x] Centralize Redis key construction in `src/server/services/redis.ts`.
- [x] Add `getAppConfig` / `setAppConfig`.
- [x] Add `getDemoModeState`, `getDemoModeFlag`, and `setDemoModeFlag`.
- [x] Add `getPolicyByRule`, `setPolicyByRule`, and `listPolicies`.
- [x] Add `saveLastScanMetadata` and `getLastScanMetadata`.
- [x] Add `saveAuditEvent` and `listRecentAuditEvents`.
- [x] Rewire `/api/smoke/redis` through the Wave 1 Redis service.

## Wave 1 Runtime Blocked / Not Runtime-Verified

- [ ] Hit `/api/smoke/redis` in playtest and confirm `modmirror:{subreddit}:smoke:redis-data-layer` write/read.
- [ ] Confirm Redis hash behavior for `modmirror:{subreddit}:policies`.
- [ ] Confirm Redis sorted-set ordering for `modmirror:{subreddit}:overrides`.
- [ ] Confirm practical Redis storage limits for scan metadata and audit events before storing larger live datasets.

## Wave 0 Completed Locally

- [x] Create Devvit app scaffold from current official `mod-tool` template.
- [x] Confirm Node/npm versions.
- [x] Confirm Devvit CLI/package versions.
- [x] Confirm generated install/dev/build/upload/publish commands.
- [x] Build smallest possible Redis smoke test.
- [x] Build smallest possible Reddit API smoke test.
- [x] Build smallest possible post/comment menu action and form chaining smoke test.
- [x] Verify SDK/type support for moderation log, removal reasons, subreddit rules, submit comments, remove/approve/ignore reports, private messages, modmail, native Mod Notes, and moderator permission checks.
- [x] Replace destructive template example with non-destructive smoke-test surfaces.
- [x] Document Wave 0 findings in `RESEARCH.md`.
- [x] Mark Wave 0 assumptions as verified, unverified, broken, or deferred in `RESEARCH.md` and `docs/DEVVIT_RESEARCH_QUESTIONS.md`.

## Wave 0 Runtime Blockers

- [ ] Complete `npm run login` / `npx devvit login`.
- [ ] Complete `npx devvit whoami`.
- [ ] Create or bind the real Reddit app identity for `modmirror`.
- [ ] Run `npm run dev` through a full playtest session in a small test subreddit.
- [ ] Hit `/api/smoke/redis` in playtest and confirm Redis read/write.
- [ ] Hit `/api/smoke/reddit` in playtest and capture redacted sample output.
- [ ] Invoke post and comment menu smoke actions in Reddit and confirm form chaining UX.
- [ ] Verify whether `submitComment` works on normal content, before removal, and after removal.
- [ ] Verify whether a submitted removal comment can be distinguished/stickied.
- [ ] Verify private message and modmail delivery behavior.
- [ ] Verify native Mod Notes add/read/delete behavior with real moderator permissions.
- [ ] Verify exact moderator permission strings needed for aggregate versus per-mod visibility.

## Wave 1 Tasks

- [x] Create `src/shared/schema.ts` with researched data contracts from `docs/DATA_MODEL.md`.
- [x] Create `src/shared/constants.ts` with confidence/action/message-delivery constants.
- [x] Use local derived rule keys, not assumed Devvit rule IDs, in shared policy types.
- [x] Set default message delivery to `log_only` until comment-before/removal and comment-after/removal behavior is playtest-verified.
- [x] Create a Redis key helper that produces `modmirror:{subreddit}:{suffix}` keys.
- [x] Split server code into `src/server/services/` while preserving the current Devvit Web/Hono entrypoint shape.
- [x] Add a health/status endpoint that reports app name, runtime context if available, demo-mode state, and whether live playtest proof is still missing.
- [x] Create the initial dashboard shell/client entry deliberately; the Wave 0 template did not generate one.
- [x] Add focused unit tests for pure shared helpers using `vitest.config.ts`.
- [x] Keep smoke endpoints/menu actions non-destructive until playtest proof exists.
- [x] Update `RESEARCH.md` if Wave 1 discovers new SDK/runtime facts.

## Wave 2 Prerequisites

- [x] Wave 1 shared contracts, Redis helper, health/status endpoint, and dashboard shell exist and pass typecheck/build.
- [x] Runtime playtest either verifies Redis/Reddit/menu/form behavior or Wave 2 explicitly stays demo/local-only until auth is unblocked.
- [ ] Comment delivery ordering is tested or Mirror Scan/Policy work defaults all outbound messaging to `log_only`.
- [x] The rule attribution contract uses confidence labels and evidence arrays for every inferred match.
- [ ] Demo seed data is available before judging-facing screenshots or video work.

## Wave 2 Tasks After Prerequisites

- [ ] Fetch moderation log actions through `reddit.getModerationLog({ subredditName, limit, pageSize }).all()`.
- [ ] Fetch removal reasons through `reddit.getSubredditRemovalReasons(subredditName)`.
- [ ] Fetch subreddit rules through `reddit.getRules(subredditName)` or `subreddit.getRules()`.
- [ ] Normalize mod actions without assuming structured rule/removal IDs.
- [ ] Implement deterministic attribution with high/medium/low/unmatched confidence labels.
- [ ] Store scan summaries and raw-enough evidence in Redis without storing unnecessary sensitive content.
- [ ] Render Mirror Scan dashboard results with clear demo/live labeling.

## Recommended Wave 2

- Build Mirror Scan on top of `src/server/services/scans.ts`.
- Keep attribution deterministic and confidence-scored.
- Use `src/server/services/policies.ts` only for policy lookup/persistence; do not add editor UI in Wave 2 unless explicitly scoped.
- Add focused tests for pure attribution/scoring helpers once those helpers exist.

## Wave 2 UI Tasks

- Render live Mirror Scan results from the Wave 2 scan endpoint.
- Show scanned action count, confidence breakdown, unmatched count, and drift candidates.
- Add a useful small-subreddit/no-history state that routes users to demo mode or policy setup.
- Wire demo seed data into the dashboard without making it look like live subreddit data.
- Preserve the exact "Wave 2 will implement live scan" placeholder until the scan endpoint is ready.
- Keep all inferred rule labels confidence-scored and visually distinct from confirmed data.

## Ready For Wave 2

- Shared contracts are importable from server code through `src/shared/index.ts`.
- Use `ruleKey` for policy and attribution references; do not assume a stable Devvit rule ID.
- Full Mirror Scan attribution and the 50-80 action demo dataset remain Wave 2 scope.

## Do Not Start Yet

Do not implement these until Wave 1 contracts exist and the relevant runtime behavior is verified or explicitly demo-only:

- full Mirror Scan scoring beyond pure/unit-testable helpers
- policy editor
- Apply Policy enforcement flow
- public comment delivery as a default
- private message, modmail, or native Mod Notes delivery
- override audit dashboard
- Devpost final copy
