# Wave 32 Synthetic Eval

## What Changed

- Added a deterministic synthetic evaluation harness in `src/server/services/syntheticEval.ts`.
- Added nine named scenarios:
  - `stable_rule`
  - `high_drift`
  - `policy_improved`
  - `small_subreddit`
  - `noisy_attribution`
  - `repeated_offender`
  - `policy_version_change`
  - `incident_mode`
  - `multi_community_isolation`
- Added a checked-in golden manifest at `docs/expansion-waves/synthetic-eval-golden.json`.
- Added `scripts/synthetic-eval.mjs` as a local evaluation entrypoint.
- Added targeted Vitest coverage for deterministic generation, replay expectations, analytics expectations, golden-manifest matching, and safety labels.

## Product Utility

The harness gives ModMirror local regression fixtures for the core consistency loop:

- policy replay catches changed recommendations and skipped unmatched rows;
- drift-over-time analytics are checked against stable, improving, regressing, and insufficient-data scenarios;
- policy impact checks distinguish improved adherence, new-policy tracking, and insufficient receipt history;
- incident-mode receipts are counted without enabling live moderation behavior.
- multi-community fixtures include foreign-subreddit actions while replay and
  scan summaries stay scoped to the dataset subreddit, matching the W29
  isolation-first contract.

## Safety Notes

- Synthetic scan records are stored as `demo` source because persisted scan schema intentionally supports only live/demo sources.
- Every synthetic scan includes `Synthetic evaluation fixture: not live Reddit history.`
- Synthetic receipts use simulator/log-only execution only.
- Multi-community synthetic coverage is not cross-subreddit benchmarking; it is
  a guard against accidentally mixing communities in local evaluation fixtures.
- The harness does not call Reddit APIs, Redis, Devvit runtime, mod notes, modmail, scheduler, or external AI.

## Verification

- `npm install` passed in this worktree because `node_modules` was missing.
- `npm run type-check` passed before tests.
- `npm test -- src/server/services/syntheticEval.test.ts` passed in W32.
- `node scripts/synthetic-eval.mjs` passed in W32.
- Post-W34 multi-community isolation update:
  `npm test -- src/server/services/syntheticEval.test.ts` passed.
  `node scripts/synthetic-eval.mjs` passed.

## Remaining Risks

- This is local/static validation only. It proves deterministic service behavior, not Devvit runtime behavior.
- The golden manifest is intentionally compact; it validates evaluation summaries rather than storing full synthetic histories.
- Future waves that change replay, analytics, policy recommendation, or
  synthetic safeguard semantics should update the golden manifest
  intentionally.
