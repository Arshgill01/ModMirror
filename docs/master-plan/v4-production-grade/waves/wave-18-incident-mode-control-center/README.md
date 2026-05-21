# Wave 18: Incident Mode Control Center

Status: complete

## Goal

Make Incident Mode feel like an explicit, temporary operations control instead
of a plain settings form, while preserving the existing safety boundary: it tags
ModMirror receipts and changes review context only.

## Delivered

- Added safe preset cards for raid watch, spam flood, and brigading review.
- Added active time-left and receipt-tag context to the global banner and
  Settings panel.
- Added visible active safeguards stating that normal Apply Policy confirmation
  remains required and no Reddit state is changed automatically.
- Kept the existing explicit end flow and post-incident report path.

## Safety Boundary

Incident Mode still does not auto-remove, auto-ban, comment, message, add mod
notes, or bypass Apply Policy confirmation. Presets only start a temporary
incident record through the existing `/api/incidents/start` route.
