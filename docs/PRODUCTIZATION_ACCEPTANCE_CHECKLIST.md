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
