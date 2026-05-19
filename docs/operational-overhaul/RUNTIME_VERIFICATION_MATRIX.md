# Runtime Verification Matrix

Last updated: 2026-05-20

This matrix distinguishes runtime proof from local tests, static browser proof,
type-only support, and disabled capability gates. It is mirrored in the
non-destructive diagnostic endpoint:

- `GET /api/runtime-verification`

## W13 Runtime Pass

Environment:

- Worktree: `/Users/arshdeepsingh/Developer/modmirror-w13-runtime-verification`
- Branch: `overhaul/w13-runtime-verification`
- Devvit user: `u/BrightyBrainiac`
- Playtest subreddit: `r/modmirror_dev`
- Playtest version: `v0.0.1.71`
- Browser used for UI proof: Zen on desktop

Runtime observations:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- The subreddit overflow menu showed `Open ModMirror dashboard`.
- Selecting that menu entry opened the `Open ModMirror Dashboard` confirmation
  form. The form was canceled; no new dashboard post was created in W13.
- An existing ModMirror dashboard custom post expanded and rendered the W12
  Act / Scan / Agree / Review / Prove / Settings IA inside Reddit's expanded
  WebView modal.
- The expanded modal preserved Reddit host chrome, including the viewport
  control labeled `Mobile`.
- Post/comment Apply Policy entries were not proven. The visible post overflow
  and moderator menus checked in the feed did not expose `Apply ModMirror
  Policy`; this remains type/build-only until tested in the correct Reddit
  post/comment context.

Artifact:

- `output/runtime/w13/devvit-w12-act-modal-v0.0.1.71.png`

## Post-W34 Runtime Pass

Environment:

- Worktree: `/Users/arshdeepsingh/Developer/ModMirror`
- Branch: `master`
- Devvit user: `u/BrightyBrainiac`
- Playtest subreddit: `r/modmirror_dev`
- Latest playtest version observed while continuing runtime proof work:
  `v0.0.1.138`
- Browser/UI driver: Zen desktop browser with Computer Use

Runtime observations:

