# Wave 10 - Integration Hardening

## Objective

Bring the product-health, calibration, runtime-proof, reliability, and UX lanes
together and remove integration rough edges.

## Dependencies

- Wave 07
- Wave 08
- Wave 09

## Deliverables

- End-to-end local walkthrough of core loop.
- API route consistency review.
- Client error-state review.
- Shared schema/type cleanup only where necessary.
- Documentation updates for durable implementation facts.

## Guardrails

- No broad refactors for style.
- No submission artifacts.
- No new external services.

## Acceptance Criteria

- Full validation commands pass.
- Core loop is internally consistent across API, UI, receipts, and docs.
- Known gaps are documented in `TODO.md` or runtime proof docs.
