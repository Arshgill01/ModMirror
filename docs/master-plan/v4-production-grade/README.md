# ModMirror V4 Production-Grade Master Plan

Date: 2026-05-21

## Purpose

This is the active production-grade plan after reviewing the latest Gemini
implementation plan. V2 proved a broad implementation. V3 captured a
frontend-heavy improvement board. V4 is the stricter plan for making ModMirror
feel like a real product, not a demo or MVP.

Do not mark the active goal complete until every wave in this file is either:

- completed with evidence and merged, or
- explicitly removed by a recorded decision with rationale.

## North Star

ModMirror must make one workflow unmistakable:

> A mod team enforces the same rule three different ways. ModMirror finds the
> drift, helps the team agree on policy, nudges future actions toward that
> policy, and records exceptions so the policy improves.

Everything else exists to make that loop useful, trustworthy, and reliable.

## Global Rules

- Future subagent prompts must start with `/goal`.
- Every wave must leave the repo buildable or document the exact blocker.
- Keep work in branches/worktrees where practical. Merge only after review and
  validation.
- Preserve deterministic logic. No AI judging, no automatic bans, no default
  destructive behavior.
- Keep public/delivery/destructive/external-service features disabled unless
  the user explicitly approves the matching runtime proof plan.
- Do not use external fonts or remote visual assets in the Devvit app.
- Do not expose per-mod blame or leaderboards.
- Do not claim runtime proof from local tests, static screenshots, or upload
  readiness alone.

## Default Validation Gate

Most implementation waves must run:

```sh
git diff --check
npm run type-check
npm run lint
npm test
npm run build
```

Runtime waves must also record:

```sh
npx devvit whoami
npm run dev
```

and the exact WebView route, UI control, account type, app version, and result.

## Wave Board

| Wave | Lane | Name | Status |
|---:|---|---|---|
| 01 | Control | Source Truth And Gemini Plan Reconciliation | complete |
| 02 | Control | Parallel Agent Protocol And PR Discipline | complete |
| 03 | Client | Client State And Action Extraction | complete |
| 04 | Client | Component Extraction Without Rewrite | complete |
| 05 | Product | First-Viewport Product Comprehension | complete |
| 06 | Product | Judge Demo Path Orchestrator | complete |
| 07 | Product | Onboard A New Mod Quiz Core | complete |
| 08 | Product | Quiz Feedback And Team Norm Scorecard | complete |
| 09 | Product | Scenario Lab Authoring And Archiving | complete |
| 10 | Product | Drift Radar Distribution Drilldown | complete |
| 11 | Product | Representative Cases With Privacy Guards | complete |
| 12 | Product | Policy Simulator Console | complete |
| 13 | Product | Policy Starter Templates And Overwrite Guard | complete |
| 14 | Product | Ratification Lifecycle UX | complete |
| 15 | Product | Override Resolution Inbox | complete |
| 16 | Product | Evidence Graph Lane View | complete |
| 17 | Product | Case Packet And Evidence Board Continuity | complete |
| 18 | Settings | Incident Mode Control Center | complete |
| 19 | Settings | Config Portability Console | complete |
| 20 | Settings | Privacy Retention Console | complete |
| 21 | Runtime | Safe V2 Route-Level Smoke Rehearsal | blocked |
| 22 | Runtime | True Non-Mod And Limited-Mod Access Proof | blocked |
| 23 | Runtime | Live Modqueue, Deep Scan, And Reddit Source Proof | pending |
| 24 | Reliability | Redis Index Hygiene And Storage Envelope | complete |
| 25 | Runtime | Controlled Retention And Execution Harnesses | pending |
| 26 | Runtime | Delivery, Mod Notes, And Scheduler Proof Harnesses | pending |
| 27 | Reliability | Error Taxonomy And Recovery UX | complete |
| 28 | Quality | Accessibility, Native Mobile, And Performance | pending |
| 29 | Assurance | Multi-Moderator, Security, And Privacy Review | pending |
| 30 | Integration | Final Merge, Proof Assets, And Completion Audit | pending |

## Wave Details

### Wave 01: Source Truth And Gemini Plan Reconciliation

Create the durable control record for V4. Import the Gemini plan conclusions
into repo docs, map each Gemini wave to current repo state, and identify which
items are kept, corrected, omitted, or expanded.

Deliverables:

- `docs/master-plan/v4-production-grade/GEMINI_PLAN_AUDIT.md`
- updated goal audit if completion criteria change
- explicit list of source files inspected

Done when:

- the plan source is named by absolute path;
- shortcomings are recorded;
- V4 is clearly marked as the active production-grade plan.

### Wave 02: Parallel Agent Protocol And PR Discipline

Define how workers take wave ownership without trampling each other.

Deliverables:

- branch/worktree naming convention;
- ownership rules for disjoint file sets;
- merge checklist for each wave;
- command log template;
- rule that worker prompts start with `/goal`.

Done when:

- at least three independent worker scopes can run in parallel without shared
  write sets.

### Wave 03: Client State And Action Extraction

