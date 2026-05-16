# Wave 0 Codex Goal Prompt

Use this as the first Codex `/goal` after the docs are committed.

```md
/goal

You are working in the ModMirror repository.

First read:
- AGENTS.md
- PLAN.md
- TODO.md
- RESEARCH.md
- docs/PRODUCT.md
- docs/DECISIONS.md
- docs/DEVVIT_RESEARCH_QUESTIONS.md
- docs/DATA_MODEL.md
- .codex/skills/devvit-research/SKILL.md
- .codex/skills/modmirror-product-guardrails/SKILL.md
- .codex/skills/wave-execution/SKILL.md

Your goal is Wave 0 only: Research + Scaffold Proof.

Do not build the full product yet.

Tasks:
1. Inspect the current repo and generated Devvit scaffold.
2. Confirm install/dev/build commands.
3. Confirm Devvit package/CLI versions.
4. Prove the app can run in playtest.
5. Create the smallest possible Redis smoke test.
6. Create the smallest possible Reddit API smoke test.
7. Investigate:
   - getModerationLog
   - getSubredditRemovalReasons
   - subreddit rules API
   - post/comment menu actions
   - forms and form chaining
   - submitComment behavior before/after removal
   - private message or modmail feasibility
   - native Mod Notes feasibility
   - moderator permission detection
8. Update RESEARCH.md with concrete findings.
9. Update TODO.md with what is done, blocked, and recommended next.
10. Make small commits; do not make one giant commit.
11. Do not use LLMs or external services.
12. Do not implement product UI beyond minimal proof surfaces needed for research.

Definition of done:
- App scaffolds and runs, or exact blocker is documented.
- RESEARCH.md answers every Wave 0 research question with evidence or limitation.
- TODO.md clearly states the next implementation wave.
- Repo is buildable or the failure is documented with exact command/error.
```
