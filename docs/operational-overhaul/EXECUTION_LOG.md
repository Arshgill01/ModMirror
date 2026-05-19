# Operational Overhaul Execution Log

Created: 2026-05-18

## Run Boundary

This is a `/goal` run for building the operational overhaul. It is not a
submission-prep run. Do not work on Devpost, public publishing, final demo
video, app-store launch, public community outreach, or final submission assets.

## Active Objective

Turn ModMirror from a polished governance/demo dashboard into an operational
Reddit moderation tool with real post/comment entrypoints, target context,
safe confirmed execution, receipts, scan history, policy agreement, evidence,
and runtime proof.

## Timeline

### 2026-05-18 - Mandatory Preload

Commands run from `/Users/arshdeepsingh/Developer/ModMirror`:

- `pwd`
- `git status --short`
- `git branch --show-current`
- `git log --oneline --decorate -n 40`
- `find . -maxdepth 3 -type f -not -path './node_modules/*' -not -path './.git/*' | sort`
- `find . -name AGENTS.md -not -path './node_modules/*' -not -path './.git/*' -print`
- `find . \( -path './node_modules' -o -path './.git' -o -path './dist' \) -prune -o -type f \( -iname '*exec*' -o -iname '*plan*' -o -iname '*report*' -o -iname '*prompt*' \) -print | sort`
- `rg -n "ExecPlan|EXEC_PLAN|execution plan|wave|operational|launch readiness|runtime proof|playtest|policy|Apply Policy|case packet|digest" AGENTS.md PLAN.md README.md TODO.md RESEARCH.md TREE.txt docs prompts scripts modmirror_operational_overhaul_spec_pack src -S`
- `find src -maxdepth 5 -type f | sort`
- `git worktree list`
- `git branch --all --format='%(refname:short)' | sort`
- `git fetch origin --prune`
- `git pull --ff-only origin master`
- `git worktree add ../modmirror-w00-truth-and-control -b overhaul/w00-truth-and-control master`

Findings:

- `master` was up to date with `origin/master`.
- The only starting untracked path was
  `modmirror_operational_overhaul_spec_pack/`.
- Existing code confirms the operational-overhaul spec's core gaps:
  smoke menu labels remain, Apply Policy is log-only, scan persistence is
  metadata-only, and policy agreement is CRUD/versioning rather than true
  agreement.

### 2026-05-18 - Context Index

Created this W00 control set:

- `docs/operational-overhaul/REPO_CONTEXT_INDEX.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave00-truth-control.md`

No product behavior was changed in W00.

## Baseline Validation

Initial gate attempt before dependency install:

- `npm run type-check` - failed because this fresh worktree had no
  `node_modules`; TypeScript could not resolve Devvit, Vite, or Vitest modules.
- `npm run lint` - failed because `typescript-eslint` was not installed in the
  worktree.
- `npm test` - failed because `vitest` was not installed in the worktree.
- `npm run build` - failed because `vite` was not installed in the worktree.

Dependency install:

- `npm install` - passed. npm reported existing audit findings: 31
  vulnerabilities, with 3 low, 27 high, and 1 critical.

Final baseline after dependency install:

- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 15 files and 67 tests.
- `npm run build` - passed, build completed in 4412 ms.

Runtime playtest was not attempted for W00 and is not claimed here.

## Open Risks

- Prior launch/submission docs exist, but this overhaul must not continue
  submission work.
- Prior runtime proof covers demo and digest flows, not real moderation
  execution.
- Unverified Reddit APIs must stay disabled or capability-labeled until
  playtest proves exact behavior.

### 2026-05-19 - Post-W34 Merge, Runtime Proof, And Cleanup

Commands run from `/Users/arshdeepsingh/Developer/ModMirror` after PR #12:

- `git fetch origin master`
- `git pull --ff-only origin master`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`
- `npx devvit whoami`
- `npm run dev`
- `git fetch origin --prune`
- `git worktree list --porcelain`
- `git branch --format='%(refname:short)'`
- `git push origin --delete post34/runtime-smoke-controls`
- `gh pr view 12 --json state,mergedAt,mergeCommit,url,headRefName,baseRefName`

Findings and results:

- PR #12 merged to `master` at
  `7598f122fc704468bd01d212575b87741fb7ef2c`.
- `master` and `origin/master` both resolved to `7598f12`.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test` passed, 43 files and 186 tests.
- `npm run build` passed.
- `git diff --check` passed.
- `npx devvit whoami` returned `u/BrightyBrainiac`.
- `npm run dev` uploaded playtest `v0.0.1.120` for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Computer Use verified the latest Reddit-hosted launch card, dashboard open,
  fullscreen host mode, Agree page, and Settings runtime matrix without taking
  Reddit moderation/write actions.
- All non-master local worktrees were checked as merged and clean, then
  removed.
- All merged local wave branches were deleted.
- The merged remote branch `post34/runtime-smoke-controls` was deleted.
- The remaining root untracked spec-pack directories were left untouched.

Open after this cleanup:

- Native Reddit mobile behavior, non-mod access checks, exact moderator
  permission shape, real Reddit moderation execution, actual retention
  deletion, native Mod Notes, Mod Discussion delivery, scheduler behavior, live
  modqueue reads, and external AI remain unverified or disabled.

### 2026-05-19 - Post-W34 UI And W29 Runtime Proof Reconciliation

Follow-up proof branches after PR #12:

- PR #14 merged UI sweep proof at
  `0c9b574f9d17f58172a46129997884720573e6d1`.
- PR #15 merged W29 subreddit-isolation runtime proof at
  `51e002dd7f0cdab8445be159b991747c75054d84`.

Runtime proof added:

- Devvit playtest `v0.0.1.121` verified the embedded launch card plus Act,
  Scan, Review, and Prove in Reddit host Mobile and Fullscreen modes by
  Computer Use accessibility-tree inspection. No Reddit writes or moderation
  actions were taken.
