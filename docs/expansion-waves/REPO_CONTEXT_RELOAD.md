# Expansion Waves Repo Context Reload

Date: 2026-05-18

Branch: `expansion/w16-context-intake`

Base: `integration/operational-overhaul` at `f790eb1`

## Scope Boundary

This continuation pass is build-only. It must not do Devpost submission,
public publishing, final app listing polish, final demo video work, community
outreach, or prize-positioning copy.

The active goal is not complete after W14. The user expanded it to include
Waves 16-34 and asked that completion not be marked until those waves are
executed and the user gives explicit green light.

## Reload Commands

Commands used while reloading state:

- `pwd`
- `git status --short`
- `git branch --show-current`
- `git log --oneline --decorate -n 20`
- `git log --oneline --decorate --graph -40`
- `git branch --list --sort=refname`
- `git worktree list`
- `find . -maxdepth 3 -type f -not -path './node_modules/*' -not -path './.git/*' -not -path './dist/*' | sort`
- `find docs prompts .codex scripts . -path './node_modules' -prune -o -maxdepth 4 -type f \( -iname '*exec*' -o -iname '*plan*' -o -iname '*report*' -o -iname '*prompt*' \) -print | sort`
- `rg -n "ExecPlan|EXEC_PLAN|execution plan|wave|operational|launch readiness|runtime proof|playtest|policy|Apply Policy|case packet|digest" AGENTS.md PLAN.md README.md TODO.md RESEARCH.md TREE.txt docs prompts scripts src --glob '!node_modules/**'`
- `find src -maxdepth 5 -type f | sort`
- `rg -n "^api\.(get|post|put|patch|delete)" src/routes/api.ts`
- `rg -n "^export (async )?function|^export const|^export type|^export interface" src/server/services/*.ts src/shared/*.ts`
- `rg -n "^describe\(|^  it\(" src/**/*.test.ts`

## Guidance And Planning Files Read

Top-level and config:

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

Prior execution and report artifacts:

