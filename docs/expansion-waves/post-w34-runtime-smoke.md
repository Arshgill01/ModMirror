# Post-W34 Runtime Smoke Controls

Date: 2026-05-19

Branch: `post34/runtime-smoke-controls`

## Scope

This is a post-W34 build follow-up, not a submission pass. It adds an
authenticated Settings UI for existing safe smoke routes so runtime proof can
be gathered from inside Reddit's Devvit WebView instead of relying on external
curl calls that lack the WebView authorization token.

## What Changed

- Added Settings buttons for:
  - Redis smoke: `POST /api/smoke/redis`
  - Reddit read-only smoke: `POST /api/smoke/reddit`
- Kept both controls explicitly non-destructive in UI copy.
- Displayed pass/fail feedback after each smoke check.
- Reloaded the runtime capability matrix after each smoke check.
- Updated the legacy Redis/Reddit Settings summary cards to read from the
  runtime capability matrix so they do not contradict verified runtime status.
- Added a compact Apply Policy launch payload to form-created custom posts via
  Devvit `postData`.
- Added `GET /api/launch-context` so the WebView can recover the selected
  post/comment target from Devvit request context instead of relying on the
  parent Reddit URL hash.
- Added an Act workspace target context strip that shows the selected Reddit
  target before any policy action is previewed or confirmed.
- Added the selected comment body excerpt to the Act target context strip so
  comment launches are visually attributable in the WebView.

## Runtime Proof

Playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Versions observed:
  - `v0.0.1.73` for executing the smoke buttons.
  - `v0.0.1.74` for final UI confirmation after the Settings summary card fix.
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: existing `ModMirror policy dashboard` custom post in
  `r/modmirror_dev`.

Verified in Devvit WebView:

- Settings rendered the safe smoke controls.
- Redis smoke completed with the UI message:
  `Redis smoke passed: write/read matched inside Devvit playtest.`
- Reddit read-only smoke completed with the UI message:
  `Reddit read smoke passed: 0 rule(s), 0 removal reason(s), 5 mod log action(s).`
- Runtime capability matrix promoted to `2 runtime`.
- Final `v0.0.1.74` Settings summary cards showed:
  - `Redis status`: `verified runtime`
  - `Reddit source status`: `verified runtime`

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version observed: `v0.0.1.83`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: ordinary safe post
  `https://www.reddit.com/r/modmirror_dev/comments/1texjev/modmirror_wave_2_smoke_test/?playtest=modmirror`.

Verified in Reddit post menu and Devvit WebView:

- The post moderation actions menu showed `Apply ModMirror Policy`.
- Selecting it opened the `Apply ModMirror Policy` form with:
  - target thing ID `t3_1texjev`
  - target type `post`
  - target author `BrightyBrainiac`
  - subreddit `modmirror_dev`
  - resolved title `ModMirror Wave 2 smoke test`
- Accepting `Open policy dashboard` created and opened a guidance custom post.
- Expanding the dashboard showed the Act workspace target strip:
  - `Selected Reddit target`
  - `t3_1texjev`
  - `BrightyBrainiac`
  - `modmirror_dev`
  - `ModMirror Wave 2 smoke test`
  - `Open source item`
- No Reddit moderation action was taken during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Versions observed: `v0.0.1.84` for the initial comment form proof and
  `v0.0.1.89` for the body-excerpt WebView proof.
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: ordinary safe comment created for this runtime proof:
  `t1_ommzgtz` on post `t3_1texjev`.

Verified in Reddit comment menu and Devvit WebView:

- A safe test comment was posted with body:
  `Runtime comment target smoke for ModMirror; safe test content.`
- The comment moderation actions menu showed `Apply ModMirror Policy`.
- Selecting it opened the `Apply ModMirror Policy` form with:
  - target thing ID `t1_ommzgtz`
  - target type `comment`
  - target author `BrightyBrainiac`
  - subreddit `modmirror_dev`
  - resolved body `Runtime comment target smoke for ModMirror; safe test content.`
- Accepting `Open policy dashboard` created and opened guidance custom posts.
- Expanding the dashboard showed the Act workspace target strip:
  - `Selected Reddit target`
  - `t1_ommzgtz`
  - `BrightyBrainiac`
  - `modmirror_dev`
  - the selected comment body excerpt
  - `Open source item`
