# Operational Overhaul Repo Context Index

Created: 2026-05-18

Updated: 2026-05-20

Branch: `master`

Initial overhaul base commit: `74dcd70 docs: mark Wave 9 10 pushed`

## Purpose

This index is the mandatory repository-context preload for the operational
overhaul. It reconciles the new spec pack with the existing repository, prior
wave artifacts, runtime notes, and current source code before implementation
work begins.

## Source Precedence

1. Current code is the source of truth for implemented behavior.
2. `RESEARCH.md`, `TODO.md`, and latest wave reports are evidence for runtime
   proof and known gaps.
3. `modmirror_operational_overhaul_spec_pack/` defines the new build direction
   and no-submission boundary.
4. Older plans and prompt packs are historical intent unless current code and
   later reports confirm them.

## Repository State

- Working directory inspected: `/Users/arshdeepsingh/Developer/ModMirror`.
- Initial operational-overhaul work began from `master` at `74dcd70`.
- Current continuation work is on the root `master` worktree.
- PR #12 merge cleanup removed the historical local wave worktrees and local
  wave branches.
- The untracked `modmirror-expansion-waves-16-34/` and
  `modmirror_operational_overhaul_spec_pack/` directories are intentionally
  preserved and untouched during post-W34 continuation work.

Latest relevant commits on `master`:

- `36bbb19 docs: add modqueue plan to completion audit`
- `c3c2706 docs: plan modqueue runtime proof`
- `d05957b docs: refresh operational completion audit`
- `abcd664 docs: reconcile runtime verification matrix`
- `c9c265a docs: plan access runtime proof`
- `a9d36bb test: harden moderator permission normalization`
- `d5371eb docs: plan retention destructive cleanup proof`
- `d88b24a fix: include redis proofs in runtime verification`
- `49aac7c fix: align runtime capability baseline`
- `01de18c docs: refresh operational context index`
- `b876767 docs: record retention cleanup runtime pass`
- `1bb93b3 feat: add retention cleanup smoke diagnostic`
- `d4a0d5c Merge pull request #41 from Arshgill01/post34/redis-storage-runtime-pass`
- `610fb4d docs: record redis storage runtime pass`

## Guidance Files Read

Top-level guidance and configuration read:

- `AGENTS.md`
- `PLAN.md`
- `README.md`
- `TODO.md`
- `RESEARCH.md`
- `TREE.txt`
- `package.json`
- `devvit.json`
- `tsconfig.json`
- `vite.config.ts`
- `vitest.config.ts`
- `eslint.config.js`
- `.prettierrc`

No nested `AGENTS.md` files were found.

## Execution, Plan, Report, And Prompt Artifacts Read

Key root and docs artifacts:

- `docs/WAVE1_EXECUTION_NOTES.md`
- `docs/WAVE2_COMPLETION_REPORT.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`
- `docs/WAVE3_4_MANUAL_QA.md`
- `docs/WAVE5_EXECUTION_NOTES.md`
- `docs/WAVE6_EXECUTION_NOTES.md`
- `docs/WAVE7_8_EXEC_PLAN.md`
- `docs/WAVE7_8_EXECUTION_NOTES.md`
- `docs/WAVE7_8_COMPLETION_AUDIT.md`
- `docs/WAVE7_8_COMPLETION_REPORT.md`
- `docs/WAVE9_10_EXEC_PLAN.md`
- `docs/WAVE9_10_EXECUTION_NOTES.md`
- `docs/WAVE9_10_FINAL_REPORT.md`
- `docs/WAVE9_10_FINAL_REPORT_TEMPLATE.md`
- `docs/LAUNCH_READINESS_CHECKLIST.md`
- `docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md`
- `docs/PRODUCT.md`
- `docs/DATA_MODEL.md`
- `docs/DECISIONS.md`
- `docs/DEVVIT_RESEARCH_QUESTIONS.md`

Prompt packs and scripts indexed:

- `prompts/WAVE0_GOAL.md`
- `prompts/wave1/*`
- `prompts/wave3-4/*`
- `prompts/wave5/*`
- `prompts/wave7-8/*`
- `prompts/wave9-10/*`
- `scripts/wave7_8_tmux_plan.sh`
- `scripts/wave9_10_tmux_plan.sh`

Operational-overhaul spec pack read:

