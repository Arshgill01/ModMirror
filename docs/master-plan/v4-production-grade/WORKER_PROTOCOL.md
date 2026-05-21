# V4 Worker Protocol

Date: 2026-05-21

## Required Prompt Prefix

Every subagent prompt for this plan must begin with:

```txt
/goal
```

Do not use `/code` for new subagent prompts in this thread.

## Branch And Worktree Rules

Preferred branch names:

```txt
v4/wave-03-client-state-actions
v4/wave-07-calibration-quiz
v4/wave-10-drift-radar
v4/wave-21-runtime-smoke
```

Preferred worktree path pattern:

```txt
../ModMirror-v4-wave-03-client-state-actions
```

Workers must:

- start from the current `master`;
- run `git status --short --branch` before edits;
- avoid reverting unrelated changes;
- keep ownership to the assigned write set;
- update the matching wave execution log;
- run targeted validation first, then the full gate when their wave changes
  production behavior.

## Merge Rules

A wave is mergeable only when:

- implementation matches the wave README and product guardrails;
- relevant tests or QA proof were run;
- `git diff --check` passes;
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass
  unless the wave log documents a precise blocker;
- runtime claims are backed by real Devvit/WebView evidence, not local tests;
- the final response lists files touched and commands run.

## Initial Parallel Lanes

### Lane A: Client Extraction

Waves: 03-04

Owned paths:

- `src/client/state/*`
- new `src/client/actions/*` or `src/client/components/common/*`
- narrow imports/bindings in `src/client/main.ts`
- focused tests for extracted helpers

Avoid:

- changing calibration, drift radar, policy simulator, or settings UI behavior.

### Lane B: Calibration Product Loop

Waves: 07-09

Owned paths:

- calibration-specific client rendering/actions once extracted;
- `src/server/services/calibration*` only if a real API contract gap is found;
- calibration tests;
- calibration wave logs.

Avoid:

- broad client shell refactors;
- unrelated policy workbench changes.

### Lane C: Drift Radar And Simulator

Waves: 10-12

Owned paths:

- Drift Radar client rendering/actions;
- Policy Simulator client rendering/actions;
- narrowly scoped shared UI helpers if needed;
- related tests.

Avoid:

- calibration quiz changes;
- Settings/incident/config/privacy changes.

### Lane D: Runtime Proof

Waves: 21-23

Owned paths:

- `RESEARCH.md`
- `TODO.md`
- `docs/operational-overhaul/*`
- runtime proof output files under `output/runtime-proof/`

Avoid:

- destructive/public/delivery/mod-note/scheduler/external AI actions without
  explicit approval;
- code changes unless route proof reveals a concrete bug.
