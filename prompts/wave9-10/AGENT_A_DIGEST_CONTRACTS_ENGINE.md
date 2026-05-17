# Agent A — Digest Contracts + Engine

## Goal

Implement deterministic digest generation.

## Tasks

1. Add digest types to shared schema.
2. Add constants for digest periods/statuses.
3. Create digest server service.
4. Aggregate:
   - policy health,
   - active policies,
   - override review statuses,
   - recent actions,
   - case packet/action history where useful,
   - scan metadata.
5. Produce:
   - summary,
   - rule health list,
   - unresolved override summary,
   - recommendations,
   - Markdown output.
6. Store digest history in Redis.
7. Add tests.

## Rules

- No AI.
- No external services.
- Deterministic recommendations only.
- Empty/live-low-data state must still be useful.

## Acceptance

- Pure digest engine tests pass.
- Markdown output is clean.
- Demo data creates an impressive digest.