- `npm run dev` reached Playtest ready for
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`.
- The inline launch card rendered app version `0.0.1.120` and opened the
  dashboard.
- Reddit host fullscreen mode rendered the Act, Agree, and Settings surfaces
  without the previously reported card alignment issue.
- Earlier post-W34 playtests recorded in `RESEARCH.md` and
  `docs/expansion-waves/post-w34-runtime-smoke.md` verified safe Redis smoke,
  Reddit read-only smoke, post/comment Apply Policy menu target capture,
  log-only receipt persistence, receipt-backed Evidence Boards and Case
  Packets, Incident Mode receipt tagging, config import/export, privacy
  dry-run controls, response preview receipts, review health, policy impact,
  attribution correction, replay, and policy ratification.
- Devvit playtest `v0.0.1.122` verified W29 subreddit isolation in the
  authenticated WebView API: current/default reads resolved to `modmirror_dev`,
  the labeled `ExampleLearning` demo namespace remained allowed, and
  cross-subreddit query/body requests returned isolation errors before writes.
- Devvit playtest `v0.0.1.123` rechecked the W17 same-subreddit Operational
  Queue path in the authenticated expanded WebView. The read-only refresh
  entered the loading state, returned the labeled type-supported/no-items
  fallback, and did not return live queue items.
- Devvit playtest `v0.0.1.126` reached Playtest ready after the server-side
  moderator access guard was added. No true non-mod account runtime proof was
  performed.
- Devvit playtest `v0.0.1.129` recorded the current moderator account's
  protected Settings access diagnostic as `all`.
- Devvit playtest `v0.0.1.136` verified Redis sorted-set ordering through the
  safe smoke route.
- Devvit playtest `v0.0.1.137` verified the current bounded Redis storage
  envelope through the safe smoke route.
- Devvit playtest `v0.0.1.138` verified the synthetic retention cleanup smoke
  route for synthetic expired records only.
- `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md` defines the required
  proof gate for true non-mod protected-route blocking and lower-permission
  moderator role-string capture. That plan has not been executed.
- No real Reddit moderation action, public post, native Mod Note write, Mod
  Discussion send, scheduler task, actual retention deletion against real
  operational records, or external AI call was executed.

## Capability Matrix

| Capability | Status | Proof / Evidence | Next Action |
|---|---|---|---|
| Subreddit dashboard launcher | runtime verified | W13 playtest `v0.0.1.71`; post-W34 `v0.0.1.120` and `v0.0.1.121` launch cards opened the dashboard from merged `master`. | Keep in runtime regression checklist. |
| Desktop expanded WebView IA | runtime verified | Existing dashboard post rendered Act / Scan / Agree / Review / Prove / Settings in Reddit's expanded modal; post-W34 verified launch/fullscreen/Agree/Settings after UI alignment; `v0.0.1.121` accessibility-tree sweep covered Act, Scan, Review, and Prove. | Keep in runtime regression checklist; add pixel screenshot proof when capture is reliable. |
| Host viewport control | runtime verified | Expanded modal showed Reddit-owned `Mobile` / `Fullscreen` viewport controls; post-W34 `v0.0.1.121` rendered launch, Act, Scan, Review, and Prove in both host modes by accessibility-tree inspection. | Verify native Reddit mobile separately. |
| Subreddit isolation guard | runtime verified | W29 Devvit playtest `v0.0.1.122` used authenticated WebView API probes: `/api/health` returned `modmirror_dev`; `/api/policies` default and explicit-current reads stayed scoped to `modmirror_dev`; `ExampleLearning` remained the labeled demo exception; cross-subreddit policy/runtime-capability/modqueue queries returned `403 subreddit_isolation_failed`; cross-subreddit policy creation returned `400 policy_validation_failed` before writes. | Keep same-subreddit live routes in regression checklist; cross-community dashboards are out of scope. |
| Modqueue triage | runtime fallback observed | Post-W34 playtests `v0.0.1.94` and `v0.0.1.123` reached the Act-page Operational Queue refresh path. The `v0.0.1.123` same-subreddit authenticated WebView refresh showed the read-only loading state, then returned the labeled type-supported/no-items fallback with no live queue items. `MODQUEUE_RUNTIME_TEST_PLAN.md` defines the safe proof gate before claiming live queue reads. | Execute the modqueue runtime test plan: use existing safe queue content if available, or ask before creating/reporting throwaway content, then verify live `reddit_modqueue` items or capture the exact adapter permission/runtime failure. |
| Post Apply Policy menu | runtime verified | Post-W34 playtest `v0.0.1.83` showed `Apply ModMirror Policy` on safe post `t3_1texjev` and resolved the target into the Act workspace. | Keep in runtime regression checklist. |
| Comment Apply Policy menu | runtime verified | Post-W34 playtest `v0.0.1.84` / `v0.0.1.89` showed `Apply ModMirror Policy` on safe comment `t1_ommzgtz` and resolved the comment body into the Act workspace. | Keep in runtime regression checklist. |
| Target context capture | runtime verified | Post-W34 post/comment menu proofs resolved target ID, type, author, subreddit, and post title/comment body in Reddit's desktop WebView path. | Verify native mobile separately. |
| Redis smoke | runtime verified | Post-W34 WebView Settings smoke reported write/read matched inside Devvit playtest. | Keep safe smoke button available. |
| Redis sorted-set ordering | runtime verified | Devvit playtest `v0.0.1.131` ran Settings `Run Redis ZSET`; the WebView reported `Redis sorted-set smoke order mismatch: expected newest, middle, oldest, observed .` and the runtime capability matrix recorded `redis-zset-ordering` as failed. After the diagnostic switched to the documented variadic `zAdd` call, Devvit playtest `v0.0.1.136` reported `Redis sorted-set smoke passed: observed newest, middle, oldest.` and the matrix showed `4 runtime`, `0 failed`. | Keep the safe smoke in regression checks. |
| Redis storage envelope | runtime verified for current caps | `/api/smoke/redis-storage` writes one scan-like record, 10 scan metadata rows, 500 action rows, and 500 override rows to smoke keys, then deletes them and verifies cleanup. Devvit playtest `v0.0.1.137` returned `Redis storage smoke passed: scan 10/10, actions 500/500, overrides 500/500, cleanup 0.` The runtime matrix showed `5 runtime`, `1 type-only`, `1 demo-only`, and `0 failed`. | Keep the safe storage smoke in regression checks before raising caps or storing larger live envelopes. |
| Retention cleanup synthetic smoke | runtime verified for synthetic records | `/api/smoke/retention-cleanup` creates old synthetic scan, receipt, evidence board, and team-delivery receipt records, deletes only those records through retention cleanup, and verifies detail keys plus sorted-set index references are gone. Local tests cover the route and runtime health event promotion. Devvit playtest `v0.0.1.138` returned `Retention cleanup smoke passed: scans 1/1, receipts 1/1, boards 1/1, delivery 1/1, detail keys 0, index refs 0.` The runtime matrix showed `6 runtime`, `1 type-only`, `1 demo-only`, and `0 failed`. | Keep this safe synthetic smoke in regression checks. Real operational-record deletion still requires a separate controlled destructive cleanup test. |
| Reddit read smoke | runtime verified | Post-W34 WebView Settings smoke reported rules/removal-reason/mod-log read-only results. | Keep read-only; do not infer live execution support. |
| Scan history persistence | runtime verified for safe live scan path | `scans.test.ts` passes; post-W34 live quick scan persisted corrected attribution data and replay consumed it. | Deep pagination remains unverified. |
| Policy proposal/review/adoption | runtime verified for single-mod playtest path | `policies.test.ts` passes; post-W34 `v0.0.1.104` verified proposed/under-review state and threshold blocking. | Multi-moderator distinct-reviewer proof remains open. |
| Log-only Apply Policy receipts | runtime verified | Post-W34 playtest `v0.0.1.90` recorded `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` for comment `t1_ommzgtz`; later WebView loads showed it in the Receipt Ledger. | Keep real Reddit execution disabled until separate proof. |
| Real remove/approve/ignore-reports | disabled with proof plan | Gated by `moderationExecution.ts`; no safe runtime proof. `REDDIT_MODERATION_EXECUTION_TEST_PLAN.md` defines the required explicit approval, throwaway-target, receipt, Reddit-visible-state, and cleanup gates. | Execute the destructive moderation execution test plan before enabling or claiming live remove/approve/ignore-reports behavior. |
| Public comment delivery | disabled/unverified, local log-only guard | `policies.ts` normalizes policy default delivery to `log_only` across create/update/version/adoption/read paths, and `policies.test.ts` covers the guard. `PUBLIC_COMMENT_DELIVERY_TEST_PLAN.md` defines the required approval, throwaway-content, identity, distinguish, sticky, and before/after-removal proof gate. | Execute the public comment delivery test plan before enabling any public-comment default. |
| Native Mod Notes | disabled/unverified with proof plan | `modNotes.ts` keeps native calls behind `MODMIRROR_ENABLE_NATIVE_MOD_NOTES=true`, `MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED=true`, and receipt availability; local tests cover skipped/sent/failed attempts with mocked Reddit. `NATIVE_MOD_NOTES_TEST_PLAN.md` defines the required approval, throwaway-target, receipt, readback, and cleanup proof gate. | Execute the native Mod Notes test plan before enabling native mode or claiming add/read/delete behavior. |
| Case Packets v2 | runtime verified | Post-W34 playtest generated an Official Case Packet from runtime receipt `receipt-79f819c9-bd62-4b80-8fd0-31b76097dce0` and opened a receipt-backed Evidence Board. | Preserve evidence labels and caveats. |
| Team delivery | manual/skipped receipts runtime verified, real send disabled | W11 preview-only service; post-W34 verified manual-ready and skipped Mod Discussion draft receipt persistence. Product routes still do not inject a live adapter, and scheduler confirmations are locally guarded as skipped because no scheduler task is registered. `PRIVATE_DELIVERY_TEST_PLAN.md` covers direct private-message and modmail proof; `MOD_DISCUSSION_DELIVERY_TEST_PLAN.md` covers internal Mod Discussion proof; `SCHEDULER_RUNTIME_TEST_PLAN.md` covers proof-only scheduler registration and smoke execution. | Verify private delivery, internal Mod Discussion destination behavior, and scheduler registration before enabling any send path. |
| AI advisory | disabled/type-only | W10 disabled provider abstraction; `AI_PRIVACY_READINESS.md` records the terms/privacy and data-minimization gate; no HTTP permission/secret proof. | Keep disabled until provider, secret, fetch, latency, failure, and privacy proof exists. |
| Non-mod access blocking | local server guard verified, runtime unverified | Menu config uses `forUserType: "moderator"` and `moderatorAccess.ts` now requires a signed-in user with non-empty `getModPermissionsForSubreddit` results before protected API routes continue in live subreddit context. Unit tests cover missing user, unavailable permission API, empty permissions, and permission-check failures. Current moderator diagnostics returned permission `all`, but no true non-mod account was used. Future per-mod/manage-level visibility stays aggregate-only unless `all` is present. `ACCESS_RUNTIME_TEST_PLAN.md` now defines the account, route, and evidence gates for the missing proof. | Execute the access runtime test plan with a true non-mod account and record the exact HTTP/UI failure shape. |
| Current moderator permission diagnostic | runtime verified for current account | Protected `/api/access/diagnostics` is covered by `apiAccess.test.ts`; the Devvit WebView Settings `Check access` diagnostic on playtest `v0.0.1.129` returned `Access check passed: 1 permission(s): all.` for the current moderator on `r/modmirror_dev`. The local diagnostic now also reports `full_moderator` only for `all`. `ACCESS_RUNTIME_TEST_PLAN.md` defines the separate lower-permission moderator role-string proof, but it has not run. | Execute the access runtime test plan with a lower-permission moderator before expanding the full-access-only per-mod/admin gate. |
| Native Reddit mobile app | unverified | W12 static 390px screenshot exists; W13 did not use native mobile app. | Verify in native Reddit app/device mirror. |

## Diagnostic Routes

Safe/non-destructive routes:

- `GET /api/runtime-verification`
- `GET /api/runtime-capabilities`
- `POST /api/runtime-capabilities/events`
- `POST /api/smoke/redis`
- `POST /api/smoke/redis-zset`
- `POST /api/smoke/redis-storage`
- `POST /api/smoke/retention-cleanup`
- `POST /api/smoke/reddit`
- `GET /api/health`
- `GET /api/access/diagnostics`
- `GET /api/receipts`
- `GET /api/scans`
- `GET /api/delivery/capabilities`
- `GET /api/ai/capabilities`

Settings includes a protected manual runtime-event form for `playtest` and
`manual_qa` observations that are not covered by smoke routes.

Destructive routes/actions remain disabled by default. Do not enable real
remove/approve/ignore-reports execution without explicit moderator confirmation,
controlled test content, and receipt proof.
