# DEVVIT_RESEARCH_QUESTIONS.md

Wave 0 resolved as much as possible with local scaffold, installed SDK typings, typecheck, lint, build, and non-destructive smoke routes. Runtime playtest remains blocked by missing Devvit CLI auth.

Status labels:

- Verified: proven by local files, installed typings, or successful commands.
- Unverified: SDK/type shape exists, but live playtest is still needed.
- Broken: a prior assumption was false.
- Deferred: intentionally left for a later wave.

## Setup

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | What is the current recommended project creation flow? | Wave 0 used the official `mod-tool` template from the Devvit template registry. | None unless Devvit template guidance changes. |
| Verified | What files does the selected Devvit template generate? | See `RESEARCH.md` Project Structure. Key files include `devvit.json`, `package.json`, `src/index.ts`, and route files. | Keep structure notes updated when Wave 1 moves files. |
| Verified | What Node version is used locally? | `v22.21.0`. | None. |
| Verified | What Devvit package/CLI version is installed? | Devvit CLI/package version `0.12.23`. | Re-check after dependency upgrades. |
| Verified | What command runs playtest? | `npm run dev` -> `devvit playtest`. | Complete auth and rerun. |
| Verified | What command builds? | `npm run build` -> `vite build`. | Keep using before handoff. |
| Verified | What command uploads? | `npm run deploy` -> typecheck/lint/test then `devvit upload`; direct command is `devvit upload`. | Use only after auth/app binding. |
| Verified | What command publishes? | `npm run launch` -> deploy then `devvit publish`; direct command is `devvit publish`. | Do not publish before explicit release approval. |

## Devvit Web

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | Is this project using Devvit Web? | Yes: `@devvit/web/server`, `@devvit/start/vite`, Hono, and `@hono/node-server`. | Preserve this shape in Wave 1. |
| Verified | Where is the client entry? | None yet. The mod-tool template is server/API/form/menu only. | Wave 1 dashboard lane must create one deliberately. |
| Verified | Where is the server entry? | `src/index.ts`, built to `dist/server/index.cjs`. | Preserve Hono entrypoint or document moves. |
| Verified | Do endpoints need `/api/` prefix? | Public routes are mounted under `/api`; internal menu/form/trigger routes under `/internal`. | Keep public product API under `/api`. |
| Verified | What server framework is generated? | Hono. | None. |
| Unverified | Are endpoint calls authenticated automatically? | Devvit context helpers exist, but runtime headers/context are not playtest-verified. | Inspect `context` during playtest. |

## Reddit API

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | How do server endpoints access Reddit API? | `import { reddit } from '@devvit/web/server'`. | Use this import unless Wave 1 finds a better generated pattern. |
| Verified | Is `getModerationLog()` available? | Yes: `reddit.getModerationLog(options)`. | Runtime-test after auth. |
| Verified | What fields does `getModerationLog()` return? | `ModAction` includes `id`, `type`, moderator, created time, subreddit, optional description/details, and optional target metadata. | Capture redacted runtime samples. |
| Broken | Does `getModerationLog()` include structured rule/removal reason fields? | No structured rule/removal reason fields in the installed `ModAction` type. | Keep attribution inferred and confidence-scored. |
| Verified | Is `getSubredditRemovalReasons()` available? | Yes: `reddit.getSubredditRemovalReasons(subredditName)`. | Runtime-test after auth. |
| Verified | What fields do removal reasons include? | `id`, `title`, `message`. | Capture redacted runtime sample. |
| Verified | Is there a subreddit rules API? | Yes: `reddit.getRules(subredditName)` and `subreddit.getRules()`. | Runtime-test after auth. |
| Broken | Does the rules API expose a stable rule ID? | No stable rule ID appears in installed `Rule` type. | Use local derived rule keys. |
| Verified | Can the app remove posts/comments? | Typings expose `reddit.remove`, `Post.remove`, and `Comment.remove`. | Runtime-test only on safe test content with confirmation. |
| Verified | Can the app approve posts/comments? | Typings expose `reddit.approve`, `Post.approve`, and `Comment.approve`. | Runtime-test only on safe test content. |
| Verified | Can the app ignore reports? | Typings expose `Post.ignoreReports()` and `Comment.ignoreReports()`. | Runtime-test only on safe test content. |
| Verified | Can the app submit comments? | Typings expose `reddit.submitComment`. | Test normal/before-removal/after-removal behavior. |
| Unverified | Can the app send private messages? | `reddit.sendPrivateMessage` exists; subreddit PM variant is deprecated. | Avoid deprecated subreddit PM; test only if needed. |
| Unverified | Can the app create modmail conversations? | `reddit.modMail.createConversation` exists. | Runtime-test before using as delivery path. |
| Unverified | Can the app add/read native Mod Notes? | Typings expose add/read/delete methods. | Runtime-test with real moderator permissions. |

