# Runtime Verification Matrix

Last updated: 2026-05-18

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

## Capability Matrix

| Capability | Status | Proof / Evidence | Next Action |
|---|---|---|---|
| Subreddit dashboard launcher | runtime verified | W13 playtest `v0.0.1.71`; Zen showed `Open ModMirror dashboard` and the confirmation form. | Re-run after W14 integration. |
| Desktop expanded WebView IA | runtime verified | Existing dashboard post rendered Act / Scan / Agree / Review / Prove / Settings in Reddit's expanded modal. | Capture integrated-branch screenshots. |
| Host viewport control | runtime verified | Expanded modal showed Reddit-owned `Mobile` viewport control. | Verify desktop/tablet/mobile host states after integration. |
| Post Apply Policy menu | type/build-only | `devvit.json` config and `src/routes/menu.ts`; not found/proven in W13 feed menu checks. | Test on an ordinary safe post detail page. |
| Comment Apply Policy menu | type/build-only | `devvit.json` config and `src/routes/menu.ts`; no comment target was verified in W13. | Add/locate a safe comment and test comment context menu. |
| Target context capture | type/build-only | `targetContext.test.ts` passes with mocks. | Verify resolved author/permalink from real post/comment menu target. |
| Redis smoke | type/build-only | `/api/smoke/redis` exists; local tests/build pass. | Hit route from Devvit runtime and record redacted read/write result. |
| Reddit read smoke | type/build-only | `/api/smoke/reddit` exists; local tests/build pass. | Hit route from Devvit runtime and record redacted rules/removal/modlog result. |
| Scan history persistence | local verified | `scans.test.ts` passes with mocked Redis. | Run demo/live scans in playtest, then verify list/detail/compare routes. |
| Policy proposal/review/adoption | local verified | `policies.test.ts` passes. | Complete lifecycle in playtest and reload. |
| Log-only Apply Policy receipts | local verified | `applyPolicy.test.ts` and `receipts.test.ts` pass. | Confirm an action in runtime and verify `/api/receipts`. |
| Real remove/approve/ignore-reports | disabled | Gated by `moderationExecution.ts`; no safe runtime proof. | Test only on controlled throwaway content after receipt proof. |
| Case Packets v2 | local verified | `casePacket.test.ts` passes. | Generate after a runtime receipt exists. |
| Team delivery | disabled/type-only | W11 preview-only service; no live adapter in product routes. | Verify internal destination and permission errors before enabling. |
| AI advisory | disabled/type-only | W10 disabled provider abstraction; no HTTP permission/secret proof. | Keep disabled until provider, secret, fetch, latency, and privacy proof exists. |
| Non-mod access blocking | unverified | Menu config uses `forUserType: "moderator"` only. | Test with non-mod account or document blocker. |
| Native Reddit mobile app | unverified | W12 static 390px screenshot exists; W13 did not use native mobile app. | Verify in native Reddit app/device mirror. |

## Diagnostic Routes

Safe/non-destructive routes:

- `GET /api/runtime-verification`
- `POST /api/smoke/redis`
- `POST /api/smoke/reddit`
- `GET /api/health`
- `GET /api/receipts`
- `GET /api/scans`
- `GET /api/delivery/capabilities`
- `GET /api/ai/capabilities`

Destructive routes/actions remain disabled by default. Do not enable real
remove/approve/ignore-reports execution without explicit moderator confirmation,
controlled test content, and receipt proof.
