# ModMirror Expansion Spec Pack — Waves 16–34

Continuation pack for the next major build pass after the current operational-overhaul work.

This is **not** a submission/Devpost/final-polish pack.

Goal: keep expanding ModMirror into a real-world useful moderation product:
- operationally useful at the post/comment action point,
- safe enough for real moderators,
- evidence-first rather than AI-theater,
- deeply testable,
- resilient to Devvit/runtime capability differences,
- differentiated enough for a serious large-scale Reddit hackathon.

## Use

1. Let the current Codex run finish.
2. Ensure commits/branches/PRs from that run are available locally.
3. Give Codex `00_CONTINUATION_GOAL_PROMPT.md`.
4. Point Codex at the entire repo and this folder.
5. Tell Codex to execute continuation waves with worktrees/branches/PRs.
6. Do not let Codex skip state reload.

## Non-goal

Do **not** do Devpost, app listing, submission hardening, public publish, demo video, or final marketing work in this pack.