- Devvit playtest `v0.0.1.122` verified W29 context-derived subreddit
  isolation through authenticated WebView API probes. `/api/health` returned
  `modmirror_dev` / `BrightyBrainiac`; default and explicit-current policy
  reads stayed scoped to `modmirror_dev`; the labeled `ExampleLearning` demo
  namespace remained allowed; cross-subreddit query routes returned
  `403 subreddit_isolation_failed`; and a cross-subreddit policy creation body
  returned `400 policy_validation_failed` before any write. The Devvit JWT was
  redacted from docs.

Validation:

- `git diff --check` - passed.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 43 files and 186 tests.
- `npm run build` - passed.

Open after this reconciliation:

- Real Reddit remove/approve/ignore-reports execution, native Reddit mobile,
  non-mod access blocking, native Mod Notes, Mod Discussion delivery,
  scheduler behavior, actual retention deletion, same-subreddit live modqueue
  item reads, multi-moderator ratification proof, and external AI remain
  unverified or disabled.

### 2026-05-20 - Post-W34 Access Gate And Manual Runtime Event Recorder

Follow-up branches after the runtime-proof reconciliation:

- PR #24 merged the full-access visibility gate at
  `365541ea145105717c2f554c3e3fc88c1d65cdb1`.
- PR #25 merged the Settings manual runtime event recorder at
  `51bdd1c450c51238591c8fd78230cea8f201a990`.

Implemented:

- Added a `ModeratorVisibilityLevel` helper so future per-mod/manage-level
  surfaces stay `aggregate_only` unless the runtime-probed moderator
  permission set includes `all`.
- Extended protected `/api/access/diagnostics` and Settings access diagnostic
  copy with the visibility gate result.
- Added a Settings form for recording manual runtime capability observations
  against safe, event-updatable capabilities.
- Added route coverage proving a protected manual runtime event write updates
  the runtime capability matrix.
- Updated runtime-capability docs to make clear that manual events are
  bookkeeping evidence, not proof for destructive or unsafe capability rows.

Validation:

- `npm test -- src/server/services/moderatorAccess.test.ts src/routes/apiAccess.test.ts`
  - passed.
- `npm test -- src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 45 files and 201 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Static UI verification for the manual event recorder:

- `npx vite --host 127.0.0.1 --port 4173 --strictPort` failed because the
  Devvit Vite plugin only supports `vite build`.
- `npx --yes http-server dist/client -a 127.0.0.1 -p 4173` served the built
  client successfully.
- Safari opened `http://127.0.0.1:4173/?manualEvent=1#settings`; the Settings
  page rendered the manual runtime event panel and disabled static-preview
  state without visible overlap.

Open after these follow-ups:

- The visibility gate is conservative and locally verified, but true non-mod
  runtime blocking and lower-permission moderator role strings remain
  unverified.
- The manual event recorder reduces proof-recording friction, but it does not
  close native mobile, real Reddit moderation execution, native Mod Notes, Mod
  Discussion delivery, scheduler, actual retention deletion, live modqueue
  item read, or external AI gaps.

## W00 Commit Plan

Commit only the new `docs/operational-overhaul/` control documents. The
temporary `npm install` lockfile drift was restored before commit.

### 2026-05-18 - W01 Entrypoints And Target Context

Created worktree:

- `git worktree add ../modmirror-w01-entrypoints-context -b overhaul/w01-entrypoints-context overhaul/w00-truth-and-control`

Implemented W01:

- Replaced post/comment `ModMirror smoke test` menu entries in `devvit.json`
  with `Apply ModMirror Policy`.
- Removed smoke form/menu exposure from Devvit config.
- Added `src/server/services/targetContext.ts` for post/comment target type,
  author, subreddit, title/body/permalink, current moderator, and mod
  permission capture.
- Added unit tests for target type and target context resolution.
- Added post/comment menu handlers that open a target context form.
- Added an Apply Policy target form submit path that creates the dashboard post
  and navigates with target context in the hash.
- Updated the client hash parser so the existing Apply Policy panel receives
  target ID and author from the menu handoff.

W01 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/targetContext.test.ts` - passed, 4 tests.
- `npm test` - passed, 16 files and 71 tests.
- `npm run build` - passed.

Runtime playtest was not run in W01, so menu visibility, form UX, target fetch,
and permission values remain type/build-only.

### 2026-05-18 - W02 Recommendation Core

Created worktree:

- `git worktree add ../modmirror-w02-recommendation-core -b overhaul/w02-recommendation-core overhaul/w01-entrypoints-context`

Implemented W02:

- Expanded the shared Apply Policy preview contract with policy snapshots,
  target snapshots, evidence rows, and confirmation metadata.
- Added Apply Policy input validation for selected action, source, target
  thing ID shape, and target type mismatches.
- Updated server preview generation so it reports target context, policy
  version, ModMirror-tracked offense history, and the current log-only safety
  state.
- Preserved `confirmApplyPolicy` as log-only and reused the preview policy
  snapshot for action and override records.
- Updated the API normalizer to pass optional target title/body/permalink/type
  fields through to the service.
- Updated the dashboard Apply Policy preview to render evidence and explicit
  log-only confirmation copy. Client demo fallback now returns the full preview
  shape and stays labeled as demo/log-only.
- Added service tests for target-aware preview, missing target caveats,
  unsupported target IDs, and target type mismatch rejection.

W02 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/applyPolicy.test.ts` - passed, 7 tests.
- `npm test` - passed, 16 files and 74 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W02. Apply Policy remains log-only; no Reddit
moderation execution is attempted or claimed.

### 2026-05-18 - W03 Moderation Execution

Created worktree:

- `git worktree add ../modmirror-w03-moderation-execution -b overhaul/w03-moderation-execution overhaul/w02-recommendation-core`

Implemented W03:

- Added typed moderation execution schema for execution mode, result status,
  Reddit operation, capability state, and execution result metadata.
- Added `src/server/services/moderationExecution.ts` with gated execution for
  `remove`, `approve`, and `ignore_reports`.
- Added explicit confirmation enforcement on Apply Policy confirm requests.
- Integrated execution results into Apply Policy confirmation and persisted
  action events.
- Added default feature/capability gates:
  `MODMIRROR_ENABLE_LIVE_REDDIT_ACTIONS`,
  `MODMIRROR_REDDIT_ACTIONS_RUNTIME_VERIFIED`, and
  `MODMIRROR_ACTION_RECEIPTS_AVAILABLE`.
