# WAVE7_8_ORCHESTRATOR.md

## Objective

Coordinate all sub-passes for Mega Wave 7/8.

## Execution Order

1. Agent A — UX Architecture + Design Audit
2. Agent B — Visual System + Component Shell
3. Agent C — Inline Launch Card + Expanded Mode
4. Agent D — Command Center + Setup Wizard + Demo Scenario
5. Agent E — Governance + Case Packet UI Upgrade
6. Agent F — Real Mod Workflow Hardening
7. Agent G — Manual Digest + Runtime Settings
8. Agent H — QA + Docs + Submission Readiness

## Integration Rule

Do not merge UI changes until:

- current tests pass,
- screenshots or visual inspection notes exist,
- no old flat tab dump remains,
- command center is first screen.

## Main Risk

Codex producing default UI slop.

Mitigation:

- follow UX_SPEC.md,
- follow DESIGN_SYSTEM.md,
- use uncodexify if available,
- use browser screenshot review if available,
- use Gemini/design reviewer if available,
- commit in coherent slices.

## Completion Report

At the end, report branches/worktrees used, files changed, screenshots captured, UI review tools used, commands run, tests/checks, runtime verification, known issues, and next recommended wave.
