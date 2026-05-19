# RESEARCH.md — Devvit Platform Findings

This document is the source of truth for verified Devvit behavior in this repo.

Do not assume Devvit API behavior. Verify it here.

## Research Status

Status: Expansion Wave 29 Multi-Community Isolation is implemented locally.
Subreddit scope resolution and Redis key namespace guards are type/test
verified; exact Devvit runtime context behavior still requires playtest proof.

Last updated: 2026-05-18

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
| Test subreddit            | `modmirror_dev` via `devvit.json` `dev.subreddit`                                                                                                  |
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
| Verified | Wave 2 live source adapter uses only the documented `reddit.getModerationLog`, `reddit.getSubredditRemovalReasons`, and `reddit.getRules` APIs and degrades to warnings on failures. | `src/server/services/redditSources.ts`; local typecheck/test/build proof only. |
| Verified | Wave 2 demo scan runs through the deterministic attribution pipeline and produces a Rule 2 drift candidate locally. | `src/server/services/mirrorScan.test.ts`; local test proof only. |
| Verified | `getModerationLog()` does not expose structured removal reason or subreddit rule fields in the installed `ModAction` type. | `node_modules/@devvit/reddit/RedditClient.d.ts`. |
| Verified | Subreddit `Rule` does not expose a stable rule ID in the installed SDK type. | `Rule` type in installed typings. |
| Verified | Redis can be imported from `@devvit/web/server`, defaults to installation scope, and supports string/hash/sorted-set style operations. | `RedisClient.d.ts`; smoke code typechecks/builds. |
| Verified | Reddit API methods work in the target subreddit during playtest for dashboard launch and demo scan. | `npx devvit whoami` succeeds as `u/BrightyBrainiac`; `npm run dev` reached Playtest ready for `r/modmirror_dev`; Safari created `t3_1teywdj` and rendered the dashboard WebView. Broader smoke routes still need manual QA. |
| Unverified | Redis read/write works in playtest. | Type/build proof only; hit `/api/smoke/redis` after auth. |
| Unverified | Menu actions and chained forms work in the Reddit UI. | Type/build proof only; invoke smoke menu actions after auth. |
| Unverified | Comment delivery before/after removal works reliably, and comments can be distinguished/stickied in the intended order. | Must be tested on safe test content before enabling public-comment default. |
| Unverified | Modmail/private message/native Mod Notes runtime permission behavior. | Typings exist; playtest with moderator permissions required. |
| Unverified | Exact moderator permission strings for per-mod analytics gating. | Typings expose permission checks; runtime values need logging. |
| Broken | Historical mod-log entries can be treated as having perfect rule/removal reason attribution. | `ModAction` lacks structured rule/removal metadata. |
| Broken | Policy records can rely on a Devvit-provided stable subreddit rule ID. | `Rule` type lacks stable ID. |
| Broken | The generated template's `npm test` worked without changes. | Template referenced Vitest without including it; Wave 0 added `vitest` and `vitest.config.ts`. |
| Verified | Dashboard client entry exists and now includes Mirror Scan, Policy Agreement, and Apply Policy simulator pages. | Local build/typecheck proof; Safari opens the signed-in playtest subreddit, shows the dashboard launcher, confirms custom-post creation, and renders the dashboard WebView. |
| Verified | Policy Agreement Flow API/UI, Apply Policy simulator, action events, override events, aggregate override summaries, and dashboard launcher build and test locally. | `npm run build`, `npm test`, `npm run type-check`, and `npm run lint` pass. Browser proof rendered dashboard custom post `t3_1teywdj` on Devvit version `v0.0.1.12`. |
| Verified | Wave 5 policy versioning, override review statuses, policy health scoring, and governance dashboard build and test locally. | On 2026-05-17, `npm install`, `npm run build`, `npm run type-check`, `npm run lint`, `npm test`, and `npx devvit whoami` passed in the integration worktree. `npm run dev` reached Playtest ready for `r/modmirror_dev` on `v0.0.1.15`. |
| Verified | Installed typings expose a WebView expanded-mode effect helper. | `node_modules/@devvit/client/effects/web-view-mode.d.ts` exports `requestExpandedMode(event, entry)`. |
| Verified | Wave 7/8 productized UI builds locally with compact inline launch card, Command Center IA, manual Digest, Settings, and static-preview demo fallbacks. | `npm run build`, `npm run type-check`, `npm run lint`, targeted productization tests, and Playwright static screenshots passed locally on 2026-05-17. |
| Verified | Signed-in Wave 7/8 Reddit playtest opens the compact inline card and native expanded dashboard modal. | `npm run dev` reached Playtest ready for `r/modmirror_dev` on `v0.0.1.65`; Safari opened the compact inline card, Open Dashboard triggered the Devvit WebView immersive-mode effect, and Reddit opened the native expanded modal with the host `Mobile` viewport dropdown and native theme control. |
| Verified | The full demo workflow runs inside the Reddit playtest WebView. | On `v0.0.1.65`, Safari verified ExampleLearning demo scan, Low-effort questions policy creation, Apply Policy preview/confirm with an override, Case Packet generation with Markdown export, Review inbox/health update, Manual Digest generation, and Settings runtime state. |
| Verified | Wave 9/10 digest history can use Redis sorted sets with the existing installation-scoped Redis client. | `src/server/services/digest.ts` stores reports in `modmirror:{subreddit}:digests` and `modmirror:{subreddit}:digest:{digestId}`; `npm run type-check` and `npm test -- src/server/services/digest.test.ts` pass. Runtime Redis read/write remains tracked separately. |
| Verified | W01 post/comment Apply Policy menu entrypoints can use `MenuItemRequest.targetId`, `reddit.getPostById`, `reddit.getCommentById`, `reddit.getCurrentUser`, and `User.getModPermissionsForSubreddit` to build target context. | Local checks pass; post target capture was playtest-verified on `v0.0.1.83` with `t3_1texjev`, and comment target capture was playtest-verified on `v0.0.1.84` with `t1_ommzgtz`. Execution receipts remain separately unverified. |
| Type/build only | Devvit scheduler client exists in installed typings. | `@devvit/web/server` re-exports `@devvit/scheduler`; `node_modules/@devvit/scheduler/SchedulerClient.d.ts` exposes `scheduler.runJob`, `cancelJob`, and `listJobs`, and `Devvit.addSchedulerJob` exists in `node_modules/@devvit/public-api/devvit/Devvit.d.ts`. No Wave 9/10 scheduler job is registered until runtime behavior is verified. |
| Type/build only | Devvit modmail/mod discussion APIs exist in installed typings. | `node_modules/@devvit/reddit/models/ModMail.d.ts` and newmodmail proto typings expose modmail conversations including internal mod-only conversation fields. ModMirror keeps digest delivery disabled/unverified until a non-spam runtime playtest proves safe behavior. |
| Verified locally | W07 consistency analytics can summarize persisted scan drift trends and receipt-backed policy impact without inventing live proof. | `src/server/services/analytics.ts`, `src/server/services/analytics.test.ts`, `/api/analytics/consistency`, and client Review surface; `npm run type-check`, `npm run lint`, targeted analytics tests, full `npm test`, `npm run build`, and `git diff --check` pass. Runtime Redis/API behavior remains unverified. |
| Verified locally | W08 Policy Agreement now has draft/propose/review/adopt lifecycle artifacts. | `RulePolicy` and `PolicyVersion` carry lifecycle/proposal/review/adoption metadata; `/api/policies/:id/propose`, `/reviews`, and `/adopt` exist; `policies.test.ts` covers draft, review, adopt, invalid transitions, and Apply Policy active-version snapshot behavior. Runtime Redis/API behavior remains unverified. |
| Verified locally | W09 Case Packets prefer immutable receipts and label evidence sources. | `casePacket.ts` loads receipts, emits packet types/evidence labels, includes receipt target snapshots and execution results, and falls back to action history with caveats. `casePacket.test.ts` covers receipt-backed packets and policy-changed-since-action. Runtime Redis/API behavior remains unverified. |
| Type/build only | W17 modqueue triage can read Reddit modqueue items through Devvit when runtime permits. | Official Subreddit docs list `getModQueue(options?)` and `getReports(options?)` returning `Listing<Post | Comment>`; installed typings expose `Subreddit.getModQueue`, `RedditAPIClient.getModQueue`, `Subreddit.getReports`, and proto routes `/r/{subreddit}/about/modqueue` and `/about/reports`. `src/server/services/modqueueTriage.ts`, `/api/modqueue/triage`, and `src/server/services/modqueueTriage.test.ts` are local/type verified only. |
| Verified locally | W18 attribution calibration can apply moderator corrections to future scan attribution. | `src/server/services/attributionCalibration.ts` stores corrections by subreddit/action ID, `mirrorScan.ts` loads corrections before attribution, and tests cover persistence plus correction application. Redis runtime remains unverified. |
| Verified locally | W19 policy ratification enforces reviewer approval thresholds before non-quick adoption. | `src/server/services/policyRatification.ts` summarizes latest reviewer votes, `policies.ts` stores proposal notes/settings and blocks adoption until approval thresholds are met, and policy tests cover threshold success/failure plus disabled quick adoption. Redis runtime remains unverified. |
| Verified locally | W20 replay sandbox can simulate proposed policy outcomes without live Reddit calls or receipt mutation. | `src/server/services/replaySandbox.ts` runs read-only policy replay over supplied or scan-derived attributed actions, `/api/policies/:id/replay` loads stored scan actions when given `scanId`, and replay tests cover changed recommendations, skipped rules, and input immutability. Redis/API runtime remains unverified. |
| Verified locally | W21 community health emits aggregate consistency signals without per-mod blame fields. | `src/server/services/communityHealth.ts` combines stored actions, overrides, receipts, scans, policies, and policy change events into aggregate rule health, repeat-author buckets, policy churn, drift stability, and case-packet readiness. Tests cover empty and small-community states. Redis/API runtime remains unverified. |
| Verified locally | W22 policy impact measures before/after consistency around adopted policy versions when thresholds are met. | `src/server/services/policyImpact.ts` combines policy versions, receipts, overrides, and scan history, `/api/policies/:id/impact` exposes policy-detail impact, and tests cover thresholded impact, insufficient data, and demo labeling. Redis/API runtime remains unverified. |
| Verified locally | W23 response templates render preview-only moderation copy from policy steps. | `src/shared/responseTemplates.ts` renders warning, removal, mod note, modmail, and private-message drafts with escaped variables and missing-variable placeholders; Apply Policy preview includes gated templates and receipts can persist the preview. Redis/API runtime remains unverified. |
| Type/build only | W24 native Mod Notes can call `reddit.addModNote` when explicitly enabled and runtime-verified. | Official Reddit for Developers docs list `RedditAPIClient.addModNote(options)` and `ModNote` properties. Installed `node_modules/@devvit/reddit/RedditClient.d.ts` exposes `addModNote(options): Promise<ModNote>`, and `node_modules/@devvit/reddit/models/ModNote.d.ts` shows `PostNotesRequest` options plus labels. Local tests cover skipped, sent, and failed attempts. No playtest call has been made. |
| Verified locally / type-only delivery | W25 case packets can be prepared for manual team review and stored as delivery receipts; Mod Discussion sending remains disabled. | `src/shared/casePacketDelivery.ts` builds case-packet delivery drafts, `/api/delivery/confirm` accepts `case_packet`, and `teamDelivery.ts` stores manual/skipped receipts. Official ModMailService docs and installed typings expose `createModDiscussionConversation`, but no playtest send has been made and product routes still do not inject a live adapter. |
| Runtime verified | W26 Evidence Boards collect review-thread evidence without copying moderator names or target authors into board summaries. | `src/server/services/evidenceBoard.ts` stores boards under namespaced Redis keys and builds evidence summaries from receipts, content snapshots, overrides, case packets, comparables, and policy changes. `src/server/services/evidenceBoard.test.ts` covers multi-source collection, status lifecycle, and privacy flags. Post-W34 Devvit playtest verified receipt-backed board create/list/status persistence in the Reddit-hosted WebView. |
| Verified locally | W27 Incident Mode is explicit, temporary, and receipt-tagging only. | `src/server/services/incidentMode.ts` stores incident state, preset suggestions, triage groups, and post-incident receipt summaries; `confirmApplyPolicy` tags receipts with the active incident ID. Tests cover start/end/expiry and receipt tagging. Devvit Redis/API runtime remains unverified. |
| Runtime verified | W28 Configuration Portability excludes private history and imports policy config as drafts. | `src/server/services/configPortability.ts` exports only policy ladders, response templates, digest settings, and starter-template packages. Imports validate schema/version first, support legacy v0 migration, and use policy draft/update flows instead of adoption. Post-W34 Devvit playtest verified live export, starter-template dry-run, and draft import visibility in the Reddit-hosted WebView. |
| Verified locally | W29 API helpers reject cross-subreddit requests before service calls. | `src/server/services/subredditIsolation.ts` resolves current/demo/live subreddit scopes, `src/routes/api.ts` routes body/query subreddit values through the guard, and `src/server/services/redis.ts` rejects unsafe subreddit key namespaces. Tests cover current context, demo exception, cross-subreddit rejection, live-context rejection, and unsafe Redis key names. Devvit context behavior remains runtime-unverified. |
| Deferred | Live Reddit moderation execution from Apply Policy. | Delivery remains `log_only` because public comment/removal behavior is not playtest-verified. |

