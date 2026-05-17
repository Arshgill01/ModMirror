/goal

You are working in the ModMirror repository.

Your goal is to execute Wave 9 + Wave 10 end-to-end:

- Wave 9: Digest + Mod Discussion + Scheduler
- Wave 10: Launch Hardening + Submission Assets

This is a large autonomous implementation pass, but you must stay within the ModMirror product thesis.

## Read First

Read these files before coding:

- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- README.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DATA_MODEL.md
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_NOTES.md
- docs/WAVE9_10_EXECUTION_NOTES.md
- docs/DIGEST_SPEC.md
- docs/LAUNCH_READINESS_CHECKLIST.md
- docs/APP_REVIEW_AND_DATA_PRACTICES.md
- prompts/wave9-10/UI_AND_AGENT_PROCESS.md
- prompts/wave9-10/WAVE9_10_ORCHESTRATOR.md
- every AGENT_*.md file under prompts/wave9-10

Also read Wave 7/8 UX docs if present:

- docs/UX_SPEC.md
- docs/DESIGN_SYSTEM.md
- docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md

## Preflight Gate

Before implementing Wave 9/10, verify Wave 7/8 productization landed.

Required evidence:

- Command Center or equivalent launch-grade dashboard exists.
- Demo scenario mode is usable.
- Governance UI exists.
- Case Packet UI exists.
- Runtime/settings page or panel exists, or equivalent.
- App does not look like a raw flat tab dump.

If Wave 7/8 is not landed, STOP and write a clear report saying Wave 9/10 cannot begin yet.

## Branch / Worktree Strategy

You may use worktrees or a single integration branch.

Recommended:

- Create `integration/wave9-10-launch-loop`.
- Optionally create sub-branches:
  - `feat/wave9-digest-engine`
  - `feat/wave9-digest-ui`
  - `feat/wave9-delivery-scheduler`
  - `feat/wave10-launch-docs`
  - `feat/wave10-qa-hardening`

If using worktrees, keep them under `../modmirror-worktrees/`.

Make granular commits.

## UI / Design Process

Codex is allowed to be autonomous on backend architecture, but not on UI taste.

Follow `prompts/wave9-10/UI_AND_AGENT_PROCESS.md`.

If available, use:
- uncodexify skill,
- playwright/browser screenshots,
- agent-browser,
- Gemini CLI design review,
- tmux panes for dev/test/visual loops.

Do not produce generic card-grid AI slop.

## Wave 9 Scope

Implement:

1. Digest contracts and schema.
2. Deterministic digest engine.
3. Manual "Generate Digest Now" flow.
4. Digest preview UI.
5. Copy Markdown export.
6. Digest history in Redis.
7. Settings for digest delivery.
8. Optional mod discussion delivery if verified.
9. Optional weekly scheduler if verified.
10. Runtime capability status for digest delivery/scheduler.

Important:

- Manual digest is mandatory.
- Markdown copy/export is mandatory.
- Digest history is mandatory.
- Mod discussion delivery is optional and must be runtime-verified.
- Scheduler is optional and must be opt-in.
- Never silently send or schedule.
- If delivery/scheduler are not stable, mark them "Unavailable in this build" and keep manual digest excellent.

## Wave 10 Scope

Implement launch hardening:

1. Final UX QA pass.
2. Mobile/web responsive QA.
3. Empty/error/loading states.
4. Moderator vs non-moderator permission behavior.
5. Runtime reliability panel finalization.
6. README update.
7. App listing draft.
8. Devpost draft.
9. Data practices documentation.
10. Demo video script and screenshot checklist.
11. Launch readiness checklist.
12. Final wave report.

Do not submit Devpost.
Do not publicly publish without human confirmation.

## Required Agent Specs

Execute the intent of these files:

- AGENT_A_DIGEST_CONTRACTS_ENGINE.md
- AGENT_B_DIGEST_UI_HISTORY.md
- AGENT_C_MOD_DISCUSSION_DELIVERY.md
- AGENT_D_SCHEDULER_SETTINGS.md
- AGENT_E_LAUNCH_QA_HARDENING.md
- AGENT_F_SUBMISSION_ASSETS_DOCS.md
- AGENT_G_FINAL_RUNTIME_VISUAL_REVIEW.md

You may implement in a better order if necessary, but all acceptance criteria must be satisfied or explicitly documented as deferred.

## Product Guardrails

Do not add:

- LLM summaries,
- AI rule judgement,
- generic queue dashboard,
- automatic bans,
- external services,
- cross-subreddit analytics,
- calibration quiz mode,
- premium/payments,
- unsupported claims.

## Test Requirements

Run:

- `npm install` if needed
- `npm run build`
- `npm run type-check`
- `npm test`
- `npm run lint`
- `npm run dev` / playtest if possible

If any command fails, fix it or document the exact blocker.

## Runtime Verification

In Reddit playtest, verify at minimum:

- dashboard loads,
- digest page loads,
- demo/live data does not crash,
- Generate Digest Now works,
- Markdown copy works or graceful fallback exists,
- digest history appears,
- settings/runtime panel reports delivery/scheduler status,
- no non-mod sensitive access if testable.

If mod discussion delivery is implemented, verify it in playtest.

If scheduler is implemented, verify registration/configuration at least; do not rely on waiting a week. Provide a "run scheduled digest now" test path if feasible.

## Documentation Updates

Update:

- TODO.md
- RESEARCH.md if new Devvit facts are discovered
- docs/DATA_MODEL.md
- docs/PRODUCT.md
- docs/DEMO_SCRIPT.md
- docs/SUBMISSION_NOTES.md
- docs/LAUNCH_READINESS_CHECKLIST.md
- docs/APP_REVIEW_AND_DATA_PRACTICES.md

Create:

- docs/WAVE9_10_FINAL_REPORT.md
- docs/APP_LISTING_DRAFT.md
- docs/DEVPOST_DRAFT.md
- docs/SCREENSHOT_AND_VIDEO_PLAN.md

## Definition of Done

Wave 9/10 is done only when:

- manual digest works,
- digest Markdown export works,
- digest history works,
- runtime capability status is visible,
- launch checklist is filled,
- submission docs exist,
- tests/build/typecheck/lint pass,
- runtime playtest is verified or blockers are exact,
- master is merged and pushed,
- no public publish or Devpost submit is performed.

At completion, print a report with:

1. Summary
2. Branches/worktrees
3. Files changed
4. Commands run
5. Test results
6. Runtime verification
7. Digest status
8. Launch readiness status
9. Known issues
10. Deferred items
11. Recommended next human actions
