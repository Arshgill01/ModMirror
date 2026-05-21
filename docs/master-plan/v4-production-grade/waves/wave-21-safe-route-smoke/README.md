# Wave 21: Safe Route-Level Smoke Rehearsal

## Objective

Rerun safe route-level checks for the current V2/V4-safe Devvit Web surfaces
without changing product code or exercising public, delivery, destructive, Mod
Note, scheduler, or external AI paths.

This wave distinguishes three things:

- upload/playtest readiness;
- route-level JSON response proof from an authenticated Devvit WebView;
- local direct HTTP probes, which may stop at Devvit's upgrade boundary.

## Preconditions

- Work from `/Users/arshdeepsingh/Developer/ModMirror`.
- Confirm the current account with `npx devvit whoami`.
- Check port `5678` before starting playtest:

```sh
lsof -nP -iTCP:5678 -sTCP:LISTEN || true
```

- If another agent's Devvit process owns port `5678`, do not kill it without
  explicit user approval. Record the PID, command, and elapsed time, then treat
  local playtest startup as blocked for this wave unless the user explicitly
  clears the process.
- If port `5678` is free, run `npm run dev`, record the app version and
  `https://www.reddit.com/r/modmirror_dev/?playtest=modmirror`, then open the
  dashboard in the authenticated Reddit WebView.

## Required Route Checklist

Run these from the authenticated Devvit WebView session, not from bare
`localhost`, because protected routes need Devvit context and moderator access.
Record HTTP status, top-level `ok`, app version when present, route-specific
sanity fields, and whether the response came from live subreddit state or
demo/fallback state.

| Route | Method | State impact | Expected safe result |
|---|---:|---|---|
| `/api/health` | GET | none | `ok: true`; app slug/version if runtime provides them; subreddit resolves to `modmirror_dev`; current user is present for authenticated proof. |
| `/api/runtime-verification` | GET | none | `ok: true`; matrix labels route proof separately from upload readiness and leaves unverified/destructive capabilities unverified. |
| `/api/runtime-capabilities` | GET | none | `ok: true`; capability matrix loads without failed safe-smoke regressions. |
| `/api/access/diagnostics` | GET | none | `ok: true`; current moderator permissions are recorded; do not use this as non-mod proof. |
| `/api/command-center` | GET | none | `ok: true`; response includes command-center summary, next actions, policy health, and honest sparse/demo labels. |
| `/api/policy-workbench` | GET | none | `ok: true`; response includes policy workbench sections and does not require policy mutation. |
| `/api/review-room` | GET | none | `ok: true`; review tasks load without per-mod blame fields. |
| `/api/onboarding` | GET | none | `ok: true`; onboarding paths load for current state. |
| `/api/demo/manifest` | GET | none | `ok: true`; ExampleLearning/demo manifest is clearly labeled. |
| `/api/community-health` | GET | none | `ok: true`; aggregate-only health summary, no moderator usernames. |
| `/api/policy-health` | GET | none | `ok: true`; policy health overview handles sparse data. |
| `/api/analytics/consistency` | GET | none | `ok: true`; consistency analytics preserve sparse/insufficient-data labels. |
| `/api/config/templates` | GET | none | `ok: true`; starter templates load without importing config. |
| `/api/digest/capabilities` | GET | none | `ok: true`; delivery/scheduler remain unavailable or unverified unless separately proven. |
| `/api/delivery/capabilities` | GET | none | `ok: true`; real send paths remain disabled/unverified. |
| `/api/ai/capabilities` | GET | none | `ok: true`; external AI provider remains disabled/type-only; do not call `/api/ai/advisory`. |

## Allowed Safe Smoke Routes

These POST routes are allowed only after the authenticated WebView is open and
the current moderator account is available. They write diagnostic Redis records
or temporary synthetic smoke records, then clean up where designed. Record the
full message shown by the route or Settings control.

| Route | Method | State impact | Expected safe result |
|---|---:|---|---|
| `/api/smoke/redis` | POST | writes a diagnostic Redis smoke value and runtime health event | `ok: true` or equivalent pass message for write/read match. |
| `/api/smoke/redis-zset` | POST | writes temporary sorted-set diagnostic rows and runtime health event | pass message with newest/middle/oldest ordering. |
| `/api/smoke/redis-storage` | POST | writes bounded smoke keys and cleans them up | pass message with `scan 10/10`, `actions 500/500`, `overrides 500/500`, cleanup `0`. |
| `/api/smoke/reddit` | POST | read-only Reddit API probe plus runtime health event | pass message for rules/removal-reason/mod-log read-only path, or exact read failure. |
| `/api/smoke/retention-cleanup` | POST | creates and deletes synthetic expired records only | pass message with synthetic scans/receipts/boards/delivery counts and zero remaining detail/index refs. |

## Explicit No-Go Routes For This Wave

Do not run these in Wave 21:

- `/api/apply-policy/confirm`
- `/api/delivery/confirm`
- `/api/ai/advisory`
- `/api/privacy/delete`
- any native Mod Note path or environment-gated native Mod Note mode
- any scheduler registration or job run
- any live Reddit remove, approve, ignore-reports, public comment, private
  message, modmail, or Mod Discussion send

Also defer `/api/modqueue/triage` and deep scan pagination to Wave 23 unless
safe existing queue/history conditions are already present and the user
explicitly asks to include them.

## WebView Console Probe

When the WebView is available, run the required GET checks with:

```js
const routes = [
  '/api/health',
  '/api/runtime-verification',
  '/api/runtime-capabilities',
  '/api/access/diagnostics',
  '/api/command-center',
  '/api/policy-workbench',
  '/api/review-room',
  '/api/onboarding',
  '/api/demo/manifest',
  '/api/community-health',
  '/api/policy-health',
  '/api/analytics/consistency',
  '/api/config/templates',
  '/api/digest/capabilities',
  '/api/delivery/capabilities',
  '/api/ai/capabilities',
];

const results = [];
for (const route of routes) {
  const response = await fetch(route);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text.slice(0, 300);
  }
  results.push({
    route,
    status: response.status,
    ok: body?.ok,
    code: body?.error?.code,
    summaryKeys:
      body && typeof body === 'object' && body.data
        ? Object.keys(body.data).slice(0, 8)
        : [],
  });
}
console.table(results);
copy(JSON.stringify(results, null, 2));
```

Run the POST smoke routes only through the existing Settings controls or with
explicit per-route `fetch(route, { method: 'POST' })` calls after confirming
the WebView is authenticated.

## Completion Criteria

- Exact account, app version, route/control, HTTP status, and result are
  recorded in `execution-log.md`.
- If blocked, the blocker includes the owning process, command, and route probe
  result.
- `TODO.md`, `RESEARCH.md`, and a runtime operational doc are reconciled.
- Product code remains untouched.
