# Runtime Proof Backlog

Created: 2026-05-20

## Purpose

This backlog is the operational-overhaul control list for remaining runtime
proof gaps. It does not replace `TODO.md`, `RESEARCH.md`, or the capability
matrices; it gives future proof passes a single index of what is still open,
what evidence is required, and which actions are off limits without explicit
approval.

Do not mark the active operational-overhaul goal complete from this backlog
alone. A row is complete only when the named evidence is recorded in
`RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
`RUNTIME_VERIFICATION_MATRIX.md`, and the relevant wave/build report.

## Global No-Go Rules

- Do not perform destructive Reddit moderation actions without explicit user
  approval, controlled throwaway content, action-time moderator confirmation,
  and receipt proof.
- Do not create public Reddit posts/comments, report content, send Mod
  Discussion/modmail/private messages, add native Mod Notes, run scheduler
  jobs, delete real operational records, or call external AI providers unless
  the active proof plan explicitly permits it and the user has approved the
  run.
- Do not treat empty fallbacks, static screenshots, local tests, manual runtime
  event entries, or type-only SDK support as runtime proof.
- Keep per-mod/manage-level visibility aggregate-only unless permission strings
  are runtime-verified.

## Proof Rows

| Gap | Current status | Required evidence | Plan / next action |
|---|---|---|---|
| True non-mod protected API blocking | Local guard verified; current moderator account returned `all`; true non-mod account not used. | A true non-mod account opens/probes protected routes and receives moderator-access errors without protected data. | Execute `ACCESS_RUNTIME_TEST_PLAN.md`. |
| Lower-permission moderator strings | Current full moderator returned `all`; lower-permission roles unknown. | A limited moderator account runs Settings `Check access`; exact permission strings and visibility level are recorded. | Execute `ACCESS_RUNTIME_TEST_PLAN.md`. |
| Live same-subreddit modqueue item reads | Act Operational Queue reached read-only fallback on `v0.0.1.94` and `v0.0.1.123`; no live items. | `/api/modqueue/triage` returns `source: "reddit_modqueue"` with safe `r/modmirror_dev` items, or captures exact adapter failure. | Execute `MODQUEUE_RUNTIME_TEST_PLAN.md`. |
| Real operational-record retention deletion | Synthetic expired-record cleanup verified; real record deletion not approved or run. | Controlled marked records are inventoried, dry-run counts match, destructive deletion removes exact expected records, and policy history is preserved. | Execute `RETENTION_DESTRUCTIVE_TEST_PLAN.md` only after explicit approval. |
| Real remove/approve/ignore-reports execution | Disabled behind local execution gates. | Controlled throwaway content proves each action, receipt status, Reddit result, and rollback/cleanup notes. | Needs a dedicated destructive moderation proof plan before any run. |
| Public comment delivery | Policy defaults normalized to `log_only`; comment ordering/identity/sticky behavior unknown. | Safe content proves comment before removal, after removal, author identity, distinguishability, and sticky capability or failure shape. | Needs a dedicated public-comment delivery proof plan. |
| Private message / modmail delivery | Typings exist; product delivery remains disabled. | Explicit preview/confirm flow sends only approved safe test content and records permission/error/delivery shape. | Needs a dedicated private delivery proof plan; prefer modmail over deprecated subreddit PM. |
| Native Mod Notes | Typings and gated service exist; no playtest write/read/delete proof. | Safe target proves add/read/delete behavior, labels, permission failures, and receipt status without default enablement. | Needs a dedicated native Mod Notes proof plan. |
| Internal Mod Discussion delivery | Manual/skipped receipts verified; no live send adapter is injected. | Approved safe internal Mod Discussion send records destination, visibility, permission errors, and receipt outcome. | Needs a dedicated Mod Discussion proof plan before enabling any send path. |
| Scheduler jobs | No ModMirror scheduler task is registered; confirmations are locally skipped. | Registered task runs in Devvit runtime, records expected job result, and cannot accidentally send Mod Discussion delivery. | Needs scheduler opt-in design and proof plan before registration. |
| External AI fetch and secrets | Advisory layer disabled/type-only; privacy readiness doc exists. | Provider terms/privacy approval, secret retrieval, outbound fetch, timeout/error handling, data minimization, and no-enforcement boundary are recorded. | Needs external AI provider proof plan after provider choice and approval. |
| Native Reddit mobile app | Desktop WebView host mobile/fullscreen accessibility proof exists; native app unverified. | Native Reddit app/device or reliable device mirror proves launch, navigation, target context, forms, and no overlapping UI. | Needs native mobile QA plan and device access. |
| Deep moderation-log pagination | Type/build support and depth caps exist; live pagination unverified. | Devvit playtest with enough history proves pagination cursor behavior, caps, warnings, and no overclaiming. | Needs deep-scan pagination proof plan or safe data setup. |
| Multi-moderator policy ratification | Single-mod proposal/review threshold blocking verified. | Distinct moderator accounts prove reviewer identity handling, duplicate-review prevention, threshold adoption, and audit trail. | Needs multi-account ratification proof plan. |
| Larger Redis storage envelopes | Current bounded envelope `10/500/500` verified. | New raised caps are smoke-tested in Devvit runtime with cleanup and latency notes before product claims change. | Keep current caps until a larger-envelope proof is planned. |

## Recommended Order

1. Non-destructive/account-only proof: access, lower-permission roles.
2. Read-only platform proof: modqueue and deep pagination.
3. UI/device proof: native Reddit mobile.
4. Controlled data proof: real retention cleanup.
5. Delivery proof: public comments, modmail/private delivery, Mod Discussion.
6. Native Mod Notes.
7. Scheduler jobs.
8. External AI provider proof.
9. Destructive moderation execution.

This order keeps the product aligned with the consistency-first MVP while
delaying public, destructive, or external-service behavior until lower-risk
runtime facts are settled.
