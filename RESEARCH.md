# RESEARCH.md — Devvit Platform Findings

This document is the source of truth for verified Devvit behavior in this repo.

Do not assume Devvit API behavior. Verify it here.

## Research Status

Status: Wave 1 local Redis/data layer proof complete; Reddit playtest blocked by missing CLI auth.

Last updated: 2026-05-16

Updated by: Codex

## Environment

| Item                      | Finding                                                                                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Node version              | `v22.21.0`                                                                                                                                          |
| npm version               | `10.9.4`                                                                                                                                            |
| Devvit CLI version        | `@devvit/cli/0.12.23 darwin-arm64 node-v22.21.0`                                                                                                    |
| Devvit packages           | `@devvit/start@0.12.23`, `@devvit/web@0.12.23`, `devvit@0.12.23`; transitive `@devvit/reddit@0.12.23`, `@devvit/redis@0.12.23`                      |
| Template used             | Official Devvit template registry entry `mod-tool`, URL `https://github.com/reddit/devvit-template-mod-tool-devvit-web/archive/refs/heads/main.zip` |
| App name in `devvit.json` | `modmirror`                                                                                                                                         |
| Test subreddit            | Not configured; `devvit playtest` would create/use a default only after auth                                                                        |
| Dev command               | `npm run dev` -> `devvit playtest`                                                                                                                  |
| Build command             | `npm run build` -> `vite build`                                                                                                                     |
| Upload command            | `npm run deploy` -> checks then `devvit upload`; direct command is `devvit upload`                                                                  |
| Publish command           | `npm run launch` -> deploy then `devvit publish`; direct command is `devvit publish`                                                                |

## Assumption Status Summary

| Status | Assumption | Evidence / next action |
|---|---|---|
| Verified | The generated app is a Devvit Web server scaffold using Hono, `@devvit/web/server`, and `@devvit/start/vite`. | `devvit.json`, `package.json`, `src/index.ts`, and successful `npm run build`. |
| Verified | Public API routes can be mounted under `/api`; internal form/menu/trigger routes can be mounted separately. | Build-verified Hono routing in `src/index.ts` and route files. |
| Verified | Reddit API methods for moderation log, removal reasons, rules, submit comment, remove, approve, ignore reports, private messages, modmail, Mod Notes, and permission checks exist in installed typings. | Local SDK typings in `node_modules/@devvit/*` plus `npm run type-check`. |
| Verified | `getModerationLog()` does not expose structured removal reason or subreddit rule fields in the installed `ModAction` type. | `node_modules/@devvit/reddit/RedditClient.d.ts`. |
| Verified | Subreddit `Rule` does not expose a stable rule ID in the installed SDK type. | `Rule` type in installed typings. |
| Verified | Redis can be imported from `@devvit/web/server`, defaults to installation scope, and supports string/hash/sorted-set style operations. | `RedisClient.d.ts`; smoke code typechecks/builds. |
| Unverified | Reddit API methods work in the target subreddit during playtest. | Blocked until `devvit login`, app identity binding, and `npm run dev` playtest. |
| Unverified | Redis read/write works in playtest. | Type/build proof only; hit `/api/smoke/redis` after auth. |
| Unverified | Menu actions and chained forms work in the Reddit UI. | Type/build proof only; invoke smoke menu actions after auth. |
| Unverified | Comment delivery before/after removal works reliably, and comments can be distinguished/stickied in the intended order. | Must be tested on safe test content before enabling public-comment default. |
| Unverified | Modmail/private message/native Mod Notes runtime permission behavior. | Typings exist; playtest with moderator permissions required. |
| Unverified | Exact moderator permission strings for per-mod analytics gating. | Typings expose permission checks; runtime values need logging. |
| Broken | Historical mod-log entries can be treated as having perfect rule/removal reason attribution. | `ModAction` lacks structured rule/removal metadata. |
| Broken | Policy records can rely on a Devvit-provided stable subreddit rule ID. | `Rule` type lacks stable ID. |
| Broken | The generated template's `npm test` worked without changes. | Template referenced Vitest without including it; Wave 0 added `vitest` and `vitest.config.ts`. |
| Deferred | Rich dashboard/client implementation. | No client entry exists yet; Wave 1 owns the skeleton. |
| Deferred | Full Mirror Scan scoring, policy editor, Apply Policy, and override audit. | Must wait for Wave 1 contracts and remaining playtest proof. |

