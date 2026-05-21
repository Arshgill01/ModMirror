/goal
You are operating inside the `Arshgill01/ModMirror` repository. Your task is to implement the operational-overhaul spec pack in this folder.

This is NOT a submission-prep run. Do not work on Devpost, final app listing, final demo video, public publishing, public launch, community outreach, or final submission materials. We are still building. The user explicitly does not want submission hardening yet.

## Mission

Turn ModMirror from a polished governance/demo dashboard into a real Reddit moderation tool.

Current product truth:
- ModMirror has a strong thesis: find enforcement drift before users do.
- It has a substantial Devvit Web/Hono/Redis/schema/frontend/test foundation.
- It currently fails the real product loop because Apply Policy is log-only and does not execute Reddit moderation actions.
- It still exposes Wave 0 "ModMirror smoke test" menu items.
- It stores scan metadata but not full attributed scan history.
- "Policy Agreement" is currently policy CRUD/versioning, not true multi-mod agreement.
- Case Packets are promising but too dependent on ModMirror's own simulated/logged data.
- Demo fallbacks are useful for static preview but must never be confused with live runtime functionality.

North-star product loop:
1. A moderator opens a Reddit post/comment menu.
2. ModMirror captures target context.
3. ModMirror shows the relevant team policy, version, recommendation, evidence, and comparable cases.
4. The moderator confirms an action.
5. ModMirror applies the Reddit action when runtime-verified and safe.
6. ModMirror creates an immutable action receipt.
7. If the moderator deviates from policy, ModMirror requires and stores an override reason.
8. Later, ModMirror shows whether consistency improved after policy adoption.

## Execution mode

Read every file in this spec pack before coding.

Then:
1. Create a root execution report at `docs/operational-overhaul/EXECUTION_LOG.md`.
2. Create worktrees/branches for the waves according to `03_BRANCH_WORKTREE_MAP.md`.
3. Use multiple branches and PRs. Do not dump everything into one giant commit.
4. Use sub-agents if available. Assign agents by domain: Devvit runtime research, server/services, schema/data model, frontend/UX, tests/QA, docs/reports.
5. Use installed UI/frontend skills where available, especially `uncodexify`, Playwright/browser automation, screenshots, and any available browser-use or agent-browser skill. Do not let the model freestyle UI into generic card-grid slop.
6. Use web search for Devvit/Reddit SDK/runtime behavior when the repo's `RESEARCH.md` is incomplete or stale. Prefer official Reddit Devvit docs, installed typings, and runtime playtest proof over guesses.
7. If Gemini CLI or other design/review agents are installed, use them as critique assistants for UI/IA only. Do not let them override safety or product truth.
8. Implement in waves. Each wave must have tests and a wave report before being marked complete.
9. Commit frequently with meaningful messages.
10. Keep demo mode labeled and separate from live mode.
11. Do not claim runtime verification without actual playtest/browser/runtime proof.
12. Do not enable destructive behavior as a default. Every real moderation action must require explicit moderator confirmation.
13. Do not ask the user for guidance unless truly blocked. Make safe, conservative product decisions and document them.

## Expected end state of this run

At the end of this build run, the repo should have:
- No prototype smoke-test menu labels in production config.
- Real post/comment ModMirror menu entrypoints.
- Target context capture for posts/comments.
- A real moderation execution service with safe confirmation gates.
- Action receipts that distinguish real Reddit actions from log-only simulations.
- Full scan persistence and scan history.
- Deeper scan attempts with caps/warnings and runtime proof notes.
- Drift-over-time analytics.
- A true policy proposal/review/adoption lifecycle.
- Stronger Case Packet evidence model.
- Optional AI advisory spike and feature only if runtime-safe.
- Optional mod-team delivery spike only if runtime-safe.
- Reframed UI around Act / Scan / Agree / Review / Prove.
- Runtime verification harness and QA matrix for build confidence.

Again: no final submission work.
