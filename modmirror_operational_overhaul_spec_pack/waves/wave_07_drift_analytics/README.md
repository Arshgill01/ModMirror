# Wave 07 — Drift-Over-Time and Policy Impact Analytics

## Objective

Use persisted scans and receipts to prove whether policy adoption improves consistency over time.

## Branch / worktree

Recommended branch: `overhaul/w07-drift-analytics`

## Agents to use

- Analytics Agent
- Data Agent
- Frontend Agent
- Test Agent

## Tasks

1. Build analytics over scan history: drift trend by rule, action distribution over time, attribution confidence trend.
2. Build policy impact views: before/after active policy version, adherence rate, override rate, unresolved overrides.
3. Use receipts as stronger signal than inferred historical mod-log where available.
4. Add data quality/caveat messaging when history is insufficient.
5. Add APIs for trend summaries.
6. Add dashboard surfaces that show real improvement/regression without overclaiming.

## Deliverables

- Trend analytics service.
- Policy impact service/API.
- UI components for before/after consistency.
- Tests for trend computations and insufficient-data states.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

No fake analytics. If data is insufficient, say insufficient.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
