# ModMirror Operational Overhaul Spec Pack

This pack is not a submission-prep pack. It is a build-only, operational-overhaul spec pack for turning ModMirror from a polished governance/demo dashboard into a real Reddit moderation tool.

The target product is:

> A policy-enforced moderation copilot for Reddit teams: open a post/comment, see team policy and comparable cases, confirm the action, have ModMirror apply the Reddit action, log any deviation, and later prove whether the team became more consistent.

## Pack layout

- `00_MASTER_SLASH_CALL_PROMPT.md` — paste this into Codex as the top-level slash-call / goal prompt.
- `01_REPO_TRUTH.md` — brutally honest product/repo truth Codex must treat as source of truth.
- `02_EXECUTION_PROTOCOL.md` — worktree, branch, commit, sub-agent, test, and reporting protocol.
- `03_BRANCH_WORKTREE_MAP.md` — proposed branch/worktree layout and integration order.
- `04_GLOBAL_ACCEPTANCE_CRITERIA.md` — non-negotiable quality bar across all waves.
- `05_NO_SUBMISSION_BOUNDARY.md` — explicit ban on Devpost/submission/publish work in this run.
- `06_RUNTIME_RESEARCH_TARGETS.md` — platform behaviors that must be verified before enabling features.
- `waves/` — wave-by-wave specs and agent prompts.
- `shared_specs/` — cross-wave specs for receipts, scan history, policy agreement, UI IA, AI safety, and safety gates.

## How this is intended to run

Codex should read this whole folder, create worktrees, execute wave branches, test heavily, produce PRs/merge branches where appropriate, and keep implementation reports inside the repo. This is intentionally large. The goal is not a 5-minute patch; the goal is multiple hours of serious implementation.

## Absolute boundary

Do not do Devpost, final submission hardening, public publishing, app-store publishing, community outreach, or final demo copy in this run.
