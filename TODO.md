# TODO.md — Current Work Queue

## Current Phase

Expansion Wave 22 — Policy Impact is in progress on
`expansion/w22-policy-impact` after W21 community health.

The operational overhaul remains build-only/type-verified for several runtime
paths unless a wave report explicitly says playtest was run. Post/comment
Apply Policy menus, Devvit Redis receipt persistence, live Reddit moderation
execution, Mod Discussion delivery, scheduler, native Mod Notes, external AI,
non-mod access, and native mobile behavior remain unverified or disabled.

## Expansion Wave 22 Checklist

- [x] Add policy impact measurement schema.
- [x] Add before/after policy impact service.
- [x] Add policy impact API route.
- [x] Add policy-detail before/after UI.
- [x] Add demo-labeled impact fallback.
- [x] Add tests for thresholds, insufficient data, and demo labeling.
- [ ] Runtime-verify policy impact route through Devvit Web/Redis playtest.

## Expansion Wave 21 Checklist

- [x] Add aggregate community health schema.
- [x] Add aggregate-only community health service.
- [x] Include repeat-author buckets without exposing usernames.
- [x] Include unresolved overrides, policy churn, drift stability, and
      receipt-backed case packet readiness.
- [x] Add `/api/community-health`.
- [x] Surface community health on the Review page.
- [x] Add empty/small-community tests.
- [ ] Runtime-verify community health route through Devvit Web/Redis playtest.

## Expansion Wave 20 Checklist

- [x] Add read-only replay contracts.
- [x] Add replay service for stored or synthetic attributed actions.
- [x] Add replay API route under policy records.
- [x] Add policy replay UI on the Agree page.
- [x] Add replay fixtures and edge-case tests.
- [x] Keep replay from mutating action receipts or live Reddit state.
- [ ] Runtime-verify replay route against a stored scan in Devvit Web/Redis
      playtest.

## Expansion Wave 19 Checklist

- [x] Add explicit ratification settings and summary schema.
- [x] Add a pure policy ratification helper service.
- [x] Store proposal notes with proposed versions.
- [x] Enforce approval thresholds before reviewed adoption.
- [x] Keep quick adoption explicit and block it when policy settings disable it.
- [x] Show approval thresholds and proposal notes in the Agree UI.
- [x] Add threshold and invalid-transition tests.
- [ ] Runtime-verify policy lifecycle API writes through Devvit Web/Redis
      playtest.

## Expansion Wave 18 Checklist

- [x] Add attribution correction schema.
- [x] Add Redis-backed attribution correction persistence.
- [x] Apply moderator corrections during future scan attribution.
- [x] Preserve inferred/corrected distinction and original evidence.
- [x] Add correction API endpoints.
- [x] Add scan-page calibration UI for stored scan actions.
- [x] Add synthetic tests for correction persistence and future attribution.
- [ ] Runtime-verify correction persistence through Devvit Web/Redis playtest.

## Expansion Wave 17 Checklist

- [x] Research current Devvit modqueue/report API support from official docs
      and installed typings.
- [x] Record modqueue capability as type-only until playtest proves it.
- [x] Add shared triage contracts for capability, queue item, policy hint,
      history summary, and response.
- [x] Add read-only triage service that normalizes Reddit queue items.
- [x] Add `/api/modqueue/triage` without demo/fake queue fallback.
- [x] Surface Operational Queue triage on the Act page.
- [x] Link triage items into Apply Policy target fields.
- [x] Add targeted service tests for capability, normalization, adapter failure,
      and missing subreddit context.
- [ ] Runtime-verify `/api/modqueue/triage` in Devvit playtest with safe queue
      content.

## Expansion Wave 16 Checklist

- [x] Create `docs/expansion-waves/REPO_CONTEXT_RELOAD.md` before production
      coding.
- [x] Add content snapshot schema/types.
- [x] Add content snapshot server service.
- [x] Capture target snapshots in Apply Policy previews.
- [x] Persist snapshots on action receipts.
- [x] Surface receipt-backed snapshots in Case Packets.
- [x] Add content snapshot tests for post, comment, failed fetch, and missing
      target.
- [x] Add Wave 16 implementation report.
- [x] Run full W16 validation gate.
- [ ] Runtime-verify snapshots through real post/comment menu entrypoints in
      Devvit playtest.

