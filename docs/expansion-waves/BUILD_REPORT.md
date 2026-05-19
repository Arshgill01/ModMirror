# Expansion Waves Build Report

## Scope

This is a build report for Expansion Waves 16-34. It is not a submission,
Devpost, public launch, marketing, or demo-video report.

Integration branch: `expansion/w34-integration`

Base: `integration/operational-overhaul` at `f790eb1`

Current integrated head before W34 docs: `ca9d8e1`

## Branches And Worktrees Used

- `expansion/w16-context-intake`
- `expansion/w17-modqueue-triage`
- `expansion/w18-attribution-calibration`
- `expansion/w19-policy-ratification`
- `expansion/w20-replay-sandbox`
- `expansion/w21-community-health`
- `expansion/w22-policy-impact`
- `expansion/w23-response-library`
- `expansion/w24-mod-notes`
- `expansion/w25-appeal-modmail`
- `expansion/w26-evidence-board`
- `expansion/w27-incident-mode`
- `expansion/w28-config-portability`
- `expansion/w29-multi-community`
- `expansion/w30-privacy-controls`
- `expansion/w31-mobile-resilience`
- `expansion/w32-synthetic-eval`
- `expansion/w33-observability`
- `expansion/w34-integration`

## Implemented Features

- Content snapshots for moderation context and evidence.
- Read-only modqueue triage with capability truth.
- Attribution correction/calibration.
- Stronger policy ratification and adoption gates.
- Read-only policy replay sandbox.
- Aggregate community health lens.
- Policy impact measurements.
- Response template library.
- Native Mod Note safety gates.
- Appeal/case-packet delivery drafts.
- Collaborative evidence boards.
- Incident mode.
- Config export/import without receipts or private evidence payloads.
- Subreddit isolation guards.
- Privacy retention settings, dry-run inventory, and cleanup controls.
- Mobile/static resilience and timeout/error handling.
- Synthetic evaluation harness and golden manifest.
- Runtime capability observability and health events.

## Runtime Proofs Obtained

No Devvit playtest proof was obtained during the W16-W34 implementation pass
except local/static browser proof for W31 and W33 UI surfaces. Post-W34
follow-up runtime proof has since been added for safe smoke routes,
post/comment menu target capture, log-only receipt persistence, and Reddit's
desktop host mobile Devvit modal.

Previously recorded runtime proof still applies only to the W13 verified areas:

- Devvit playtest launched for `r/modmirror_dev`.
- Subreddit dashboard launcher appeared for a moderator.
- Subreddit dashboard confirmation form opened.
- Desktop expanded WebView rendered Act, Scan, Agree, Review, Prove, and
  Settings.

W31 static browser proof:

- Built client served from `dist/client`.
- 390px Playwright checks for Act, Scan, Review, Prove, and Settings had no
  horizontal overflow.

W33 static browser proof:

- Built client served from `dist/client`.
- Settings runtime capability matrix rendered at 390px with an intercepted
  capability response and no horizontal overflow.

Post-W34 runtime smoke proof:

- Branch `post34/runtime-smoke-controls` added authenticated Settings controls
  for the existing safe smoke routes.
- Devvit playtest `v0.0.1.73` executed Redis smoke from inside the WebView and
  reported: `Redis smoke passed: write/read matched inside Devvit playtest.`
- Devvit playtest `v0.0.1.73` executed Reddit read-only smoke from inside the
  WebView and reported: `Reddit read smoke passed: 0 rule(s), 0 removal reason(s), 5 mod log action(s).`
- Devvit playtest `v0.0.1.74` confirmed the Settings matrix and summary cards
  show Redis and Reddit source status as `verified runtime`.
- This proof covers safe Redis read/write and Reddit read-only source access
  only. It does not cover destructive moderation execution.

Post-W34 post-menu target proof:

- Branch `post34/runtime-smoke-controls` added Devvit custom post `postData`
  handoff for Apply Policy guidance posts plus `GET /api/launch-context`.
- Devvit playtest `v0.0.1.83` on the ordinary safe post
  `t3_1texjev` showed `Apply ModMirror Policy` in the post moderation actions
  menu.
- The Devvit form resolved `t3_1texjev`, target type `post`, author
  `BrightyBrainiac`, subreddit `modmirror_dev`, and title
  `ModMirror Wave 2 smoke test`.
- The expanded guidance WebView displayed `Selected Reddit target` with the
  captured target ID, author, subreddit, title, and source link in the Act
  workspace.