Move duplicated client state and API action logic out of `src/client/main.ts`
incrementally. Reuse the existing `src/client/state/store.ts` rather than
creating a parallel store.

Target files:

- `src/client/state/store.ts`
- `src/client/state/actions.ts`
- `src/client/main.ts`
- focused tests under `src/client/state/`

Done when:

- at least scan, demo reset, and common fetch/error handling are extracted;
- state tests cover listener/update behavior and one async action path;
- `main.ts` behavior is unchanged.

### Wave 04: Component Extraction Without Rewrite

Extract one vertical UI slice at a time into render modules. Do not wipe the
client entrypoint.

Target slices:

- common primitives;
- Command Center;
- Scan/Drift Radar;
- Policy Workbench;
- Review Room;
- Settings.

Done when:

- extracted modules are imported by `main.ts`;
- no duplicate state model is introduced;
- screenshots prove no obvious visual regression.

### Wave 05: First-Viewport Product Comprehension

Make the first expanded WebView screen explain the product value in under 10
seconds without marketing copy or a landing page.

Done when:

- the first screen shows the current policy health, top drift, next action, and
  safety/runtime label;
- empty/live/demo states all remain useful.

### Wave 06: Judge Demo Path Orchestrator

Build a deterministic 60-second path through the Rule 2 story.

Flow:

1. load ExampleLearning;
2. show Mirror Scan drift;
3. create or select a Rule 2 policy;
4. preview Apply Policy;
5. select a stricter action;
6. record override;
7. show receipt, Case Packet/Evidence Board, and digest-ready proof.

Done when:

- the flow is one obvious UI action from the Command Center;
- it mutates only demo or clearly labeled safe ModMirror state;
- it is covered by a golden test or static browser smoke.

### Wave 07: Onboard A New Mod Quiz Core

Turn Team Calibration into a step-by-step quiz.

Done when:

- one scenario appears at a time;
- a moderator chooses an action from controlled options;
- navigation state survives normal re-rendering;
- no per-mod score is stored as a leaderboard.

### Wave 08: Quiz Feedback And Team Norm Scorecard

Show alignment feedback after each answer and an aggregate scorecard at the end.

Done when:

- feedback distinguishes aligned, acceptable alternative, and review
  recommended;
- explanations are deterministic and policy-based;
- final summary is aggregate and non-punitive.

### Wave 09: Scenario Lab Authoring And Archiving

Expose the existing scenario creation and archive routes in the client.

Done when:

- lead mods can create a scenario with title, prompt, rule, expected action,
  alternatives, and explanation;
- incomplete submissions are blocked client-side and server-side;
- archived scenarios leave the active pack.

### Wave 10: Drift Radar Distribution Drilldown

Make drift candidates expandable.

Done when:

- action distribution bars are visible per rule;
- confidence/unmatched labels stay honest;
- sparse live data does not look broken.

### Wave 11: Representative Cases With Privacy Guards

Show example cases behind each drift signal without turning the product into a
surveillance UI.

Done when:

- cases are redacted or aggregate-safe where required;
- moderator names are omitted unless permission proof allows them;
- each case links to policy creation, attribution calibration, or evidence.

### Wave 12: Policy Simulator Console

Expose `/api/policies/:id/simulate` in the Workbench.

Done when:

- draft policy steps can be simulated before adoption;
- same/stricter/looser deltas render as exact ratios;
- simulation is read-only and does not write receipts.

### Wave 13: Policy Starter Templates And Overwrite Guard

Add starter templates for common rule patterns.

Done when:

- templates are clearly labeled as starting points;
- applying a template requires confirmation before overwriting unsaved edits;
- imported/starter policies remain drafts until adopted.

### Wave 14: Ratification Lifecycle UX

Make propose, review, block, and adopt visible as one policy lifecycle.

Done when:

- approval thresholds and current review count are visible;
- quick adoption rules are honored;
- blocked/adopted states are understandable.

### Wave 15: Override Resolution Inbox

Upgrade override review from a passive list to a resolution workflow.

Done when:

- a reviewer can mark accepted exception, policy needs update, needs team
  discussion, or reviewed;
- an audit note is persisted;
- resolved items leave the open queue.

### Wave 16: Evidence Graph Lane View

Replace raw edge strings with a lane-based graph that uses CSS only.

Done when:

- context, decisions, policies, and audits are separate lanes;
- relationship badges explain links;
- missing references are called out clearly.

### Wave 17: Case Packet And Evidence Board Continuity

Make receipts, Case Packets, Evidence Boards, and Review Room feel connected.

Done when:

- a user can move from receipt to case packet to evidence board and back;
- source labels explain whether evidence is receipt-backed, demo, inferred, or
  unavailable.

### Wave 18: Incident Mode Control Center

Expose Incident Mode start/end controls and active banner.

Done when:

- safe incident presets can be started and ended;
- timer and active context are visible;
- incident mode does not change Reddit state or bypass confirmation.

### Wave 19: Config Portability Console

Expose export, dry-run import, starter templates, and validation errors.

Done when:

- export excludes private history by default;
- dry-run import diff is readable;
- import creates drafts/proposals, not silently adopted enforcement.