## Critical Behavior

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Unverified | Can the app comment on a post after removing it? | Not playtest-verified. | Test on safe post after auth. |
| Unverified | If not, can it comment before removal and then remove? | Not playtest-verified. | Test both orderings. |
| Unverified | Can it comment on removed comments? | Not playtest-verified. | Test on safe comment after auth. |
| Unverified | Can it sticky/distinguish a removal comment? | `Comment.distinguish(makeSticky?)` exists in typings; runtime unknown. | Test after comment submission. |
| Verified | Can a post/comment menu action access target ID? | `MenuItemRequest.targetId` includes `t3_` or `t1_`. | Runtime-confirm in smoke form. |
| Verified | Can a post/comment menu action access target author? | Not directly from request; fetch target with `reddit.getPostById` or `reddit.getCommentById`. | Runtime-confirm fetch permissions. |
| Verified | Can menu actions be restricted to moderators? | `forUserType: "moderator"` in `devvit.json`. | Runtime-confirm visibility. |
| Verified | Can a menu action open a form? | `UiResponse.showForm` type/build proof. | Runtime-confirm UX. |
| Verified | Can forms chain into other forms? | Form submit can return another `UiResponse.showForm` by type/build proof. | Runtime-confirm UX. |
| Unverified | Can forms call server endpoints? | Forms submit to configured endpoints; broader endpoint-calling UX is not tested. | Keep form logic server-side until proven otherwise. |

## Redis

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | How is Redis imported? | `import { redis } from '@devvit/web/server'` or `@devvit/redis`. | Prefer the scaffold import. |
| Verified | What data structures are available? | Strings, numeric ops, hashes, sorted sets, transactions, bitfield; no list API found. | Design Wave 1 storage around verified structures. |
| Verified | Is storage per subreddit install? | Typings show default `RedisKeyScope.INSTALLATION`. | Runtime-confirm in playtest if possible. |
| Unverified | What limits matter? | Not found in local typings. | Check official docs only if data size becomes a concern. |
| Unverified | Does Redis survive app updates? | Not proven. | Runtime-test or verify with official docs before relying on update migration behavior. |
| Verified | What is the recommended key naming pattern? | `modmirror:{subreddit}:{suffix}`. | Use helper everywhere. |

## Permissions

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | What exact `devvit.json` permissions are needed for Reddit API? | `"permissions": { "reddit": true }`. | Runtime-test permission failures after auth. |
| Verified | What exact config is needed for Redis? | No separate generated permission found; Redis import typechecks/builds. | Runtime-test `/api/smoke/redis`. |
| Verified | What exact config is needed for forms/menu actions? | `menu.items[]` and top-level `forms` map in `devvit.json`. | Runtime-confirm menu visibility and form chaining. |
| Verified | What exact config is needed for triggers, if used? | Top-level `triggers` map; current smoke uses `onAppInstall`. | Do not expand triggers unless needed. |
| Verified | Can current user permissions be checked? | `context.username`, `context.userId`, `reddit.getCurrentUser()`, and `User.getModPermissionsForSubreddit` exist. | Runtime-log actual permission strings. |
| Unverified | Can we detect full/manage mod permissions? | Typings expose permission checks, but exact runtime values are unknown. | Keep per-mod analytics hidden until verified. |

## Testing

| Status | Question | Answer / evidence | Next action |
|---|---|---|---|
| Verified | Can pure functions be unit tested locally? | Yes. `npm test` passes with `vitest.config.ts`. | Add Wave 1 helper tests. |
| Verified | What test runner is generated or easy to add? | Vitest was easy to add; the generated script needed dependency/config fixes. | Keep config separate from Devvit Vite config. |
| Deferred | Can server endpoints be tested without Reddit? | Not yet implemented beyond build/type proof. | Add endpoint tests only if they stay lightweight and do not fake platform behavior too aggressively. |
| Unverified | What must be tested only in playtest? | Reddit API calls, Redis runtime, menu visibility, form UX, comment delivery, modmail/PM/Mod Notes, moderator permissions. | Complete after auth. |
