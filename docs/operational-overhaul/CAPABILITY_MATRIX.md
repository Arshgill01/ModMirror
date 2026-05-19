# Operational Capability Matrix

Created: 2026-05-18
Updated: 2026-05-19

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
| Runtime verification matrix | runtime verified for safe status paths | W13 `GET /api/runtime-verification`, `runtimeVerification.test.ts`, W13 playtest `v0.0.1.71`, post-W34 playtest through `v0.0.1.122`, W17 fallback observation on `v0.0.1.123`, and access-guard playtest-ready build `v0.0.1.126` | Keep truth labels current after runtime changes. |
| Subreddit isolation guard | runtime verified for Devvit Web request context | W29 `subredditIsolation.ts`, `subredditIsolation.test.ts`, guarded API routes, and post-W34 Devvit playtest `v0.0.1.122`: `/api/health` exposed `modmirror_dev`, current/default policy reads stayed in that namespace, `ExampleLearning` remained the labeled demo exception, and cross-subreddit query/body requests returned isolation errors before writes. | Keep same-subreddit live routes in regression checklist; cross-community dashboards remain out of scope. |
| Post/comment smoke menus | disabled | Removed from `devvit.json` in W01. `/api/smoke/*` diagnostics remain explicit API routes. | Do not re-expose smoke language to moderators. |
| Post/comment Apply Policy menu | runtime verified on desktop Reddit WebView | Post-W34 post proof `v0.0.1.83` and comment proof `v0.0.1.84` / `v0.0.1.89` showed `Apply ModMirror Policy` and opened target-aware guidance posts. | Keep native mobile and non-mod account checks open. |
| Target ID from menu request | runtime verified on desktop Reddit WebView | Post-W34 proofs resolved `t3_1texjev` and `t1_ommzgtz` from real menu requests. | Keep in regression checklist. |
| Full target context capture | runtime verified on desktop Reddit WebView | Post-W34 proofs showed target type, author, subreddit, post title, and comment body excerpt in the Act target strip. | Verify permission shape and native mobile separately. |
| Current moderator context | partial | `context.username`, `reddit.getCurrentUser()` in smoke; W29 `v0.0.1.122` `/api/health` returned `BrightyBrainiac` for authenticated Devvit Web request context. | Add safe resolver and permission notes; exact permission strings remain open. |
| Moderator-only menu visibility | runtime verified for mod account, local server guard verified | `forUserType: "moderator"` plus post/comment menu runtime proof; `moderatorAccess.ts` guards protected API routes in live subreddit context. | Runtime-verify blocking with a true non-mod account. |
| Mirror Scan demo mode | verified | `mirrorScan.test.ts`, runtime demo reports | Preserve clear demo labeling. |
| Mirror Scan live source adapters | type/build-only | `redditSources.ts`, installed typings | Runtime-smoke and capture warnings. |
| Full scan history persistence | runtime verified for safe live scan path | W05 `MirrorScanRecord`, `scans.ts`, `scans.test.ts`; post-W34 live quick scan persisted and replayed corrected attribution data. | Deep pagination remains separately unverified. |
| Modqueue triage | runtime fallback observed | W17 `modqueueTriage.ts`, `/api/modqueue/triage`, local tests, and post-W34 Devvit playtests `v0.0.1.94` / `v0.0.1.123`; the same-subreddit `v0.0.1.123` Operational Queue refresh returned the labeled type-supported/no-items fallback with no live items. | Create or identify safe queue content only with explicit confirmation; verify live `reddit_modqueue` items or exact adapter failure. |
| Deep scan pagination | type/build-only | W06 quick/standard/deep depth caps, `redditSources.test.ts`, installed `Listing` typings | Runtime-verify moderation-log pagination in Devvit playtest. |
| Drift-over-time analytics | runtime verified for small-sample Review path | W07 `analytics.ts`, `analytics.test.ts`, `/api/analytics/consistency`, Review UI surface; post-W34 Review health/impact proof loaded Redis-backed summaries. | Need larger live sample before product claims about impact strength. |
| Policy CRUD/versioning | verified locally | `policies.ts`, tests | Extend to agreement lifecycle later. |
| True policy proposal/review/adoption | runtime verified for single-mod playtest path | W08 lifecycle schema and tests; post-W34 `v0.0.1.104` verified proposed/under-review state and threshold blocking in Redis-backed WebView flow. | Multi-moderator distinct-reviewer proof remains open. |
| Apply Policy target-aware preview | verified locally | `applyPolicy.ts`, `applyPolicy.test.ts`, `schema.ts`, client rendering | Preserve as W03 execution preview foundation. |
| Apply Policy confirm log-only | verified locally | `applyPolicy.ts`, `audit.ts`, tests | Preserve fallback while adding execution gates. |
| Real Reddit remove/approve execution | disabled with local engine tests | W03 `moderationExecution.ts` can call typed SDK methods only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Ignore reports execution | disabled with local engine tests | W03 `moderationExecution.ts` uses target model `ignoreReports()` only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Public comment delivery | disabled/unverified | `RESEARCH.md` says unknown ordering | Keep disabled until runtime proof. |
| Modmail/mod discussion delivery | disabled/type-only | W11 `teamDelivery.ts`, `/api/delivery/*`, mocked adapter tests; Devvit docs/typings expose internal Mod Discussion creation | Keep disabled until explicit confirmation, runtime proof, and a real adapter are available. |
| Native Mod Notes | disabled/unverified | Typings only | Spike only after runtime proof. |
| Scheduler | unavailable/type-only | W11 delivery capabilities mark scheduler unavailable because no scheduler task is registered in `devvit.json`; Devvit docs/typings expose scheduler APIs | Register only after runtime proof and opt-in design. |
| Action receipts | runtime verified for log-only path | W04 `receipts.ts`, `receipts.test.ts`, Apply Policy confirm integration; post-W34 `v0.0.1.90` persisted receipt `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` in Devvit Redis. | Real Reddit execution receipts remain disabled until live action proof. |
| Override audit/review | verified locally | `audit.ts`, tests | Integrate with receipts. |
| Policy health | verified locally | `policyHealth.ts`, tests | Recompute with receipts when available. |
| Case Packets v2 | runtime verified for receipt-backed generation | W09 `casePacket.ts`, receipt-backed tests, packet type/evidence contracts; post-W34 generated an Official Case Packet from a runtime receipt and opened a receipt-backed Evidence Board. | Keep labels honest for missing comparables/override context. |
| Manual digest/history | verified | `digest.ts`, tests, runtime reports | Rebase on receipts/scan history later. |
| Operational IA: Act / Scan / Agree / Review / Prove | runtime verified on desktop WebView | W12 client code and static screenshots; W13 playtest `v0.0.1.71`; post-W34 `v0.0.1.120` verified launch, fullscreen, Agree, and Settings after UI alignment; `v0.0.1.121` accessibility-tree sweep verified launch, Act, Scan, Review, and Prove in Reddit host Mobile and Fullscreen modes. | Verify native Reddit mobile separately and add pixel screenshot proof when capture is reliable. |
| AI advisory layer | disabled/type-only | W10 `aiAdvisory.ts`, `/api/ai/capabilities`, `/api/ai/advisory`, mocked-provider tests; Devvit docs/typings show server fetch and secret settings support | Keep disabled until provider config, HTTP permission, secrets, terms/privacy requirements, and runtime proof are complete. |
| Team delivery receipts | runtime verified for manual/skipped receipts | W11 `teamDelivery.ts`, `teamDelivery.test.ts`, Redis keys `delivery:receipts` and `delivery:receipt:{id}`; post-W34 verified manual-ready and skipped Mod Discussion draft receipt persistence. | Real Mod Discussion send remains disabled. |
| Non-mod access blocking | locally guarded, runtime unverified | `moderatorAccess.ts` denies protected API routes when `getModPermissionsForSubreddit` is unavailable, fails, or returns no permissions; unit tests cover denial cases. | Runtime-verify with a true non-mod account and record exact failure shape. |
| Reddit mobile app QA | unverified | W12 static 390px screenshot only; W13 used desktop Zen with Reddit host Mobile viewport control, not native mobile app | Verify in native Reddit mobile app/device mirror. |
