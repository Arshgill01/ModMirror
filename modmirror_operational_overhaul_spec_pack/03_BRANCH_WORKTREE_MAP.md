# Branch / Worktree Map

This is a proposed map. Adjust only if implementation dependencies require it.

## Core sequential lane

1. `overhaul/w00-truth-and-control`
2. `overhaul/w01-entrypoints-context`
3. `overhaul/w02-recommendation-core`
4. `overhaul/w03-moderation-execution`
5. `overhaul/w04-receipts-ledger`

These are the critical path. Real Apply Policy depends on this lane.

## Parallel analytics lane

Can begin after W00, but should merge after W04 integration if it uses receipt data.

6. `overhaul/w05-scan-persistence`
7. `overhaul/w06-deep-scan`
8. `overhaul/w07-drift-analytics`

## Product workflow lane

Can begin after W00/W05, but final integration should consider W04/W07.

9. `overhaul/w08-policy-agreement`
10. `overhaul/w09-case-packets-v2`

## Spike lane

These are verification-first. Do not convert to default behavior unless proven.

11. `overhaul/w10-ai-advisory-spike`
12. `overhaul/w11-team-delivery-spike`

## UX/runtime lane

Should use the integrated backend contracts.

13. `overhaul/w12-operational-ui`
14. `overhaul/w13-runtime-verification`

## Integration lane

15. `integration/operational-overhaul`

Use this to merge wave branches, resolve conflicts, and run whole-repo checks. This is not submission work.