## Known Platform Constraints

- The current scaffold is Devvit Web with a server-first Hono structure. It does not currently have a React/client dashboard entry.
- `npm run dev` maps to `devvit playtest`. On 2026-05-16, `npx devvit whoami` succeeded as `u/BrightyBrainiac`; `npx devvit view --json` returned app id `5cd5fae3-9da6-4e7c-a243-7c8762badd91`, slug `modmirror`, and owner `BrightyBrainiac`. `npm run dev` reached Playtest ready for `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`; dashboard browser proof used `v0.0.1.12`, and Wave 5 integration reached Playtest ready on `v0.0.1.15` on 2026-05-17.
- `permissions.reddit = true` is required for Reddit API methods. Redis did not require a separate generated `devvit.json` permission in this template.
- Menu actions are configured in `devvit.json` with `menu.items[]`; form endpoints are configured through the top-level `forms` map.
- Historical `ModAction` records expose action text and target metadata, but not structured rule IDs or removal reason IDs.
- Subreddit rules expose `shortName`, `description`, `violationReason`, `priority`, and related fields, but no stable SDK rule ID.
- `sendPrivateMessageAsSubreddit` exists in typings but is deprecated and should not be used.
- Comment-before/removal and comment-after/removal behavior is unknown until playtest verifies it on safe test content.
- Per-mod analytics must remain omitted or hidden until moderator permission checks are runtime-verified.
- Wave 3/4 adds dashboard Apply Policy simulator as the safe primary surface because post/comment menu action UX remains browser/runtime-unverified. CLI playtest reaches ready, Safari is signed in, and the playtest subreddit opens. The dashboard launcher appears in the subreddit moderator overflow menu, opens a confirmation form, creates custom post `t3_1teywdj`, and renders the dashboard WebView.
- Wave 7/8 inline behavior is productized as a compact launch/status card. Open Dashboard emits the Devvit WebView immersive-mode effect when the Devvit WebView global is available, and still renders the full dashboard in place if a host ignores the request.
- The installed `@devvit/client/effects/web-view-mode` typings expose `requestExpandedMode(event, entry)`. Importing `@devvit/web/client` directly from this repo's mixed server/client TypeScript build resolved package conditions inconsistently with the server build, so the client emits the equivalent WebView effect through `globalThis.devvit` when present.
- Wave 7/8 playtest reached `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror` on Devvit version `v0.0.1.65`. Signed-in Safari verification opened the compact inline card, used Open Dashboard, and confirmed Reddit opened the native expanded modal with the host `Mobile` viewport dropdown and native theme control. That host chrome is Reddit-owned and is not part of the app DOM; it is intentionally preserved so moderators can switch viewport modes.
- The same `v0.0.1.65` runtime pass loaded demo data, created a Low-effort questions policy from drift, preserved the selected stricter Apply Policy action through preview, confirmed a log-only override, generated a Case Packet with Markdown export, showed the new override in Review, generated a manual Digest, and rendered Settings with demo data state. This caught and fixed a namespace mismatch where demo policies under `ExampleLearning` were not consistently read by governance and Case Packet routes.
- Wave 9/10 adds a persisted digest history model. The safe launch path is still manual generation plus Markdown copy. Mod discussion delivery and weekly scheduling are shown as unverified capabilities, not enabled behavior.
- W01 replaces the production-facing post/comment smoke menu entries with
  `Apply ModMirror Policy` entries that open a target-context form. This is
  type/build verified only; runtime playtest still needs to verify menu
  visibility, form submission, target fetch behavior, and exact permission
  strings. The flow remains non-destructive and does not execute moderation
  actions.
