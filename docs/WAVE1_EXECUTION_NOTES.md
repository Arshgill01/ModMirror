# WAVE1_EXECUTION_NOTES.md

## Recommended Strategy

Wave 1 can be parallelized because it is mostly skeleton/contracts work.

Do not parallelize Wave 2 until Wave 1 has merged cleanly.

## Parallel Lanes

| Agent | Lane | Risk |
|---|---|---|
| A | Shared contracts | Low |
| B | Redis/data layer | Medium |
| C | Dashboard shell | Medium |
| D | Docs/research sync | Low |

## Key Integration Point

Agent A's shared types should eventually become the source of truth. If Agent B or C creates duplicate temporary types, consolidate them after merge.

## Avoid

- Full Mirror Scan implementation.
- Full policy editor.
- Complex scoring.
- Real enforcement actions.
- Any claim that demo placeholders are working features.

## Wave 2 Starts When

- dashboard shell exists,
- data contracts exist,
- Redis helper exists,
- docs match Wave 0,
- build passes.
