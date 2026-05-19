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

Post-W34 Evidence Board runtime proof:

- Devvit playtest `v0.0.1.92` opened the comment guidance custom post
  `1thheea` in Zen as `u/BrightyBrainiac`.
- Computer Use drove the Reddit-hosted Devvit WebView.
- Screenshot captured:
  - `output/runtime-proof/post34-v92-evidence-board-receipt-snapshot.png`
- The Act workspace loaded the persisted receipt
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` from Devvit Redis.
- Clicking `Open evidence board` created a Redis-backed Evidence Board and
  navigated to the Prove workspace.
- The Prove workspace showed `Evidence board opened.`
- The board list showed
  `Review receipt receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`,
  `2 evidence items`, and status `Open`.
- The board included the receipt-backed content snapshot evidence item:
  `Snapshot captured: Runtime comment target smoke for ModMirror; safe test content.`
- Submitting the note `Runtime evidence-board smoke note.` through the status
  form returned `Evidence board status updated.`
- Entering `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` into the tracked
  action/receipt field and clicking `Generate from action` returned
  `Case packet generated.`
- The generated packet was an `Official Case Packet` for `r/modmirror_dev`
  with posture `Policy Consistent`, the same receipt ID, content snapshot
  status `captured`, verified receipt/content-snapshot/policy-version evidence
  labels, missing override/comparable labels, Markdown export, and deterministic
  caveats.
- Clicking `Open from packet` created
  `Review case packet case-packet-a7146342-1d4d-4a69-b333-790ad3e9e986`.
- The Case Packet-origin board showed `3 evidence items`, including the
  content snapshot and a case-packet summary.
- Additional screenshot captured:
  - `output/runtime-proof/post34-v92-case-packet-evidence-board.png`
- No Reddit moderation action was executed during this proof.

Post-W34 config/privacy runtime proof:

- Devvit CLI playtest reported `v0.0.1.93`; the already-open Reddit WebView
  token still reported app version `0.0.1.92`, with no production source code
  changes between those playtest starts.
- Computer Use drove the Settings UI in the Reddit-hosted Devvit WebView as
  signed-in moderator `u/BrightyBrainiac`.
- Screenshots captured:
  - `output/runtime-proof/post34-v93-config-export-import.png`
  - `output/runtime-proof/post34-v93-privacy-retention-dry-run.png`
- Config export generated `config-4c9fe762-2146-46ce-b9e3-3dfd8797327d`
  with schema `modmirror.config.v1`, source `live_config`, subreddit
  `modmirror_dev`, `includePrivateHistory: false`, `Runtime Smoke Policy`,
  digest settings, and private-history exclusion warnings.
- Starter template `template-spam-flood-review` dry-run accepted `1` policy,
  skipped `0`, left settings unchanged, and reported that
  `Spam and repeated promotion` would be imported as a new draft.
- `Import drafts` returned
  `Portable config imported as drafts and proposed updates.`, accepted `1`
  policy, skipped `0`, and the Settings summary then showed `2 policies loaded
  in this session`.
- Retention save returned
  `Retention settings saved. Policy history remains protected.`
- Privacy inventory returned counts, not private payloads: `1` retained action
  receipt, `2` retained evidence boards, `0` scan history, `0` team delivery
  receipts, `0` persisted case packets, `0` persisted AI advisory logs, and
  `Policy history Protected`.
- Retention dry-run for action receipts, evidence boards, and case packets
  returned `Dry run completed. No data was deleted.`, mode `dry run`, action
  receipts `1 selected`, evidence boards `2 selected`, case packets
  `0 selected`, and protected policy history.
- No destructive retention deletion or Reddit moderation action was executed
  during this proof.

Post-W34 Incident Mode runtime proof:

- Devvit CLI playtest reported `v0.0.1.94`.
- Computer Use drove the Settings and Act UI in the Reddit-hosted Devvit
  WebView as signed-in moderator `u/BrightyBrainiac`, with the host viewport
  selector switched to `Fullscreen`.
- Screenshots captured:
  - `output/runtime-proof/post34-v94-incident-mode-start.png`
  - `output/runtime-proof/post34-v94-incident-receipt-tag.png`
  - `output/runtime-proof/post34-v94-incident-report.png`
- Settings started Incident Mode with reason `raid`, default duration
  `120` minutes, and description
  `Runtime Incident Mode smoke for ModMirror.`
- The active banner persisted
  `incident-7aa9f981-7461-4975-a4e1-d0925cb00b36` and stated receipts would
  be tagged.
- Apply Policy created safe receipt
  `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1` for comment target
  `t1_ommzgtz` while the incident was active.
- The Receipt Ledger showed the incident tag and retained gated execution:
  execution `skipped`, mode `unverified disabled`, capability `disabled`,
  Native Mod Note `skipped (disabled)`.
- Ending the incident produced a post-incident report with `1` receipt,
  `0` overrides, `0` successes, `0` failures, and `1` skipped execution.
- No Reddit moderation action was executed during this proof.

Post-W34 Case Packet delivery receipt runtime proof:

- Devvit CLI playtest reported `v0.0.1.94`.
- Computer Use drove the Prove UI in the fullscreen Reddit-hosted Devvit
  WebView as signed-in moderator `u/BrightyBrainiac`.
- Screenshots captured:
  - `output/runtime-proof/post34-v94-case-delivery-manual-receipt.png`
  - `output/runtime-proof/post34-v94-case-delivery-mod-discussion-draft.png`
- Prove generated a Case Packet from latest action
  `action-b10aa953-9338-4932-82de-caaa6aeaa29a` and receipt
  `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1`.
- `Save manual receipt` persisted delivery receipt
  `delivery-df85dc45-32e0-41fb-86be-f354247094be` with status
  `manual ready`.
- `Save mod discussion draft` persisted delivery receipt
  `delivery-615df3a3-5dfc-422a-a474-293fa1312c5b` with status `skipped`.
- The UI confirmed no Reddit message was sent. Live Mod Discussion delivery
  remains disabled and unverified.

Post-W34 Response Preview runtime proof:

- Devvit CLI playtest reported `v0.0.1.94`.
- Computer Use drove the Act UI in the Reddit-hosted Devvit WebView.
- Screenshot captured:
  - `output/runtime-proof/post34-v94-response-preview-receipt.png`
- The recommendation panel rendered `Response Templates`, `Delivery Gated`,
  and the preview-only warning.
- The Receipt Ledger persisted `1 response template draft captured; delivery
  remained gated.` for receipts `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1`
  and `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`.
- No comment, private message, modmail, Mod Discussion, or native Mod Note was
  sent during this proof.

Post-W34 modqueue runtime fallback observation:

- Devvit CLI playtest reported `v0.0.1.94`.
- Computer Use refreshed the Act-page Operational Queue panel in the
  Reddit-hosted Devvit WebView.
- Screenshot captured:
  - `output/runtime-proof/post34-v94-modqueue-type-supported-fallback.png`
- The panel stayed reachable and non-destructive, but returned the labeled
  `type-supported` fallback rather than live `reddit_modqueue` queue items.
- W17 remains open because this did not prove Reddit modqueue adapter runtime
  behavior.

Post-W34 Review health and impact runtime proof:

- Devvit CLI playtest reported `v0.0.1.94`.
- Computer Use opened the Review tab in the Reddit-hosted Devvit WebView.
- Screenshot captured:
  - `output/runtime-proof/post34-v94-review-health-impact.png`
- Community Health loaded aggregate runtime state with `2` tracked actions,
  `0` unresolved overrides, `2` case-ready receipts, small-sample labels, and
  no per-moderator leaderboard fields.
- Policy Impact loaded stored summaries for Runtime Smoke Policy and Spam and
  repeated promotion. Runtime Smoke Policy showed source `stored`, before
  receipts `0`, after receipts `2`, before `0%`, after `100%`, and
  `Insufficient Data` due the before-adoption threshold.

## Known Gaps

- Real remove/approve/ignore-reports execution remains disabled until safe
  controlled playtest proof exists.
- Actual retention deletion, native Mod Notes, modmail/mod discussion send,
  scheduler jobs, external AI, native Reddit mobile app behavior, and non-mod
  access blocking remain unverified or disabled.
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

Post-W34 Evidence Board runtime validation passed:

- `npx devvit whoami`
- `npm run type-check`
- `npm run lint`
- `npm test -- src/server/services/evidenceBoard.test.ts src/server/services/contentSnapshots.test.ts src/server/services/receipts.test.ts`
- `npm run build`
- `npm run dev`
- Computer Use Zen Evidence Board creation/status interaction on Reddit Devvit
  WebView
- `screencapture -x output/runtime-proof/post34-v92-evidence-board-receipt-snapshot.png`
- Computer Use Zen Case Packet generation and Case Packet-origin Evidence Board
  interaction on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v92-case-packet-evidence-board.png`

