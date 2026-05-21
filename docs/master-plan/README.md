# ModMirror Development Master Plan

Last updated: 2026-05-21

## Current Canonical Plan

The canonical plan is now the V2 master build plan:

- `docs/master-plan/v2/README.md`
- `docs/master-plan/v2/PEAK_ADDITIONS.md`
- `docs/master-plan/v2/waves/wave-*/README.md`

The original 12-wave files remain as historical scaffolding only. They were too
thin and too hardening-heavy to be the actual 3-4 day agent execution plan.

## Purpose

This folder is the development-only execution plan for turning ModMirror into a
stronger, more complete Devvit moderation product. It is designed for many
agents running continuously over several days without losing context.

This plan intentionally excludes all submission artifacts:

- no Devpost copy
- no submission hardening
- no demo video
- no video script
- no public Reddit launch post
- no screenshot package planning except screenshots needed for UI QA evidence

Agents should focus only on repository implementation, automated validation,
runtime verification, product quality, and development documentation.

## North Star

ModMirror should be immediately understandable and genuinely useful:

> Scan drift -> agree on policy -> apply policy -> explain overrides -> improve
> team consistency.

The product must stay deterministic, moderator-confirmed, privacy-conscious,
and honest about inferred attribution.

## Current Baseline

Evidence read before this plan:

- `AGENTS.md`
- `PLAN.md`
- `TODO.md`
- `CONTEXT.md`
- `README.md`
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`
- `docs/operational-overhaul/WAVE_STATUS.md`
- current `src/` file layout
- `package.json`
- `letsdoit.md`

Current implementation summary:

- Operational overhaul W00-W14 is merged.
- Expansion W16-W34 is merged.
- Many safe desktop Devvit WebView paths are runtime-verified through playtest
  `v0.0.1.138`.
- Remaining high-risk platform paths are still disabled or unverified:
  true non-mod access proof, lower-permission moderator roles, live modqueue
  reads, live moderation execution, real retention deletion, public/private
  delivery, native Mod Notes, scheduler jobs, external AI, native Reddit mobile,
  deep moderation-log pagination, and multi-moderator ratification.

## Execution Model

Use this plan as a wave board, not a calendar. Multiple agents may run waves in
parallel only when the dependency table permits it.

Every wave must leave the repo buildable, or must clearly document why it is not
buildable in that wave's execution log.

Required commands for most implementation waves:

```sh
npm run type-check
npm run lint
npm test
npm run build
```

Narrower test commands are encouraged during development, but the full command
set above is the default merge gate unless the wave README says otherwise.

## Agent Rules

Before editing, each agent must:

1. Read root `AGENTS.md`.
2. Read this `README.md`.
3. Read `docs/master-plan/agent-protocol.md`.
4. Read the wave README they are executing.
5. Inspect the current source files named in the wave.
6. Check `git status --short`.

During execution, each agent must:

- keep diffs scoped to its wave
- update the wave execution log as decisions are made
- add or update tests for behavior changes
- avoid submission artifacts entirely
- avoid destructive Reddit/runtime actions unless the wave explicitly requires
  approval and the user has approved that run
- preserve product guardrails from `AGENTS.md`

At completion, each agent must:

- update the wave execution log
- update `TODO.md` only for durable status changes
- update `RESEARCH.md` only for new verified platform facts
- update runtime matrices only when runtime proof actually happened
- report exact commands run and pass/fail status

## Wave Dependency Board

| Wave | Name | Can run in parallel with | Blocks |
|---|---|---|---|
| 01 | Product Health Hook | 02, 03, 04 | 07 |
| 02 | Team Calibration Pack | 01, 03, 04 | 07 |
| 03 | Runtime Proof: Access + Roles | 01, 02, 04, 05 | 08 |
| 04 | Runtime Proof: Read-Only Sources | 01, 02, 03, 05 | 08 |
| 05 | Reliability + Storage Envelope | 03, 04, 06 | 08 |
| 06 | UX Quality Sweep | 05, 09 | 07 |
| 07 | First-Run Product Loop | after 01, 02, 06 | 10 |
| 08 | Safe Platform Capability Closure | after 03, 04, 05 | 10 |
| 09 | Test Architecture + Golden Fixtures | 05, 06 | 10 |
| 10 | Integration Hardening | after 07, 08, 09 | 11 |
| 11 | Runtime Rehearsal Matrix | after 10 | 12 |
| 12 | Final Development Audit | after 11 | none |

Canonical wave folders live under `docs/master-plan/waves/wave-NN-*`. The
top-level `wave-NN-*.md` files are companion quick-reference copies for agents
that prefer single-file navigation.

## Win-Oriented Verification Gates

No plan can guarantee a hackathon win, but this plan is designed to maximize
the controllable factors. Agents must use these gates when deciding whether the
development work is strong enough:

1. **Instant comprehension:** the first in-app surface shows what problem
   ModMirror solves without relying on external explanation.
2. **Moderator usefulness:** every new flow helps a real mod team handle
   inconsistent enforcement, onboarding, or policy review.
3. **Proof over promise:** every capability is labeled as runtime-verified,
   locally verified, disabled, or unverified.
4. **Safety advantage:** the product never looks like an AI moderator, strike
   bot, or automatic ban tool.
5. **Demo resilience:** demo mode remains deterministic and complete even if a
   test subreddit has no useful history.
6. **Live honesty:** sparse or unsupported live paths give useful next actions
   instead of broken-looking screens.
7. **Agent continuity:** execution logs make it possible for a new agent to
   resume without re-reading the entire repo.
8. **Regression resistance:** golden tests protect the Rule 2 drift story and
   the scan-to-policy-to-action loop.
9. **Runtime discipline:** non-destructive Devvit paths are rehearsed and
   documented; destructive paths remain gated unless approved.
10. **Development completeness:** full validation passes before the final audit.

## Definition Of Incredible

The plan is complete when:

- a moderator can understand the product value from the in-app launch surface in
  under 10 seconds
- the core loop is usable without demo-story narration
- Team Calibration is implemented as a safe, non-punitive in-app workflow
- runtime proof gaps are either closed or accurately labeled as disabled
- local tests cover deterministic scoring, policy recommendation, calibration,
  privacy, access guards, receipts, and major UI-state helpers
- Devvit runtime evidence is recorded for all non-destructive paths that can be
  safely proven
- unverified destructive or external-service behavior remains gated
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
