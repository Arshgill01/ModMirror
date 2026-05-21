# Wave 06 — Deep Scan and Pagination Research/Implementation

## Objective

Attempt deeper moderation-log scanning with runtime-safe caps and warnings. Do not pretend deeper scan works if runtime disproves it.

## Branch / worktree

Recommended branch: `overhaul/w06-deep-scan`

## Agents to use

- Runtime Research Agent
- Scanner Agent
- QA Agent

## Tasks

1. Inspect installed typings and official docs for moderation-log listing pagination.
2. Implement configurable scan depth: quick, standard, deep.
3. Use safe caps and page sizes.
4. Record warnings if runtime/API returns fewer records or pagination fails.
5. Add scan mode metadata so UI can explain how deep the scan was.
6. Add tests with mocked paginated listings.
7. If playtest is available, verify on `modmirror_dev` and record exact behavior.

## Deliverables

- Deep scan options.
- Paginated fetch helper if supported.
- Scan depth UI/API contract.
- Runtime research report.

## Tests / verification

- type-check
- lint
- test
- build
- runtime proof if possible

## Constraints

Do not assert API capability without proof. Shallow fallback must remain safe and transparent.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