Wave 9/10 — Digest, Delivery Status, Launch Hardening.

Status: Wave 7/8 and the redesign rescue branch are merged to `master` and
pushed to `origin` through PR #11. Wave 9/10 implementation and runtime QA are
merged to `master` and pushed to `origin`.

The first Wave 9 slice adds persisted digest contracts, a deterministic server
digest engine, Redis-backed digest history, digest API routes, an upgraded
Digest page, and digest capability status in Settings. Manual digest plus
Markdown copy remains the supported launch path. Mod discussion delivery and
weekly scheduling are still disabled/unverified until runtime proof exists.

Scheduler, AI/LLM judging, automatic bans, queue-dashboard scope, and external
analytics remain out of scope.

## Wave 9/10 Launch Checklist

- [x] Wave 7/8 merged to `master` before Wave 9/10 began.
- [x] Wave 9/10 prompts installed in root `docs/`, `prompts/wave9-10/`, and `scripts/`.
- [x] Integration branch created: `integration/wave9-10-launch-readiness`.
- [x] Digest contracts and constants added.
- [x] Deterministic digest engine added.
- [x] Digest history persists in Redis data model.
- [x] Digest API routes added.
- [x] Digest page upgraded with preview, recommendations, Markdown export, and history.
- [x] Settings shows digest delivery/scheduler capability status.
- [x] Mod discussion delivery remains disabled/unverified.
- [x] Scheduler remains disabled/unverified.
- [x] Static Digest/Settings visual QA captured.
- [x] `npm audit` reviewed and documented.
- [x] Launch readiness checklist filled with local/static/runtime evidence.
- [x] App listing draft complete.
- [x] Devpost draft complete.
- [x] Screenshot/video plan complete.
- [x] Final Wave 9/10 report complete.
- [x] Runtime playtest re-run for Wave 9/10.
- [x] Full final checks pass.
- [x] Integration branch merged to `master` after checks.
- [x] `master` pushed to `origin` after Wave 9/10 merge.

## Wave 7/8 Productization Status

Wave 7/8 is complete and merged. The client starts as a compact inline launch
card, opens into the Command Center IA, carries the ExampleLearning demo through
scan -> policy -> Apply Policy -> review -> Case Packet -> digest, exposes
runtime Settings, and preserves the Devvit expanded-modal viewport dropdown.

## Wave 7/8 Productization Checklist

- [x] Compact inline launch/status card implemented.
- [x] New IA implemented: Command Center, Scan, Policies, Review, Case Packets, Digest, Settings.
- [x] Command Center is the first dashboard screen.
- [x] Setup wizard and ExampleLearning demo scenario are visible from Command Center.
- [x] Policy health, override inbox, and Case Packet UI are upgraded.
- [x] Manual Digest generates Markdown without adding scheduler scope.
- [x] Runtime Settings shows data mode, health caveats, delivery mode, demo state, and last scan context.
- [x] Demo/static-preview fallbacks keep the 3-minute story usable without live API access.
- [x] Full final checks pass.
- [x] Runtime playtest is re-run for Wave 7/8.
- [x] Integration branch is merged to `master` and pushed.
- [x] Post-merge redesign rescue branch created after user rejected visual quality.
- [x] Redesign branch build/type-check/lint/tests pass.
- [x] Redesign branch reaches Devvit playtest ready.
- [x] Redesign branch inline card renders in signed-in Safari Reddit playtest.
- [x] Redesign branch native expanded modal opens with Devvit viewport dropdown.
- [x] Redesign branch demo workflow works end-to-end in signed-in Safari playtest.
- [x] Redesign branch pushed to `origin/redesign/wave7-8-command-center-ui`.
- [x] Draft PR opened for redesign review: `https://github.com/Arshgill01/ModMirror/pull/11`.
- [x] User reviews redesigned UI and gives explicit green light.
- [x] Merge `redesign/wave7-8-command-center-ui` to `master` if approved.

## Wave 6 Case Packet Checklist