- Kept product-integrated live Reddit execution disabled by default because W04
  receipts and runtime proof are not complete.
- Updated the client payload to send explicit confirmation and display execution
  success/failure/skipped context after confirmation.
- Added mocked execution tests for disabled gates, missing receipts, live
  success, permission failure, and ignore-reports target model calls.

W03 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/moderationExecution.test.ts src/server/services/applyPolicy.test.ts` - passed, 15 tests.
- `npm test` - passed, 17 files and 82 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W03. The Reddit execution code path is covered
by installed typings and mocked tests only; live execution must remain disabled
until W04 receipts and safe playtest proof are complete.

### 2026-05-18 - W04 Action Receipts Ledger

Created worktree:

- `git worktree add ../modmirror-w04-receipts-ledger -b overhaul/w04-receipts-ledger overhaul/w03-moderation-execution`

Implemented W04:

- Added `ActionReceipt` shared schema with target snapshot, policy snapshot,
  recommendation, selected action, override context, execution result, Reddit
  operation, capability state, and timestamp fields.
- Added Redis receipt keys for global receipt ledger, receipt detail, and
  per-target receipt indexes.
- Added `src/server/services/receipts.ts` for receipt input creation,
  persistence, detail lookup, subreddit listing, and target listing.
- Updated Apply Policy confirm to create a receipt for every confirmed action.
- Added `/api/receipts`, `/api/receipts/:id`, and
  `/api/receipts/target/:targetThingId`.
- Updated the dashboard confirmation result copy to display receipt IDs and
  execution outcome.
- Updated W03 execution capability defaults so receipt availability is true by
  default after W04 unless explicitly disabled.

W04 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/receipts.test.ts src/server/services/applyPolicy.test.ts` - passed, 10 tests.
- `npm test` - passed, 18 files and 84 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W04. Receipt persistence is locally verified
with mocked Redis only; live Reddit execution remains disabled unless runtime
proof flags are explicitly enabled.

### 2026-05-18 - W05 Full Scan Persistence

Created worktree:

- `git worktree add ../modmirror-w05-scan-persistence -b overhaul/w05-scan-persistence overhaul/w04-receipts-ledger`

Implemented W05:

- Added `MirrorScanRecord` and `MirrorScanComparison` shared schema.
- Added `SCAN_HISTORY_LIMIT`.
- Added full scan record storage in `src/server/services/scans.ts`.
- Persisted attributed actions, unmatched actions, drift candidates, warnings,
  confidence evidence, and retention metadata.
- Added capped metadata indexes by subreddit and scan source.
- Added rule and anonymized target-author indexes for future analytics.
- Updated `runMirrorScan` to save full records instead of metadata only.
- Added `/api/scans`, `/api/scans/:id`, and `/api/scans/compare`.
- Added local scan persistence tests for demo/live separation and comparison.

W05 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/scans.test.ts src/server/services/mirrorScan.test.ts` - passed, 5 tests.
- `npm test` - passed, 19 files and 86 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W05. Full scan persistence is locally verified
with mocked Redis only.

### 2026-05-18 - W06 Deep Scan

Created worktree:

- `git worktree add ../modmirror-w06-deep-scan -b overhaul/w06-deep-scan overhaul/w05-scan-persistence`

Implemented W06:

- Inspected installed Devvit `Listing` and `getModerationLog` typings for
  `limit`, `pageSize`, `after`, and `before` support.
- Added `MirrorScanDepth` and `MirrorScanDepthMetadata` shared contracts.
- Added conservative depth caps:
  - `quick`: 25 actions, page size 25
  - `standard`: 60 actions, page size 60
  - `deep`: 250 actions, page size 100
- Added depth metadata to Mirror Scan and persisted scan records.
- Updated the live Reddit source adapter to pass depth-specific `limit` and
  `pageSize`, record fetched count, record cap-hit state, and warn that
  pagination is not runtime-verified.
- Updated `/api/scan` to accept a `depth` field.
- Updated the client Scan page with Quick, Standard, and Deep live scan actions
  and scan-depth summary display.
- Added mocked live-source tests for default standard depth, deep caps,
  cap-hit warnings, and fetch-failure fallback.

W06 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test -- src/server/services/redditSources.test.ts src/server/services/mirrorScan.test.ts src/server/services/scans.test.ts` - passed, 9 tests.
- `npm test` - passed, 20 files and 90 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W06. Deep scan pagination is type/build-only and
must not be claimed as runtime-verified.

### 2026-05-18 - W07 Drift Analytics

Created worktree:

- `git worktree add ../modmirror-w07-drift-analytics -b overhaul/w07-drift-analytics overhaul/w06-deep-scan`

Implemented W07:

- Added shared consistency analytics contracts for data quality, rule drift
  trend points, policy impact windows, and overall analytics summaries.
- Added `src/server/services/analytics.ts` to compute drift-over-time trends
  from persisted `MirrorScanRecord` values and policy impact from W04 action
  receipts.
- Anchored policy impact windows on the active policy version timestamp from
  the policy record and kept insufficient/new-policy states explicit when
  receipt history is too thin.
- Added `/api/analytics/consistency`.
- Added a Review page consistency-over-time panel that reports scan count,
  receipt count, top trend, policy impact status, and caveats.
- Added demo fallback analytics with clear demo-only caveats for static
  preview.
- Added focused analytics tests for improving trend/impact and insufficient
  data behavior.

