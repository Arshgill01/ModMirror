# AGENT A — Wave 1 Shared Contracts

## Mission

Create the shared TypeScript contracts and constants for ModMirror.

You own the data model, shared types, constants, and pure utility shape. You do not own Redis implementation, dashboard UI, or product pages.

## Read First

- AGENTS.md
- PLAN.md
- RESEARCH.md
- docs/DATA_MODEL.md
- docs/DECISIONS.md
- docs/PRODUCT.md
- .codex/skills/modmirror-product-guardrails/SKILL.md
- .codex/skills/wave-execution/SKILL.md

## Scope

Create or update:

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/shared/scoring.ts`
- `src/shared/demoData.ts` if appropriate
- `src/shared/index.ts` if useful

Use the actual scaffold paths. If `src/shared` does not exist, create it.

## Required Types

Define clean exported types for:

- `Confidence`
- `EnforcementAction`
- `MessageDeliveryMode`
- `RulePolicy`
- `PolicyStep`
- `AttributedModAction`
- `MirrorScan`
- `DriftCandidate`
- `OverrideEvent`
- `ActionSource`
- `HealthStatus`
- API response wrappers if useful

Use the draft from `docs/DATA_MODEL.md`, but adjust for TypeScript correctness and actual project conventions.

## Required Constants

Include constants for:

- app name
- app tagline
- confidence values
- enforcement action values
- message delivery modes
- override reason values
- default policy window days
- minimum sample thresholds for drift display
- demo subreddit name
- route names if useful

## Scoring Helpers

Create only pure helper stubs or simple functions for Wave 1:

- `confidenceLabel(...)`
- `isOverrideAction(...)`
- `getSmallSubredditThresholdStatus(...)`
- simple normalization helpers

Do not implement full attribution scoring yet. That belongs to Wave 2.

## Demo Data

If added, include lightweight seed objects only. Do not build full 60-action dataset yet unless trivial. Wave 2 owns full demo scan data.

## Non-goals

Do not:
- call Reddit APIs,
- call Redis,
- build dashboard UI,
- implement full mirror scan,
- implement policy editor,
- add external dependencies unless absolutely necessary.

## Acceptance Criteria

- Types compile.
- No circular imports.
- Shared files are importable from server and client.
- docs/DATA_MODEL.md is updated if implementation differs.
- TODO.md notes that shared contracts are ready for Wave 2.
- Commit changes with a granular commit message.

## Completion Report

At the end, report:

- files changed,
- types added,
- assumptions made,
- build/typecheck command result,
- next integration notes for Agents B/C.