- [x] Case packet shared contracts and DTOs exist.
- [x] Case packet generator works from demo data.
- [x] Generator can target stored Apply Policy action IDs.
- [x] Policy version/snapshot at action time is shown when recorded.
- [x] Policy changes after the action are caveated.
- [x] Override context and review status appear when present.
- [x] Prior same-user same-rule history appears when available.
- [x] Comparable cases use deterministic filters and match reasons.
- [x] Suggested appeal posture is deterministic and caveated.
- [x] Markdown export/copy UI exists.
- [x] Unit tests cover engine, posture, comparables, markdown, missing data,
  and demo generation.
- [x] `npm run dev` reaches Devvit Playtest ready.
- [x] Runtime browser proof of dashboard Case Packet generation from the
  playtest UI, including Markdown copy/export.

## Wave 5 Governance Core Checklist

- [x] Policy edits create immutable versions.
- [x] Active policy version pointer is stored.
- [x] Old policy versions remain readable.
- [x] Apply Policy action logs include policy version/snapshot when available.
- [x] Overrides default to unresolved review status.
- [x] Override review updates preserve original override event fields.
- [x] Policy health supports stable/watch/at_risk/needs_review/insufficient_data.
- [x] Governance dashboard shows policy health, override review inbox, and version summaries.
- [x] Demo mode still works.
- [x] Build/typecheck/lint/tests pass after integration.
- [x] Runtime/playtest status is recorded honestly.

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
- [x] Browser UI proof that signed-in Safari opens the playtest subreddit and shows the dashboard launcher.
- [x] Browser UI proof that the dashboard launcher confirmation form opens without creating a post.
- [x] Browser UI proof that the dashboard custom post renders after approval to submit the confirmation form.

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

## Operational Overhaul W10 Follow-up

- [x] Add disabled-by-default AI advisory contracts and capability endpoint.
- [x] Add mocked-provider tests that require deterministic evidence citations.
- [x] Keep AI advisory unable to decide or execute enforcement.
- [ ] Runtime-verify Devvit external fetch with a safe test provider before
      enabling any live AI advisory path.
- [ ] Runtime-verify Devvit app secret retrieval for any provider key before
      marking AI advisory available.
- [ ] Add Terms/Privacy readiness notes before any uploaded build uses
      external fetch for AI.

## Operational Overhaul W11 Follow-up

- [x] Add team delivery capability states for manual copy, mod discussion, and
      scheduler.
- [x] Add preview-first delivery APIs for digest/policy proposal content.
- [x] Store manual/skipped delivery receipts without sending Reddit messages.
- [x] Keep product routes from injecting a live delivery adapter.
- [ ] Runtime-verify internal Mod Discussion delivery on a safe test subreddit
      before enabling any real send path.
- [ ] Register and runtime-verify a scheduler task before scheduler delivery is
      marked anything stronger than unavailable.
- [ ] Verify permission failure shape and no accidental user-facing delivery.

## Operational Overhaul W12 Follow-up

- [x] Reframe the dashboard around Act, Scan, Agree, Review, Prove, and
      Settings.
- [x] Put Apply Policy and the action receipt ledger on the Act workspace.
- [x] Move policy lifecycle work into Agree and proof artifacts into Prove.
- [x] Capture static desktop and mobile screenshots for the Act workspace.
- [ ] Runtime-verify the new IA inside Devvit WebView on desktop Reddit.
- [ ] Runtime-verify the new IA inside mobile/narrow Reddit WebView.
- [ ] Update any external docs/bookmarks that still reference the old page IDs
      after integration.

## Operational Overhaul W13 Follow-up

- [x] Add a runtime verification matrix endpoint.
- [x] Add a runtime verification matrix document.
- [x] Run Devvit playtest to readiness on `r/modmirror_dev`.
- [x] Verify the subreddit dashboard launcher appears and opens its
      confirmation form.
- [x] Verify the W12 operational IA renders inside Reddit's desktop expanded
      WebView.
- [ ] Verify post Apply Policy menu entry on an ordinary safe post detail page.
- [ ] Verify comment Apply Policy menu entry on an ordinary safe comment.
- [ ] Hit `/api/smoke/redis` in Devvit runtime and record a redacted read/write
      result.
- [ ] Hit `/api/smoke/reddit` in Devvit runtime and record redacted read-only
      context.
- [ ] Verify log-only Apply Policy creates a receipt in Devvit Redis.
- [ ] Verify native Reddit mobile app layout and interaction behavior.