- W17 adds a read-only modqueue triage route and UI panel. It does not fake
  queue items if Devvit runtime or subreddit context is unavailable. The
  capability remains `type_only` because no playtest has yet proven
  `/api/modqueue/triage` against real queue content.
- W18 stores attribution corrections separately from scan records and marks
  corrected actions with `attributionKind: corrected`. This is local/test
  verified only until Redis persistence is proven in Devvit playtest.
- W19 keeps unadopted policies out of Apply Policy. Reviewed adoption now
  requires the configured approval threshold unless the moderator deliberately
  uses quick adoption and the policy allows that small-team escape hatch.
  Runtime Redis/API behavior remains unverified.
- W20 replay is intentionally read-only. It does not write receipts, action
  events, overrides, or Reddit moderation state, and it uses synthetic data only
  when that source is explicitly labeled.
- W21 community health avoids per-mod leaderboards and does not emit moderator
  usernames. Repeat-offense signals are aggregate counts only, and empty/small
  samples are labeled before health claims are made.
- W22 policy impact requires minimum before/after receipt windows before
  claiming improvement or regression. Demo impact remains labeled as demo and
  is not live subreddit proof.
- W23 response templates are drafts only. They do not send public comments,
  private messages, modmail, or native Mod Notes, and template delivery remains
  gated until explicit delivery waves are runtime-verified.
- W24 adds an opt-in `native` Mod Note mode, but native writes remain disabled
  unless both `MODMIRROR_ENABLE_NATIVE_MOD_NOTES=true` and
  `MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED=true` are set. This wave did not
  run a playtest Mod Note write, so production behavior remains unverified.
- W27 Incident Mode is not an emergency automation system. It does not
  auto-remove, auto-ban, override policy confirmation, or change Reddit state by
  itself. It only changes ModMirror context by showing preset suggestions,
  grouping triage priorities, and tagging confirmed Apply Policy receipts.
- W28 portable config exports are intentionally configuration-only. They do not
  include receipts, overrides, scans, content snapshots, case packets, evidence
  boards, delivery receipts, incident reports, moderator activity logs, or
  private queue history.
- W29 treats `context.subredditName` as the authority for live subreddit access.
  The only explicit cross-context exception is the labeled ExampleLearning demo
  namespace. Runtime playtest still needs to verify the exact context values
  attached to Devvit Web requests.