W07 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm test -- src/server/services/analytics.test.ts` - passed, 2 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 21 files and 92 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W07. Consistency analytics are locally verified
only; Redis-backed scan/receipt reads and the Review UI panel still need
Devvit playtest proof.

### 2026-05-18 - W08 Policy Agreement Lifecycle

Created worktree:

- `git worktree add ../modmirror-w08-policy-agreement -b overhaul/w08-policy-agreement overhaul/w07-drift-analytics`

Implemented W08:

- Added policy lifecycle states: `draft`, `proposed`, `under_review`,
  `adopted`, `superseded`, and `archived`.
- Added proposal metadata, proposal source metadata, policy review records,
  review decisions, and adoption metadata to shared policy/version contracts.
- Changed new policy saves into draft versions instead of immediately active
  policies.
- Added policy lifecycle service operations:
  - propose a draft version for review;
  - record review decisions;
  - adopt proposed/reviewed versions;
  - supersede prior adopted versions when a new version is adopted.
- Kept Apply Policy scoped to adopted active policy versions. Drafts and
  proposals are visible in Agree, but not used as enforcement policy.
- Added `/api/policies/:id/propose`, `/api/policies/:id/reviews`, and
  `/api/policies/:id/adopt`.
- Updated the Policies page to show lifecycle state, review counts, and
  propose/review/quick-adopt controls. The quick-adopt path is labeled as
  single-mod quick adoption.
- Added static/demo fallback handling for lifecycle button interactions.
- Updated policy lifecycle tests for draft creation, review/adoption,
  invalid transitions, legacy migration, and active-version snapshots.

W08 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm test -- src/server/services/policies.test.ts` - initially failed
  because the existing tests expected immediate active policy creation.
- `npm test -- src/server/services/policies.test.ts` - passed after updating
  tests for W08 lifecycle behavior, 5 tests.
- `npm test -- src/server/services/policies.test.ts src/server/services/applyPolicy.test.ts` - passed, 14 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 21 files and 93 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W08. Policy lifecycle persistence and APIs are
locally verified only; Devvit Redis/API/UI behavior still needs runtime proof.

### 2026-05-18 - W09 Case Packets v2

Created worktree:

- `git worktree add ../modmirror-w09-case-packets-v2 -b overhaul/w09-case-packets-v2 overhaul/w08-policy-agreement`

Implemented W09:

- Added Case Packet packet types:
  `appeal_context`, `internal_review`, and `policy_dispute`.
- Added evidence source labels:
  `verified_receipt`, `verified_modmirror_action`, `inferred_history`,
  `demo_seed`, and `missing`.
- Updated Case Packet schema to include receipt IDs, target snapshots,
  execution results, evidence labels, and packet type.
- Updated `casePacket.ts` to load action receipts in addition to action events
  and overrides.
- Made receipts the preferred action source when a receipt ID or matching
  action ID is available.
- Kept action-event fallback with explicit caveats when no immutable receipt is
  found.
- Added receipt-backed comparable labeling while preserving deterministic
  comparable-case matching.
- Updated Markdown and UI rendering to show packet type, receipt ID, execution
  result, and evidence labels.
- Added tests for receipt-backed packets, missing data, and
  policy-changed-since-action behavior.

W09 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - initially failed on exact optional property typing;
  fixed by tightening receipt/action conversion objects.
- `npm test -- src/server/services/casePacket.test.ts` - passed, 7 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 21 files and 94 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W09. Receipt-backed packet generation is
locally verified only; Devvit Redis/API/UI behavior still needs runtime proof.

### 2026-05-18 - W10 AI Advisory Spike

Created worktree:

- `git worktree add /Users/arshdeepsingh/Developer/modmirror-w10-ai-advisory-spike -b overhaul/w10-ai-advisory-spike overhaul/w09-case-packets-v2`

Implemented W10:

- Researched Devvit external fetch and secret-storage support using official
  docs and installed typings.
- Added AI advisory shared contracts for capability state, advisory kind,
  evidence inputs, requests, and responses.
- Added a disabled-by-default `aiAdvisory` service with no-provider fallback,
  mocked-provider generation support, evidence-citation validation, and
  moderator-review/enforcement-disabled response metadata.
- Added `/api/ai/capabilities` and `/api/ai/advisory`.
- Added Settings page capability labels for AI advisory and AI enforcement use.
- Added mocked-provider tests for disabled fallback, generated output, rejected
  uncited output, and prompt evidence IDs.

W10 validation so far:

- `npm install` - passed, with the existing 31 audit findings.
- `npm test -- src/server/services/aiAdvisory.test.ts` - passed, 5 tests.
- `npm run type-check` - initially failed on exact optional property typing in
  the client AI capability state.
- `npm run type-check` - passed after fixing the optional state assignment.
- `npm run lint` - passed.
- `npm test` - passed, 22 files and 99 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W10. No external AI call was made, no provider
secret was configured/read, and `devvit.json` HTTP permissions were not enabled.
AI advisory remains disabled by default and must stay that way until provider
configuration, Devvit secret access, external fetch, latency/failure behavior,
and terms/privacy requirements are runtime-proven.

### 2026-05-18 - W11 Team Delivery Spike

Created worktree:

- `git worktree add /Users/arshdeepsingh/Developer/modmirror-w11-team-delivery-spike -b overhaul/w11-team-delivery-spike overhaul/w10-ai-advisory-spike`

Implemented W11:

- Researched Devvit internal Mod Discussion and scheduler support using
  official docs and installed typings.
- Added team delivery capability state for manual Markdown copy, Mod
  Discussion delivery, and scheduler delivery.
- Added preview-first delivery contracts and APIs:
  `/api/delivery/capabilities`, `/api/delivery/preview`, and
  `/api/delivery/confirm`.
- Added Redis-backed delivery receipts for manual-ready and skipped delivery
  confirmation paths.
- Added a guarded adapter path for mocked tests only. Product routes do not
  inject an adapter and therefore do not send Reddit messages.
- Added Settings labels for team delivery and scheduler runtime status.
- Added focused tests for capability state, previews, manual receipts, skipped
  receipts, and explicitly enabled mocked sends.