- `00_MASTER_SLASH_CALL_PROMPT.md`
- `01_REPO_TRUTH.md`
- `02_EXECUTION_PROTOCOL.md`
- `03_BRANCH_WORKTREE_MAP.md`
- `04_GLOBAL_ACCEPTANCE_CRITERIA.md`
- `05_NO_SUBMISSION_BOUNDARY.md`
- `06_RUNTIME_RESEARCH_TARGETS.md`
- `MANIFEST.json`
- `README.md`
- `shared_specs/ACTION_RECEIPT_SPEC.md`
- `shared_specs/AI_SAFETY_SPEC.md`
- `shared_specs/POLICY_AGREEMENT_SPEC.md`
- `shared_specs/SAFETY_GATES.md`
- `shared_specs/SCAN_HISTORY_SPEC.md`
- `shared_specs/UI_IA_SPEC.md`
- `waves/README.md`
- all `waves/wave_*/README.md`
- all `waves/wave_*/AGENT_PROMPT.md`

## Current App Architecture From Code

- `src/index.ts` creates a Hono app, mounts public `/api` routes, and mounts
  internal `/internal/menu`, `/internal/form`, and `/internal/triggers`.
- `devvit.json` defines one inline Devvit Web custom post entrypoint, two
  `Apply ModMirror Policy` post/comment menu entries, and one subreddit
  dashboard launcher.
- `src/routes/api.ts` exposes health, smoke/runtime diagnostics, access
  diagnostics, scan, policy, action, override, policy health, case packet,
  digest, delivery, AI capability, modqueue, privacy, and Apply Policy APIs.
- `src/routes/menu.ts` exposes target-aware Apply Policy post/comment handlers
  and a subreddit dashboard launcher.
- `src/routes/forms.ts` handles target guidance and dashboard custom-post
  launch forms.
- `src/core/smoke.ts` contains explicit Redis/Reddit diagnostic helpers, not
  production-facing moderator menu flows.
- `src/server/services/redis.ts` centralizes Redis keys and JSON helpers.
- `src/server/services/mirrorScan.ts` runs demo/live scan attribution and now
  participates in persisted scan history/replay flows.
- `src/server/services/redditSources.ts` loads live rules, removal reasons, and
  moderation log actions with a default shallow window of 60 actions.
- `src/server/services/policies.ts` implements policy CRUD, immutable versions,
  and the proposal/review/adoption lifecycle used by the Agree workspace.
- `src/server/services/applyPolicy.ts` previews policy recommendations and
  confirms by writing receipt-backed log-only action and override events. Real
  Reddit moderation execution remains gated and disabled without runtime proof.
- `src/server/services/audit.ts` stores action and override events in Redis
  sorted sets and strips moderator names from aggregate override summaries.
- `src/server/services/casePacket.ts` builds deterministic case packets from
  stored action, override, policy, and comparable-case data.
- `src/server/services/digest.ts` generates deterministic digest reports and
  persists digest history; mod discussion delivery and scheduler are
  unverified capability states.
- `src/client/main.ts` is a large single-file DOM dashboard organized around
  Act, Scan, Agree, Review, Prove, and Settings workspaces.
- `src/client/styles.css` contains the current operational workspace styling.
- Tests cover shared logic, server services, route behavior, and selected
  static client behavior.

## Runtime Truth From Research And Readiness Docs

Verified locally or in runtime notes:

- Devvit Web/Hono scaffold builds and runs through `npm run dev`.
- Devvit app identity exists for `modmirror`; playtest has reached ready in
  `r/modmirror_dev`.
- Signed-in Safari playtest verified inline card, expanded dashboard modal,
  ExampleLearning demo scan, demo policy creation, log-only Apply Policy
  override capture, Case Packet generation, manual digest generation, and
  digest history in prior waves.
- Installed typings expose moderation log, subreddit rules, removal reasons,
  remove/approve/ignore reports, comments, modmail, Mod Notes, scheduler, and
  permission APIs.
- Protected API routes now have local server-side moderator access checks in
  live subreddit context through `moderatorAccess.ts`; true non-mod runtime
  proof remains open. Protected `/api/access/diagnostics` is locally verified
  for current-user permission string capture, and the Devvit WebView Settings
  diagnostic returned current moderator permission `all`.
- Redis sorted-set ordering is runtime verified through `/api/smoke/redis-zset`
  on Devvit playtest `v0.0.1.136`.
- The current bounded Redis storage envelope is runtime verified through
  `/api/smoke/redis-storage` on Devvit playtest `v0.0.1.137`: scan metadata
  `10/10`, action rows `500/500`, override rows `500/500`, and smoke-key
  cleanup `0`.
