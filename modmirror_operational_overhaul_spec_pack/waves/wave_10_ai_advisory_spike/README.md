# Wave 10 — AI Advisory Spike and Optional Insight Layer

## Objective

Verify whether external AI calls are safe/viable, then add advisory-only insight features if and only if the spike passes.

## Branch / worktree

Recommended branch: `overhaul/w10-ai-advisory-spike`

## Agents to use

- Runtime Research Agent
- AI Safety Agent
- Server Agent
- UX Agent
- Test Agent

## Tasks

1. Research Devvit/Hono external fetch and secrets support using official docs, installed environment, and runtime if possible.
2. Implement a minimal disabled-by-default AI provider abstraction.
3. Do not hardcode keys.
4. Add a no-key/offline fallback.
5. If viable, add advisory-only insight endpoints: drift explanation, policy draft suggestion, case packet summary, digest summary.
6. Force all AI output to cite deterministic evidence IDs/receipts/scans used as input.
7. Never use AI to decide enforcement.
8. Add UI labels: AI draft/advisory, moderator must review.

## Deliverables

- AI spike report.
- Provider abstraction if viable.
- Advisory endpoints if viable.
- Tests with mocked provider.

## Tests / verification

- type-check
- lint
- test
- build
- runtime proof if possible

## Constraints

If runtime or secrets are not viable, stop at spike report and keep feature disabled.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