W11 validation so far:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/server/services/teamDelivery.test.ts` - passed, 5 tests.
- `npm run lint` - passed.
- `npm test` - passed, 23 files and 104 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run in W11. No Modmail/Mod Discussion message was
sent, and no scheduler task was registered or run. Delivery receipt persistence
is locally verified only.

### 2026-05-18 - W12 Operational UI Reframe

Created worktree:

- `git worktree add /Users/arshdeepsingh/Developer/modmirror-w12-operational-ui -b overhaul/w12-operational-ui overhaul/w11-team-delivery-spike`

Implemented W12:

- Reframed the dashboard sections around operational moderator jobs:
  Act, Scan, Agree, Review, Prove, and Settings.
- Moved Apply Policy into the Act workspace and paired it with the current
  operational queue, guided setup, demo scenario, and receipt ledger.
- Moved policy CRUD/lifecycle into Agree as decision records.
- Moved case packets, manual digest, and before-after consistency analytics
  into Prove.
- Added legacy hash mapping for old page IDs.
- Added receipt ledger loading from `/api/receipts` and a standalone static
  preview fallback for screenshot review.
- Added responsive layout adjustments for desktop and narrow viewports.

W12 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/shared/productization.test.ts` - passed, 5 tests.
- `npm run lint` - passed.
- `npm test` - passed, 23 files and 104 tests.
- `npm run build` - passed.
- `git diff --check` - passed.
- `npx vite --host 127.0.0.1 --port 5174` - failed as expected because the
  Devvit Vite plugin only supports build mode.
- `npx --yes http-server dist/client -a 127.0.0.1 -p 5174` - served the static
  built client for screenshot review.
- `bash "$PWCLI" open http://127.0.0.1:5174/#act --config output/playwright/w12-operational-ui/desktop.config.json`
  - passed.
- `bash "$PWCLI" click e19` - passed.
- `bash "$PWCLI" screenshot --full-page --filename output/playwright/w12-operational-ui/act-desktop.png`
  - passed.
- `bash "$PWCLI" open http://127.0.0.1:5174/#act --config output/playwright/w12-operational-ui/mobile.config.json`
  - passed.
- `bash "$PWCLI" click e19` - passed.
- `bash "$PWCLI" screenshot --full-page --filename output/playwright/w12-operational-ui/act-mobile.png`
  - passed.

Screenshot artifacts:

- `output/playwright/w12-operational-ui/act-desktop.png` - 1440x1516.
- `output/playwright/w12-operational-ui/act-mobile.png` - 390x2851.

Runtime playtest was not run in W12. Static browser preview produced expected
`/api/*` 404 console entries because only `dist/client` was served; the UI
handled the receipt ledger without surfacing a static-preview failure.

### 2026-05-18 - W13 Runtime Verification Harness

Created worktree:

- `git worktree add /Users/arshdeepsingh/Developer/modmirror-w13-runtime-verification -b overhaul/w13-runtime-verification overhaul/w12-operational-ui`

Implemented W13:

- Added runtime verification shared schema and `GET /api/runtime-verification`.
- Added `src/server/services/runtimeVerification.ts` to classify operational
  capabilities as runtime-verified, local-verified, static-verified, type-only,
  disabled, unverified, or blocked.
- Added focused tests for runtime verification summary/context behavior and
  destructive execution safety labels.
- Added `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`.

W13 validation:

- `npm run type-check` - failed before `npm install` because `node_modules`
  were absent in the new worktree.
- `npm test -- src/server/services/runtimeVerification.test.ts` - failed before
  `npm install` because `vitest` was unavailable.
- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - failed once on exact optional `context.username`
  typing.
- `npm test -- src/server/services/runtimeVerification.test.ts` - passed, 3
  tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 24 files and 107 tests.
- `npm run build` - passed.
- `git diff --check` - passed.
- `npx devvit whoami` - passed as `u/BrightyBrainiac`.
- `npm run dev` - reached Playtest ready for `r/modmirror_dev` on
  `v0.0.1.71`.
- `screencapture -x output/runtime/w13/devvit-w12-act-modal-v0.0.1.71.png` -
  captured the expanded WebView proof.
- `npm test -- src/server/services/runtimeVerification.test.ts` - passed after
  updating matrix evidence.

Runtime proof recorded:

- Subreddit menu entry `Open ModMirror dashboard` appeared for the moderator.
- The subreddit dashboard launcher opened its confirmation form and was
  canceled; no new dashboard post was created.
- An existing dashboard post rendered the W12 Act / Scan / Agree / Review /
  Prove / Settings IA in Reddit's expanded WebView modal.
- Reddit host chrome and the `Mobile` viewport control remained visible.

Runtime proof gaps:

- Post/comment Apply Policy menus were not proven. The feed post overflow and
  moderator action menus checked during W13 did not show `Apply ModMirror
  Policy`; test ordinary post/comment detail contexts next.
- Redis smoke, Reddit smoke, target context, receipts, scan persistence, policy
  lifecycle persistence, non-mod blocking, native mobile, and all destructive or
  delivery features remain unverified unless earlier reports explicitly say
  otherwise.

### 2026-05-18 - W14 Integration

Created worktree:

- `git worktree add /Users/arshdeepsingh/Developer/modmirror-integration-operational-overhaul -b integration/operational-overhaul master`

Integrated operational overhaul:

- `git merge --ff-only overhaul/w13-runtime-verification` fast-forwarded the
  integration branch from `master` to the W13 tip.
- No merge conflicts occurred. W13 is a descendant of W00 through W12, so this
  fast-forward includes the full operational wave lane.
- Updated `README.md` to describe the integrated operational IA and current
  verified/unverified runtime truth.
- Added `docs/operational-overhaul/wave14-integration.md`.
- Added `docs/operational-overhaul/BUILD_REPORT.md`.

W14 validation:

- `npm install` - passed, with the existing 31 audit findings.
- `npm run type-check` - passed.
- `npm test -- src/server/services/runtimeVerification.test.ts src/server/services/moderationExecution.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
  - passed, 4 files and 20 tests.
- `npm run lint` - passed.
- `npm test` - passed, 24 files and 107 tests.
- `npm run build` - passed.
- `git diff --check` - passed.
- `git diff -- package-lock.json` - passed after restoring install churn.

Runtime playtest was not rerun in W14. W14 preserves W13 runtime proof and
records the remaining gaps in `BUILD_REPORT.md`.

### 2026-05-19 - Post-W34 Server Moderator Access Guard

Implemented local server-side moderator access checks for protected API routes:

- Added `src/server/services/moderatorAccess.ts`.
- Added `src/server/services/moderatorAccess.test.ts`.
- Added API middleware in `src/routes/api.ts` so protected routes require a
  signed-in user with a non-empty `getModPermissionsForSubreddit` result when
  Devvit supplies live subreddit context.
- Added `src/routes/apiAccess.test.ts` route-level middleware tests for public
  health metadata, denied protected access without a current user, and allowed
  moderator access with permissions.
- Added protected `GET /api/access/diagnostics` for current-user permission
  string capture.
- Left health/status/capability metadata routes public.
- Added client-side `access_denied` classification for moderator-access API
  failures.
- Updated runtime verification/capability matrices and current truth docs.

Validation:

- `npm run type-check` - passed.
- `npm test -- src/routes/apiAccess.test.ts` - passed, 1 file and 4 tests.
- `npm test -- src/server/services/moderatorAccess.test.ts src/server/services/runtimeVerification.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed, 3 files and 12 tests.
- `npm test -- src/shared/clientResilience.test.ts` - passed, 1 file and 5
  tests.

