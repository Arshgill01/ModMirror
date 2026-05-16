# TODO.md — Current Work Queue

## Current Phase

Wave 1 — App Skeleton + Data Contracts.

Status: Wave 0 local scaffold/build proof is complete. Runtime playtest remains blocked until `devvit login` is completed, so Wave 1 should build contracts/skeletons that do not depend on unverified Reddit runtime behavior.

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

- [ ] Create `src/shared/schema.ts` with researched data contracts from `docs/DATA_MODEL.md`.
- [ ] Create `src/shared/constants.ts` with confidence/action/message-delivery constants.
- [ ] Use local derived rule keys, not assumed Devvit rule IDs, in shared policy types.
- [ ] Set default message delivery to `log_only` until comment-before/removal and comment-after/removal behavior is playtest-verified.
- [ ] Create a Redis key helper that produces `modmirror:{subreddit}:{suffix}` keys.
- [ ] Split server code into `src/server/services/` while preserving the current Devvit Web/Hono entrypoint shape.
- [ ] Add a health/status endpoint that reports app name, runtime context if available, demo-mode state, and whether live playtest proof is still missing.
- [ ] Create the initial dashboard shell/client entry deliberately; the Wave 0 template did not generate one.
- [ ] Add focused unit tests for pure shared helpers using `vitest.config.ts`.
- [ ] Keep smoke endpoints/menu actions non-destructive until playtest proof exists.
- [ ] Update `RESEARCH.md` if Wave 1 discovers new SDK/runtime facts.

## Wave 2 Prerequisites

- [ ] Wave 1 shared contracts, Redis helper, health/status endpoint, and dashboard shell exist and pass typecheck/build.
- [ ] Runtime playtest either verifies Redis/Reddit/menu/form behavior or Wave 2 explicitly stays demo/local-only until auth is unblocked.
- [ ] Comment delivery ordering is tested or Mirror Scan/Policy work defaults all outbound messaging to `log_only`.
- [ ] The rule attribution contract uses confidence labels and evidence arrays for every inferred match.
- [ ] Demo seed data is available before judging-facing screenshots or video work.

## Wave 2 Tasks After Prerequisites

- [ ] Fetch moderation log actions through `reddit.getModerationLog({ subredditName, limit, pageSize }).all()`.
- [ ] Fetch removal reasons through `reddit.getSubredditRemovalReasons(subredditName)`.
- [ ] Fetch subreddit rules through `reddit.getRules(subredditName)` or `subreddit.getRules()`.
- [ ] Normalize mod actions without assuming structured rule/removal IDs.
- [ ] Implement deterministic attribution with high/medium/low/unmatched confidence labels.
- [ ] Store scan summaries and raw-enough evidence in Redis without storing unnecessary sensitive content.
- [ ] Render Mirror Scan dashboard results with clear demo/live labeling.

## Do Not Start Yet

Do not implement these until Wave 1 contracts exist and the relevant runtime behavior is verified or explicitly demo-only:

- full Mirror Scan scoring beyond pure/unit-testable helpers
- policy editor
- Apply Policy enforcement flow
- public comment delivery as a default
- private message, modmail, or native Mod Notes delivery
- override audit dashboard
- Devpost final copy
