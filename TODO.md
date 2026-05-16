# TODO.md — Current Work Queue

## Current Phase

Wave 3/4 — Policy Agreement Flow + Apply Policy Action implemented locally.

Status: Mirror Scan, deterministic attribution, policy creation/editing, Apply Policy simulator, log-only action events, deviation override enforcement, aggregate override summary services, and a moderator-only dashboard launch menu are implemented. CLI playtest reaches ready for `r/modmirror_dev`; Safari is signed in and opens the playtest subreddit. Activating the dashboard launcher creates a visible custom post and needs explicit approval before browser proof clicks it.

## Wave 3/4 Completion Checklist

- [x] Policy creation API and dashboard flow.
- [x] Policy editing API and dashboard flow.
- [x] Policy list/overview dashboard.
- [x] Create policy from Mirror Scan drift candidate.
- [x] Manual policy creation.
- [x] Empty policy fallback copy.
- [x] Small-subreddit policy-first copy.
- [x] Apply Policy preview endpoint and dashboard simulator.
- [x] Apply Policy confirm endpoint in `log_only` mode.
- [x] Deviating selected actions require override reason.
- [x] Action events are stored in Redis sorted sets.
- [x] Override events are stored in Redis sorted sets.
- [x] Aggregate override summary service/API hides per-mod breakdowns.
- [x] Demo scan supports the full policy/apply loop.
- [x] Local build/test/typecheck/lint pass in Wave 3/4 worktree.
- [x] Runtime playtest reaches ready.
- [ ] Browser UI proof for the dashboard custom post after approval to create the visible test post.

## Wave 2 Integration Checklist

- [x] Merge deterministic attribution engine.
- [x] Merge mandatory `r/ExampleLearning` demo seed data.
- [x] Merge live source adapters for mod log, rules, and removal reasons.
- [x] Merge Mirror Scan dashboard states.
- [x] Wire demo and live scan through the same scan service.
- [x] Verify confidence breakdown totals.
- [x] Verify demo Rule 2 drift candidate.
- [x] Complete `docs/WAVE2_COMPLETION_REPORT.md`.
- [x] Keep Policy Agreement Flow out of Wave 2.
- [x] Keep Apply Policy and Override Audit out of Wave 2.

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

- [x] Complete `npm run login` / `npx devvit login`.
- [x] Complete `npx devvit whoami` locally as `u/BrightyBrainiac`.
- [x] Create or bind the real Reddit app identity for `modmirror`; `npx devvit view --json` returns app id `5cd5fae3-9da6-4e7c-a243-7c8762badd91`.
- [x] Run `npm run dev` far enough to reach Playtest ready in `r/modmirror_dev`.
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
- [x] Demo seed data is available before judging-facing screenshots or video work.

## Wave 2 Tasks After Prerequisites

- [x] Fetch moderation log actions through `reddit.getModerationLog({ subredditName, limit, pageSize }).all()`.
- [x] Fetch removal reasons through `reddit.getSubredditRemovalReasons(subredditName)`.
- [x] Fetch subreddit rules through `reddit.getRules(subredditName)`.
- [x] Normalize mod actions without assuming structured rule/removal IDs.
- [x] Implement deterministic attribution with high/medium/low/unmatched confidence labels.
- [x] Store scan summary metadata in Redis while avoiding raw content storage.
- [x] Render Mirror Scan dashboard results with clear demo/live labeling.

## Ready For Wave 3

- Shared contracts are importable from server code through `src/shared/index.ts`.
- Use `ruleKey` for policy and attribution references; do not assume a stable Devvit rule ID.
- Start Policy Agreement Flow from `MirrorScan.driftCandidates`.
- Keep policy message delivery defaulted to `log_only` until public comment behavior is playtest-verified.
- Preflight commands passed on 2026-05-16: `npm run build`, `npm test`, `npm run type-check`, `npm run lint`, `npx devvit whoami`, and `npm run dev` to Playtest ready.

## Do Not Start Until Scoped

- Apply Policy enforcement flow.
- public comment delivery as a default.
- private message, modmail, or native Mod Notes delivery.
- override audit dashboard.
- Devpost final copy.
