# TODO.md — Current Work Queue

## Current Phase

Wave 1 — Redis/Data Layer

Status: Local Redis/data-access skeleton is implemented. Runtime playtest is still blocked until `devvit login` is completed.

## Wave 1 Completed Locally

- [x] Create shared TypeScript data contracts in `src/shared/schema.ts`.
- [x] Create shared constants for confidence levels, enforcement actions, and override reasons.
- [x] Centralize Redis key construction in `src/server/services/redis.ts`.
- [x] Add `getAppConfig` / `setAppConfig`.
- [x] Add `getDemoModeState`, `getDemoModeFlag`, and `setDemoModeFlag`.
- [x] Add `getPolicyByRule`, `setPolicyByRule`, and `listPolicies`.
- [x] Add `saveLastScanMetadata` and `getLastScanMetadata`.
- [x] Add `saveAuditEvent` and `listRecentAuditEvents`.
- [x] Rewire `/api/smoke/redis` through the Wave 1 Redis service.

## Wave 1 Runtime Blocked / Not Runtime-Verified

- [ ] Hit `/api/smoke/redis` in playtest and confirm `modmirror:{subreddit}:smoke:redis-data-layer` write/read.
- [ ] Confirm Redis hash behavior for `modmirror:{subreddit}:policies`.
- [ ] Confirm Redis sorted-set ordering for `modmirror:{subreddit}:overrides`.
- [ ] Confirm practical Redis storage limits for scan metadata and audit events before storing larger live datasets.

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

## Recommended Wave 2

- Build Mirror Scan on top of `src/server/services/scans.ts`.
- Keep attribution deterministic and confidence-scored.
- Use `src/server/services/policies.ts` only for policy lookup/persistence; do not add editor UI in Wave 2 unless explicitly scoped.
- Add focused tests for pure attribution/scoring helpers once those helpers exist.

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