- Installed scheduler typings require scheduler capability/configuration and runtime registration proof before scheduled digest jobs can be trusted. No scheduled digest job is registered in Wave 9/10's first implementation slice.
- Installed modmail/mod discussion typings are sufficient for future research, but ModMirror must not send digest conversations until a moderator explicitly previews/confirms delivery and playtest records exact behavior.
- Static browser preview with `serve dist/client` cannot reach `/api/*`; Wave 7/8 includes deterministic in-memory demo fallbacks for screenshots and local QA only. Live Devvit runtime still uses server APIs.
- `npm audit` still reports 31 vulnerabilities: 3 low, 27 high, 1 critical. Key items are `hono` and `vite` fixes that require out-of-range/force updates, and Devvit transitive `protobufjs` advisories with no fix available through the installed Devvit package chain.

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
| Reddit API read/write          | `"permissions": { "reddit": true }`                                                                        | Type/build only | Template uses this for Reddit API. CLI playtest reaches ready; route behavior still needs browser/UI proof. |
| Redis                          | No explicit `devvit.json` permission found in generated template; import `redis` from `@devvit/web/server` | Type/build only | `@devvit/web/server` re-exports `@devvit/redis`; `RedisClient` defaults to installation scope.       |
| Menu actions                   | `menu.items[]` with `location`, `forUserType`, `endpoint`                                                  | Type/build only | Post/comment menu locations are configured.                                                          |
| Forms                          | Top-level `forms` map from form name to endpoint                                                           | Type/build only | Menu action returns `UiResponse.showForm`.                                                           |
| Triggers                       | Top-level `triggers` map                                                                                   | Type/build only | Template includes `onAppInstall`. Not needed for MVP yet.                                            |
| Devvit Web dashboard/endpoints | `server.dir`, `server.entry`; Hono server mounted by `src/index.ts`                                        |  Build verified | Public API routes are mounted under `/api`. Internal menu/form/trigger routes are under `/internal`. |

## Devvit Web Findings

| Question                          | Answer                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Is this project using Devvit Web? | Yes. It uses `@devvit/web/server`, `@devvit/start/vite`, Hono, and `@hono/node-server`.                        |
| Client entry                      | Wave 1 adds `src/client/index.html` as the dashboard shell entrypoint.                                          |
| Client build trigger              | Verified from installed `@devvit/start@0.12.23` plugin code: client assets are built only when `devvit.json` includes `post.entrypoints`; Wave 1 adds a default `src/client/index.html` entrypoint built to `dist/client/index.html`. |
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
| Works in playtest?              | Not verified through browser UI; CLI playtest reaches ready.                                                                         |
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
| Works in playtest?    | Not verified through browser UI; CLI playtest reaches ready. |

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
| Can open dashboard/custom post? | `UiResponse.showForm`, `UiResponse.navigateTo`, and `reddit.submitCustomPost` exist. A moderator-only subreddit menu launcher is implemented as a confirmation form before visible custom-post creation. |

Conclusion:

- Apply Policy can start from post/comment menus, capture target ID, fetch target author, and use forms. Runtime UX still needs playtest. The dashboard itself can be launched from a subreddit menu confirmation form; browser proof created custom post `t3_1teywdj`.

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

- Removal comment behavior remains a later playtest item after browser login. Do not promise comment-after-removal until tested.
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
- `zAdd`, `zRange`, `hSet`, and `hGetAll` signatures were verified against `node_modules/@devvit/redis/RedisClient.d.ts`; runtime behavior remains unverified until browser playtest can exercise routes after login consent.

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
| `npx devvit whoami`    | PASS: `Logged in as u/BrightyBrainiac`.                                                                                                  |
| `npm run type-check`   | PASS.                                                                                                                                    |
| `npm run lint`         | PASS.                                                                                                                                    |
| `npm run build`        | PASS.                                                                                                                                    |
| `npm test`             | PASS after adding `vitest.config.ts`; no tests exist yet.                                                                                |
| `npm run dev`          | PASS. Vite/server build completes and Devvit reaches Playtest ready for `r/modmirror_dev`; Safari opens the signed-in playtest subreddit and rendered dashboard custom post `t3_1teywdj` on version `v0.0.1.12`; the final rebuilt runtime reached `v0.0.1.14`. |
| `npm audit --omit=dev` | FAIL. Direct/transitive vulnerabilities remain in template dependencies, including `hono`, `vite`, and `protobufjs` via Devvit packages. |

## Broken Assumptions

- The repo did not contain the requested local skill files, despite `TREE.txt` listing them.
- Devvit CLI playtest requires a valid Reddit app identity and logged-in CLI session; both are now present for `modmirror`.
- The generated mod-tool template's `test` script referenced Vitest without including `vitest`; Wave 0 added `vitest` and a separate `vitest.config.ts`.
- `ModAction` does not expose structured removal reason or subreddit rule fields.
- `Rule` does not expose a stable rule ID in the installed SDK type.
- Browser proof covered the dashboard launcher, dashboard custom post, WebView render, demo Mirror Scan drift output, and entry into the policy editor; deeper Reddit/Redis smoke routes remain manual QA.

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

## Wave 9/10 Runtime Findings

Date: 2026-05-18

Commands:

