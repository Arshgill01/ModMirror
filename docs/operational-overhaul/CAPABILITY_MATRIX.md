# Operational Capability Matrix

Created: 2026-05-18

Status labels:

- `verified`: proven by current code plus recorded local/runtime evidence.
- `type/build-only`: SDK or code typechecks, but no runtime proof.
- `unverified`: intended or available, but not proven in runtime.
- `disabled`: deliberately unavailable in product behavior.
- `gap`: not implemented.

| Capability | Status | Evidence | Next Action |
|---|---|---|---|
| Devvit Web/Hono server | verified | `src/index.ts`, build/playtest reports | Preserve shape. |
| Inline custom post dashboard | verified | `devvit.json`, Wave 7/8 and 9/10 runtime reports | Preserve as dashboard launcher/fallback. |
| Expanded WebView dashboard | verified | `RESEARCH.md`, Wave 7/8 and 9/10 runtime reports | Keep host chrome intact. |
| Subreddit dashboard menu | verified | `devvit.json`, `src/routes/menu.ts`, runtime reports | Keep, but align labels with operational IA later. |
| Post/comment smoke menus | disabled | Removed from `devvit.json` in W01. `/api/smoke/*` diagnostics remain explicit API routes. | Do not re-expose smoke language to moderators. |
| Post/comment Apply Policy menu | type/build-only | `devvit.json`, `src/routes/menu.ts`, `src/routes/forms.ts`, local typecheck/build. | Runtime-verify in Devvit playtest. |
| Target ID from menu request | type/build-only | `MenuItemRequest.targetId`, W01 form path | Runtime-verify through real W01 flow. |
| Full target context capture | type/build-only | `src/server/services/targetContext.ts`, unit tests | Runtime-verify post/comment fetch and permission shape. |
| Current moderator context | partial | `context.username`, `reddit.getCurrentUser()` in smoke | Add safe resolver and permission notes. |
| Moderator-only menu visibility | type/build-only | `forUserType: "moderator"` | Runtime-verify and add server-side checks. |
| Mirror Scan demo mode | verified | `mirrorScan.test.ts`, runtime demo reports | Preserve clear demo labeling. |
| Mirror Scan live source adapters | type/build-only | `redditSources.ts`, installed typings | Runtime-smoke and capture warnings. |
| Full scan history persistence | verified locally | W05 `MirrorScanRecord`, `scans.ts`, `scans.test.ts` | Runtime-smoke Redis persistence in Devvit playtest. |
| Deep scan pagination | type/build-only | W06 quick/standard/deep depth caps, `redditSources.test.ts`, installed `Listing` typings | Runtime-verify moderation-log pagination in Devvit playtest. |
| Drift-over-time analytics | verified locally | W07 `analytics.ts`, `analytics.test.ts`, `/api/analytics/consistency`, Review UI surface | Runtime-smoke Redis-backed scan/receipt reads in Devvit playtest. |
| Policy CRUD/versioning | verified locally | `policies.ts`, tests | Extend to agreement lifecycle later. |
| True policy proposal/review/adoption | verified locally | W08 lifecycle schema, policy version metadata, propose/review/adopt APIs, and policy tests | Runtime-smoke lifecycle APIs in Devvit playtest. |
| Apply Policy target-aware preview | verified locally | `applyPolicy.ts`, `applyPolicy.test.ts`, `schema.ts`, client rendering | Preserve as W03 execution preview foundation. |
| Apply Policy confirm log-only | verified locally | `applyPolicy.ts`, `audit.ts`, tests | Preserve fallback while adding execution gates. |
| Real Reddit remove/approve execution | disabled with local engine tests | W03 `moderationExecution.ts` can call typed SDK methods only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Ignore reports execution | disabled with local engine tests | W03 `moderationExecution.ts` uses target model `ignoreReports()` only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Public comment delivery | disabled/unverified | `RESEARCH.md` says unknown ordering | Keep disabled until runtime proof. |
| Modmail/mod discussion delivery | disabled/type-only | W11 `teamDelivery.ts`, `/api/delivery/*`, mocked adapter tests; Devvit docs/typings expose internal Mod Discussion creation | Keep disabled until explicit confirmation, runtime proof, and a real adapter are available. |
| Native Mod Notes | disabled/unverified | Typings only | Spike only after runtime proof. |
| Scheduler | unavailable/type-only | W11 delivery capabilities mark scheduler unavailable because no scheduler task is registered in `devvit.json`; Devvit docs/typings expose scheduler APIs | Register only after runtime proof and opt-in design. |
| Action receipts | verified locally | W04 `receipts.ts`, `receipts.test.ts`, Apply Policy confirm integration | Runtime-smoke Redis persistence in Devvit playtest. |
| Override audit/review | verified locally | `audit.ts`, tests | Integrate with receipts. |
| Policy health | verified locally | `policyHealth.ts`, tests | Recompute with receipts when available. |
| Case Packets v2 | verified locally/demo runtime | W09 `casePacket.ts`, receipt-backed tests, packet type/evidence contracts, runtime reports for older demo flow | Runtime-smoke receipt-backed generation in Devvit playtest. |
| Manual digest/history | verified | `digest.ts`, tests, runtime reports | Rebase on receipts/scan history later. |
| AI advisory layer | disabled/type-only | W10 `aiAdvisory.ts`, `/api/ai/capabilities`, `/api/ai/advisory`, mocked-provider tests; Devvit docs/typings show server fetch and secret settings support | Keep disabled until provider config, HTTP permission, secrets, terms/privacy requirements, and runtime proof are complete. |
| Team delivery receipts | verified locally | W11 `teamDelivery.ts`, `teamDelivery.test.ts`, Redis keys `delivery:receipts` and `delivery:receipt:{id}` | Runtime-smoke receipt persistence in Devvit playtest. |
| Non-mod access blocking | unverified | Launch checklist unchecked | Add runtime QA matrix. |
| Reddit mobile app QA | unverified | Launch checklist unchecked | Add W13 verification target. |