Runtime playtest for true non-mod account blocking was not run for this guard.
A follow-up Devvit WebView Settings diagnostic on `r/modmirror_dev` reached
playtest `v0.0.1.129` and returned
`Access check passed: 1 permission(s): all.` This verifies only the current
moderator account's permission string; true non-mod runtime blocking and
lower-permission moderator role strings remain unverified.

### 2026-05-20 - Post-W34 Policy Message Delivery Guard

Implemented a local guard for the remaining comment-delivery prerequisite:

- `src/server/services/policies.ts` now normalizes policy
  `defaultMessageMode` to `log_only` for create, update/import-style drafts,
  policy versions, adoption, snapshots, saved policies, and legacy indexed
  reads.
- `src/server/services/policies.test.ts` covers create, update/import-style
  drafts, stored versions, and legacy indexed reads that request non-log
  delivery modes.
- Runtime capability, current-truth, capability-matrix, runtime-matrix,
  research, and TODO docs now record that public comment delivery remains
  disabled while policy defaults are locally guarded.

Validation:

- `npm test -- src/server/services/policies.test.ts` - passed, 11 tests.
- `npm test -- src/server/services/policies.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed, 2 files and 14 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 45 files and 204 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run for this guard. Public comment ordering, comment
identity/sticky behavior, private message/modmail delivery, native Mod Notes,
and real Reddit moderation execution remain disabled or unverified.

### 2026-05-20 - Post-W34 Local Override Sorted-Set Ordering Test

Implemented local persistence coverage for the historical Redis override
ordering follow-up:

- Added `src/server/services/auditPersistence.test.ts`.
- The test writes three override events with out-of-order timestamps through
  `saveOverrideEvent` and verifies `listRecentAuditEvents` returns newest
  events first from `modmirror:{subreddit}:overrides`.
- Updated TODO, research, and capability docs to distinguish local coverage
  from the still-open runtime Redis sorted-set confirmation.

Validation:

- `npm test -- src/server/services/auditPersistence.test.ts src/server/services/audit.test.ts`
  - passed, 2 files and 5 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 205 tests.
- `git diff --check` - passed.

Runtime playtest was not run for this local test slice. Exact Devvit Redis
sorted-set ordering remains a runtime follow-up.

### 2026-05-20 - Post-W34 Local Audit Storage Caps

Implemented local caps for audit event indexes:

- Added `ACTION_EVENT_HISTORY_LIMIT` and `OVERRIDE_EVENT_HISTORY_LIMIT` in
  `src/shared/constants.ts`.
- `saveActionEvent` now trims global and per-user action event sorted sets to
  the local action history cap.
- `saveAuditEvent` now trims the override audit sorted set to the local
  override history cap.
- Extended `src/server/services/auditPersistence.test.ts` to cover action and
  override cap trimming while preserving newest-first reads.
- Updated TODO, research, current-truth, and capability docs to distinguish
  local storage guardrails from still-open runtime Redis limit proof.

Validation:

- `npm test -- src/server/services/auditPersistence.test.ts src/server/services/audit.test.ts`
  - passed, 2 files and 7 tests.
- `npm test -- src/server/services/auditPersistence.test.ts src/server/services/audit.test.ts src/server/services/overrideReview.test.ts`
  - passed, 3 files and 11 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 207 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run for this local cap slice. Practical Devvit Redis
storage limits remain a runtime follow-up before larger live datasets.

### 2026-05-20 - Post-W34 AI Privacy Readiness Gate

Added the W10 terms/privacy readiness note without enabling external AI:

- Added `docs/operational-overhaul/AI_PRIVACY_READINESS.md`.
- The gate requires provider terms review, privacy notice updates, data
  minimization, evidence-ID citation checks, secret handling, HTTP permission
  review, runtime failure proof, and retention decisions before any uploaded
  build can use external AI fetch.
- Updated TODO, research, capability matrix, runtime matrix, and W10 report
  references.

Runtime playtest was not run. No external fetch, provider secret retrieval, AI
provider call, or AI enforcement behavior was added.

### 2026-05-20 - Post-W34 Team Delivery Scheduler Guard

Closed a local W11 safety gap without enabling live delivery:

- `src/server/services/teamDelivery.ts` now always records scheduler delivery
  confirmations as skipped because no scheduler task is registered.
- Added regression coverage proving a scheduler confirmation does not call the
  injected Mod Discussion adapter even when live-delivery and runtime-verified
  flags are supplied.
- Split the W11 TODO so the local no-accidental-scheduler-delivery guard is
  complete while live Mod Discussion permission failure proof remains open.

Validation:

- `npm test -- src/server/services/teamDelivery.test.ts` - passed, 1 file and
  6 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 208 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run. No Mod Discussion send, scheduler task, Reddit
message, or user-facing delivery behavior was enabled.

### 2026-05-20 - Post-W34 Completion Audit Refresh

Refreshed operational control artifacts after PR #31 and PR #32:

- Updated `COMPLETION_AUDIT.md` so the prompt-to-artifact checklist includes
  the AI privacy readiness gate, the local scheduler skipped-delivery guard,
  and the latest broad validation count of 46 files and 208 tests.
- Updated `CURRENT_REPO_TRUTH.md` with the current AI readiness gate and
  scheduler-confirmation behavior.
- Updated `WAVE_STATUS.md` so the post-W34 status summary includes the AI
  privacy and scheduler guard slices while keeping external AI, live Mod
  Discussion sends, and scheduler jobs marked unverified or disabled.

Validation:

- `git diff --check` - passed.

Runtime playtest was not run. This was an audit refresh only.

### 2026-05-20 - Post-W34 Legacy Page ID Audit

Audited tracked references for old W12 page IDs:

- Ran a repo search for `#command-center`, `#policies`, `#case-packets`,
  `#digest`, old page-ID wording, bookmarks, and related legacy route names.