- `npx devvit whoami` returned `Logged in as u/BrightyBrainiac`.
- `npm run dev` reached playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror` on version
  `v0.0.1.70`.

Safari/Computer Use runtime observations:

- The refreshed Reddit playtest WebView used app version `0.0.1.70`.
- The inline launch card rendered inside the Reddit post before dashboard open.
- `Open Dashboard` entered the Devvit expanded modal and loaded Command Center.
- The Devvit modal toolbar/viewport dropdown is present and exposes `Mobile`,
  `Desktop`, and `Fullscreen`; ModMirror should not replace this with an
  in-app duplicate.
- ExampleLearning demo scan completed in runtime with 60 actions and labeled
  demo state.
- Manual Digest generated in runtime, rendered Markdown Export, enabled Copy
  Markdown, and added a Digest History row.
- Runtime Settings showed Digest History plus `unverified` capability states for
  mod discussion delivery and scheduler.

Digest delivery/scheduler status:

- Manual Markdown copy remains the verified launch path.
- Mod discussion delivery is still unverified and disabled.
- Scheduler execution is still unverified and disabled.

## Operational Overhaul W03 Findings

Date: 2026-05-18

Evidence source:

- Installed typings in `node_modules/@devvit/reddit/RedditClient.d.ts`
  expose `reddit.approve(id)`, `reddit.remove(id, isSpam)`,
  `reddit.getPostById(id)`, and `reddit.getCommentById(id)`.
- Installed typings in `node_modules/@devvit/reddit/models/Post.d.ts` and
  `node_modules/@devvit/reddit/models/Comment.d.ts` expose
  `ignoreReports()`.
- Local W03 tests mock success, failure, and permission-denied execution paths.

Decision:

- W03 adds a typed execution engine, but product-integrated live Reddit actions
  remain disabled by default. The live path requires all of:
  `MODMIRROR_ENABLE_LIVE_REDDIT_ACTIONS=true`,
  `MODMIRROR_REDDIT_ACTIONS_RUNTIME_VERIFIED=true`, and
  `MODMIRROR_ACTION_RECEIPTS_AVAILABLE=true`.
- `MODMIRROR_ACTION_RECEIPTS_AVAILABLE` intentionally remains false by default
  because W04 has not added the receipt ledger yet.

Runtime status:

- Not playtest-verified in W03.
- Do not claim remove/approve/ignore-reports behavior beyond installed typings
  and mocked local tests until safe playtest proof is recorded.

## Operational Overhaul W04 Findings

Date: 2026-05-18

Evidence source:

- W04 adds Redis-backed receipt storage under namespaced keys:
  `modmirror:{subreddit}:receipts`,
  `modmirror:{subreddit}:receipt:{receiptId}`, and
  `modmirror:{subreddit}:receipts:target:{targetThingId}`.
- Local tests cover receipt creation, detail lookup, subreddit listing, and
  per-target listing.

Decision:

- `MODMIRROR_ACTION_RECEIPTS_AVAILABLE` now defaults to available unless set to
  `false`, because the receipt service exists. Live Reddit execution still also
  requires explicit live-action and runtime-verified flags.

Runtime status:

- Receipt persistence is locally tested with mocked Redis only.
- No Devvit playtest was run for W04 receipt storage.

## Operational Overhaul W05 Findings

Date: 2026-05-18

Evidence source:

- W05 adds full scan record persistence with `MirrorScanRecord` under
  `modmirror:{subreddit}:scan:{scanId}`.
- W05 adds capped metadata indexes under
  `modmirror:{subreddit}:scans` and
  `modmirror:{subreddit}:scans:source:{source}`.
- W05 adds rule and target-author hash indexes for future analytics.

Runtime status:

- Scan persistence is locally tested with mocked Redis only.
- No Devvit playtest was run for W05 scan storage, list, detail, or compare
  routes.

## Operational Overhaul W06 Findings

Date: 2026-05-18

Evidence source:

- Installed typings in `node_modules/@devvit/reddit/models/Listing.d.ts`
  expose `ListingFetchOptions` with `limit`, `pageSize`, `after`, and
  `before`, plus `Listing.all()` and `Listing.get(count)`.
- Installed typings in `node_modules/@devvit/reddit/RedditClient.d.ts`
  document `reddit.getModerationLog({ subredditName, limit, pageSize }).all()`
  and show a `limit: 1000`, `pageSize: 100` example.
- W06 local tests mock depth-specific `getModerationLog` calls and warning
  behavior.

Decision:

- W06 exposes conservative scan depths:
  - `quick`: 25 actions, page size 25
  - `standard`: 60 actions, page size 60
  - `deep`: 250 actions, page size 100
- The live adapter records the requested cap, page size, fetched action count,
  whether the cap was hit, and that pagination remains runtime-unverified.
- The product warns when live scans hit a cap or return fewer actions than
  requested.

Runtime status:

- Not playtest-verified in W06.
- Do not claim deep moderation-log pagination works in Reddit runtime until a
  safe playtest records actual behavior and sample counts.

## Operational Overhaul W10 Findings

Date: 2026-05-18

Evidence source:

- Official Devvit Web documentation says server endpoints can use standard
  server frameworks and server capabilities, including `fetch`, while client
  fetch is restricted to the app's own webview domain:
  `https://developers.reddit.com/docs/next/capabilities/devvit-web/devvit_web_overview`.
- Official HTTP Fetch documentation says Devvit apps can fetch allow-listed
  HTTPS domains from server-side code, lists a 30-second timeout, documents
  `permissions.http.domains`, and lists `api.openai.com` and
  `generativelanguage.googleapis.com` in the global fetch allowlist:
  `https://developers.reddit.com/docs/capabilities/server/http-fetch`.
- Official secrets documentation describes app-scoped secret settings set by
  the developer via `devvit settings set` and retrieved during invocation:
  `https://developers.reddit.com/docs/secrets_storage`.
- Installed typings expose `SettingsClient.get()` in
  `node_modules/@devvit/settings/SettingsClient.d.ts` and Devvit Web config
  schema types for `permissions.http` and app/subreddit `settings` in
  `node_modules/@devvit/shared-types/schemas/config-file.v1.d.ts`.

Decision:

- W10 does not enable HTTP permissions or commit any provider key path.
- W10 adds a disabled-by-default provider abstraction and advisory endpoints:
  `/api/ai/capabilities` and `/api/ai/advisory`.
- The service only generates with an explicitly supplied provider and enabled
  flag. Production/default runtime returns a disabled fallback.
- AI output is advisory only, cannot decide enforcement, and must cite
  deterministic evidence IDs supplied in the request. Provider output that
  does not cite known evidence is rejected.

Runtime status:

- No external AI call was made in W10.
- Devvit HTTP Fetch and secret-storage behavior remain docs/type-supported
  only for ModMirror. Runtime proof requires a configured provider, HTTP
  permission/domain review as needed, secret setting, terms/privacy readiness,
  and playtest logs before any live advisory path can be labeled available.

## Operational Overhaul W11 Findings

Date: 2026-05-18

Evidence source:

- Official Devvit ModMailService docs expose
  `reddit.modMail.createModDiscussionConversation({ subject, bodyMarkdown, subredditId })`
  and say it creates a Mod Discussions conversation for the moderators of an
  installed subreddit:
  `https://developers.reddit.com/docs/api/redditapi/models/classes/ModMailService`.
- Installed typings in `node_modules/@devvit/reddit/models/ModMail.d.ts` and
  `node_modules/@devvit/public-api/apis/reddit/models/ModMail.d.ts` expose
  `createModDiscussionConversation`, `createModInboxConversation`,
  `createModNotification`, and `createConversation`.
- Official Devvit Scheduler docs require scheduler tasks to be declared in
  `devvit.json`, document Hono internal scheduler endpoints, and show
  `scheduler.runJob`, `scheduler.cancelJob`, and `scheduler.listJobs`:
  `https://developers.reddit.com/docs/capabilities/server/scheduler`.
- Installed typings in `node_modules/@devvit/scheduler/SchedulerClient.d.ts`
  expose `runJob`, `cancelJob`, and `listJobs`; `@devvit/web/server` re-exports
  scheduler types.

Decision:

- W11 adds preview-first team delivery APIs but does not send Reddit messages
  in production/default paths.
- W11 adds delivery capability states:
  `unavailable`, `unverified`, `verified_disabled`, and `enabled`.
- Manual Markdown copy is enabled and creates no Reddit-side message.
- Mod discussion delivery is type-supported but runtime-unverified. Confirming
  it without runtime proof stores a skipped receipt.
- Scheduler delivery is marked unavailable because no ModMirror scheduler task
  is registered in `devvit.json`.
- Actual mod discussion delivery can only happen through an explicitly injected
  adapter plus live-delivery and runtime-proof flags. Product routes do not
  inject an adapter.

Runtime status:

- No modmail/mod discussion message was sent in W11.
- No scheduler task was registered or run in W11.
- Delivery receipt persistence is locally tested with mocked Redis only.
- Runtime proof still requires a safe playtest that confirms internal-only
  destination, permission failure shape, receipt persistence, and no accidental
  user-facing message.

## Wave 25 Appeal / Case Packet Delivery

Date: 2026-05-18

Evidence source:

- Official Devvit ModMailService docs expose
  `reddit.modMail.createModDiscussionConversation({ subject, bodyMarkdown, subredditId })`
  as an internal Mod Discussions conversation API for installed subreddits:
  `https://developers.reddit.com/docs/api/redditapi/models/classes/ModMailService`.
- Installed typings in `node_modules/@devvit/reddit/models/ModMail.d.ts` expose
  `createConversation`, `createModDiscussionConversation`,
  `createModInboxConversation`, `createModNotification`, and reply/archive
  operations.
- Installed `RedditClient.d.ts` exposes `get modMail(): ModMailService`.

Decision:

- W25 does not add a product-route live Modmail adapter.
- Case packets can now be wrapped as delivery drafts with
  `subjectType: case_packet`.
- Manual Markdown delivery remains the supported path.
- Saving a Mod Discussion draft receipt through the UI records a skipped
  delivery receipt; it does not send a Reddit message in default/product routes.

Runtime status:

- No Modmail or Mod Discussion message was sent in W25.
- Case packet delivery draft generation is locally tested.
- Delivery receipt storage is locally tested with mocked Redis only.
- Runtime proof still requires safe playtest verification of internal-only
  destination, permission failure shape, and Redis receipt persistence before
  any live send adapter is exposed.

## Wave 26 Collaborative Evidence Board

Date: 2026-05-18

Evidence source:

- Existing local services already persist action receipts, override events,
  policy change events, and generated Case Packet data.
- Shared privacy guidance requires minimizing copied data and avoiding per-mod
  blame analytics.

Decision:

- Evidence Boards store review-thread summaries and source references rather
  than full duplicate receipts or Case Packet Markdown.
- Board evidence privacy metadata explicitly records that moderator names and
  target authors are not copied into board summaries.
- Board statuses are `open`, `needs_policy_change`, `accepted_exception`,
  `resolved`, and `archived`.
- Evidence Boards are a moderator review surface only; they do not execute or
  recommend Reddit actions.

Runtime status:

- Evidence Board service and routes are locally/type verified only.
- Redis persistence is tested with mocked Redis.
- Devvit Web/Redis route proof now exists for safe smoke routes, log-only
  receipts, content snapshots, Evidence Boards, Case Packets, config
  export/import, and retention inventory/dry-run controls.

## Wave 30 Privacy Retention Controls

Date: 2026-05-19

Evidence source:

- Existing local services persist scan metadata/detail records, action
  receipts, Evidence Boards, and team delivery receipts under namespaced Redis
  keys.
- Shared expansion privacy guidance requires data minimization,
  moderator-visible retention/export/delete controls, and protected policy
  history.

Decision:

- W30 adds retention settings for scan history, action receipts, Evidence
  Boards, team delivery receipts, Case Packets, and AI advisory logs.
- Policy history remains protected by default and is reported as protected in
  inventory/deletion results.
- Case Packets and AI advisory logs are included in settings and reports but
  currently have no persisted first-class records to delete.
- Privacy export is an inventory/count report, not a private payload export.
- Manual deletion supports dry-run by default, selected categories, and expired
  cleanup based on retention windows.

Runtime status:

- Privacy retention service, API contracts, and Settings UI are locally
  type-verified.
- Post-W34 Devvit playtest verified Settings save, privacy inventory counts,
  and selected-category dry-run deletion controls in the Reddit-hosted WebView.
- Actual Redis deletion behavior is tested with mocked dependencies only; no
  destructive Devvit deletion was run. Runtime proof is still required before
  claiming live Redis cleanup or scheduled cleanup behavior.

## Wave 31 Mobile And Runtime Resilience

Date: 2026-05-19

Evidence source:

- Static built client served from `dist/client` through `http-server`.
- Playwright CLI at a 390px viewport.
- Local CSS/static tests for narrow workspace collapse.

Decision:

- W31 adds timeout-aware client API calls and classifies static preview,
  timeout, network, API, and clipboard failures into actionable messages.
- Static preview and missing Devvit WebView signals are shown as runtime
  resilience notices instead of silent fallback behavior.
- Clipboard failures keep Markdown export text visible and tell moderators to
  copy manually from the export box.

Runtime status:

- Static browser proof: Act, Scan, Review, Prove, and Settings reported
  `documentElement.scrollWidth === window.innerWidth === 390`.
- Screenshot artifact:
  `output/playwright/w31/settings-390.png` (ignored local output).
- No Devvit playtest or native mobile app verification was run in W31.
  Runtime mobile/WebView proof remains required before claiming mobile runtime
  readiness.

## Operational Overhaul W13 Runtime Findings

Date: 2026-05-18

Evidence source:

- `npx devvit whoami` succeeded as `u/BrightyBrainiac`.
- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror` on
  `v0.0.1.71`.
- Zen desktop browser was signed in and opened the playtest subreddit.
- Computer Use observed Reddit UI state and captured a screenshot at
  `output/runtime/w13/devvit-w12-act-modal-v0.0.1.71.png`.

Verified:

- The subreddit overflow menu shows `Open ModMirror dashboard` for the
  moderator account.
- Selecting `Open ModMirror dashboard` opens the confirmation form. The W13 pass
  canceled the form and did not create a new dashboard post.
- An existing ModMirror dashboard custom post renders the W12 operational IA in
  Reddit's expanded WebView modal: Act, Scan, Agree, Review, Prove, Settings.
- Reddit host chrome remains present, including the host viewport control
  labeled `Mobile`.

Not verified:

- At W13 time, post/comment Apply Policy menu entries were still unverified.
  Post and comment detail-page entrypoints were later verified in the
  post-W34 runtime proof sections below.
- Runtime `/api/smoke/redis` and `/api/smoke/reddit` responses.
- Real target context capture from `MenuItemRequest.targetId`.
- Devvit Redis receipt, scan, policy lifecycle, and case packet persistence.
- Non-mod access blocking and native Reddit mobile app behavior.

Decision:

- W13 upgrades the operational IA and subreddit dashboard launcher to runtime
  verified on desktop WebView.
- W13 does not upgrade post/comment Apply Policy, Redis persistence, receipts,
  destructive moderation execution, delivery, scheduler, native Mod Notes, AI,
  non-mod access, or native mobile status.

## Post-W34 Runtime Smoke Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Existing `ModMirror policy dashboard` custom post opened the Devvit WebView.
- Settings safe smoke controls were executed inside the authenticated WebView.

Verified:

- Playtest `v0.0.1.73` executed `POST /api/smoke/redis` from the WebView and
  returned the UI success message:
  `Redis smoke passed: write/read matched inside Devvit playtest.`
- Playtest `v0.0.1.73` executed `POST /api/smoke/reddit` from the WebView and
  returned the UI success message:
  `Reddit read smoke passed: 0 rule(s), 0 removal reason(s), 5 mod log action(s).`
- The runtime capability matrix promoted Redis and Reddit read-only access to
  `verified runtime`.
- Playtest `v0.0.1.74` confirmed the Settings summary cards now also show
  Redis and Reddit source status as `verified runtime`.

Not verified:

- Post/comment Apply Policy menu entries and target context capture were not
  verified during the smoke-button pass; they were verified in the subsequent
  post-W34 menu target proofs below.
- Log-only Apply Policy receipt creation in Devvit Redis.
- Any destructive moderation operation.
- Native Mod Notes, modmail/mod discussion, scheduler, external AI, native
  mobile, or non-mod access blocking.

Decision:

- Redis read/write and Reddit read-only source access may now be described as
  runtime-verified for this test subreddit and playtest path.
- This proof does not authorize destructive moderation execution or delivery
  features.

## Post-W34 Post Menu Target Context Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Playtest version: `v0.0.1.83`.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Ordinary safe post used:
  `https://www.reddit.com/r/modmirror_dev/comments/1texjev/modmirror_wave_2_smoke_test/?playtest=modmirror`.