### Wave 20: Privacy Retention Console

Expose retention settings, inventory, export, and dry-run deletion controls.

Done when:

- real deletion remains gated;
- dry-run counts are clear;
- synthetic cleanup proof remains separated from operational deletion claims.

### Wave 21: Safe V2 Route-Level Smoke Rehearsal

Rerun safe route-level checks after the latest merged UI and V2 code.

Target routes:

- `/api/health`
- `/api/runtime-capabilities`
- `/api/command-center`
- `/api/policy-workbench`
- `/api/review-room`
- `/api/onboarding`
- `/api/demo/manifest`
- safe smoke routes where already allowed

Done when:

- exact app version, route/control, and result are recorded;
- docs distinguish route proof from upload readiness.

### Wave 22: True Non-Mod And Limited-Mod Access Proof

Execute `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md`.

Done when:

- a true non-mod account is proven blocked from protected data;
- a limited moderator account records exact permission strings if available;
- visibility remains aggregate-only without `all`.

### Wave 23: Live Modqueue, Deep Scan, And Reddit Source Proof

Execute safe read-only proof for modqueue and deep moderation-log pagination.

Done when:

- live modqueue either returns `source: "reddit_modqueue"` with safe items or
  records exact runtime failure;
- deep pagination behavior, caps, and warnings are documented;
- read-only Reddit source claims are reconciled in `RESEARCH.md` and runtime
  matrices.

### Wave 24: Redis Index Hygiene And Storage Envelope

Harden Redis storage behavior beyond the existing bounded smoke.

Done when:

- tests cover stale sorted-set JSON members, index compaction, and update/delete
  consistency for mutable records;
- current caps remain honest unless larger caps are runtime-proven;
- cleanup paths preserve policy history and do not delete unrelated records.

### Wave 25: Controlled Retention And Execution Harnesses

Prepare, but do not run without approval, destructive-retention and Reddit
moderation execution proof harnesses.

Done when:

- dry-run and explicit-confirmation gates are reviewed;
- throwaway-content runbooks exist for remove, approve, and ignore-reports;
- real deletion/execution remains disabled unless the user approves the exact
  proof run.

### Wave 26: Delivery, Mod Notes, And Scheduler Proof Harnesses

Prepare, but do not run without approval, proof-only flows for public comments,
private/modmail delivery, Mod Discussion, native Mod Notes, and scheduler jobs.

Done when:

- preview/confirm behavior is separated from real send/write behavior;
- proof-only scheduler job cannot send messages;
- native Mod Notes remain gated by env/runtime flags until proven.

### Wave 27: Error Taxonomy And Recovery UX

Normalize client handling for access denied, subreddit isolation, unavailable
runtime APIs, partial data, offline fetch failures, and validation errors.

Done when:

- each error class has a clear UI state and next action;
- tests cover classification and rendering for the most important failures.

### Wave 28: Accessibility, Native Mobile, And Performance

Audit dense workflows for keyboard access, focus order, labels, contrast,
reduced-motion behavior, native Reddit/mobile behavior, and performance.

Done when:

- primary flows are keyboard navigable;
- interactive controls have labels;
- no obvious text overlap exists at mobile widths;
- native Reddit mobile is checked if device access exists, otherwise the
  blocker is recorded;
- client bundle and main entrypoint size are measured.

### Wave 29: Multi-Moderator, Security, And Privacy Review

Prove or conservatively document the multi-moderator and privacy/security
surface.

Done when:

- distinct-reviewer ratification is proven if accounts are available, otherwise
  the blocker is explicit;
- no secrets or credentials are present;
- exports exclude private history by default;
- per-mod and per-user data handling is documented accurately.

### Wave 30: Final Merge, Proof Assets, And Completion Audit

Close the plan only after every wave has evidence.

Done when:

- all wave logs are complete;
- all relevant branches/PRs are merged or intentionally closed;
- README/Devpost/app listing/Reddit showcase copy are updated or explicitly
  declared out of scope by the user;
- a screenshot package and short demo proof path are captured or explicitly
  blocked with reasons;
- `master` is clean;
- full validation passes;
- Devvit readiness and available runtime proof are recorded;
- `docs/master-plan/goal-completion-audit.md` maps every user requirement to
  evidence and no required work remains.

## Parallelization Plan

Initial safe worker lanes:

- Worker A: Waves 03-04 client extraction, write set limited to
  `src/client/state/*`, `src/client/components/*`, and narrow imports in
  `src/client/main.ts`.
- Worker B: Waves 07-09 calibration/scenario UI, write set limited to
  calibration-related client modules and tests.
- Worker C: Waves 10-12 Drift Radar and Policy Simulator UI, write set limited
  to scan/workbench client modules and tests.
- Worker D: Waves 21-23 runtime proof planning/execution docs and safe route
  checks, write set limited to `RESEARCH.md`, `TODO.md`, and
  `docs/operational-overhaul/*` unless a code bug is found.

Do not run two workers against the same client file until Wave 04 creates
disjoint component modules.
