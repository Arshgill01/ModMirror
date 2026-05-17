# UI Review — Wave 7/8

Review date: 2026-05-17

## Tools Used

- `uncodixfy` skill: used to remove generic Codex UI patterns, reduce card-grid reliance, flatten borders, and keep the palette Reddit-native.
- Playwright CLI: captured static preview screenshots under `output/playwright/wave7-8/`.
- Gemini CLI: first headless image review failed with a model-routing/import error. The successful review ran in tmux window `modmirror-wave7-8:gemini-qa` with the interactive CLI showing `/model` as `Auto (Gemini 3)`.

## Screenshots Reviewed

- `output/playwright/wave7-8/final-inline.png`
- `output/playwright/wave7-8/final-command-center-demo.png`
- `output/playwright/wave7-8/final-scan-demo.png`
- `output/playwright/wave7-8/final-review-inbox-clean.png`
- `output/playwright/wave7-8/final-case-packet-clean.png`
- `output/playwright/wave7-8/final-digest.png`
- `output/playwright/wave7-8/final-mobile-settings.png`

## Gemini Summary

Gemini passed the current palette, alignment, card fatigue, mobile usability, and moderation-product feel. It described the UI as a serious utility surface rather than a generic SaaS dashboard.

Remaining critique:

- Review and Case Packet views could be denser.
- Command Center has both a primary action row and setup checklist, which can compete for attention.
- Consistency score needed clearer semantic context.
- Some Case Packet table widths create mild reading zigzag.
- Inline Open Dashboard button was too large relative to the compact card.

## Changes Applied After Review

- Added a compact score meter under the Command Center consistency score.
- Reduced Review inbox and Case Packet row padding.
- Flattened nested metric borders inside inbox/action cards.
- Reduced inline launch-card CTA width on desktop while preserving full-width mobile behavior.
- Removed duplicate page-level CTAs that competed with in-page workflow actions.

## Remaining Accepted Risk

- The UI still uses bordered containers because Devvit WebViews need strong structure in constrained Reddit surfaces. The current treatment is intentionally closer to Reddit mod tooling than a freeform SaaS dashboard.
- Expanded-mode behavior is type/build verified but not yet Reddit playtest verified. The in-post fallback is implemented.

## Cardless Follow-up

After the initial Gemini review, the user asked whether the app could move away
from the card format entirely. A second Gemini tmux review was started against
the `final2-*` screenshots and the CLI successfully read six image files, but
the model did not return within the bounded wait and the request was cancelled.

Implemented cardless refinements:

- Converted major dashboard surfaces from rounded cards to full-width ledger
  bands with horizontal rules.
- Converted Review and Case Packet content from stacked cards into row/list
  panes.
- Converted Settings from a card grid into a table-like runtime ledger.
- Reduced global radii and kept stronger rounding only for nav and inline
  launch-card affordances.
- Preserved bordered cells where they improve scanability in the constrained
  Reddit WebView.

Latest cardless screenshots:

- `output/playwright/wave7-8/cardless-inline.png`
- `output/playwright/wave7-8/cardless-command-center.png`
- `output/playwright/wave7-8/cardless-review.png`
- `output/playwright/wave7-8/cardless-case-packet.png`
- `output/playwright/wave7-8/cardless-mobile-settings.png`
