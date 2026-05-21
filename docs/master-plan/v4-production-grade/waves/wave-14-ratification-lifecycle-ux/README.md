# Wave 14 — Ratification Lifecycle UX

Status: complete

## Objective

Make policy proposal, review, blockage, quick adoption, and reviewed adoption
read as one lifecycle instead of disconnected buttons.

## Scope

- Add a four-step lifecycle view to each policy card: Draft, Propose, Review,
  Adopt.
- Show approval thresholds, current approval counts, change requests, and
  adoption blockage in the lifecycle itself.
- Keep quick adoption visible only when the policy settings allow it.
- Show a disabled reviewed-adoption action with the blocking reason when a
  proposed policy is not ready.

## Acceptance Evidence

- The Agree page now renders a ratification lifecycle for every policy card.
- Adopted policies show their adopted state and date when available.
- Proposed or reviewed policies show whether adoption is ready or blocked.
- Quick adoption text and buttons honor `allowSingleModAdoption`.