## Known Platform Constraints

- The current scaffold is Devvit Web with a server-first Hono structure. It does not currently have a React/client dashboard entry.
- `npm run dev` maps to `devvit playtest` and cannot complete until `devvit login` succeeds and the app identity/test subreddit flow is completed.
- `permissions.reddit = true` is required for Reddit API methods. Redis did not require a separate generated `devvit.json` permission in this template.
- Menu actions are configured in `devvit.json` with `menu.items[]`; form endpoints are configured through the top-level `forms` map.
- Historical `ModAction` records expose action text and target metadata, but not structured rule IDs or removal reason IDs.
- Subreddit rules expose `shortName`, `description`, `violationReason`, `priority`, and related fields, but no stable SDK rule ID.
- `sendPrivateMessageAsSubreddit` exists in typings but is deprecated and should not be used.
- Comment-before/removal and comment-after/removal behavior is unknown until playtest verifies it on safe test content.
- Per-mod analytics must remain omitted or hidden until moderator permission checks are runtime-verified.

## Implementation Warnings for Future Agents

- Do not add product code that assumes a generated client app exists; create the dashboard shell deliberately in Wave 1.
- Do not claim live Reddit/Redis/menu behavior is verified from typecheck or build alone.
- Do not use mod-log attribution as certain; every inferred rule/removal match needs confidence and evidence.
- Do not store policies by raw Devvit rule ID unless a runtime-stable ID is later discovered.
- Do not enable public comments, private messages, modmail, Mod Notes, or destructive enforcement as default behavior before playtest records the exact runtime behavior and permission errors.
- Use `log_only` as the default message-delivery mode until public comment delivery is proven before/after removal.

## Project Structure

Generated/modded Wave 0 tree:

```txt
.github/dependabot.yml
.gitignore
.prettierrc
.vscode/settings.json
LICENSE
devvit.json
eslint.config.js
package-lock.json
package.json
src/core/smoke.ts
src/index.ts
src/routes/api.ts
src/routes/forms.ts
src/routes/menu.ts
src/routes/triggers.ts
tsconfig.json
vite.config.ts
vitest.config.ts
```

Notes:

- The repository initially had planning docs only; no `package.json`, `src/`, or `devvit.json`.
- The prompt requested `.codex/skills/devvit-research/SKILL.md`, `.codex/skills/modmirror-product-guardrails/SKILL.md`, and `.codex/skills/wave-execution/SKILL.md`, but those files were not present. `TREE.txt` listed them, and `scripts/bootstrap_dirs.sh` creates their directories only.
- The official mod-tool template ships a destructive "Mop" moderation example. Wave 0 replaced it with non-destructive smoke endpoints/forms.

## Devvit Configuration

### `devvit.json`

Important fields discovered:

```json
{
  "name": "modmirror",
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "menu": {
    "items": [
      {
        "label": "ModMirror smoke test",
        "location": "comment",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/smoke-comment"
      },
      {
        "label": "ModMirror smoke test",
        "location": "post",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/smoke-post"
      }
    ]
  },
  "forms": {
    "smokeTarget": "/internal/form/smoke-target-submit",
    "smokeChained": "/internal/form/smoke-chained-submit"
  },
  "triggers": {
    "onAppInstall": "/internal/triggers/on-app-install"
  },
  "scripts": {
    "build": "vite build",
    "dev": "vite build --watch"
  },
  "permissions": {
    "reddit": true
  }
}
```

### Required permissions/capabilities

