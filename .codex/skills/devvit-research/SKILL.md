---
name: devvit-research
description: Research and verify Devvit SDK, CLI, template, Reddit API, Redis, forms, menu actions, permissions, and playtest behavior for ModMirror. Use before adding or changing Devvit APIs, when RESEARCH.md needs updates, or when runtime behavior is uncertain.
---

# Devvit Research

Use this skill to reduce platform uncertainty before implementation.

## Workflow

1. Read `AGENTS.md`, `PLAN.md`, `TODO.md`, `RESEARCH.md`, `docs/DEVVIT_RESEARCH_QUESTIONS.md`, and nearby code.
2. Prefer installed package typings and generated scaffold code before external docs:
   - `node_modules/@devvit/reddit`
   - `node_modules/@devvit/redis`
   - `node_modules/@devvit/web`
   - `node_modules/@devvit/shared-types`
3. Use official Devvit docs or official GitHub templates only when local typings are insufficient.
4. Prove uncertain APIs with the smallest non-destructive smoke route, form, menu action, or script.
5. Record each finding in `RESEARCH.md` with:
   - exact method/import/config
   - evidence source
   - whether playtest verified it
   - limitation or next action

## Guardrails

- Do not hallucinate Devvit API names.
- Do not use deprecated APIs if a current replacement is verified.
- Do not perform destructive Reddit actions during research unless the user explicitly asks and the test subreddit/content is safe.
- Treat type/build proof separately from playtest proof.
- Keep smoke surfaces small and removable.

## Commands

Use the narrowest relevant commands:

```bash
npm install
npx devvit --version
npx devvit whoami
npm run type-check
npm run lint
npm run build
npm test
npm run dev
```

## Research Priorities

- `getModerationLog`, returned fields, and attribution limits.
- `getSubredditRemovalReasons` and subreddit rules.
- Redis key scope and available data structures.
- Post/comment menu request shape.
- Form chaining and `UiResponse` behavior.
- `submitComment` before/after removal.
- Modmail, private message, and native Mod Notes feasibility.
- Current user identity and moderator permission detection.
