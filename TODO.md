# TODO.md — Current Work Queue

## Current Phase

Wave 1 — Dashboard Shell

Status: Agent C dashboard shell is implemented locally. Runtime playtest is still blocked until `devvit login` is completed.

## Wave 0 Completed

- [x] Create Devvit app scaffold from current official `mod-tool` template.
- [x] Confirm Node/npm versions.
- [x] Confirm Devvit CLI/package versions.
- [x] Confirm generated install/dev/build/upload/publish commands.
- [x] Build smallest possible Redis smoke test.
- [x] Build smallest possible Reddit API smoke test.
- [x] Build smallest possible post/comment menu action and form chaining smoke test.
- [x] Verify SDK/type support for moderation log, removal reasons, subreddit rules, submit comments, remove/approve/ignore reports, private messages, modmail, native Mod Notes, and moderator permission checks.
- [x] Replace destructive template example with non-destructive smoke-test surfaces.
- [x] Document Wave 0 findings in `RESEARCH.md`.

## Wave 0 Blocked / Not Runtime-Verified

- [ ] Complete `npx devvit login`.
- [ ] Complete `npx devvit whoami`.
- [ ] Create or bind the real Reddit app identity for `modmirror`.
- [ ] Run `npm run dev` through a full playtest session in a small test subreddit.
- [ ] Hit `/api/smoke/redis` in playtest and confirm Redis read/write.
- [ ] Hit `/api/smoke/reddit` in playtest and capture redacted sample output.
- [ ] Invoke post and comment menu smoke actions in Reddit and confirm form chaining UX.
- [ ] Verify whether `submitComment` works before and after post/comment removal.
- [ ] Verify whether a submitted removal comment can be distinguished/stickied.
- [ ] Verify private message and modmail delivery behavior.
- [ ] Verify native Mod Notes add/read/delete behavior with real moderator permissions.
- [ ] Verify exact moderator permission strings needed for aggregate versus per-mod visibility.

## Immediate Next Steps

1. Run `npm run login` and complete browser authentication.
2. Run `npx devvit whoami`.
3. Run `npm run dev` and finish playtest setup in a small test subreddit.
4. Use the smoke endpoints and menu actions to capture real sample outputs.
5. Update `RESEARCH.md` with runtime samples and any permission errors.

## Wave 1 Dashboard Shell

- [x] Add default Devvit Web client entrypoint for the dashboard shell.
- [x] Add Overview, Mirror Scan, Policies, Overrides, and Demo Mode sections.
- [x] Add Wave 1 status cards for Mirror Scan, Policy Agreement, Apply Policy, and Override Audit.
- [x] Add read-only `/api/health` response shape for app, playtest, subreddit, demo, and Redis placeholder status.
- [x] Keep demo mode toggle disabled until seeded demo data is wired.
- [ ] Verify dashboard in a real Devvit playtest after CLI auth is completed.
- [ ] Replace placeholder health Redis status after Agent B Redis data layer merges.
- [ ] Consolidate dashboard status types with Agent A shared contracts after merge.

## Recommended Wave 2 UI Tasks

- Render live Mirror Scan results from the Wave 2 scan endpoint.
- Show scanned action count, confidence breakdown, unmatched count, and drift candidates.
- Add a useful small-subreddit/no-history state that routes users to demo mode or policy setup.
- Wire demo seed data into the dashboard without making it look like live subreddit data.
- Preserve the exact “Wave 2 will implement live scan” placeholder until the scan endpoint is ready.
- Keep all inferred rule labels confidence-scored and visually distinct from confirmed data.

## Do Not Start Yet

Do not implement these until playtest smoke behavior is verified:

- Mirror scan scoring
- Policy editor
- Apply Policy flow
- Override audit dashboard
- Devpost submission copy

## Definition of Done for Wave 0

Wave 0 local definition is complete when:

- [x] The app scaffolds successfully.
- [ ] The app runs in playtest. Blocked by missing Devvit auth.
- [x] `RESEARCH.md` answers every required question with SDK evidence or documented limitation.
- [ ] At least one Redis read/write is proven in playtest. Local type/build proof exists only.
- [ ] At least one Reddit API read is proven in playtest. Local type/build proof exists only.
- [ ] Menu/form capability is proven in playtest. Local type/build proof exists only.
- [ ] Comment-after-removal behavior is tested or explicitly deferred with reason. Deferred because playtest is blocked.
- [x] `TODO.md` lists exact next steps for Wave 1.
