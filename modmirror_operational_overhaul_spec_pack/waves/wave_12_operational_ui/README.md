# Wave 12 — Operational UI Reframe: Act / Scan / Agree / Review / Prove

## Objective

Reframe the frontend around the real operational workflow after backend capabilities exist.

## Branch / worktree

Recommended branch: `overhaul/w12-operational-ui`

## Agents to use

- Frontend Agent
- UX Critique Agent
- uncodexify Agent if available
- Playwright Agent
- Gemini Critique Agent if available

## Tasks

1. Audit current 3k+ line frontend monolith and identify safe refactor boundaries.
2. Do not freestyle UI. Use a defined IA: Act, Scan, Agree, Review, Prove, Settings.
3. Prioritize the post/comment action flow over dashboard vanity.
4. Represent action receipts as a ledger/timeline, not generic cards.
5. Represent policy agreement as a decision record/document flow.
6. Represent case packets as documents/evidence packets.
7. Represent analytics as clear before/after trend panels with caveats.
8. Use `uncodexify`, screenshots, Playwright/browser tools, and external critique tools if installed.
9. Avoid generic AI SaaS card grid slop.
10. Keep mobile/narrow viewport in scope.

## Deliverables

- Updated IA/navigation.
- Target-aware Apply Policy UI.
- Receipt ledger UI.
- Policy agreement UI.
- Trend analytics UI.
- Case Packet v2 UI.
- Screenshots/regression notes.

## Tests / verification

- type-check
- lint
- test
- build
- static UI QA
- runtime UI QA if possible

## Constraints

No UI autonomy. Design must follow product truth and real workflow.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
