# Current Repo Truth

Created: 2026-05-18

## Product Truth

ModMirror has a strong deterministic governance foundation, but it is not yet
an operational Reddit moderation tool at the moment of action.

It currently supports:

- Devvit Web + Hono server scaffold.
- Non-destructive post/comment menu entrypoints for Apply Policy guidance
  with target context capture, added in W01 and type/build-verified locally.
- Redis key helpers and service-level persistence.
- Demo and live Mirror Scan source paths.
- Deterministic attribution and drift summaries.
- Policy CRUD with immutable version records.
- Apply Policy target-aware preview, policy snapshots, evidence notes, explicit
  log-only confirmation copy, and `log_only` confirmation.
- A W03 gated moderation execution engine with typed success, failure, and
  skipped results. Product-integrated live Reddit actions remain disabled by
  default until receipts and runtime proof exist.
- W04 action receipts for every confirmed Apply Policy operation, with target
  snapshot, policy snapshot, recommendation, selected action, override context,
  and execution result.
- W05 full scan record persistence with attributed actions, unmatched actions,
  drift candidates, warnings, retention metadata, and scan compare APIs.
- Override audit/review and policy health.
- Case Packet generation from tracked ModMirror action data.
- Manual digest generation and digest history.
- Productized dashboard UI with runtime Settings.
- Unit tests for core shared and server service logic.

It does not yet support:

- Default-enabled safe execution of Reddit moderation actions from Apply
  Policy. W03 added the gated engine, but live execution remains disabled.
- Runtime-verified action receipts in Devvit playtest. Receipt storage is
  locally tested only.
- Runtime-verified full attributed scan history persistence. W05 local tests
  cover the Redis storage shape.
- Drift-over-time or policy-impact analytics from persisted scan/receipt data.
- True multi-mod policy proposal/review/adoption.
- Runtime-verified comment, modmail, scheduler, or native Mod Notes delivery.

## Remaining Smoking-Gun Code Facts

- W01 removed the production-facing post/comment smoke menus from
  `devvit.json` and replaced them with `Apply ModMirror Policy` entries.
- `src/core/smoke.ts` still backs explicit `/api/smoke/*` diagnostic routes,
  but smoke menu/form surfaces are no longer production-facing.
- `src/server/services/applyPolicy.ts` calls `createLogOnlyActionInput` and
  `saveActionEvent`; it does not call `reddit.remove`, `reddit.approve`, or
  `ignoreReports`.
- W02 Apply Policy previews now distinguish target context, policy version,
  ModMirror-tracked history, and log-only safety caveats before confirmation.
- W03 `src/server/services/moderationExecution.ts` can call typed
  remove/approve/ignore-reports SDK methods only when confirmation, runtime
  proof, feature flags, and receipt availability gates all pass. Current
  product defaults keep this path disabled.
- W04 `src/server/services/receipts.ts` persists receipts in Redis sorted sets,
  per-receipt keys, and per-target indexes. Apply Policy confirm writes a
  receipt after action/override events.
- W05 `src/server/services/scans.ts` stores full `MirrorScanRecord` values and
  capped scan metadata indexes by subreddit/source, plus rule and anonymized
  author indexes for later analytics.
- `src/server/services/scans.ts` persists `LastScanMetadata`, not complete
  attributed scan records.
- `src/server/services/redditSources.ts` defaults live moderation-log reads to
  `limit: 60` and `pageSize: 60`.
- `src/server/services/policies.ts` versions policy edits immediately; it does
  not model proposal, review, adoption, supersession, or archival states.
- W01 target context is type/build-verified only. Runtime proof for post/comment
  menu visibility, form behavior, dashboard navigation, target fetch, and
  moderator permission shape is still pending.

## Runtime Truth

Runtime evidence exists for:

- Devvit app identity and playtest readiness.
- Compact inline card and expanded dashboard modal.
- Demo scan, demo policy creation, log-only Apply Policy override capture,
  Case Packet generation, manual digest generation, and digest history.

Runtime evidence does not yet exist for:

- Real moderation execution.
- Comment-before/removal and comment-after/removal behavior.
- Modmail/mod discussion delivery.
- Native Mod Notes.
- Scheduler.
- Non-moderator access blocking.
- Exact moderator permission strings.

## Product Boundary

The operational overhaul should stop expanding reporting-only polish until the
actual moderation loop is credible:

1. Open from a post/comment menu.
2. Capture target context.
3. Show policy, recommendation, evidence, and comparable cases.
4. Require explicit moderator confirmation.
5. Execute only when capability-gated and runtime-verified.
6. Create immutable receipts for success, failure, skipped, and log-only paths.
7. Require override reasons for deviations.
8. Prove consistency changes over time from receipts and scans.