Verified:

- The Reddit post moderation actions menu displayed `Apply ModMirror Policy`.
- The menu action opened the Devvit form and resolved the real post target:
  `t3_1texjev`, target type `post`, author `BrightyBrainiac`, subreddit
  `modmirror_dev`, title `ModMirror Wave 2 smoke test`.
- Submitting `Open policy dashboard` created a guidance custom post.
- The expanded WebView on that guidance custom post loaded the Act workspace
  and displayed `Selected Reddit target` with the captured target ID, author,
  subreddit, title, and source link.
- The working target handoff uses Devvit custom post `postData` and
  `/api/launch-context`, because Reddit preserves `#act?...` on the parent
  post URL while the embedded WebView only receives `#act`.
- No moderation action was executed.

Not verified:

- Log-only Apply Policy receipt creation from this real post target.
- Destructive moderation execution.

Decision:

- Post-level Apply Policy entrypoint discovery and target-context handoff may
  now be described as runtime-verified for this desktop Reddit playtest path.
- Execution receipts remain unverified.

## Post-W34 Comment Menu Target Context Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Playtest versions: `v0.0.1.84` for the initial comment form proof and
  `v0.0.1.89` for the body-excerpt WebView proof.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Ordinary safe comment used: `t1_ommzgtz` on safe post `t3_1texjev`.

Verified:

- A safe test comment was posted with body
  `Runtime comment target smoke for ModMirror; safe test content.`
- The Reddit comment moderation actions menu displayed `Apply ModMirror Policy`.
- The menu action opened the Devvit form and resolved the real comment target:
  `t1_ommzgtz`, target type `comment`, author `BrightyBrainiac`, subreddit
  `modmirror_dev`, and the selected comment body.
- Submitting `Open policy dashboard` created a guidance custom post.
- The expanded WebView on the `v0.0.1.89` guidance custom post loaded the Act
  workspace and displayed `Selected Reddit target` with the captured comment
  ID, author, subreddit, body excerpt, and source link.
- The working target handoff uses Devvit custom post `postData` and
  `/api/launch-context`; the embedded WebView receives `#act`, while the parent
  Reddit post URL preserves the full target payload.
- No moderation action was executed.

Not verified:

- Log-only Apply Policy receipt creation from this real comment target.
- Destructive moderation execution.

Decision:

- Comment-level Apply Policy entrypoint discovery and target-context handoff
  may now be described as runtime-verified for this desktop Reddit playtest
  path.
- Execution receipts remain unverified.

## Post-W34 Log-Only Receipt Runtime Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Playtest version: `v0.0.1.90`.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Computer Use drove the Reddit page and switched the Devvit modal from
  `Mobile` to `Fullscreen` before confirmation.
- Comment guidance custom post used:
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- Screenshots captured:
  - `output/runtime-proof/post34-v90-after-confirm-click.png`
  - `output/runtime-proof/post34-v90-receipt-ledger.png`

Verified:

- The fullscreen WebView displayed the Act workspace with the menu-captured
  comment target `t1_ommzgtz`, author `BrightyBrainiac`, subreddit
  `modmirror_dev`, and body `Runtime comment target smoke for ModMirror; safe
  test content.`
- `Runtime Smoke Policy` was selected.
- The selected action was changed to `warn`, matching the policy
  recommendation; Native Mod Note stayed `log only`.
- Confirming the log-only action showed `Policy action recorded with receipt.`
- The response proof reported:
  `Receipt receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0 recorded. No Reddit action was applicable.`
- The Receipt Ledger displayed the same receipt with recommended `warn`,
  selected `warn`, execution `skipped`, mode `log only`, capability
  `not applicable`, a gated response template draft, and Native Mod Note
  `skipped (disabled)`.
- No Reddit moderation action was executed.

Decision:

- Log-only Apply Policy receipt creation may now be described as
  runtime-verified for this desktop Reddit Devvit WebView playtest path.
- This proof does not authorize destructive Reddit moderation execution or
  native Mod Note delivery.

## Post-W34 Mobile Devvit WebView Runtime Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Playtest version: `v0.0.1.91`.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Computer Use inspected the Reddit-owned Devvit modal while the host viewport
  selector remained on `Mobile`.
- Comment guidance custom post used:
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- Screenshots captured:
  - `output/runtime-proof/post34-v91-mobile-act-ledger.png`
  - `output/runtime-proof/post34-v91-mobile-target-form.png`
  - `output/runtime-proof/post34-v91-mobile-receipt-ledger.png`

Verified:

- The Reddit desktop host `Mobile` Devvit modal rendered the ModMirror shell,
  nav, Act workspace, target context, Apply Policy form, Operational Queue,
  guided setup, demo scenario, and Receipt Ledger without requiring fullscreen.
- The Act workspace showed the selected comment target `t1_ommzgtz`, author
  `BrightyBrainiac`, subreddit `modmirror_dev`, and body
  `Runtime comment target smoke for ModMirror; safe test content.`
- The Apply Policy form retained the captured target fields and allowed the
  safe log-only control state to remain visible in the narrow modal.