- Found only the intentional client compatibility mapping in
  `src/client/main.ts` plus historical wave/report references.
- Updated `TODO.md` and `wave12-operational-ui.md` to record that tracked
  repo-side docs/bookmark-like references do not require migration. User-owned
  external docs/bookmarks, if any exist outside this repository, remain a
  separate manual follow-up.

Validation:

- `git diff --check` - passed.

Runtime playtest was not run. This was a tracked-docs audit only.

### 2026-05-20 - Post-W34 Synthetic Multi-Community Fixture

Closed the local W32 follow-up for future multi-community scenario coverage
under the W29 isolation-first contract:

- Added `multi_community_isolation` to the synthetic evaluation harness.
- The fixture contains foreign-subreddit actions, but replay evaluation and
  scan summaries stay scoped to the dataset subreddit.
- Added a synthetic safeguard count for foreign-subreddit actions and updated
  the checked-in golden manifest intentionally.
- Updated the W32 report and TODO to distinguish isolation coverage from
  cross-community benchmarking.

Validation:

- `npm test -- src/server/services/syntheticEval.test.ts` - passed, 1 file and
  6 tests.
- `node scripts/synthetic-eval.mjs` - passed.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 46 files and 209 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run. The harness does not call Reddit APIs, Redis,
Devvit runtime, mod notes, modmail, scheduler, or external AI.

### 2026-05-20 - Post-W34 Synthetic Audit Refresh

Refreshed operational control artifacts after PR #35:

- Updated `COMPLETION_AUDIT.md` so the prompt-to-artifact checklist includes
  the synthetic multi-community isolation fixture and the latest broad
  validation count of 46 files and 209 tests.
- Updated `CURRENT_REPO_TRUTH.md` with the current synthetic evaluation truth:
  foreign-subreddit actions exist only inside a local fixture and remain
  excluded from replay and scan summaries.
- Updated `WAVE_STATUS.md` so the post-W34 status summary includes the
  synthetic fixture while preserving the boundary that cross-community
  analytics and new runtime behavior were not added.

Validation:

- `git diff --check` - passed.

Runtime playtest was not run. This was an audit refresh only.

### 2026-05-20 - Post-W34 Redis Sorted-Set Diagnostic

Added a safe local diagnostic for the remaining Redis sorted-set ordering proof:

- Added `runRedisSortedSetSmoke`, which writes three deterministic sorted-set
  members, reads reverse-rank order, and deletes the smoke key.
- Added `POST /api/smoke/redis-zset`, a `redis-zset-ordering` runtime
  capability entry, and a Settings button to run the diagnostic later from the
  authenticated WebView.
- Updated operational docs to keep the Devvit runtime sorted-set/storage proof
  open until the new route is actually run in playtest.

Validation:

