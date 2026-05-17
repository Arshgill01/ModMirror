# Agent B — Digest UI + History

## Goal

Build the Digest page/surface.

## UI Requirements

Digest UI should include:

- title: "ModMirror Digest"
- period selector or current period label,
- Generate Digest Now CTA,
- preview panel,
- summary cards,
- rules needing attention,
- stable rules,
- unresolved override summary,
- recommendations,
- Copy Markdown button,
- digest history list.

## Design Requirements

Follow `docs/DESIGN_SYSTEM.md` and `docs/UX_SPEC.md` if present.

Do not make a generic table dump.

Every empty state must have a next action.

## Acceptance

- Judge understands the digest page in 10 seconds.
- Demo mode digest looks strong.
- Copy Markdown works or has robust fallback.
- History persists.