- The Receipt Ledger displayed
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` with recommended `warn`,
  selected `warn`, execution `skipped`, mode `log only`, capability
  `not applicable`, gated response template draft, and Native Mod Note
  `skipped (disabled)`.
- No Reddit moderation action was executed.

Not verified:

- This is a desktop Reddit host mobile-modal proof, not native Reddit mobile
  app proof. Native mobile app layout and interaction behavior remain
  unverified.

Decision:

- The W12/W31 narrow Devvit WebView layout may now be described as
  runtime-verified for Reddit's desktop host `Mobile` modal.
- Native Reddit mobile app behavior must remain a separate open runtime gap.

## Post-W34 Evidence Board Runtime Proof

Date: 2026-05-19

Evidence source:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Playtest version: `v0.0.1.92`.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Computer Use opened the existing comment guidance custom post and drove the
  Reddit-owned Devvit WebView modal.
- Comment guidance custom post used:
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- Screenshot captured:
  `output/runtime-proof/post34-v92-evidence-board-receipt-snapshot.png`.

Verified:

- The Act workspace Receipt Ledger still loaded
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` from Devvit Redis after the
  playtest advanced to `v0.0.1.92`.
- Clicking `Open evidence board` on that receipt created a Redis-backed
  Evidence Board and navigated to the Prove workspace.
- The UI reported `Evidence board opened.`
- The Evidence Board list displayed
  `Review receipt receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` with
  `2 evidence items` and status `Open`.
- The board included a receipt-backed content snapshot evidence item:
  `Snapshot captured: Runtime comment target smoke for ModMirror; safe test content.`
- Entering `Runtime evidence-board smoke note.` and clicking `Update`
  exercised the status-update route and returned
  `Evidence board status updated.`
- No Reddit moderation action was executed.

Decision:

- W26 Evidence Board create/list/status persistence may now be described as
  runtime-verified for this desktop Reddit Devvit WebView playtest path.
- W16 receipt-backed content snapshot persistence is runtime-verified for the
  previously captured real comment menu target.
- This proof does not cover native mobile behavior.

Additional Case Packet proof on the same playtest:

- Entering `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` into the tracked
  action/receipt field and clicking `Generate from action` returned
  `Case packet generated.`
- The generated packet was labeled `Official Case Packet` for
  `r/modmirror_dev`, posture `Policy Consistent`, action
  `action-4f669df3-18a2-411a-a13d-78a66ec1fdbb`, and receipt
  `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0`.
- The packet's evidence labels included:
  - `Action receipt: verified receipt`
  - `Content snapshot: verified receipt`
  - `Policy version: verified modmirror action`
  - `Override context: missing`
  - `Comparable cases: missing`
- The Markdown export included `Content snapshot: captured` and retained the
  deterministic caveats.
- Clicking `Open from packet` created a second Evidence Board:
  `Review case packet case-packet-a7146342-1d4d-4a69-b333-790ad3e9e986`.
- The Case Packet-origin board displayed `3 evidence items`, including the
  content snapshot and a case-packet evidence summary:
  `Case packet appeal_context: matched_policy; posture policy_consistent; 5 evidence labels.`
- Screenshot captured:
  `output/runtime-proof/post34-v92-case-packet-evidence-board.png`.

## Post-W34 Config And Privacy Runtime Proof

Date: 2026-05-19

Evidence source:

- `npx devvit whoami` reported `Logged in as u/BrightyBrainiac`.
- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- Devvit CLI reported playtest version `v0.0.1.93`. The already-open Reddit
  WebView token still reported app version `0.0.1.92`; no production source
  code changed between the `v0.0.1.92` and `v0.0.1.93` playtest starts.
- Zen desktop browser was signed in as moderator `u/BrightyBrainiac`.
- Computer Use drove the Reddit-owned Devvit WebView modal on the comment
  guidance custom post:
  `https://www.reddit.com/r/modmirror_dev/comments/1thheea/modmirror_policy_guidance_for_comment/?playtest=modmirror`.
- Screenshots captured:
  - `output/runtime-proof/post34-v93-config-export-import.png`
  - `output/runtime-proof/post34-v93-privacy-retention-dry-run.png`

Verified config portability:

- Settings export generated a live portable config package with
  `schemaVersion` `modmirror.config.v1`, package ID
  `config-4c9fe762-2146-46ce-b9e3-3dfd8797327d`, source `live_config`,
  subreddit `modmirror_dev`, `includePrivateHistory: false`, and exported-by
  moderator `BrightyBrainiac`.
- The exported package contained `Runtime Smoke Policy` and digest settings,
  but explicitly warned that private history is excluded: receipts, overrides,
  scans, content snapshots, case packets, evidence boards, delivery receipts,
  and incident reports are not exported.
- Loading starter template `template-spam-flood-review` filled the import box
  with one starter policy, `Spam and repeated promotion`.
- Import dry-run returned `Dry run completed. No policies or settings were
  written.`, accepted `yes`, policies `1`, skipped `0`, settings `unchanged`,
  and `Spam and repeated promotion - created Policy will be imported as a new draft.`
- Clicking `Import drafts` returned
  `Portable config imported as drafts and proposed updates.`, accepted `yes`,
  policies `1`, skipped `0`, settings `unchanged`, and retained the private
  history exclusion warnings.
- The Settings side summary then showed `2 policies loaded in this session`,
  proving the imported draft was visible after the Redis-backed import route.

Verified privacy retention controls:

- Clicking `Save retention` with the visible default windows returned
  `Retention settings saved. Policy history remains protected.`
- Clicking `Export inventory` returned
  `Privacy inventory loaded. It reports counts, not private payloads.`
- Inventory export reported subreddit `r/modmirror_dev`, `7` categories,
  `1` retained action receipt, `2` retained evidence boards, `0` retained scan
  history, `0` retained team delivery receipts, `0` persisted case packets,
  `0` persisted AI advisory logs, and `Policy history Protected`.
- Selecting action receipts, evidence boards, and case packets, then clicking
  `Dry run selected`, returned `Dry run completed. No data was deleted.`
- The dry-run deletion report showed mode `dry run`, action receipts
  `0 retained / 1 selected`, evidence boards `0 retained / 2 selected`, case
  packets `0 retained / 0 selected`, and `Policy history Protected`.
- The dry-run warnings stated `Dry run only. No keys were deleted.` and
  `Policy history remains protected by default.`
- No destructive retention deletion was clicked.

Decision:

- W28 config export/import persistence may now be described as
  runtime-verified for this desktop Reddit Devvit WebView playtest path.
- W30 retention settings, privacy inventory, and dry-run deletion controls may
  now be described as runtime-verified for this desktop Reddit Devvit WebView
  playtest path.
- Actual expired-data cleanup/deletion remains unverified and should require a
  separate controlled destructive cleanup test.