- `npm test -- src/server/services/redis.test.ts src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  - passed, 3 files and 12 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 47 files and 212 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime playtest was not run. The new route is a proof surface for a future
Devvit runtime check, not runtime evidence by itself.

### 2026-05-20 - Post-W34 Redis Sorted-Set Runtime Failure

Ran the Redis sorted-set diagnostic in Devvit playtest and recorded the failure
instead of closing the capability:

- Preflight passed: `npx devvit whoami` reported `u/BrightyBrainiac`,
  `npm run type-check`, `npm run lint`, `npm run build`, and `npm test`.
- `npm run dev` reached Playtest ready for `r/modmirror_dev` on `v0.0.1.131`.
- Reddit desktop WebView Settings `Run Redis ZSET` returned:
  `Redis sorted-set smoke order mismatch: expected newest, middle, oldest,
  observed .`
- The runtime capability matrix moved `redis-zset-ordering` to failed, with
  `1 type-only, 1 demo-only, 1 failed` shown in Settings.
- No destructive Reddit actions, Mod Notes, Mod Discussion sends, scheduler
  jobs, external AI calls, or retention deletion were run.

Follow-up implementation:

- Switched the smoke diagnostic to Devvit's documented variadic `zAdd` call.
- Added add count, cardinality, row count, observed scores, and per-member
  score checks to the `/api/smoke/redis-zset` response and Settings mismatch
  summary.
- Kept sorted-set ordering and practical storage limits open pending another
  Devvit runtime run.

Validation:

- `npm test -- src/server/services/redis.test.ts src/routes/apiAccess.test.ts`
  - passed, 2 files and 9 tests.
- `npm run type-check` - passed.
- `npm run lint` - passed.
- `npm test` - passed, 47 files and 212 tests.
- `npm run build` - passed.
- `git diff --check` - passed.

Runtime proof status: failed for `v0.0.1.131`; the next run should use the
expanded diagnostic response to identify whether Devvit Redis writes,
cardinality, score lookup, or reverse-rank reads differ from local mocks.

### 2026-05-20 - Post-W34 Redis Sorted-Set Runtime Pass

Reran the expanded Redis sorted-set diagnostic after the route switched to
Devvit's documented variadic `zAdd` call:

- Preflight passed: `npx devvit whoami` reported `u/BrightyBrainiac`,
  `npm run type-check`, `npm run lint`, `npm run build`, and `npm test`.
- `npm run dev` reached Playtest ready for `r/modmirror_dev` on `v0.0.1.136`.
- The Reddit desktop WebView was refreshed from the stale `v0.0.1.131`
  WebView to the `v0.0.1.136` WebView before running the smoke.
- Settings `Run Redis ZSET` returned:
  `Redis sorted-set smoke passed: observed newest, middle, oldest.`
- The runtime capability matrix showed `4 runtime`, `0 failed`, and no
  longer showed the `At least one runtime capability has a recorded failure`
  warning.
- No destructive Reddit actions, Mod Notes, Mod Discussion sends, scheduler
  jobs, external AI calls, or retention deletion were run.

Runtime proof status: reverse-rank sorted-set ordering is now verified for the
safe diagnostic route. Practical Redis storage limits remain a separate open
follow-up.

### 2026-05-20 - Post-W34 Redis Storage-Envelope Diagnostic

Added a safe local diagnostic for the remaining practical Redis storage-limit
proof:

- Added `runRedisStorageSmoke`, which writes a bounded scan-like record,
  10 scan metadata rows, 500 action-event rows, and 500 override-event rows to
  namespaced smoke keys, then deletes the keys and verifies cleanup with
  `redis.exists`.
- Added `POST /api/smoke/redis-storage`, a `redis-storage-envelope` runtime
  capability entry, and a Settings `Run Redis storage` control.
- Added local route/service coverage for expected counts, cleanup, and runtime
  health-event promotion.
- Updated `TODO.md`, `RESEARCH.md`, and operational-overhaul docs to keep
  practical Redis storage limits open until the safe storage smoke passes in
  Devvit playtest.

Validation:

- `npm test -- src/server/services/redis.test.ts src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  passed: 3 files, 14 tests.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test` passed: 47 files, 214 tests.
- `npm run build` passed.
- `git diff --check` passed.

Runtime proof status: local diagnostic implemented and validated. Devvit
playtest for `/api/smoke/redis-storage` was not run in this pass, so practical
Redis storage limits remain open.

### 2026-05-20 - Post-W34 Redis Storage-Envelope Runtime Pass

Ran the safe Redis storage-envelope diagnostic in Devvit playtest after PR #40
merged to `master`:

- Preflight passed: `npx devvit whoami` reported `u/BrightyBrainiac`.
- Merged-master validation passed with
  `npm run type-check && npm run lint && npm run build && npm test`.
- `npm run dev` reached Playtest ready for `r/modmirror_dev` on
  `v0.0.1.137`.
- The Reddit desktop WebView Settings `Run Redis storage` control returned:
  `Redis storage smoke passed: scan 10/10, actions 500/500, overrides
  500/500, cleanup 0.`
- The runtime capability matrix changed from `4 runtime` to `5 runtime` and
  showed `1 type-only`, `1 demo-only`, and `0 failed`.
- No destructive Reddit actions, Mod Notes, Mod Discussion sends, scheduler
  jobs, external AI calls, or retention deletion were run.

Runtime proof status: current bounded Redis storage envelope is verified for
the local caps. Raising scan metadata/action/override storage caps remains a
separate future proof item.

### 2026-05-20 - Synthetic Retention Cleanup Diagnostic

- Added `/api/smoke/retention-cleanup` for a bounded synthetic retention
  cleanup check. The route writes old synthetic scan, action receipt, Evidence
  Board, and team-delivery receipt records; deletes only those records through
  retention cleanup; and verifies detail keys plus sorted-set index references
  are gone.
- Added Settings `Run retention cleanup` wiring and runtime capability health
  event recording for `retention-cleanup`.
- Local validation passed for
  `npm test -- src/server/services/privacyRetention.test.ts src/routes/apiAccess.test.ts src/server/services/runtimeCapabilities.test.ts`
  and `npm run type-check`.

Initial proof status before playtest: local/static only. Actual deletion
against real operational records remained a separate controlled-test item.

### 2026-05-20 - Synthetic Retention Cleanup Runtime Pass

Ran the safe synthetic retention cleanup diagnostic in Devvit playtest:

- Preflight passed: `npx devvit whoami` reported `u/BrightyBrainiac`.
- `npm run dev` reached Playtest ready for `r/modmirror_dev` on
  `v0.0.1.138`.
- The Reddit desktop WebView Settings `Run retention cleanup` control returned:
  `Retention cleanup smoke passed: scans 1/1, receipts 1/1, boards 1/1,
  delivery 1/1, detail keys 0, index refs 0.`
- The runtime capability matrix changed from `5 runtime` to `6 runtime` and
  showed `1 type-only`, `1 demo-only`, and `0 failed`.
- No destructive Reddit actions, Mod Notes, Mod Discussion sends, scheduler
  jobs, external AI calls, or real operational-record retention deletion were
  run.

Runtime proof status: synthetic expired-record cleanup is verified for the
bounded diagnostic path. Actual deletion against real operational records
remains a separate controlled destructive cleanup test.

### 2026-05-20 - Runtime Capability Baseline Reconciliation

- Updated `src/server/services/runtimeCapabilities.ts` so the static baseline
  now reflects the recorded runtime proof for Redis sorted-set ordering, the
  current Redis storage envelope, and synthetic retention cleanup.
- Kept each diagnostic `canUpdateFromHealthEvents: true`, so later failed
  smoke events can still demote the capability state for the current subreddit.
- Updated `runtimeCapabilities.test.ts` to assert the runtime baseline for
  storage and synthetic retention cleanup.

Validation:

- `npm test -- src/server/services/runtimeCapabilities.test.ts src/routes/apiAccess.test.ts`
  passed: 2 files, 12 tests.
- `npm run type-check` passed.
- `npm run lint` passed.
- `npm test` passed: 47 files, 216 tests.
- `npm run build` passed.
- `git diff --check` passed.

Runtime proof status: no new Devvit playtest was run in this reconciliation.
The change only aligns code metadata with already recorded playtest evidence.

### 2026-05-20 - Legacy Runtime Verification Matrix Reconciliation

- Updated `src/server/services/runtimeVerification.ts` so the legacy
  `/api/runtime-verification` matrix also lists the runtime-verified Redis
  sorted-set ordering, current Redis storage envelope, and synthetic retention
  cleanup diagnostics.
- Kept actual real-record retention deletion out of the verified scope; the
  synthetic cleanup entry remains destructive-flagged and points to a separate
  controlled destructive cleanup test before deleting operational records.
- Updated `runtimeVerification.test.ts` to assert those entries and diagnostic
  routes.

Validation:

- `npm test -- src/server/services/runtimeVerification.test.ts` passed.
- `npm run type-check` passed.
- `git diff --check` passed.

Runtime proof status: no new Devvit playtest was run. The change only aligns
the legacy verification matrix with already recorded playtest evidence.
