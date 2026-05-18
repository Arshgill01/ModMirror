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
| Deep scan pagination | gap | Live source defaults to shallow fetch | Research/implement W06. |
| Policy CRUD/versioning | verified locally | `policies.ts`, tests | Extend to agreement lifecycle later. |
| True policy proposal/review/adoption | gap | No lifecycle schema | Add W08 after receipt/scan groundwork. |
| Apply Policy target-aware preview | verified locally | `applyPolicy.ts`, `applyPolicy.test.ts`, `schema.ts`, client rendering | Preserve as W03 execution preview foundation. |
| Apply Policy confirm log-only | verified locally | `applyPolicy.ts`, `audit.ts`, tests | Preserve fallback while adding execution gates. |
| Real Reddit remove/approve execution | disabled with local engine tests | W03 `moderationExecution.ts` can call typed SDK methods only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Ignore reports execution | disabled with local engine tests | W03 `moderationExecution.ts` uses target model `ignoreReports()` only when live and runtime-proof flags are enabled; W04 receipt service now exists | Runtime-proof on safe test content before enabling. |
| Public comment delivery | disabled/unverified | `RESEARCH.md` says unknown ordering | Keep disabled until runtime proof. |
| Modmail/mod discussion delivery | disabled/unverified | Digest capabilities are `unverified` | Spike only, preview-first. |
| Native Mod Notes | disabled/unverified | Typings only | Spike only after runtime proof. |
| Scheduler | disabled/unverified | Digest capabilities are `unverified` | Spike only after runtime proof. |
| Action receipts | verified locally | W04 `receipts.ts`, `receipts.test.ts`, Apply Policy confirm integration | Runtime-smoke Redis persistence in Devvit playtest. |
| Override audit/review | verified locally | `audit.ts`, tests | Integrate with receipts. |
| Policy health | verified locally | `policyHealth.ts`, tests | Recompute with receipts when available. |
| Case Packets | verified locally/demo runtime | `casePacket.ts`, tests, runtime reports | Upgrade to receipt-backed v2 in W09. |
| Manual digest/history | verified | `digest.ts`, tests, runtime reports | Rebase on receipts/scan history later. |
| Non-mod access blocking | unverified | Launch checklist unchecked | Add runtime QA matrix. |
| Reddit mobile app QA | unverified | Launch checklist unchecked | Add W13 verification target. |
