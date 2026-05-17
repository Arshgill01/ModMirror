# Wave 7/8 Prompt Pack — Mega Productization + Real Workflow

Use `WAVE7_8_MASTER_GOAL.md` as the main `/goal` prompt.

This wave combines:

- Wave 7: Productization / UX / UI quality
- Wave 8: Real moderation workflow hardening + manual digest/runtime settings

This is intentionally a large autonomous wave, but UI autonomy is constrained by the UX spec and design system.

## Core Intent

Make ModMirror feel like a real launch-grade Reddit moderation product, not a prototype embedded inside a post.

## Required Skill Usage

The master prompt tells Codex to:

- inspect available `.codex/skills`,
- use `uncodexify` if available,
- use browser automation/playwright/agent-browser skills if available,
- optionally use Gemini CLI/model helpers if installed and configured,
- run UI critique loops,
- capture screenshots,
- record findings.

## Use

From repo root on master/main:

```bash
git checkout master
git pull --ff-only || true
git status
```

Extract this prompt pack, commit it, then run:

```txt
prompts/wave7-8/WAVE7_8_MASTER_GOAL.md
```
