# Wave 09 — Scenario Lab Authoring And Archiving

Status: complete

## Objective

Expose Scenario Lab authoring and archive controls as a real client workflow
instead of only backend calibration routes.

## Scope

- Let lead mods author scenarios with title, prompt, rule key/name, expected
  action, acceptable alternatives, explanation, teaching reason, and active
  status.
- Add explicit client-side validation before submitting to the route.
- Keep server-side required-field validation strict.
- Ensure archiving removes the latest scenario record from active calibration
  packs even when older Redis sorted-set members still exist.

## Acceptance Evidence

- Scenario Lab includes acceptable-alternative checkboxes and blocks blank
  required fields before sending.
- `POST /api/calibration/scenarios` now rejects missing expected action instead
  of defaulting to `manual_review`.
- Calibration scenario listing deduplicates by scenario ID using the latest
  sorted-set member before active filtering, so archive updates win over older
  active records.
- `calibration.test.ts` covers incomplete draft rejection, acceptable
  alternatives, and archived scenarios leaving the active pack.