| Capability                     | Required config                                                                                            |       Verified? | Notes                                                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | --------------: | ---------------------------------------------------------------------------------------------------- |
| Reddit API read/write          | `"permissions": { "reddit": true }`                                                                        | Type/build only | Template uses this for Reddit API. Playtest blocked by auth.                                         |
| Redis                          | No explicit `devvit.json` permission found in generated template; import `redis` from `@devvit/web/server` | Type/build only | `@devvit/web/server` re-exports `@devvit/redis`; `RedisClient` defaults to installation scope.       |
| Menu actions                   | `menu.items[]` with `location`, `forUserType`, `endpoint`                                                  | Type/build only | Post/comment menu locations are configured.                                                          |
| Forms                          | Top-level `forms` map from form name to endpoint                                                           | Type/build only | Menu action returns `UiResponse.showForm`.                                                           |
| Triggers                       | Top-level `triggers` map                                                                                   | Type/build only | Template includes `onAppInstall`. Not needed for MVP yet.                                            |
| Devvit Web dashboard/endpoints | `server.dir`, `server.entry`; Hono server mounted by `src/index.ts`                                        |  Build verified | Public API routes are mounted under `/api`. Internal menu/form/trigger routes are under `/internal`. |

## Devvit Web Findings

| Question                          | Answer                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Is this project using Devvit Web? | Yes. It uses `@devvit/web/server`, `@devvit/start/vite`, Hono, and `@hono/node-server`.                        |
| Client entry                      | None in the mod-tool template; this is a server/API/form/menu scaffold, not a dashboard UI yet.                |
| Server entry                      | `src/index.ts`, built to `dist/server/index.cjs`.                                                              |
| Endpoint prefix                   | Public endpoints are mounted under `/api`; internal menu/form/trigger endpoints are mounted under `/internal`. |
| Server framework                  | Hono.                                                                                                          |
| Endpoint auth                     | Not playtest-verified. Server context comes from Devvit request headers via `@devvit/web/server` `context`.    |

## Reddit API Findings

### `getModerationLog`

| Question                        | Answer                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Exists in SDK?                  | Yes. `reddit.getModerationLog(options)` exists in `node_modules/@devvit/reddit/RedditClient.d.ts`.                                  |
| Method path/import              | `import { reddit } from '@devvit/web/server'`; method `reddit.getModerationLog({ subredditName, limit, pageSize }).all()`.          |
| Required permission             | `permissions.reddit = true` in `devvit.json`.                                                                                       |
| Works in playtest?              | Not verified; blocked by CLI auth.                                                                                                  |
| Returns action type?            | Yes, `ModAction.type`.                                                                                                              |
| Returns target ID?              | Yes when present, `ModAction.target?.id`.                                                                                           |
| Returns target author?          | Yes when present, `ModAction.target?.author`.                                                                                       |
| Returns moderator name?         | Yes, `ModAction.moderatorName`.                                                                                                     |
| Returns removal reason?         | No structured removal reason field in `ModAction` type. Only `description`, `details`, and `target` may contain text to infer from. |
| Returns subreddit rule ID/name? | No structured rule ID/name field in `ModAction` type.                                                                               |
| Pagination/limit behavior       | Returns `Listing<ModAction>` with `limit`, `pageSize`, `after`, `before` via listing options.                                       |

Raw type shape:

```ts
interface ModAction {
  id: string;
  type: ModActionType;
  moderatorName: string;
  moderatorId: T2;
  createdAt: Date;
  subredditName: string;
  subredditId: T5;
  description?: string;
  details?: string;
  target?: {
    id: string;
    author?: string;
    body?: string;
    permalink?: string;
    title?: string;
  };
}
```

Conclusion:

- Mirror Scan can read recent mod actions.
- Historical rule/removal reason attribution must remain deterministic and confidence-scored because structured rule/removal reason metadata is not exposed in the `ModAction` type.

### `getSubredditRemovalReasons`

