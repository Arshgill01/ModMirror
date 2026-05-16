# TODO.md — Current Work Queue

## Current Phase

Wave 0 — Research + Scaffold Proof

Status: Local scaffold/build proof complete. Runtime playtest is blocked until `devvit login` is completed.

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

## Recommended Wave 1

- Create `src/shared/schema.ts` with the researched data contracts.
- Create `src/shared/constants.ts` with Redis key helpers and confidence/action constants.
- Split server code into `src/server/services/` as planned while preserving the Devvit Web/Hono entrypoint.
- Add unit tests for pure helpers using the now-working `vitest.config.ts`.
- Add a minimal dashboard/health surface only after runtime playtest is unblocked.

## Do Not Start Yet

Do not implement these until playtest smoke behavior is verified:

- Full dashboard UI
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
