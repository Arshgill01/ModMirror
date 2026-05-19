# Current Repo Truth

Created: 2026-05-18
Updated: 2026-05-19

## Product Truth

ModMirror has a strong deterministic governance foundation, but it is not yet
an operational Reddit moderation tool at the moment of action.

It currently supports:

- Devvit Web + Hono server scaffold.
- Non-destructive post/comment menu entrypoints for Apply Policy guidance with
  target context capture. W01 added these locally; post-W34 runtime proof
  verified both post and comment menu target handoff in Reddit's desktop
  WebView path.
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
  and execution result. Post-W34 runtime proof verified log-only receipt
  persistence in Devvit Redis.
- W05 full scan record persistence with attributed actions, unmatched actions,
  drift candidates, warnings, retention metadata, and scan compare APIs.
- W06 quick, standard, and deep Mirror Scan depth options with safe caps,
  scan-depth metadata, and explicit runtime-unverified pagination warnings.
- W07 consistency analytics from persisted scans and Apply Policy receipts,
  including drift trend direction, receipt-backed policy impact windows, and
  insufficient-data caveats.
- W08 policy agreement lifecycle with draft, proposed, under-review, adopted,
  superseded, and archived states; review records; explicit adoption APIs; and
  client controls for propose/review/quick-adopt.
- Override audit/review and policy health.
- Case Packet generation from tracked ModMirror action data.
- W09 Case Packets v2 prefer W04 action receipts when present and include
  receipt IDs, target snapshots, execution results, packet types, and evidence
  labels that distinguish verified receipts from inferred history. Post-W34
  runtime proof generated a receipt-backed official Case Packet and opened an
  Evidence Board from it.
- W10 AI advisory spike contracts, capability endpoints, Settings labels, and
  mocked-provider tests. The feature remains disabled-by-default and cannot
  decide or execute enforcement.
- W11 team-delivery capability state, preview/confirm APIs, manual/skipped
  delivery receipts, and mocked adapter tests. It stores receipts but does not
  send Reddit messages by default.
- Manual digest generation and digest history.
- Productized dashboard UI with runtime Settings.
- Unit tests for core shared and server service logic.

It does not yet support:

- Default-enabled safe execution of Reddit moderation actions from Apply
  Policy. W03 added the gated engine, but live execution remains disabled.
- Runtime-verified destructive action receipts. Log-only receipt persistence is
  runtime-verified; real Reddit action receipts remain disabled until live
  action proof exists.
- Runtime-verified deep attributed scan pagination. Safe live scan persistence
  and replay/correction paths have post-W34 runtime evidence, but deep
  moderation-log pagination remains unverified.
- Runtime-verified deep moderation-log pagination. W06 verifies installed
  typings and local mocks only.
- Runtime-verified public comment, modmail, scheduler, or native Mod Notes
  delivery.
- Runtime-verified external AI calls or Devvit secret retrieval for AI
  providers. W10 is docs/type-supported and locally tested with mocks only.
- Registered scheduler tasks for ModMirror delivery. W11 marks scheduler
  delivery unavailable because no scheduler task exists in `devvit.json`.

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
- W06 `src/server/services/redditSources.ts` supports live scan depths:
  quick 25/25, standard 60/60, and deep 250/100. All live depth metadata remains
  runtime-unverified until playtest proves actual pagination behavior.
- W07 `src/server/services/analytics.ts` computes consistency summaries from
  persisted `MirrorScanRecord` values and W04 receipts. It treats receipts as
  stronger signals than inferred mod-log history, but it only claims impact
  when scan/receipt counts meet local thresholds.
- W08 `src/server/services/policies.ts` stores policy lifecycle metadata on
  policy records and versions. Draft/proposed versions can be reviewed and
  adopted, while Apply Policy only uses policies with an adopted active version.
- W09 `src/server/services/casePacket.ts` loads action receipts alongside
  action/override history. Receipt-backed packets are treated as stronger
  evidence; action-history-only packets remain supported with explicit caveats.
- W10 `src/server/services/aiAdvisory.ts` returns disabled fallback responses
  unless an explicit provider is injected and enabled. It requires
  deterministic evidence IDs and rejects provider output that does not cite
  known evidence.
