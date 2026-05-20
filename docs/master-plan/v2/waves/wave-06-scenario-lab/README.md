# Wave 06 - Scenario Lab

## Objective

Give lead moderators a way to create and maintain calibration scenarios from
drift examples, receipts, demo cases, and manual prompts.

## Build Outcome

Team Calibration is not just hardcoded demo content. It becomes a maintainable
policy education system.

## Source Areas

- `src/server/services/calibration.ts`
- `src/server/services/receipts.ts`
- `src/server/services/scans.ts`
- `src/server/services/contentSnapshots.ts`
- `src/routes/api.ts`
- `src/client/main.ts`
- `src/shared/schema.ts`

## Implementation Slices

1. Add scenario draft schema with source reference and privacy metadata.
2. Add create/edit/archive routes.
3. Add source options: drift candidate, receipt, case packet, demo fixture, or
   manual entry.
4. Require a linked policy step or explicit "teaching scenario" reason.
5. Add acceptable alternatives and explanation fields.
6. Add preview mode before scenario is active.
7. Add starter scenario generation from Rule 2 drift.
8. Add UI for scenario list and edit form.
9. Add tests for source privacy and archive behavior.
10. Keep all scenario content deterministic.

## Quality Bar

The Scenario Lab should help a lead mod teach policy, not build a surveillance
dataset.

## Tests

- scenario CRUD tests
- source reference privacy tests
- archive/list tests
- generated starter tests

## Acceptance Criteria

- Lead mod can create and edit a scenario.
- Archived scenarios do not appear in active packs.
- Source references do not leak unnecessary sensitive content.
- Full validation passes.

