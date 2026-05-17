# UI Review — Wave 7/8

Review date: 2026-05-17

## Tools Used

- `uncodixfy` skill: used to remove generic Codex UI patterns, reduce card-grid reliance, flatten borders, and keep the palette Reddit-native.
- `frontend-design` skill: used for the dedicated visual recovery pass after the user critique.
- `agent-browser` skill: loaded as the preferred browser automation reference; Playwright was used for deterministic local screenshots because it was already available in the repo.
- Playwright CLI: captured static preview screenshots under `output/playwright/wave7-8/`.
- Gemini CLI: first headless image review failed with a model-routing/import error. The successful review ran in tmux window `modmirror-wave7-8:gemini-qa` with the interactive CLI showing `/model` as `Auto (Gemini 3)`.
- Gemini CLI was also run in tmux window `modmirror-wave7-8:gemini-design` for the cardless redesign critique. A follow-up prompt with the latest screenshot set was sent through the actual tmux pane on 2026-05-17. Gemini initially hit an internal `unexpected tool call` while reading screenshot files, then returned a design critique with `/model` set to `Auto (Gemini 3)`.
- Sub-agent delegation was attempted for reference synthesis and tool/skill discovery. Both new agents failed immediately with account usage-limit errors, so this pass used the earlier completed UI audit, Gemini tmux critique, local skills, browser QA, and direct reference synthesis instead.
- Public reference synthesis used Linear's redesign notes, GitHub Primer, Shopify Polaris Resource List, and Stripe Dashboard documentation as directional checks for density, alignment, native-feeling app chrome, resource-list workflows, and restrained settings/action surfaces.

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

## Reference-Led Recovery Pass

After the user rejected the remaining card-list direction, the UI was pushed further toward a ledger/workbench model:

- Replaced pill-like navigation with underline tabs and horizontal mobile scrolling.
- Reduced repeated rounded containers in favor of horizontal dividers, flush rows, and table-like metric strips.
- Made the Command Center use one dominant operational score block plus a signal ledger instead of equivalent metric cards.
- Split Policies into a desktop workbench: policy editor and Apply Policy sit side-by-side, with mobile falling back to stacked task surfaces.
- Converted Review into a severity inbox with a red attention rail only for unresolved exceptions.
- Converted Case Packet summary from metric cards into a document-style status strip.
- Tightened mobile layouts and verified no horizontal overflow at 390px.
- Replaced a CSS `:has()` dependency with an explicit `status-needs-attention` class for safer Devvit WebView rendering.

Latest reference-pass screenshots:

- `output/playwright/wave7-8/reference6-inline.png`
- `output/playwright/wave7-8/reference6-command-empty.png`
- `output/playwright/wave7-8/reference6-scan-demo.png`
- `output/playwright/wave7-8/reference6-policies-workbench.png`
- `output/playwright/wave7-8/reference7-review-inbox.png`
- `output/playwright/wave7-8/reference6-case-packet.png`
- `output/playwright/wave7-8/reference6-digest.png`
- `output/playwright/wave7-8/reference6-settings.png`
- `output/playwright/wave7-8/reference6-mobile-settings.png`
- `output/playwright/wave7-8/reference6-mobile-policies.png`
- `output/playwright/wave7-8/reference7-mobile-review.png`

Static Playwright overflow checks reported `horizontalOverflow=false` for every screenshot above. The static preview still uses deterministic client fallbacks because `serve dist/client` cannot reach Devvit `/api/*`.

Remaining design risk:

- The UI is now substantially flatter and more operational, but forms still use bounded task surfaces where containment helps prevent mistakes in the embedded Reddit context.
- The mobile Policies view still stacks into long task surfaces; this is acceptable for function, but a future polish wave could add accordion sections or a narrower policy-step table.

## Final Gemini Tmux Critique

Gemini's latest verdict: acceptable for hackathon submission. It said the move from card grids to flush ledgers crosses the threshold from "AI prototype" to intentional product design.

Remaining critique and response:

- Metadata lists still looked like definition-list grids. Response: changed `.compact-metrics` and `.status-list` to wrapped inline metadata rows with bullet separators on desktop.
- Policy-step forms still needed more power-user density. Response: tightened the horizontal policy-step grid and reduced input heights.
- The 72px consistency score was too heavy. Response: reduced the score block and score type so the inbox/workbench content carries more visual weight.

Final density-pass screenshots:

- `output/playwright/wave7-8/final-density-inline.png`
- `output/playwright/wave7-8/final-density-command.png`
- `output/playwright/wave7-8/final-density-review.png`
- `output/playwright/wave7-8/final-density-policies-v3.png`
- `output/playwright/wave7-8/final-density-mobile-policies.png`

Final static overflow checks reported `horizontalOverflow=false` for desktop
and mobile. The Policies form screenshot was recaptured after widening the
recommended-action select so `temporary ban suggested` is readable.
