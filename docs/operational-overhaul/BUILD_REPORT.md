# Operational Overhaul Build Report

Date: 2026-05-18
Updated: 2026-05-20

Integrated branch: `integration/operational-overhaul`
Current merged branch: `master`

## Implemented

- Removed production-facing smoke-test menu labels and added real ModMirror
  post/comment Apply Policy menu entries.
- Added post/comment target context capture and dashboard handoff.
- Added target-aware Apply Policy preview, evidence, comparable context, and
  explicit confirmation.
- Added gated moderation execution service; real Reddit actions remain disabled
  until safe runtime proof exists.
- Added immutable action receipts and receipt APIs.
- Added full scan persistence, scan history, comparison routes, and deep scan
  depth controls.
- Added drift-over-time analytics from scans and receipts.
- Added policy draft/propose/review/adopt lifecycle.
- Added receipt-backed Case Packets v2.
- Added disabled-by-default AI advisory spike.
- Added preview-first team delivery spike with manual/skipped receipts.
- Reframed UI around Act / Scan / Agree / Review / Prove / Settings.
- Added runtime verification matrix endpoint and docs.
- Added protected moderator access diagnostics with a full-access-only
  visibility gate for future per-mod surfaces.
- Added a Settings manual runtime capability event recorder for safe proof
  bookkeeping.
- Added a policy message-delivery guard that keeps policy defaults `log_only`
  until public comment delivery ordering and identity are runtime-proven.

## Branches / Worktrees

- W00-W13 wave branches: `overhaul/w00-truth-and-control` through
  `overhaul/w13-runtime-verification`.
- Integration branch: `integration/operational-overhaul`.
- Integration worktree:
  `/Users/arshdeepsingh/Developer/modmirror-integration-operational-overhaul`.

Post-merge cleanup update:

- W00-W14, W16-W34, and post-W34 local worktrees were removed after all
  checked branch tips were confirmed merged and clean.
- Local merged wave branches were deleted.
- The merged remote branch `post34/runtime-smoke-controls` was deleted.
- The only remaining local worktree is the root `master` worktree.

## Validation

Integrated local checks:

- `npm install` - passed, with existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/server/services/runtimeVerification.test.ts src/server/services/moderationExecution.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
  - passed, 4 files and 20 tests.
- `npm run lint` - passed.
- `npm test` - passed, 24 files and 107 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime proof obtained before integration:

- W13 `npm run dev` reached playtest ready for `r/modmirror_dev` on
  `v0.0.1.71`.
- Subreddit dashboard launcher and confirmation form were visible to the
  moderator account.
- W12 operational IA rendered inside Reddit's desktop expanded WebView modal.

Post-W34 runtime proof obtained after integration:

- PR #12 merged into `master` with merge commit
  `7598f122fc704468bd01d212575b87741fb7ef2c`.
- `npm run dev` from `master` uploaded Devvit playtest `v0.0.1.120`.
- Computer Use verified the Reddit-hosted launch card, dashboard open,
  fullscreen host mode, Agree page, and Settings runtime matrix on the latest
  playtest without taking moderation/write actions.
- Follow-up Devvit playtest `v0.0.1.121` used Computer Use in Zen to verify the
  embedded launch card, dashboard open, Act, Scan, Review, and Prove in both
  Reddit host `Mobile` and `Fullscreen` modes. This proof is based on the
  rendered accessibility tree; the Computer Use bitmap payload was blank/white
  during the session, so no new pixel screenshot proof is claimed.
- Follow-up Devvit playtest `v0.0.1.122` verified W29 subreddit isolation
  through authenticated WebView API probes: `/api/health` returned
  `modmirror_dev` / `BrightyBrainiac`, default and explicit-current policy
  reads stayed in the current namespace, `ExampleLearning` remained the labeled
  demo exception, and cross-subreddit query/body requests returned isolation
  errors before any write. The Devvit JWT was redacted from docs.
- Earlier post-W34 playtests verified safe Redis smoke, Reddit read-only smoke,
  post/comment Apply Policy menu target capture, log-only receipt persistence,
  receipt-backed Evidence Boards and Case Packets, Incident Mode receipt
  tagging, config import/export, privacy dry-run controls, response preview
  receipts, review health, policy impact, attribution correction, replay, and
  policy ratification paths.
- A static client smoke check for the Settings manual runtime event recorder
  rendered from `dist/client` in Safari at
  `http://127.0.0.1:4173/?manualEvent=1#settings`; no Devvit playtest was run
  for that UI follow-up.

Post-W34 merged validation:

- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 43 files and 186 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest post-W34 merged validation after the access-gate and manual-event
recorder follow-ups:

- `npm test -- src/server/services/moderatorAccess.test.ts src/routes/apiAccess.test.ts`
  - passed.
- `npm test -- src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 45 files and 201 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest post-W34 validation after the policy message-delivery guard:

- `npm test -- src/server/services/policies.test.ts` - passed, 11 tests.
- `npm test -- src/server/services/policies.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed, 2 files and 14 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 45 files and 204 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest post-W34 validation after the team delivery scheduler guard:

- `npm test -- src/server/services/teamDelivery.test.ts` - passed, 1 file and
  6 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 208 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest post-W34 validation after the synthetic multi-community fixture:

- `npm test -- src/server/services/syntheticEval.test.ts` - passed, 1 file and
  6 tests.
- `node scripts/synthetic-eval.mjs` - passed.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 209 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest post-W34 validation after the Redis sorted-set diagnostic:

- `npm test -- src/server/services/redis.test.ts src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed, 3 files and 12 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 47 files and 212 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Latest Redis sorted-set runtime follow-up:

- `npx devvit whoami` - passed as `u/BrightyBrainiac`.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `npm test` - passed, 47 files and 212 tests.
- `npm run dev` - reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror` on
  `v0.0.1.131`.
- Reddit desktop WebView Settings `Run Redis ZSET` - failed as useful runtime
  evidence: `Redis sorted-set smoke order mismatch: expected newest, middle,
  oldest, observed .` The capability matrix recorded `redis-zset-ordering` as
  failed.
- Follow-up local diagnostic enhancement:
  `npm test -- src/server/services/redis.test.ts src/routes/apiAccess.test.ts`
  passed, 2 files and 9 tests.
- Follow-up local diagnostic enhancement: `npm run type-check` passed.
- Follow-up local diagnostic enhancement: `npm run lint` passed.
- Follow-up local diagnostic enhancement: `npm test` passed, 47 files and
  212 tests.
- Follow-up local diagnostic enhancement: `npm run build` passed.
- Follow-up local diagnostic enhancement: `git diff --check` passed.

## Known Gaps

- Post/comment Apply Policy menus need focused runtime proof in post/comment
  detail contexts. Closed for desktop Reddit WebView by post-W34 proof.
- Devvit Redis receipt/scan/policy persistence needs route-level runtime proof.
  Closed for selected safe routes by post-W34 proof; live modqueue reads and
  destructive cleanup remain unverified.
- W29 context-derived subreddit isolation is closed for Devvit Web request
  context; cross-community dashboards and same-subreddit live modqueue item
  reads remain separate gaps.
- Server-side protected API moderator access checks are locally verified for
  live subreddit context, and the guarded build reached Devvit playtest ready
  on `v0.0.1.126`. Protected `/api/access/diagnostics` is locally verified for
  current-user permission capture; a follow-up Devvit WebView diagnostic on
  `v0.0.1.129` returned current moderator permission `all`. True non-mod
  account runtime blocking and lower-permission moderator role strings remain
  separate gaps.
- The Settings manual runtime event recorder is locally and statically verified
  and route-tested for safe capabilities. It is a bookkeeping surface, not
  proof of destructive actions, native Mod Notes, Mod Discussion delivery,
  scheduler behavior, native mobile behavior, or non-mod account blocking.
- Public comment/private message/modmail policy delivery defaults are locally
  guarded to `log_only`; public comment ordering, identity, and sticky behavior
  remain unverified.
- The post-W34 host UI sweep is closed for accessibility-tree proof in Reddit
  desktop host Mobile/Fullscreen modes; native Reddit mobile app behavior and
  new pixel-level visual proof remain separate gaps.
- Real Reddit remove/approve/ignore-reports execution is intentionally disabled.
- Native mobile, Mod Discussion delivery, scheduler, native Mod Notes, and
  external AI are unverified/disabled.
- Redis sorted-set ordering now has a safe local diagnostic endpoint, and
  Devvit playtest `v0.0.1.131` proved the current runtime path fails with an
  empty observed order. The route now exposes add count, cardinality, row
  count, observed scores, and score checks for the next playtest. Practical
  Redis storage limits remain unverified.
- `npm install` continues to report inherited audit findings; W14 did not
  change dependency versions.

## Next Engineering Risks

- Expansion waves must not build on unverified destructive behavior.
- Any feature that uses post/comment context must first close the W13 menu proof
  gap.
- Runtime receipts should be verified before relying on analytics or case
  packets as live proof.
