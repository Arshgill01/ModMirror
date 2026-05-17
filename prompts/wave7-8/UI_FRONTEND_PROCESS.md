# UI_FRONTEND_PROCESS.md — Mandatory Frontend Process

Codex is strong at implementation but must not freestyle the UI.

## Before Editing UI

1. Read docs/UX_SPEC.md, docs/DESIGN_SYSTEM.md, docs/PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md, docs/DEMO_SCRIPT.md.
2. Inspect current UI files.
3. Identify existing component structure.
4. Make a short UI implementation plan.
5. Create a screenshot baseline if browser tooling exists.

## Skills

Inspect available skills:

```bash
find .codex/skills -maxdepth 2 -name SKILL.md -print
```

If an `uncodexify` skill exists:

- read its SKILL.md,
- follow it after the first UI implementation pass,
- apply its critique,
- document before/after changes.

If browser automation / playwright / agent-browser skills exist:

- use them to run the Reddit playtest UI,
- capture screenshots,
- test responsive widths,
- record issues.

## Gemini / External Model Review

If Gemini CLI is installed and authenticated, use it as a design reviewer, not as a blind code generator.

Probe first:

```bash
which gemini || true
gemini --help || true
```

Do not assume exact model names. If the user has aliases such as Gemini 3.1 Pro or Gemini Flash, use the available configured aliases. If model listing exists, inspect it.

Suggested usage:

- ask a stronger model for product/UX critique of screenshots or component descriptions,
- ask faster model instances for narrow review tasks: mobile layout critique, copy clarity, empty-state quality, visual hierarchy.

Do not paste secrets. Do not block if Gemini is unavailable.

If Gemini is used, save summary to `docs/UI_REVIEW.md`.

## Tmux

If running inside tmux, Codex may use panes for dev server, tests, and browser QA. Use stable session names. Do not spawn unbounded panes. Record useful commands in the completion report.

## UI Definition of Done

The UI is not done until:

- it looks intentionally designed,
- command center is useful,
- inline card is compact,
- expanded/full dashboard is usable,
- demo mode tells a story,
- empty states are action-oriented,
- mobile layout works,
- screenshots were captured,
- tests still pass.
