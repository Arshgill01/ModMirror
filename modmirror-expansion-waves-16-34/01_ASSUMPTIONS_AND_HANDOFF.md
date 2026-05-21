# Assumptions and Handoff

This pack assumes prior operational-overhaul waves may have implemented some or all of:
real post/comment menu entrypoints, target-aware policy recommendation, moderation execution, action receipts, scan persistence, deep scan, drift analytics, policy agreement, Case Packet v2, AI/delivery spikes, UI reframe, runtime harness, and integration.

Because Codex is currently executing waves, the continuation agent must not assume a fixed state.

## Strategy

First reload actual repo state. Then extend/complete instead of duplicating.

If a prior wave already implemented a feature:
- read it,
- test it,
- identify missing sharp edges,
- extend it.

If a prior wave partially implemented a feature:
- complete missing production path,
- keep public surface stable,
- add tests and receipts.

If a prior wave left demo fallback:
- document the gap,
- add real implementation or truthful gated fallback.

## Product emphasis

Focus on real mod-team utility, not screenshot polish.