| Question              | Answer                                                   |
| --------------------- | -------------------------------------------------------- |
| Exists in SDK?        | Yes. `reddit.getSubredditRemovalReasons(subredditName)`. |
| Required permission   | `permissions.reddit = true`.                             |
| Returns ID?           | Yes, `id`.                                               |
| Returns title?        | Yes, `title`.                                            |
| Returns message/body? | Yes, `message`.                                          |
| Works in playtest?    | Not verified; blocked by CLI auth.                       |

Raw type shape:

```ts
type RemovalReason = {
  id: string;
  message: string;
  title: string;
};
```

Conclusion:

- Removal reasons are available as structured data if the app has Reddit API access at runtime.

### Subreddit Rules API

| Question                  | Answer                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Exists in SDK?            | Yes.                                                                                                                                                                                    |
| Method name               | `reddit.getRules(subredditName)` and `subreddit.getRules()`.                                                                                                                            |
| Required permission       | `permissions.reddit = true`.                                                                                                                                                            |
| Returns rule ID?          | No explicit stable rule ID in `Rule` type. It returns `shortName`, `description`, `kind`, `violationReason`, `priority`, `createdUtc`, `subredditName`, and optional `descriptionHtml`. |
| Returns short name/title? | Yes, `shortName`.                                                                                                                                                                       |
| Returns full description? | Yes, `description`.                                                                                                                                                                     |

Raw type shape:

```ts
class Rule {
  get shortName(): string;
  get description(): string;
  get kind(): 'all' | 'link' | 'comment';
  get violationReason(): string;
  get priority(): number;
  get createdUtc(): number;
  get descriptionHtml(): string | undefined;
  get subredditName(): string;
}
```

Conclusion:

- Policy records should not depend on a Devvit rule ID unless runtime testing reveals one. Use a derived local rule key, plus rule `shortName` and `priority`, and handle renamed/reordered rules carefully.

## Menu/Form Findings

### Post/comment menu actions

| Question                        | Answer                                                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Can add post menu item?         | Yes by config: `location: "post"`.                                                                                                                           |
| Can add comment menu item?      | Yes by config: `location: "comment"`.                                                                                                                        |
| Can restrict to moderators?     | Yes by config: `forUserType: "moderator"`.                                                                                                                   |
| Can access post/comment ID?     | Yes. `MenuItemRequest.targetId` includes `t3_` or `t1_`.                                                                                                     |
| Can access author?              | Not directly from `MenuItemRequest`; it only contains `location` and `targetId`. Author can be fetched with `reddit.getPostById` or `reddit.getCommentById`. |
| Can trigger form?               | Yes by returning `UiResponse.showForm` from the menu endpoint.                                                                                               |
| Can chain forms?                | Type/build proof yes: first form submit returns another `UiResponse.showForm`. Runtime not verified.                                                         |
| Can open dashboard/custom post? | `UiResponse.navigateTo` exists. Runtime behavior not verified.                                                                                               |

Conclusion:

- Apply Policy can start from post/comment menus, capture target ID, fetch target author, and use forms. Runtime UX still needs playtest.

## Enforcement Action Findings

### `submitComment`

| Question                                        | Answer                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Method exists?                                  | Yes. `reddit.submitComment({ id, text\|richtext, runAs })`.                                                |
| Can comment on normal post?                     | Not playtest-verified.                                                                                     |
| Can comment after removing post?                | Not playtest-verified.                                                                                     |
| If not, can comment before removal then remove? | Not playtest-verified.                                                                                     |
| Can distinguish/sticky a removal comment?       | Comment model has `distinguish(makeSticky?: boolean)`. Runtime not verified.                               |
| Can distinguish bot/app author?                 | `submitComment` supports `runAs: 'APP'` or `'USER'` per typings. Runtime identity display not verified.    |

Conclusion:

- Removal comment behavior remains a Wave 1/2 playtest item after auth. Do not promise comment-after-removal until tested.
- Default MVP message delivery should be `log_only` until playtest proves public comment behavior in both normal and removed-thread states. Public comments can become the preferred moderator-facing delivery mode after that proof; deprecated subreddit PM should not be used.

