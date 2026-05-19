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

## Still Not Verified

- Destructive moderation execution (`remove`, `approve`, `ignoreReports`).
- Native Mod Notes, modmail/mod discussion delivery, scheduler jobs, native
  Reddit mobile app behavior, and non-mod access blocking.

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