- No Reddit moderation action was executed during this proof.

Post-W34 comment-menu target proof:

- Devvit playtest `v0.0.1.84` on safe comment `t1_ommzgtz` showed
  `Apply ModMirror Policy` in the comment moderation actions menu.
- The Devvit form resolved `t1_ommzgtz`, target type `comment`, author
  `BrightyBrainiac`, subreddit `modmirror_dev`, and body
  `Runtime comment target smoke for ModMirror; safe test content.`
- Devvit playtest `v0.0.1.89` displayed the expanded guidance WebView
  `Selected Reddit target` strip with the captured comment ID, author,
  subreddit, body excerpt, and source link in the Act workspace.
- No Reddit moderation action was executed during this proof.

Post-W34 log-only receipt proof:

- Devvit playtest `v0.0.1.90` opened the comment guidance custom post
  `1thheea` in Zen as `u/BrightyBrainiac`.
- Computer Use drove the Reddit/Devvit UI and switched the Devvit modal to
  fullscreen before confirmation.
- The Act workspace displayed the captured comment target `t1_ommzgtz`, author
  `BrightyBrainiac`, subreddit `modmirror_dev`, and body
  `Runtime comment target smoke for ModMirror; safe test content.`
- `Runtime Smoke Policy` was selected, selected action was `warn`, Native Mod
  Note stayed `log only`, and the confirmation returned
  `Policy action recorded with receipt.`
- The Receipt Ledger displayed
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` with recommended `warn`,
  selected `warn`, execution `skipped`, mode `log only`, capability
  `not applicable`, gated response template draft, and Native Mod Note
  `skipped (disabled)`.
- No Reddit moderation action was executed during this proof.

Post-W34 mobile Devvit WebView proof:

- Devvit playtest `v0.0.1.91` opened the comment guidance custom post
  `1thheea` in Zen as `u/BrightyBrainiac`.
- Computer Use inspected the Reddit-owned Devvit modal while the host viewport
  selector remained on `Mobile`.
- Screenshots captured:
  - `output/runtime-proof/post34-v91-mobile-act-ledger.png`
  - `output/runtime-proof/post34-v91-mobile-target-form.png`
  - `output/runtime-proof/post34-v91-mobile-receipt-ledger.png`
- The mobile modal rendered the ModMirror shell, nav, Act workspace, target
  context, Apply Policy form, Operational Queue, guided setup, demo scenario,
  and Receipt Ledger without switching to fullscreen.
- The Receipt Ledger displayed
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` with recommended `warn`,
  selected `warn`, execution `skipped`, mode `log only`, capability
  `not applicable`, gated response template draft, and Native Mod Note
  `skipped (disabled)`.
- This is desktop Reddit host mobile-modal proof, not native Reddit mobile app
  proof. No Reddit moderation action was executed.

## Known Gaps

- Real remove/approve/ignore-reports execution remains disabled until safe
  controlled playtest proof exists.
- Native Mod Notes, modmail/mod discussion send, scheduler jobs, external AI,
  native Reddit mobile app behavior, and non-mod access blocking remain
  unverified or disabled.
- W34 did not publish, submit, market, or prepare final demo material.

## Validation Status

Full W34 validation passed:

- `npm run type-check`
- `npm run lint`
- `node scripts/synthetic-eval.mjs`
- `git diff --check`
- `npm test`
- `npm run build`

Post-W34 runtime-smoke validation passed:

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run dev`

Post-W34 post-menu target validation passed:

- `npm run type-check`
- `npm test -- src/server/services/targetContext.test.ts`
- `npm run dev`

Post-W34 comment-menu target validation passed:

- `npm run type-check`
- `npm run lint`
- `npm test -- src/server/services/targetContext.test.ts`
- `npm run build`
- `npm run dev`

Post-W34 log-only receipt runtime validation passed:

- `npm run dev`
- Computer Use Zen fullscreen interaction on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v90-after-confirm-click.png`
- `screencapture -x output/runtime-proof/post34-v90-receipt-ledger.png`

Post-W34 mobile-modal runtime validation passed:

- `npm run dev`
- Computer Use Zen mobile-modal interaction on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v91-mobile-receipt-ledger.png`

## Next Engineering Risks

- Runtime proof should be the next focus before expanding feature surface.
- Capability vocabulary in `schema.ts`, delivery services, and Settings should
  be consolidated if future waves add more proof states.
- The client is now large enough that future UI changes should be isolated and
  screenshot-checked on desktop and narrow widths.