### remove/approve/ignore reports

| Question                      | Answer                                                              |
| ----------------------------- | ------------------------------------------------------------------- |
| Remove post method exists?    | Yes. `reddit.remove(id, isSpam)` and `Post.remove(isSpam?)`.        |
| Remove comment method exists? | Yes. `reddit.remove(id, isSpam)` and `Comment.remove(isSpam?)`.     |
| Approve method exists?        | Yes. `reddit.approve(id)`, `Post.approve()`, `Comment.approve()`.   |
| Ignore reports method exists? | Yes. `Post.ignoreReports()` and `Comment.ignoreReports()`.          |
| Required permission           | `permissions.reddit = true`, plus moderator permissions at runtime. |

Conclusion:

- Enforcement actions have SDK support. MVP should still require human confirmation and use the least destructive defaults.

### Private message / modmail

| Question                         | Answer                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Can send private message?        | SDK exposes `reddit.sendPrivateMessage(options)`. Runtime not verified.                                                    |
| Can send as subreddit/mod team?  | `sendPrivateMessageAsSubreddit` exists but is marked deprecated and "No longer working as expected."                       |
| Can create modmail conversation? | Yes. `reddit.modMail.createConversation(...)`, plus mod discussion/inbox helpers. Runtime not verified.                    |
| Any deprecated APIs to avoid?    | Avoid `sendPrivateMessageAsSubreddit`; docs in typings recommend `modMail.createConversation` with `isAuthorHidden: true`. |

Conclusion:

- Prefer public comments or modmail over subreddit PM. Do not rely on deprecated subreddit PM behavior.

### Native Mod Notes

| Question                            | Answer                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Can add native Mod Note?            | Yes. `reddit.addModNote(options)`.                                                                                 |
| Can read native Mod Notes?          | Yes. `reddit.getModNotes(options)`.                                                                                |
| Can delete/update native Mod Notes? | Delete exists: `reddit.deleteModNote(options)`. No update method found.                                            |
| Required permission                 | `permissions.reddit = true`, plus moderator permissions at runtime.                                                |
| Note labels available?              | `BOT_BAN`, `PERMA_BAN`, `BAN`, `ABUSE_WARNING`, `SPAM_WARNING`, `SPAM_WATCH`, `SOLID_CONTRIBUTOR`, `HELPFUL_USER`. |

Conclusion:

- Native Mod Notes are feasible by typings, but runtime permission behavior needs playtest.

## Redis Findings

| Question                            | Answer                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Redis client import                 | `import { redis } from '@devvit/web/server'` or `@devvit/redis`.                                                        |
| String read/write works?            | Type/build proof exists in `src/core/smoke.ts`; runtime not verified due auth blocker.                                  |
| Hash/list/sorted-set availability   | Strings, numeric ops, hashes, sorted sets, transactions, bitfield are exposed. No list API found in `RedisClient.d.ts`. |
| Namespacing behavior                | Redis client defaults to `RedisKeyScope.INSTALLATION`; `redis.global` is also exposed.                                  |
| Per-installation storage confirmed? | Confirmed in typings (`RedisKeyScope.INSTALLATION` default), not runtime-tested.                                        |
| Practical limits                    | Not found in local typings. Needs official docs/runtime confirmation if data grows.                                     |

Smoke test notes:

- Wave 1 centralizes key construction in `src/server/services/redis.ts`.
- `src/core/smoke.ts` now delegates to `runRedisDataSmoke`, which writes and reads `modmirror:{subreddit}:smoke:redis-data-layer`.
- The helper follows the planned `modmirror:{subreddit}:{suffix}` naming pattern.

Wave 1 data layer notes:

- `src/server/services/config.ts` uses string JSON values for app config and demo state.
- `src/server/services/policies.ts` stores each policy under `modmirror:{subreddit}:policy:{ruleId}` and duplicates policy JSON into the `modmirror:{subreddit}:policies` hash for listing.
- `src/server/services/scans.ts` stores scan metadata under `modmirror:{subreddit}:scan:{scanId}` and `modmirror:{subreddit}:scan:last`.
- `src/server/services/audit.ts` stores override/audit events in the `modmirror:{subreddit}:overrides` sorted set with `createdAt` as the score.
- `zAdd`, `zRange`, `hSet`, and `hGetAll` signatures were verified against `node_modules/@devvit/redis/RedisClient.d.ts`; runtime behavior remains unverified until playtest auth is available.

## Permission / Visibility Findings

| Question                                        | Answer                                                                                                                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Can identify current user?                      | Yes. `context.username`, `context.userId`, and `reddit.getCurrentUser()` exist.                                                                              |
| Can identify whether current user is moderator? | Menu config can restrict to `forUserType: "moderator"`; runtime permission checks can use `getModPermissionsForSubreddit`.                                   |
| Can inspect moderator permissions?              | Yes. `User.getModPermissionsForSubreddit(subredditName): Promise<ModeratorPermission[]>`.                                                                    |
| Can distinguish full/manage permissions?        | Typings expose permission strings including `all`; the template checks `all` or `posts`. Exact available permission values need runtime logging in playtest. |

Conclusion:

- Visibility gating is feasible by SDK shape. Per-mod analytics should remain hidden until full/manage-level permission behavior is playtested.

## Build/Test Findings

| Command                | Result                                                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `npm install`          | PASS. Installed 540 packages after adding `vitest`; npm audit reports 31 vulnerabilities.                                                |
| `node --version`       | PASS: `v22.21.0`.                                                                                                                        |
| `npm --version`        | PASS: `10.9.4`.                                                                                                                          |
| `npx devvit --version` | PASS: `@devvit/cli/0.12.23 darwin-arm64 node-v22.21.0`.                                                                                  |
| `npx devvit whoami`    | FAIL: `Not currently logged in. Try devvit login first`.                                                                                 |
| `npm run type-check`   | PASS.                                                                                                                                    |
| `npm run lint`         | PASS.                                                                                                                                    |
| `npm run build`        | PASS.                                                                                                                                    |
| `npm test`             | PASS after adding `vitest.config.ts`; no tests exist yet.                                                                                |
| `npm run dev`          | PARTIAL. Vite/server build completes, then Devvit prompts for Reddit OAuth and cannot proceed without browser auth.                      |
| `npm audit --omit=dev` | FAIL. Direct/transitive vulnerabilities remain in template dependencies, including `hono`, `vite`, and `protobufjs` via Devvit packages. |

## Broken Assumptions

- The repo did not contain the requested local skill files, despite `TREE.txt` listing them.
- The Devvit CLI cannot create/init/playtest a real app without a Reddit app creation/auth flow.
- The generated mod-tool template's `test` script referenced Vitest without including `vitest`; Wave 0 added `vitest` and a separate `vitest.config.ts`.
- `ModAction` does not expose structured removal reason or subreddit rule fields.
- `Rule` does not expose a stable rule ID in the installed SDK type.
- Playtest cannot be completed from this unauthenticated session.

## Decisions Based on Research

- Use the Devvit Web mod-tool template with Hono for Wave 0.
- Keep smoke tests non-destructive: Redis write/read, Reddit read-only scan, menu/form chaining.
- Store future policy rule references using local derived IDs plus rule `shortName`/`priority`, not an assumed Devvit rule ID.
- Treat mod-log rule/removal attribution as inferred only.
- Avoid deprecated `sendPrivateMessageAsSubreddit`; prefer modmail if private delivery is needed.
- Keep `vitest.config.ts` separate from `vite.config.ts` because the Devvit Vite plugin only supports `vite build`.

## Links Consulted

- Devvit CLI template registry: `https://developers.reddit.com/templates.json`
- Official template archive: `https://github.com/reddit/devvit-template-mod-tool-devvit-web/archive/refs/heads/main.zip`