Post-W34 config/privacy runtime validation passed:

- `npx devvit whoami`
- `npm run type-check`
- `npm test -- src/server/services/configPortability.test.ts src/server/services/privacyRetention.test.ts`
- `npm run dev`
- Computer Use Zen Settings interaction for config export/import and privacy
  retention inventory/dry-run controls on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v93-config-export-import.png`
- `screencapture -x output/runtime-proof/post34-v93-privacy-retention-dry-run.png`

Post-W34 Incident Mode runtime validation passed:

- `npx devvit whoami`
- `npm run type-check`
- `npm test -- src/server/services/incidentMode.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
- `npm run dev`
- Computer Use Zen Incident Mode start, receipt-tagging, and post-incident
  report interaction on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v94-incident-mode-start.png`
- `screencapture -x output/runtime-proof/post34-v94-incident-receipt-tag.png`
- `screencapture -x output/runtime-proof/post34-v94-incident-report.png`

Post-W34 Case Packet delivery receipt runtime validation passed:

- `npm test -- src/server/services/teamDelivery.test.ts src/shared/casePacketDelivery.test.ts src/server/services/privacyRetention.test.ts`
- Computer Use Zen Case Packet delivery receipt interaction on Reddit Devvit
  WebView
- `screencapture -x output/runtime-proof/post34-v94-case-delivery-manual-receipt.png`
- `screencapture -x output/runtime-proof/post34-v94-case-delivery-mod-discussion-draft.png`

Post-W34 Response Preview runtime validation passed:

- `npm test -- src/shared/responseTemplates.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
- Computer Use Zen Response Preview and Receipt Ledger inspection on Reddit
  Devvit WebView