- `docs/WAVE1_EXECUTION_NOTES.md`
- `docs/WAVE2_COMPLETION_REPORT.md`
- `docs/WAVE3_4_EXECUTION_NOTES.md`
- `docs/WAVE5_EXECUTION_NOTES.md`
- `docs/WAVE6_EXECUTION_NOTES.md`
- `docs/WAVE7_8_EXEC_PLAN.md`
- `docs/WAVE7_8_EXECUTION_NOTES.md`
- `docs/WAVE7_8_COMPLETION_REPORT.md`
- `docs/WAVE9_10_EXEC_PLAN.md`
- `docs/WAVE9_10_EXECUTION_NOTES.md`
- `docs/WAVE9_10_FINAL_REPORT.md`
- `docs/WAVE9_10_FINAL_REPORT_TEMPLATE.md`
- `docs/UI_IMPLEMENTATION_PLAN.md`
- `docs/SCREENSHOT_AND_VIDEO_PLAN.md`
- `docs/SKILL_INSTALLATION_REPORT.md`
- `docs/operational-overhaul/REPO_CONTEXT_INDEX.md`
- `docs/operational-overhaul/EXECUTION_LOG.md`
- `docs/operational-overhaul/CURRENT_REPO_TRUTH.md`
- `docs/operational-overhaul/CAPABILITY_MATRIX.md`
- `docs/operational-overhaul/RUNTIME_VERIFICATION_MATRIX.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- `docs/operational-overhaul/wave00-truth-control.md`
- `docs/operational-overhaul/wave01-entrypoints-context.md`
- `docs/operational-overhaul/wave02-recommendation-core.md`
- `docs/operational-overhaul/wave03-moderation-execution.md`
- `docs/operational-overhaul/wave04-receipts-ledger.md`
- `docs/operational-overhaul/wave05-scan-persistence.md`
- `docs/operational-overhaul/wave06-deep-scan.md`
- `docs/operational-overhaul/wave07-drift-analytics.md`
- `docs/operational-overhaul/wave08-policy-agreement.md`
- `docs/operational-overhaul/wave09-case-packets-v2.md`
- `docs/operational-overhaul/wave10-ai-advisory-spike.md`
- `docs/operational-overhaul/wave11-team-delivery-spike.md`
- `docs/operational-overhaul/wave12-operational-ui.md`
- `docs/operational-overhaul/wave13-runtime-verification.md`
- `docs/operational-overhaul/wave14-integration.md`
- `docs/operational-overhaul/BUILD_REPORT.md`
- `prompts/wave1/**`
- `prompts/wave3-4/**`
- `prompts/wave5/**`
- `prompts/wave7-8/**`
- `prompts/wave9-10/**`
- `scripts/wave7_8_tmux_plan.sh`
- `scripts/wave9_10_tmux_plan.sh`

Expansion pack files read:

- `modmirror-expansion-waves-16-34/README.md`
- `00_CONTINUATION_GOAL_PROMPT.md`
- `01_ASSUMPTIONS_AND_HANDOFF.md`
- `02_STATE_RELOAD_PROTOCOL.md`
- `03_EXPANSION_WAVE_MAP.md`
- `04_AGENT_AND_WORKTREE_PROTOCOL.md`
- `05_NON_GOALS_AND_BOUNDARIES.md`
- `06_REAL_WORLD_PRODUCT_BAR.md`
- `07_CROSS_WAVE_ARCHITECTURE_TARGETS.md`
- `08_BUILD_ONLY_INTEGRATION_CRITERIA.md`
- `shared_specs/ai_advisory_limits.md`
- `shared_specs/capability_research_protocol.md`
- `shared_specs/data_retention_privacy.md`
- `shared_specs/runtime_safety_model.md`
- `shared_specs/telemetry_and_health_model.md`
- `shared_specs/test_matrix.md`
- `shared_specs/ux_principles.md`
- all Wave 16-34 `README.md` files
- Wave 16 `AGENT_PROMPT.md`
- Wave 16 `ACCEPTANCE_CHECKLIST.md`

## Current Branches And Worktrees

Current expansion branch:

- `expansion/w16-context-intake`
- Worktree: `/Users/arshdeepsingh/Developer/modmirror-w16-context-intake`

Operational integration base:

- `integration/operational-overhaul`
- Worktree: `/Users/arshdeepsingh/Developer/modmirror-integration-operational-overhaul`
- Latest commit: `f790eb1 docs: record operational integration`

Operational wave branches/worktrees exist for:

- `overhaul/w00-truth-and-control`
- `overhaul/w01-entrypoints-context`
- `overhaul/w02-recommendation-core`
- `overhaul/w03-moderation-execution`
- `overhaul/w04-receipts-ledger`
- `overhaul/w05-scan-persistence`
- `overhaul/w06-deep-scan`
- `overhaul/w07-drift-analytics`
- `overhaul/w08-policy-agreement`
- `overhaul/w09-case-packets-v2`
- `overhaul/w10-ai-advisory-spike`
- `overhaul/w11-team-delivery-spike`
- `overhaul/w12-operational-ui`
- `overhaul/w13-runtime-verification`

Older Wave 1-10 branches and worktrees also remain locally. They are historical
and should not be treated as the current integration base.

Root `master` worktree:

- `/Users/arshdeepsingh/Developer/ModMirror`
- `master` at `74dcd70`
- Contains untracked prompt/spec folders, including
  `modmirror-expansion-waves-16-34/`.

## Current App Architecture From Code

Runtime shape:

- `src/index.ts` mounts Hono routes under `/api` and `/internal`.
- `/internal/menu` handles Devvit menu callbacks.
- `/internal/form` handles Devvit form submissions.
- `/internal/triggers` handles install triggers.
- `devvit.json` defines Devvit Web server/client builds, post/comment/subreddit
  menu items, forms, `permissions.reddit = true`, and playtest subreddit
  `modmirror_dev`.

API surface in `src/routes/api.ts`:

- health and runtime verification: `/health`, `/runtime-verification`
- diagnostics: `/smoke/redis`, `/smoke/reddit`
- scan history: `/scan`, `/scans`, `/scans/compare`, `/scans/:id`
- analytics: `/analytics/consistency`
- policies: `/policies`, `/policies/from-drift`, `/policies/:id`,
  `/policies/:id/propose`, `/policies/:id/reviews`,
  `/policies/:id/adopt`, `/policies/:id/versions`,
  `/policies/:id/changes`
- action/audit: `/actions`, `/receipts`, `/receipts/:id`,
  `/receipts/target/:targetThingId`, `/overrides`,
  `/overrides/:id`, `/overrides/:id/review`, `/overrides/summary`
- policy health: `/policy-health`, `/policies/:id/health`
- proof/delivery/advisory: `/case-packet`, `/digest/*`, `/delivery/*`,
  `/ai/*`
- Apply Policy: `/apply-policy/preview`, `/apply-policy/confirm`

Service boundaries:

- `targetContext.ts`: fetches post/comment target details from Devvit Reddit
  APIs and moderator permissions.
- `applyPolicy.ts`: builds recommendation previews and confirms log-only or
  gated execution attempts.
- `moderationExecution.ts`: contains live Reddit remove/approve/ignore-report
  calls behind explicit confirmation, runtime-proof, and receipt gates.
- `receipts.ts`: persists immutable action receipts.
- `mirrorScan.ts`, `redditSources.ts`, `attribution.ts`, `scans.ts`: run scans,
  normalize Reddit data, attribute actions, and persist full scan records.
- `policies.ts`: policy CRUD plus draft/propose/review/adopt version lifecycle.
- `audit.ts`, `overrideReview.test.ts`, `policyHealth.ts`: action events,
  override events, review status, and policy health.
- `analytics.ts`: drift trends and receipt-backed policy impact summaries.
- `casePacket.ts`, `comparableCases.ts`: evidence/case packet generation.
- `digest.ts`: deterministic manual digest and history.
- `aiAdvisory.ts`: disabled-by-default advisory layer with deterministic
  evidence citation checks.
- `teamDelivery.ts`: preview-first manual/skipped delivery receipts; no default
  Reddit send adapter.
- `runtimeVerification.ts`: explicit capability matrix.
- `redis.ts`: `modmirror:{subreddit}:...` key helper and Redis JSON helpers.

Client shape:

- `src/client/main.ts` is a string-template dashboard, not React.
- First screen is a compact inline launch card.
- Expanded dashboard sections are Act, Scan, Agree, Review, Prove, Settings.
- Act contains Apply Policy and action receipt ledger.
- Scan contains scan controls/history.
- Agree contains policy lifecycle controls.
- Review contains exceptions, policy health, and analytics.
- Prove contains consistency analytics, Case Packets, and Digest.
- Settings contains runtime/capability state.
- `src/client/styles.css` carries the full operational UI styling.

Shared shape:

- `src/shared/schema.ts` is the main contract file and is large. It includes
  policy, scan, receipt, execution, case packet, digest, delivery, AI, and
  runtime verification types.
- `src/shared/constants.ts` mirrors enum-like values and routes.
- `src/shared/scoring.ts` and `src/shared/productization.ts` contain pure
  recommendation/productization helpers.

## Prior Waves Already Implemented

Operational W00-W14 are integrated on `integration/operational-overhaul`:

- W00: context/control docs and baseline validation.
- W01: production smoke menu labels removed; post/comment Apply Policy menu
  entrypoints and target context service added, type/build verified only.
- W02: target-aware Apply Policy recommendation previews with evidence,
  policy snapshots, and safety caveats.
- W03: gated moderation execution engine for remove/approve/ignore_reports,
  disabled by default.
- W04: immutable action receipts and receipt APIs.
- W05: full scan record persistence and scan comparison routes.
- W06: quick/standard/deep scan depths with caps and warnings.
- W07: drift-over-time and receipt-backed policy impact analytics.
- W08: policy draft/propose/review/adopt lifecycle.
- W09: receipt-backed Case Packets v2 with evidence source labels.
- W10: disabled-by-default AI advisory spike.
- W11: preview-first team delivery spike with manual/skipped receipts.
- W12: operational UI reframe around Act / Scan / Agree / Review / Prove.
- W13: runtime verification matrix endpoint and desktop playtest proof notes.
- W14: fast-forward integration branch and full local validation.

## Incomplete Or Unverified

Critical gaps that expansion must respect:

- Post/comment Apply Policy menu entrypoints are still type/build-only. W13 did
  not find/prove them in real post/comment detail contexts.
- Target context capture from a real Devvit menu request is not runtime proven.
- Redis read/write in Devvit runtime is still not proven through
  `/api/smoke/redis`.
- Reddit read smoke in Devvit runtime is still not proven through
  `/api/smoke/reddit`.
- Log-only Apply Policy receipts are locally tested but not proven in Devvit
  Redis.
- Scan history, policy lifecycle, receipt ledger, and receipt-backed Case
  Packets are locally verified but need runtime route proof.
- Real Reddit remove/approve/ignore-reports execution remains disabled and
  must stay disabled until safe controlled playtest proof exists.
- Comment delivery, Mod Discussion/modmail delivery, scheduler, native Mod
  Notes, native Reddit mobile behavior, non-mod access blocking, and external
  AI calls remain unverified or disabled.

## Runtime Capability Truth

Runtime verified:

- Devvit CLI login as `u/BrightyBrainiac`.
- `npm run dev` reaching playtest ready for `r/modmirror_dev`.
- Subreddit dashboard launcher visible to moderator.
- Subreddit dashboard confirmation form opens.
- W12 Act/Scan/Agree/Review/Prove/Settings IA renders in Reddit's desktop
  expanded WebView modal on playtest `v0.0.1.71`.
- Earlier runtime passes verified demo scan, demo policy creation, log-only
  override capture, Case Packet generation, and manual Digest in Reddit
  WebView.

Local/static/type verified only:

- Post/comment Apply Policy menu config and form route.
- Target context service using `reddit.getPostById`, `reddit.getCommentById`,
  `reddit.getCurrentUser`, and moderator permissions.
- Scan persistence, receipts, policy lifecycle, analytics, Case Packets v2,
  AI advisory mock path, team delivery mock path, and runtime matrix service.

Disabled/unverified:

- Real moderation execution.
- Public comment delivery.
- Modmail/Mod Discussion delivery.
- Scheduler delivery.
- Native Mod Notes.
- External AI provider calls.
- Native mobile app flow.
- Non-mod access blocking.

## Real Versus Demo/Fallback Code Paths

Real server-backed paths:

- `/api/scan` with `mode = live` uses `redditSources.ts`.
- `/api/scan` with `mode = demo` uses deterministic demo data.
- Policy, action, override, receipt, scan, digest, and delivery receipt
  services use Redis helpers.
- Apply Policy confirmation writes action/override records and receipts, but
  uses `log_only` unless live execution gates are explicitly satisfied.

Demo/fallback paths:

- ExampleLearning demo data remains mandatory and clearly labeled.
- Static `dist/client` browser preview cannot call `/api/*`; the client has
  deterministic fallback rendering for local screenshot review.
- AI advisory returns disabled/no-provider fallbacks unless a provider is
  explicitly injected and enabled.
- Team delivery stores manual/skipped receipts by default; product routes do
  not inject a live Reddit delivery adapter.

## Contradictions Or Stale Docs

- `README.md` reflects the current W14 truth and says W00-W14 are integrated on
  `integration/operational-overhaul`.
- `TODO.md` still opens with stale Wave 9/10 and operational W09 text, even
  though later sections include W10-W13 follow-ups and W14 has integrated.
- `TREE.txt` describes an old Wave 7/8 prompt pack layout, not the current repo
  tree.
- `RESEARCH.md` top status still says operational W09 Case Packets v2, but the
  body includes newer W13/W14-relevant runtime facts. Treat specific dated rows
  and operational W13 docs as more current than the top status sentence.
- Older launch/submission docs and prompt artifacts exist from prior hackathon
  work. This continuation pass must not continue submission work.
- The root `master` worktree is older and contains the new expansion spec pack
  as untracked files. Expansion implementation should branch from
  `integration/operational-overhaul`, not root `master`.

## Dangerous Files To Modify

- `src/shared/schema.ts`: central contract file used by nearly every route,
  service, and test; additions must be backwards-aware and exact-optional safe.
- `src/shared/constants.ts`: route and enum-like constants must stay aligned
  with schema and client API calls.
- `src/routes/api.ts`: large route hub; new routes need explicit validation and
  careful response typing.
- `src/client/main.ts`: large string-template UI with many shared state
  variables; avoid incidental rewrites and keep UI additions tightly scoped.
- `src/client/styles.css`: global styling; avoid broad visual churn unless the
  wave explicitly touches UI.
- `src/server/services/redis.ts`: key naming controls subreddit isolation.
- `src/server/services/applyPolicy.ts`, `moderationExecution.ts`,
  `receipts.ts`, `casePacket.ts`: action, receipt, and evidence paths are
  safety-critical.
- `devvit.json`: changing menu, permissions, forms, scheduler, or HTTP
  permissions can affect runtime behavior. Do not enable destructive or
  external capabilities without proof.
- `package-lock.json`: `npm install` may produce optional dependency churn.
  Preserve unrelated lockfile state.

## Continuation Build Plan

The continuation should execute the expansion waves in order unless a later
wave only needs documentation/research and is safe to split. If waves are
merged or split, document the reason in
`docs/expansion-waves/EXECUTION_DECISIONS.md`.

Initial build order:

1. W16 content snapshots: add a stable evidence snapshot layer and integrate it
   into Apply Policy, receipts, and Case Packets without changing destructive
   gates.
2. W17 modqueue/report triage: research Devvit support and build either a real
   supported adapter or a truthful unsupported capability state.
3. W18 attribution calibration: let moderators correct inferred rule
   attribution and use corrections in future scans.
4. W19 policy ratification: extend existing W08 lifecycle into stronger
   team-workflow semantics, preserving version history.
5. W20 replay sandbox: simulate proposed policies against stored/synthetic
   history without mutating receipts.
6. W21-W22: aggregate health and policy impact improvements with thresholds and
   no per-mod blame.
7. W23-W25: response templates, Mod Notes, and appeal/modmail features only
   with gated delivery and capability truth.
8. W26-W30: evidence boards, incident mode, portability, multi-community
   isolation, and retention/privacy controls.
9. W31-W33: mobile resilience, synthetic evaluation, and richer observability.
10. W34: integration branch, build report, architecture consolidation, and full
    checks. No submission work.

## W16 Starting Point

Wave 16 should build on `targetContext.ts` rather than replace it.

Expected W16 shape:

- Add content snapshot schema with target ID, target type, subreddit,
  permalink, author, title/body excerpt, source, fetchedAt, fetch status, and
  privacy metadata.
- Add `src/server/services/contentSnapshots.ts`.
- Use snapshots in Apply Policy preview/confirm and action receipts.
- Include snapshot evidence in Case Packets when receipts contain it.
- Preserve degraded snapshots on fetch failure instead of hiding failures.
- Add tests for post snapshot, comment snapshot, unknown target, and fetch
  failure.
- Update docs with privacy notes and runtime status.

W16 must not claim runtime verification unless Devvit playtest actually proves
the menu/API behavior.
