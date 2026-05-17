# PRODUCTIZATION_ACCEPTANCE_CHECKLIST.md

Wave 7/8 is done only when all applicable items are checked.

## Product Experience

- [ ] First screen is Command Center, not README-style Overview.
- [ ] Inline post is compact launch/status card.
- [ ] Expanded/full dashboard is available or fallback is documented.
- [ ] Navigation is simplified to Command Center, Scan, Policies, Review, Case Packets, Digest, Settings.
- [ ] Every empty state has a next action.
- [ ] Demo mode tells the full story.
- [ ] Live/demo data are clearly labeled.
- [ ] Policy health cards are visual and actionable.
- [ ] Override review is an inbox, not a raw log.
- [ ] Case packets look exportable and official.
- [ ] Manual digest generation works.

## Design Quality

- [ ] CSS design tokens exist.
- [ ] Layout is responsive.
- [ ] No horizontal overflow at mobile width.
- [ ] Buttons have consistent hierarchy.
- [ ] Status colors have meaning.
- [ ] Copy is concise and mod-native.
- [ ] UI no longer looks like default Codex output.
- [ ] Screenshots were captured and reviewed.
- [ ] If available, uncodexify skill was used and findings were addressed.
- [ ] If available, Gemini/design critique was used and findings were addressed or rejected with reasons.

## Runtime / Workflow

- [ ] npm run build passes.
- [ ] npm run type-check passes.
- [ ] npm test passes.
- [ ] npm run lint passes.
- [ ] npm run dev/playtest loads.
- [ ] Dashboard works in signed-in Reddit playtest.
- [ ] Demo scenario works end-to-end.
- [ ] Apply Policy flow still works.
- [ ] Override review still works.
- [ ] Case Packet flow still works.
- [ ] Manual Digest flow works.
- [ ] Runtime Settings page reports useful checks.

## Documentation

- [ ] README updated.
- [ ] PRODUCT.md updated.
- [ ] DEMO_SCRIPT.md updated.
- [ ] SUBMISSION_NOTES.md updated.
- [ ] TODO.md updated.
- [ ] RESEARCH.md updated if Devvit behavior changed.
- [ ] Known limitations documented honestly.
