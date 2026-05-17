# PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md

Wave 7/8 is done only when all applicable items are checked.

## Product Experience

- [x] First screen is Command Center, not README-style Overview.
- [x] Inline post is compact launch/status card.
- [x] Expanded/full dashboard is available or fallback is documented.
- [x] Navigation is simplified to Command Center, Scan, Policies, Review, Case Packets, Digest, Settings.
- [x] Every empty state has a next action.
- [x] Demo mode tells the full story.
- [x] Live/demo data are clearly labeled.
- [x] Policy health cards are visual and actionable.
- [x] Override review is an inbox, not a raw log.
- [x] Case packets look exportable and official.
- [x] Manual digest generation works.

## Design Quality

- [x] CSS design tokens exist.
- [x] Layout is responsive.
- [x] No horizontal overflow at mobile width.
- [x] Buttons have consistent hierarchy.
- [x] Status colors have meaning.
- [x] Copy is concise and mod-native.
- [x] UI no longer looks like default Codex output.
- [x] Screenshots were captured and reviewed.
- [x] If available, uncodexify skill was used and findings were addressed.
- [x] If available, Gemini/design critique was used and findings were addressed or rejected with reasons.

## Runtime / Workflow

- [x] npm run build passes.
- [x] npm run type-check passes.
- [x] npm test passes.
- [x] npm run lint passes.
- [x] npm run dev/playtest loads.
- [x] Dashboard works in signed-in Reddit playtest.
- [x] Demo scenario works end-to-end.
- [x] Apply Policy flow still works.
- [x] Override review still works.
- [x] Case Packet flow still works.
- [x] Manual Digest flow works.
- [x] Runtime Settings page reports useful checks.

## Documentation

- [x] README updated.
- [x] PRODUCT.md updated.
- [x] DEMO_SCRIPT.md updated.
- [x] SUBMISSION_NOTES.md updated.
- [x] TODO.md updated.
- [x] RESEARCH.md updated if Devvit behavior changed.
- [x] Known limitations documented honestly.

## Notes

- `npm install`, `npm run build`, `npm run type-check`, `npm test`,
  `npm run lint`, `npx devvit whoami`, and `npm run dev` passed on
  2026-05-17. `npm install` still reports the existing 31 audit findings.
- `npm run dev` reached Playtest ready at
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`, version
  `v0.0.1.26`.
- Wave 7/8 was merged to `master` with no-ff commit
  `791c938 merge: Wave 7 8 productization` and pushed to `origin/master`.
- Signed-in Safari Reddit playtest verification opened the compact inline card,
  launched the dashboard fallback, rendered Command Center, loaded the
  ExampleLearning demo, created the Low-effort questions policy from drift, and
  verified Apply Policy preview against the selected demo policy namespace.
- Static Playwright QA passes through deterministic local demo fallbacks because
  `serve dist/client` cannot reach Devvit `/api/*` routes.

## Post-Merge Redesign Rescue Status

- The user rejected the merged Wave 7/8 visual direction as still too
  prototype/card-grid-like, so follow-up work is active on branch
  `redesign/wave7-8-command-center-ui`.
- Redesign branch commits:
  - `b7e3ab5 docs: record skill installation audit`
  - `4186dc7 feat: redesign moderation workspace UI`
  - `f91d228 docs: record redesigned UI playtest smoke`
  - `c700eaa fix: normalize settings typography and theme control`
  - `facb5e5 docs: refresh redesign completion audit`
- The redesign branch replaces the accumulated CSS override stack with a single
  operational workspace shell, desktop moderation rail, wrapping mobile nav,
  Command Center split surface, ledger-style Review/Case Packet views, and a
  global demo-mode banner.
- Post-redesign checks passed on 2026-05-18:
  `npm run type-check`, `npm run lint`, `npm run build`, and `npm test`
  (14 files, 65 tests).
- Post-redesign `npm run dev` reached Playtest ready at
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`, version
  `v0.0.1.38`.
- Signed-in Safari rendered the Reddit playtest post and compact inline
  ModMirror launch card for the redesign branch.
- Curated redesign screenshots are committed under
  `docs/screenshots/wave7-8-redesign/` for PR review.
- A focused follow-up fixed Settings typography drift and added an in-app
  `System / Light / Dark` appearance control. Static verification confirmed
  forced light/dark modes change app theme variables even when Reddit's host
  theme signal is unavailable to the WebView. Review screenshots are committed
  as `settings-light.png` and `settings-dark.png`.
- Chromium Playwright screenshot of Reddit was blocked by Reddit network
  security, and automated Safari click-through capture was blocked by macOS
  automation permissions. Both blockers are documented in `docs/UI_REVIEW.md`.
- This redesign rescue branch is not merged to `master` yet. Do not mark the
  goal complete until the user reviews the redesigned UI and explicitly gives
  the green light.
- The redesign rescue branch was pushed to
  `origin/redesign/wave7-8-command-center-ui` for review. GitHub offered PR
  URL:
  `https://github.com/Arshgill01/ModMirror/pull/new/redesign/wave7-8-command-center-ui`.
- Draft PR opened for review:
  `https://github.com/Arshgill01/ModMirror/pull/11`.