- No Reddit moderation action was taken during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version observed: `v0.0.1.90`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: comment guidance custom post
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- UI driver: Computer Use against Zen, with the Devvit modal switched from
  `Mobile` to `Fullscreen` before confirming the action.
- Screenshots:
  - `output/runtime-proof/post34-v90-after-confirm-click.png`
  - `output/runtime-proof/post34-v90-receipt-ledger.png`

Verified in fullscreen Reddit Devvit WebView:

- The Act workspace loaded the menu-captured comment target:
  - target thing ID `t1_ommzgtz`
  - target type `comment`
  - target author `BrightyBrainiac`
  - subreddit `modmirror_dev`
  - body `Runtime comment target smoke for ModMirror; safe test content.`
- `Runtime Smoke Policy` was selected.
- The selected action was changed from the default `remove` to `warn` so it
  matched the policy recommendation and did not need an override reason.
- Native Mod Note mode remained `log only`.
- Confirming `Confirm log-only action` showed:
  `Policy action recorded with receipt.`
- The response preview showed:
  `Receipt receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0 recorded. No Reddit action was applicable.`
- The Receipt Ledger showed the saved receipt:
  - receipt ID `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`
  - target `t1_ommzgtz`
  - rule `Runtime Smoke Policy`
  - recommended action `warn`
  - selected action `warn`
  - execution `skipped`
  - mode `log only`
  - capability `not applicable`
  - response template draft captured; delivery remained gated
  - native Mod Note `skipped (disabled)`
- No Reddit moderation action was executed during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version observed: `v0.0.1.91`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: comment guidance custom post
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- UI driver: Computer Use against Zen with the Reddit host viewport selector
  left on `Mobile`.
- Screenshots:
  - `output/runtime-proof/post34-v91-mobile-act-ledger.png`
  - `output/runtime-proof/post34-v91-mobile-target-form.png`
  - `output/runtime-proof/post34-v91-mobile-receipt-ledger.png`

Verified in Reddit desktop host `Mobile` Devvit WebView:

- The ModMirror shell, nav, Act workspace, target context, Apply Policy form,
  Operational Queue, guided setup, demo scenario, and Receipt Ledger rendered
  in the mobile modal without switching to fullscreen.
- The Act workspace retained the menu-captured comment target:
  - target thing ID `t1_ommzgtz`
  - target author `BrightyBrainiac`
  - subreddit `modmirror_dev`
  - body `Runtime comment target smoke for ModMirror; safe test content.`
- The Apply Policy form retained the captured target fields, `Runtime Smoke
  Policy`, selected action control, Native Mod Note control, override controls,
  Preview, and Confirm log-only action controls.
- The Receipt Ledger displayed the prior log-only receipt:
  - receipt ID `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`
  - recommended action `warn`
  - selected action `warn`
  - execution `skipped`
  - mode `log only`
  - capability `not applicable`
  - response template draft captured; delivery remained gated
  - native Mod Note `skipped (disabled)`
- No Reddit moderation action was executed during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version observed: `v0.0.1.92`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: comment guidance custom post
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- UI driver: Computer Use against Zen in the Reddit-hosted Devvit WebView.
- Screenshot:
  - `output/runtime-proof/post34-v92-evidence-board-receipt-snapshot.png`

Verified in Reddit Devvit WebView:

- The Act workspace Receipt Ledger loaded the persisted receipt
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` after playtest advanced to
  `v0.0.1.92`.
- Clicking `Open evidence board` created a Redis-backed Evidence Board and
  navigated to the Prove workspace.
- The Prove workspace showed `Evidence board opened.`
- The board list showed
  `Review receipt receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`,
  `2 evidence items`, and status `Open`.
- One evidence item was the receipt-backed content snapshot:
  `Snapshot captured: Runtime comment target smoke for ModMirror; safe test content.`
- Submitting the note `Runtime evidence-board smoke note.` through the board
  status form returned `Evidence board status updated.`
- Entering `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` into the tracked
  action/receipt field and clicking `Generate from action` returned
  `Case packet generated.`
- The generated packet showed:
  - `Official Case Packet`
  - subreddit `r/modmirror_dev`
  - posture `Policy Consistent`
  - receipt `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`
  - content snapshot status `captured`
  - evidence labels for verified receipt, content snapshot, policy version,
    missing override context, and missing comparables
  - Markdown export with deterministic caveats
- Clicking `Open from packet` created
  `Review case packet case-packet-a7146342-1d4d-4a69-b333-790ad3e9e986`.
- The Case Packet-origin board showed `3 evidence items`, including the
  content snapshot and a case-packet summary.
- No Reddit moderation action was executed during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version reported by Devvit CLI: `v0.0.1.93`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: comment guidance custom post
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- UI driver: Computer Use against Zen in the Reddit-hosted Devvit WebView.
- Note: the already-open Reddit WebView token still reported app version
  `0.0.1.92`; no production source code changed between the `v0.0.1.92` and
  `v0.0.1.93` playtest starts.
- Screenshots:
  - `output/runtime-proof/post34-v93-config-export-import.png`
  - `output/runtime-proof/post34-v93-privacy-retention-dry-run.png`

Verified in Reddit Devvit WebView:

- Settings export generated live package
  `config-4c9fe762-2146-46ce-b9e3-3dfd8797327d` with schema
  `modmirror.config.v1`, source `live_config`, subreddit `modmirror_dev`,
  `includePrivateHistory: false`, `Runtime Smoke Policy`, digest settings, and
  private-history exclusion warnings.
- Loading starter template `template-spam-flood-review` populated the import
  JSON with `Spam and repeated promotion`.
- Import dry-run returned `Dry run completed. No policies or settings were
  written.`, accepted `1` policy, skipped `0`, and left settings unchanged.
- `Import drafts` returned
  `Portable config imported as drafts and proposed updates.`, accepted `1`
  policy, skipped `0`, and the Settings summary showed `2 policies loaded in
  this session`.
- Saving retention settings returned
  `Retention settings saved. Policy history remains protected.`
- Privacy inventory returned `Privacy inventory loaded. It reports counts, not
  private payloads.` and showed `1` retained action receipt, `2` retained
  evidence boards, `0` scan history, `0` team delivery receipts, `0` persisted
  case packets, `0` persisted AI advisory logs, and protected policy history.
- Dry-run deletion for action receipts, evidence boards, and case packets
  returned `Dry run completed. No data was deleted.`, mode `dry run`, action
  receipts `1 selected`, evidence boards `2 selected`, case packets
  `0 selected`, and protected policy history.
- No destructive retention deletion and no Reddit moderation action were
  executed during this proof.

Additional playtest:

- Command: `npm run dev`
- Devvit URL: `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`
- Version reported by Devvit CLI: `v0.0.1.94`
- Browser: signed-in Zen desktop browser as `u/BrightyBrainiac`.
- Surface: comment guidance custom post
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- UI driver: Computer Use against Zen in the Reddit-hosted Devvit WebView,
  with the host viewport selector switched to `Fullscreen`.
- Screenshots:
  - `output/runtime-proof/post34-v94-incident-mode-start.png`
  - `output/runtime-proof/post34-v94-incident-receipt-tag.png`
  - `output/runtime-proof/post34-v94-incident-report.png`

Verified in Reddit Devvit WebView:

- Settings started Incident Mode with reason `raid`, default duration
  `120` minutes, and description
  `Runtime Incident Mode smoke for ModMirror.`
- The active banner showed
  `incident-7aa9f981-7461-4975-a4e1-d0925cb00b36` and stated that receipts
  would be tagged.
- Apply Policy created safe receipt
  `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1` for comment target
  `t1_ommzgtz` while the incident was active.
- The Receipt Ledger showed the incident tag:
  `Incident: incident-7aa9f981-7461-4975-a4e1-d0925cb00b36. Tagged for post-incident review.`
- The receipt stayed gated: execution `skipped`, mode `unverified disabled`,
  capability `disabled`, and Native Mod Note `skipped (disabled)`.
- Ending the incident produced a post-incident report with `1` receipt,
  `0` overrides, `0` successes, `0` failures, and `1` skipped execution.
- The recent incidents list changed from `raid - active` to `raid - ended`.
- No Reddit moderation action was executed during this proof.

## Case Packet Delivery Receipt Proof

Validated on Devvit playtest `v0.0.1.94` in the fullscreen Reddit-hosted
Devvit WebView.

Screenshots:

- `output/runtime-proof/post34-v94-case-delivery-manual-receipt.png`
- `output/runtime-proof/post34-v94-case-delivery-mod-discussion-draft.png`

Verified in Reddit Devvit WebView:

- Prove generated a Case Packet from latest action
  `action-b10aa953-9338-4932-82de-caaa6aeaa29a` and receipt
  `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1`.
- Clicking `Save manual receipt` persisted delivery receipt
  `delivery-df85dc45-32e0-41fb-86be-f354247094be` with status
  `manual ready`.
- Clicking `Save mod discussion draft` persisted delivery receipt
  `delivery-615df3a3-5dfc-422a-a474-293fa1312c5b` with status `skipped`.
- The UI confirmed `Mod Discussion draft receipt saved. No Reddit message was sent.`
- The supported path remains manual Markdown copy. Live Mod Discussion delivery
  remains disabled and unverified.

## Response Preview Receipt Proof

Validated on Devvit playtest `v0.0.1.94` in the Reddit-hosted Devvit WebView.

Screenshot:

- `output/runtime-proof/post34-v94-response-preview-receipt.png`

Verified in Reddit Devvit WebView:

- The Act recommendation panel rendered `Response Templates`, `Delivery Gated`,
  and the preview-only warning.
- Receipt `receipt-bc1cf6eb-f184-43ea-beb6-4f6ade9399a1` persisted
  `1 response template draft captured; delivery remained gated.`
- Receipt `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` also persisted
  `1 response template draft captured; delivery remained gated.`
- Both receipts kept Reddit delivery disabled or log-only, with native Mod Note
  `skipped (disabled)`.

## Still Not Verified

- Destructive moderation execution (`remove`, `approve`, `ignoreReports`).
- Actual retention deletion, native Mod Notes, modmail/mod discussion delivery,
  scheduler jobs, native Reddit mobile app behavior, and non-mod access
  blocking.

## Commands Run

- `npm install`
- `npm run type-check`
- `npm run lint`
- `npm run build`
- `npm run dev`
- Computer Use Zen fullscreen interaction for the `v0.0.1.90` receipt proof.
- Computer Use Zen mobile-modal interaction for the `v0.0.1.91` narrow
  WebView proof.
- `screencapture -x output/runtime-proof/post34-v91-mobile-receipt-ledger.png`
- `npm test -- src/server/services/evidenceBoard.test.ts src/server/services/contentSnapshots.test.ts src/server/services/receipts.test.ts`
- Computer Use Zen Evidence Board creation/status interaction for the
  `v0.0.1.92` receipt-backed board proof.
- `screencapture -x output/runtime-proof/post34-v92-evidence-board-receipt-snapshot.png`
- Computer Use Zen Case Packet generation and Case Packet-origin Evidence Board
  interaction for the `v0.0.1.92` proof.
- `screencapture -x output/runtime-proof/post34-v92-case-packet-evidence-board.png`
- `npx devvit whoami`
- `npm run type-check`
- `npm test -- src/server/services/configPortability.test.ts src/server/services/privacyRetention.test.ts`
- Computer Use Zen config export/import and privacy retention dry-run
  interaction for the `v0.0.1.93` proof.
- `screencapture -x output/runtime-proof/post34-v93-config-export-import.png`
- `screencapture -x output/runtime-proof/post34-v93-privacy-retention-dry-run.png`
- `npm test -- src/server/services/incidentMode.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
- Computer Use Zen Incident Mode start, receipt-tagging, and post-incident
  report interaction for the `v0.0.1.94` proof.
- `screencapture -x output/runtime-proof/post34-v94-incident-mode-start.png`
- `screencapture -x output/runtime-proof/post34-v94-incident-receipt-tag.png`
- `screencapture -x output/runtime-proof/post34-v94-incident-report.png`
- `npm test -- src/server/services/teamDelivery.test.ts src/shared/casePacketDelivery.test.ts src/server/services/privacyRetention.test.ts`
- Computer Use Zen Case Packet delivery receipt interaction for the
  `v0.0.1.94` proof.
- `screencapture -x output/runtime-proof/post34-v94-case-delivery-manual-receipt.png`
- `screencapture -x output/runtime-proof/post34-v94-case-delivery-mod-discussion-draft.png`
- `npm test -- src/shared/responseTemplates.test.ts src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts`
- Computer Use Zen Response Preview and Receipt Ledger inspection for the
  `v0.0.1.94` proof.
- `screencapture -x output/runtime-proof/post34-v94-response-preview-receipt.png`
