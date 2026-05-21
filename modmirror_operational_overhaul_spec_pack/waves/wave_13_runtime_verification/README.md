# Wave 13 — Runtime Verification Harness and Safety Matrix

## Objective

Build verification harnesses and record runtime proof for the operational features. This is build validation, not submission hardening.

## Branch / worktree

Recommended branch: `overhaul/w13-runtime-verification`

## Agents to use

- QA Agent
- Runtime Agent
- Docs Agent

## Tasks

1. Create a runtime verification checklist for each operational capability.
2. Add internal diagnostic routes hidden from production menus if needed.
3. Verify menu entrypoints.
4. Verify target context fetch.
5. Verify safe test remove/approve/log-only on test content if possible.
6. Verify receipts created on success/failure.
7. Verify scan persistence.
8. Verify policy agreement lifecycle.
9. Verify non-mod access blocked if possible.
10. Verify narrow/mobile layout if possible.
11. Record exact results in docs. Do not claim unverified items.

## Deliverables

- Runtime verification matrix.
- Diagnostic harness routes if needed.
- QA reports.
- Updated capability matrix.

## Tests / verification

- type-check
- lint
- test
- build
- runtime playtest where possible

## Constraints

Not submission hardening. This is proof collection for build correctness.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
