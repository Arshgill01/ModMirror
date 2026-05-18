# Current Repo Truth

Created: 2026-05-18

## Product Truth

ModMirror has a strong deterministic governance foundation, but it is not yet
an operational Reddit moderation tool at the moment of action.

It currently supports:

- Devvit Web + Hono server scaffold.
- Redis key helpers and service-level persistence.
- Demo and live Mirror Scan source paths.
- Deterministic attribution and drift summaries.
- Policy CRUD with immutable version records.
- Apply Policy preview and `log_only` confirmation.
- Override audit/review and policy health.
- Case Packet generation from tracked ModMirror action data.
- Manual digest generation and digest history.
- Productized dashboard UI with runtime Settings.
- Unit tests for core shared and server service logic.

It does not yet support:

- Real post/comment Apply Policy entrypoints.
- Full target context capture for posts/comments.
- Safe execution of Reddit moderation actions from Apply Policy.
- Action receipts that distinguish live, failed, skipped, dry-run, and log-only
  outcomes.
- Full attributed scan history persistence.
- Drift-over-time or policy-impact analytics from persisted scan/receipt data.
- True multi-mod policy proposal/review/adoption.
- Runtime-verified comment, modmail, scheduler, or native Mod Notes delivery.

## Smoking-Gun Code Facts

- `devvit.json` still exposes two `"ModMirror smoke test"` menu entries for
  moderators on posts and comments.
- `src/routes/menu.ts` routes post/comment menu actions to smoke forms.
- `src/routes/forms.ts` contains smoke chained forms and a subreddit dashboard
  launcher.
- `src/core/smoke.ts` has a minimal target summary helper, but there is no
  production target-context service.
- `src/server/services/applyPolicy.ts` calls `createLogOnlyActionInput` and
  `saveActionEvent`; it does not call `reddit.remove`, `reddit.approve`, or
  `ignoreReports`.
- `src/server/services/scans.ts` persists `LastScanMetadata`, not complete
  attributed scan records.
- `src/server/services/redditSources.ts` defaults live moderation-log reads to
  `limit: 60` and `pageSize: 60`.
- `src/server/services/policies.ts` versions policy edits immediately; it does
  not model proposal, review, adoption, supersession, or archival states.

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

