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
| Post/comment smoke menus | verified as present | `devvit.json`, `src/routes/menu.ts` | Replace in W01 with real ModMirror entrypoints. |
| Post/comment Apply Policy menu | gap | No menu config or handler exists | Add in W01. |
| Target ID from menu request | type/build-only | `MenuItemRequest.targetId`, smoke helper | Runtime-verify through real W01 flow. |
| Full target context capture | gap | Only smoke summary exists | Add target-context service in W01. |
| Current moderator context | partial | `context.username`, `reddit.getCurrentUser()` in smoke | Add safe resolver and permission notes. |
| Moderator-only menu visibility | type/build-only | `forUserType: "moderator"` | Runtime-verify and add server-side checks. |
| Mirror Scan demo mode | verified | `mirrorScan.test.ts`, runtime demo reports | Preserve clear demo labeling. |
| Mirror Scan live source adapters | type/build-only | `redditSources.ts`, installed typings | Runtime-smoke and capture warnings. |
| Full scan history persistence | gap | `scans.ts` stores metadata only | Add W05 persistence with retention. |
| Deep scan pagination | gap | Live source defaults to shallow fetch | Research/implement W06. |
| Policy CRUD/versioning | verified locally | `policies.ts`, tests | Extend to agreement lifecycle later. |
| True policy proposal/review/adoption | gap | No lifecycle schema | Add W08 after receipt/scan groundwork. |
| Apply Policy preview | verified locally | `applyPolicy.ts`, tests | Make target-aware in W02. |
| Apply Policy confirm log-only | verified locally | `applyPolicy.ts`, `audit.ts`, tests | Preserve fallback while adding execution gates. |
| Real Reddit remove/approve execution | type/build-only | Installed typings expose APIs; no product call | Add gated service in W03, runtime-proof before enabling. |
| Ignore reports execution | type/build-only | Installed typings expose APIs | Gate and test before enabling. |
| Public comment delivery | disabled/unverified | `RESEARCH.md` says unknown ordering | Keep disabled until runtime proof. |
| Modmail/mod discussion delivery | disabled/unverified | Digest capabilities are `unverified` | Spike only, preview-first. |
| Native Mod Notes | disabled/unverified | Typings only | Spike only after runtime proof. |
| Scheduler | disabled/unverified | Digest capabilities are `unverified` | Spike only after runtime proof. |
| Action receipts | gap | `ActionEvent` lacks execution result fields | Add W04 receipt ledger. |
| Override audit/review | verified locally | `audit.ts`, tests | Integrate with receipts. |
| Policy health | verified locally | `policyHealth.ts`, tests | Recompute with receipts when available. |
| Case Packets | verified locally/demo runtime | `casePacket.ts`, tests, runtime reports | Upgrade to receipt-backed v2 in W09. |
| Manual digest/history | verified | `digest.ts`, tests, runtime reports | Rebase on receipts/scan history later. |
| Non-mod access blocking | unverified | Launch checklist unchecked | Add runtime QA matrix. |
| Reddit mobile app QA | unverified | Launch checklist unchecked | Add W13 verification target. |