- `screencapture -x output/runtime-proof/post34-v94-response-preview-receipt.png`

Post-W34 modqueue fallback validation passed, with W17 still open:

- `npm test -- src/server/services/modqueueTriage.test.ts`
- Computer Use Zen Operational Queue refresh on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v94-modqueue-type-supported-fallback.png`

Post-W34 Review health and impact runtime validation passed:

- `npm test -- src/server/services/communityHealth.test.ts src/server/services/policyImpact.test.ts src/server/services/policyHealth.test.ts`
- Computer Use Zen Review health and impact inspection on Reddit Devvit WebView
- `screencapture -x output/runtime-proof/post34-v94-review-health-impact.png`

Post-W34 live scan correction and replay validation passed:

- `npm test -- src/server/services/attributionCalibration.test.ts src/server/services/replaySandbox.test.ts`
- `npm run type-check`
- `npm test -- src/server/services/attributionCalibration.test.ts src/server/services/replaySandbox.test.ts src/server/services/normalizers.test.ts src/server/services/mirrorScan.test.ts`
- `npm run dev`
- Computer Use Zen live quick scan, attribution correction scope check, and
  stored-scan replay inspection on Reddit Devvit WebView `v0.0.1.101`.
- `screencapture -x output/runtime-proof/post34-v101-live-scan-correction-scope-fixed.png`
- `screencapture -x output/runtime-proof/post34-v101-replay-stored-live-scan-correction.png`

Post-W34 policy ratification runtime validation passed:

- `npm run type-check`
- `npm run lint`
- `npm run build`
- Computer Use Zen policy propose/review/blocked quick-adopt inspection on
  Reddit Devvit WebView `v0.0.1.101`, followed by a UI cleanup verification on
  `v0.0.1.104`.
- `screencapture -x output/runtime-proof/post34-v101-policy-ratification-proposed-review-block.png`
- `screencapture -x output/runtime-proof/post34-v101-policy-ratification-quick-adopt-block.png`
- `screencapture -x output/runtime-proof/post34-v104-policy-ratification-quick-adopt-hidden.png`

Post-W34 runtime matrix truth refresh passed:

- `npm test -- src/server/services/runtimeCapabilities.test.ts src/server/services/runtimeVerification.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Computer Use Zen Fullscreen Settings inspection on Reddit Devvit WebView
  `v0.0.1.109`.
