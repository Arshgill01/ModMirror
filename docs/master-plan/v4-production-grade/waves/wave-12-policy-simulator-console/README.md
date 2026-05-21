# Wave 12: Policy Simulator Console

Status: complete

## Scope

Wave 12 exposes the existing read-only `/api/policies/:id/simulate` route in
the Policy Workbench UI.

## Delivered

- Simulate button beside each saved policy.
- Policy Simulator panel with same, stricter, looser, manual-review, and
  insufficient-data ratios.
- Read-only simulation case rows with historical, active, draft, confidence,
  and evidence details.
- Explicit warnings that simulations never write receipts or Reddit actions.
- Demo fallback simulation when live scan-backed simulation is unavailable.

## Verification

See `execution-log.md` for exact commands and pass/fail status.
