# Wave 06 - UX Quality Sweep

## Objective

Make the existing Devvit WebView feel coherent, dense, and moderator-ready
across Act, Scan, Agree, Review, Prove, Settings, launch card, and narrow mode.

## Source Areas

- `src/client/main.ts`
- `src/client/styles.css`
- client helper tests
- static render or browser QA artifacts

## Deliverables

- Consistent card/form/metric/button spacing.
- No text overlap at narrow widths.
- Clear status labels for demo/live/runtime proof states.
- Reduced cognitive noise on first-run and sparse states.
- UI QA screenshots or browser evidence stored only as development QA artifacts.

## Guardrails

- Do not make a marketing landing page.
- Do not add submission screenshots as deliverables.
- Do not introduce decorative UI that obscures moderation workflow.

## Acceptance Criteria

- Desktop expanded WebView surfaces are readable.
- Narrow/mobile host mode has no obvious overlap.
- UI labels remain honest about unverified capabilities.
- Full validation commands pass.