- `screencapture -x output/runtime-proof/post34-v109-runtime-matrix-menu-proof-refresh-zen.png`

Post-W34 UI uniformity pass:

- `src/client/styles.css` now normalizes shared panel padding/radius, primary
  button contrast, Agree policy-step/template grids, no-policy workbench span,
  and Settings runtime capability card sizing/status alignment.
- Computer Use opened a fresh Zen window and reached the Reddit-hosted Devvit
  fullscreen path for the current playtest build, including `v0.0.1.119`.
- Follow-up Computer Use proof on Devvit playtest `v0.0.1.121` opened the
  Reddit-hosted embedded launch card, entered the dashboard, switched between
  Reddit host `Mobile` and `Fullscreen` viewport modes, and inspected Act,
  Scan, Review, and Prove headings/controls/limited-data states without taking
  any public or destructive Reddit actions.
- Screenshot evidence:
  - `output/runtime-proof/post34-v113-ui-pass-embedded-launch.png`
  - `output/runtime-proof/post34-v119-ui-pass-agree-local.png`
  - `output/runtime-proof/post34-v119-ui-pass-settings-matrix-local.png`
- Local built-client proof shows the reported Agree response-template boxes and
  Settings runtime matrix cards aligned into consistent grids. The `v0.0.1.121`
  host sweep closes the accessibility-tree coverage for launch, Act, Scan,
  Review, and Prove in Reddit host Mobile and Fullscreen modes, but it is not
  new pixel-level screenshot proof because the Computer Use bitmap capture was
  blank in that session.

Post-W34 Wave 29 subreddit-isolation runtime proof:

- `npm run dev` reached Devvit playtest ready for `r/modmirror_dev` on
  `v0.0.1.122`.
- A direct unauthenticated WebView API request returned `401` with
  `missing authorization header`, confirming runtime probes needed the Devvit
  WebView JWT.
- With `Authorization: Bearer <redacted Devvit JWT>`, `GET /api/health`
  returned version `0.0.1.122`, subreddit `modmirror_dev`, and user
  `BrightyBrainiac`.
- `GET /api/policies` and `GET /api/policies?subreddit=modmirror_dev` returned
  only `modmirror_dev` policies.
- `GET /api/policies?subreddit=ExampleLearning` remained allowed as the
  labeled demo exception.
- `GET /api/policies?subreddit=OtherCommunity`,
  `GET /api/runtime-capabilities?subreddit=OtherCommunity`, and
  `GET /api/modqueue/triage?subreddit=OtherCommunity&limit=1` returned
  `403 subreddit_isolation_failed`.
- `POST /api/policies` with body `subreddit: OtherCommunity` returned
  `400 policy_validation_failed` with the cross-subreddit isolation message,
  proving body-based policy creation is rejected before a write.
- No public Reddit writes, live scan/demo load actions, moderation actions,
  native Mod Notes, or Mod Discussion operations were performed.

## Next Engineering Risks

- Runtime proof should continue to focus on unchecked live Reddit capabilities:
  native Mod Notes, Mod Discussion sending, actual retention deletion,
  destructive moderation operations, scheduler jobs, native mobile, non-mod
  access, live modqueue items, and reviewed adoption with multiple distinct
  moderators.
- The W19 runtime pass found and fixed a UI affordance gap: quick adoption was
  correctly rejected by the API when disabled, but the Agree UI still showed the
  button. The button is now hidden unless the policy allows single-mod adoption.
- The W18/W20 runtime pass found and fixed two real integration gaps:
  stored-scan replay ignored post-scan corrections, and non-content mod-log
  targets could over-apply attribution corrections before target matching was
  restricted to `t1_`/`t3_` content IDs.
- Capability vocabulary in `schema.ts`, delivery services, and Settings should
  be consolidated if future waves add more proof states.
- The client is now large enough that future UI changes should be isolated and
  screenshot-checked on desktop and narrow widths.
