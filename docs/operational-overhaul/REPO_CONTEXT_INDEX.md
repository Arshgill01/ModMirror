# Operational Overhaul Repo Context Index

Created: 2026-05-18

Branch: `overhaul/w00-truth-and-control`

Base commit: `74dcd70 docs: mark Wave 9 10 pushed`

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
- Starting branch: `master`.
- Starting status: only `modmirror_operational_overhaul_spec_pack/` was
  untracked.
- `master` was up to date with `origin/master`.
- Current W00 worktree:
  `/Users/arshdeepsingh/Developer/modmirror-w00-truth-and-control`.
- Existing worktrees remain from prior waves under
  `/Users/arshdeepsingh/Developer/modmirror-worktrees/` and
  `/Users/arshdeepsingh/Developer/modmirror-wave2-worktrees/`.

Latest relevant commits on `master`:

- `74dcd70 docs: mark Wave 9 10 pushed`
- `ea90080 docs: mark Wave 9 10 merged`
- `9b9c88c merge: Wave 9 10 launch readiness`
- `1c4a532 docs: record Wave 9 10 runtime proof`
- `ef81d6b feat: add persisted digest engine`
- `273316d Merge pull request #11 from Arshgill01/redesign/wave7-8-command-center-ui`
- `4186dc7 feat: redesign moderation workspace UI`
- `791c938 merge: Wave 7 8 productization`

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
- `devvit.json` defines one inline Devvit Web custom post entrypoint and three
  menu entries.
- `src/routes/api.ts` exposes health, smoke, scan, policy, action, override,
  policy health, case packet, digest, and Apply Policy APIs.
- `src/routes/menu.ts` still exposes post/comment smoke menu handlers and a
  subreddit dashboard launcher.
- `src/routes/forms.ts` handles smoke target/chained forms and dashboard custom
  post launch.
- `src/core/smoke.ts` contains Redis/Reddit smoke helpers and a minimal target
  summary helper for smoke flows.
- `src/server/services/redis.ts` centralizes Redis keys and JSON helpers.
- `src/server/services/mirrorScan.ts` runs demo/live scan attribution and saves
  last-scan metadata only.
- `src/server/services/redditSources.ts` loads live rules, removal reasons, and
  moderation log actions with a default shallow window of 60 actions.
- `src/server/services/policies.ts` implements policy CRUD plus immutable
  version records, but not a proposal/review/adoption lifecycle.
- `src/server/services/applyPolicy.ts` previews policy recommendations and
  confirms by writing `log_only` action and override events. It does not call
  Reddit moderation execution APIs.
- `src/server/services/audit.ts` stores action and override events in Redis
  sorted sets and strips moderator names from aggregate override summaries.
- `src/server/services/casePacket.ts` builds deterministic case packets from
  stored action, override, policy, and comparable-case data.
- `src/server/services/digest.ts` generates deterministic digest reports and
  persists digest history; mod discussion delivery and scheduler are
  unverified capability states.
- `src/client/main.ts` is a large single-file DOM dashboard with Command
  Center, Scan, Policies, Review, Case Packets, Digest, and Settings pages.
- `src/client/styles.css` contains the current operational workspace styling.
- Tests currently cover shared logic and server services. There are no route,
  client, or menu/form integration tests.

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

Still unverified or disabled:

- Real Reddit moderation execution from Apply Policy.
- Public comment delivery before/after removal.
- Private messages, modmail/mod discussion delivery, native Mod Notes, and
  scheduler runtime behavior.
- True non-moderator access checks.
- Exact moderator permission strings for stronger permission-gating.
- Reddit mobile app behavior.
- Redis smoke endpoints in playtest remain separately tracked as not broadly
  proven despite digest history working in runtime QA.

## Current Implementation Gaps From Code

- `devvit.json` still exposes production-facing `"ModMirror smoke test"` post
  and comment menu labels.
- Post/comment menu handlers in `src/routes/menu.ts` open smoke forms, not real
  ModMirror policy flows.
- There is no real target-context service outside the smoke helper.
- Apply Policy confirm stores `ActionEvent` records but performs no Reddit
  moderation action.
- Apply Policy has no typed execution result or receipt model.
- Existing action events do not distinguish live execution, failed execution,
  dry run, skipped execution, or unverified-disabled execution.
- Mirror Scan persists only `LastScanMetadata`, not full attributed scan
  records or scan history.
- Live scan uses a shallow moderation-log fetch by default.
- Policy Agreement is policy CRUD/versioning, not draft/propose/review/adopt.
- Case Packets depend mostly on ModMirror action/audit records and lack a
  receipt-backed evidence model.
- Client UI uses static fallback/demo paths for preview and screenshots; those
  must stay clearly separated from live runtime functionality.

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
- The operational-overhaul pack's smoking-gun claims match current code for
  smoke menus, log-only Apply Policy, shallow scans, metadata-only scans, and
  incomplete policy agreement.

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

