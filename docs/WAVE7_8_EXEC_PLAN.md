# Wave 7/8 Exec Plan

## Objective

Productize ModMirror into a Reddit-native moderation command center while
preserving the existing deterministic Mirror Scan, policy, override review, and
Case Packet behavior.

## Constraints

- Follow `docs/UX_SPEC.md` and `docs/DESIGN_SYSTEM.md`.
- Keep delivery mode conservative; `log_only` remains the safe default.
- Do not add AI classification, automatic punishments, generic queueing,
  external analytics, or scheduler-first digest behavior.
- Preserve demo/live labeling and aggregate-first governance.
- Treat the existing untracked prompt bundles as user-provided inputs.

## Execution Slices

1. UX architecture and planning
   - Map old sections to Command Center, Scan, Policies, Review, Case Packets,
     Digest, and Settings.
   - Document inline versus dashboard behavior.
2. Visual system and shell
   - Replace the flat tab dump with a compact shell, navigation, action cards,
     status badges, inbox cards, markdown panels, and responsive layout tokens.
3. Inline launch and expanded fallback
   - Render a compact launch card first.
   - Use Devvit `requestExpandedMode` when available from installed typings.
   - Reveal the full dashboard in-place when expanded mode cannot be used.
4. Command Center, setup, and demo story
   - Add deterministic command center summary helpers.
   - Build guided setup/demo steps around the ExampleLearning Rule 2 story.
5. Governance and case packet polish
   - Keep health, override review, and Case Packet flows actionable and
     exportable.
6. Digest and settings
   - Add manual digest generation and runtime settings/status surfaces.
7. QA and docs
   - Run required checks, capture screenshots if tooling allows, perform UI
     review, and update acceptance/docs.

## Validation

Target checks:

- `npm install`
- `npm run build`
- `npm run type-check`
- `npm test`
- `npm run lint`
- `npm run dev`

Runtime/playtest proof and screenshots will be recorded if the local Devvit
environment and browser tooling allow it.
