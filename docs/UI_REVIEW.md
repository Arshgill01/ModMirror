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
- Expanded-mode behavior is runtime verified on the redesign branch in Reddit
  playtest `v0.0.1.65`. The in-post fallback remains implemented for hosts
  that ignore the WebView mode request.

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

## Post-Merge Redesign Rescue Pass

The user rejected the merged UI as still too card-heavy and prototype-like, so a
new branch `redesign/wave7-8-command-center-ui` replaced the accumulated CSS
override stack with a single coherent operational workspace system.

Skills/process used:

- `frontend-design`: used for a page-level redesign rather than local component
  polish.
- `uncodixfy`: used to reject metric-card grids, soft SaaS chrome, decorative
  copy, and repeated rounded containers.
- Matt Pocock `prototype` workflow: used as the design process reference for
  making structural layout changes rather than color-only tweaks.
- Gemini CLI: run in actual tmux window
  `modmirror-wave7-8:gemini-redesign`, model display `Auto (Gemini 3)`, after
  screenshot capture.

Screenshots captured/reviewed in this pass:

- `output/playwright/wave7-8/redesign-rescue/final-inline.png`
- `output/playwright/wave7-8/redesign-rescue/final-command-empty.png`
- `output/playwright/wave7-8/redesign-rescue/final-scan-demo.png`
- `output/playwright/wave7-8/redesign-rescue/final-policies-demo.png`
- `output/playwright/wave7-8/redesign-rescue/final-review-demo.png`
- `output/playwright/wave7-8/redesign-rescue/final-case-demo-v2.png`
- `output/playwright/wave7-8/redesign-rescue/final-mobile-command.png`

Curated review screenshots are also committed for PR review:

- `docs/screenshots/wave7-8-redesign/inline.png`
- `docs/screenshots/wave7-8-redesign/command-center.png`
- `docs/screenshots/wave7-8-redesign/policies.png`
- `docs/screenshots/wave7-8-redesign/review.png`
- `docs/screenshots/wave7-8-redesign/case-packet.png`
- `docs/screenshots/wave7-8-redesign/mobile-command-center.png`
- `docs/screenshots/wave7-8-redesign/settings-light.png`
- `docs/screenshots/wave7-8-redesign/settings-dark.png`

Typography/theme follow-up:

- Settings ledger values were reduced from a larger 20px treatment to the same
  15px operational value scale used elsewhere.
- Added an in-app `System / Light / Dark` appearance control because Reddit's
  host theme toggle is not guaranteed to propagate into the Devvit WebView.
- Static verification confirmed forced light and forced dark modes update CSS
  variables, Settings value font size remains `15px`, and desktop Settings has
  no horizontal overflow.

Gemini critique and response:

- Mobile nav showed only a partial `Case Packets` label. Response: changed
  mobile/tablet nav from horizontal clipping to a wrapping grid so all
  destinations remain visible.
- Demo mode labels were scattered. Response: added a global demo banner in the
  dashboard shell when ExampleLearning data is active.
- Review decision buttons had equal weight. Response: made the two active
  governance decisions visually primary and left passive decisions secondary.
- Case Packet content looked like a dashboard split. Response: converted the
  packet detail into a single-column document flow.
- Review nav did not auto-load governance data. Response: Review navigation now
  triggers governance loading so demo fallback data appears without an extra
  Refresh click.

Current accepted direction:

- Persistent moderation rail on desktop, compact wrapping nav on mobile.
- Command Center as an operational split surface: score, next action, signals,
  then setup/demo workflow.
- Review and Case Packets use ledgers/document rows instead of repeated
  decorative cards.
- The UI still uses some bordered task surfaces for forms and export textareas
  because those are error-prone workflows inside a constrained Reddit WebView.

Runtime follow-up on 2026-05-18:

- `npm run dev` reached Devvit Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`, version
  `v0.0.1.38`, on branch `redesign/wave7-8-command-center-ui`.
- After the Settings theme/typography follow-up, `npm run dev` reached Devvit
  Playtest ready for the same URL at version `v0.0.1.39`, and Safari was
  opened to the refreshed playtest URL for live review. A later expanded-modal
  restoration reached `v0.0.1.65` and is documented below.
- Signed-in Safari rendered the Reddit playtest post and the compact inline
  ModMirror launch card.
- Playwright Chromium capture of the Reddit URL was blocked by Reddit network
  security; screenshot saved locally at
  `output/playwright/wave7-8/redesign-rescue-runtime/reddit-playtest.png`.
- Safari screen capture of the signed-in page was saved locally at
  `output/playwright/wave7-8/redesign-rescue-runtime/safari-playtest.png`.
- Automated click-through to the expanded dashboard was not captured because
  macOS `System Events` click automation returned error `-25200`, and Safari
  `do JavaScript` automation hung before returning DOM access.

Expanded modal restoration follow-up on 2026-05-18:

- The user asked to restore the Devvit viewport dropdown behavior. The app now
  launches the dashboard through Reddit's native expanded WebView modal again.
- `npm run dev` reached Devvit Playtest ready at `v0.0.1.65`.
- Signed-in Safari verified the compact inline launch card, native expanded
  modal, host `Mobile` viewport dropdown, and native theme control.
- The host viewport dropdown/theme button are Reddit/Devvit chrome outside
  ModMirror's DOM. They are intentionally kept for viewport switching, even
  though their visual style cannot be controlled by the app.
- The same runtime pass verified the demo workflow end to end: scan, policy
  creation from drift, Apply Policy preview/confirm with override capture, Case
  Packet Markdown export, Review inbox/health, Manual Digest generation, and
  Settings.