- Synthetic expired-record retention cleanup is runtime verified through
  `/api/smoke/retention-cleanup` on Devvit playtest `v0.0.1.138`: scans
  `1/1`, receipts `1/1`, boards `1/1`, delivery `1/1`, detail keys `0`, and
  index refs `0`. This does not prove destructive deletion against real
  operational records.

Still unverified or disabled:

- Real Reddit moderation execution from Apply Policy.
- Public comment delivery before/after removal.
- Private messages, modmail/mod discussion delivery, native Mod Notes, and
  scheduler runtime behavior.
- True non-moderator runtime account checks.
- Lower-permission moderator role strings for stronger permission-gating; keep
  product gates conservative until roles beyond the current `all` account are
  verified.
- Live same-subreddit modqueue item reads; the route and UI are read-only and
  fallback-observed, but no live `reddit_modqueue` item or exact adapter
  failure has been captured.
- Reddit mobile app behavior.
- Redis behavior beyond the current sorted-set and `10/500/500` storage
  envelope remains unproven.
- Actual retention deletion against real operational records remains unverified
  and requires a separate controlled destructive cleanup test.

## Current Remaining Gaps From Code And Runtime Evidence

- Real Reddit remove/approve/ignore-reports execution is still disabled until
  controlled throwaway-content runtime proof exists.
- Public comment delivery, private messages, modmail/Mod Discussion sends,
  native Mod Notes, scheduler jobs, and external AI calls remain disabled or
  unverified.
- True non-mod protected API blocking and lower-permission moderator role
  strings have an access runtime test plan but no account-separated runtime
  proof.
- Live same-subreddit modqueue reads have a runtime test plan but no safe queue
  item or exact adapter failure proof yet.
- Actual retention deletion against real operational records has a destructive
  cleanup test plan but has not been approved or executed.
- Deep moderation-log pagination, native Reddit mobile behavior,
  multi-moderator policy ratification, and larger Redis storage envelopes
  remain unverified.

## Contradictions And Stale Documentation

- `README.md` says Wave 9/10 work is active on
  `integration/wave9-10-launch-readiness`, but `TODO.md` and
  `docs/WAVE9_10_FINAL_REPORT.md` say Wave 9/10 is merged to `master`.
- `docs/WAVE7_8_COMPLETION_AUDIT.md` still contains an addendum saying the
  redesign branch is unmerged pending review, while `TODO.md` and git history
  show PR #11 was merged.
- `RESEARCH.md` foregrounds Wave 7/8 in its top status while later sections
  contain Wave 9/10 runtime proof.
- `docs/DEVVIT_RESEARCH_QUESTIONS.md` still says runtime playtest is blocked by
  missing Devvit CLI auth, which later docs and runtime reports supersede.
- `PLAN.md` is historical after Waves 7-10 and does not reflect the new
  operational-overhaul wave map.
- `TREE.txt` is a Wave 7/8 prompt-pack tree, not the current repository tree.
- Prior Wave 9/10 docs include submission-oriented drafts. The operational
  overhaul explicitly forbids new submission hardening in this run.
- The operational-overhaul pack's early smoking-gun claims about smoke menus,
  log-only Apply Policy, metadata-only scans, and incomplete policy
  agreement were valid at preload time but are now historical. Current
  completion truth lives in `COMPLETION_AUDIT.md`, `CAPABILITY_MATRIX.md`, and
  `RUNTIME_VERIFICATION_MATRIX.md`.

## Integration With Existing Repo Structure

The operational-overhaul should preserve the existing Devvit Web/Hono shape:

- Public APIs stay under `src/routes/api.ts` and `/api`.
- Internal Devvit menu/form flows stay under `src/routes/menu.ts` and
  `src/routes/forms.ts`.
- Product logic remains in `src/server/services/` and shared pure contracts in
  `src/shared/`.
- Redis keys continue through `src/server/services/redis.ts` with
  `modmirror:{subreddit}:...` namespacing.
- UI changes should respect the current DOM client until a deliberate
  refactor is scoped.
- W00 is docs/control only.
- W01 should replace smoke menu exposure and add target context without
  destructive actions.
- W02-W04 should introduce target-aware preview, safe execution gates, and
  durable receipts before analytics or UX reframing consumes them.
- Later scan, policy agreement, case packet, digest, and UI waves should
  consume receipts and persisted scans where available instead of expanding
  reporting-only surfaces.