- W11 `src/server/services/teamDelivery.ts` builds digest/policy proposal
  delivery previews and stores delivery receipts. Mod discussion sends require
  explicit confirmation, runtime-proof flags, and an injected adapter; product
  routes do not inject an adapter, so default confirmations are skipped.
- W12 reframed the client IA around Act, Scan, Agree, Review, Prove, and
  Settings. Apply Policy and the receipt ledger now live in Act; policy
  lifecycle records live in Agree; case packets, digest, and before-after
  consistency evidence live in Prove. W13 verified this IA in Reddit's desktop
  expanded WebView on playtest `v0.0.1.71`; native mobile remains unverified.
- W13 added `GET /api/runtime-verification` and a matrix service so runtime,
  local, static, type-only, disabled, and unverified claims are explicit.
- W01 target context is runtime-verified for post/comment menu visibility,
  form behavior, dashboard navigation, and target fetch in the desktop Reddit
  WebView path. Server-side protected API moderator access checks are locally
  verified for live subreddit context. The current full moderator account
  returned permission `all`; lower-permission moderator role strings, non-mod
  account runtime behavior, and native Reddit mobile behavior remain pending.
- W29 subreddit isolation is runtime-verified for Devvit Web request context:
  authenticated playtest `v0.0.1.122` exposed current subreddit
  `modmirror_dev`, kept default and explicit-current API reads in that
  namespace, allowed only the labeled `ExampleLearning` demo exception, and
  rejected cross-subreddit query/body requests before writes.
- W17 modqueue triage has follow-up runtime fallback evidence: authenticated
  Devvit playtest `v0.0.1.123` reached the same-subreddit Operational Queue
  refresh path for `modmirror_dev`, but still returned the labeled
  type-supported/no-items fallback instead of live queue items.
- Server-side protected API moderator access checks are locally verified and
  the guarded build reached Devvit playtest ready on `v0.0.1.126`; a follow-up
  Devvit WebView Settings diagnostic on `v0.0.1.129` returned current
  moderator permission `all`.

## Runtime Truth

Runtime evidence exists for:

- Devvit app identity and playtest readiness.
- Compact inline card and expanded dashboard modal.
- W12 operational IA inside the desktop expanded WebView on playtest
  `v0.0.1.71`, plus launch/fullscreen/Agree/Settings proof on `v0.0.1.120`
  and later UI/accessibility-tree plus subreddit-isolation proof through
  `v0.0.1.122`; W17 Operational Queue fallback evidence through
  `v0.0.1.123`.
- Safe Redis smoke and Reddit read-only smoke from inside the Devvit WebView.
- Post/comment Apply Policy menu target capture and Act target strip handoff.
- Log-only Apply Policy receipt persistence in Devvit Redis.
- Receipt-backed Evidence Board creation, Case Packet generation, Incident
  Mode receipt tagging, config import/export, privacy dry-run controls,
  response preview receipt persistence, attribution correction, replay, review
  health, policy impact, and policy ratification in desktop Reddit WebView
  playtest paths.
- Context-derived subreddit isolation and cross-subreddit API rejection in the
  authenticated Devvit WebView path.
- Server-side protected API moderator access checks for live subreddit context,
  verified by unit tests with a playtest-ready build but not yet by a non-mod
  runtime account. A protected current-user permission diagnostic route is
  locally verified; a Devvit WebView Settings diagnostic returned current
  moderator permission `all`.
- Demo scan, demo policy creation, log-only Apply Policy override capture,
  Case Packet generation, manual digest generation, and digest history.

Runtime evidence does not yet exist for:

- Real moderation execution.
- Comment-before/removal and comment-after/removal behavior.
- Modmail/mod discussion delivery.
- Native Mod Notes.
- Scheduler.
- Mod discussion delivery through Reddit Modmail.
- External AI fetch, provider secret retrieval, and provider latency/failure
  behavior.
- Non-moderator access blocking in live runtime; local server-side guard tests
  pass, but a true non-mod account has not been used.
- Lower-permission moderator role strings for stronger per-mod/admin gates; the
  current full moderator account returned `all` in Devvit WebView.
- Native Reddit mobile app behavior.
- Same-subreddit live modqueue item reads; the Operational Queue fallback was
  observed on playtests `v0.0.1.94` and `v0.0.1.123`.

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
