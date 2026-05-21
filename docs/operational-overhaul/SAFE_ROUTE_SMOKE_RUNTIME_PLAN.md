# Safe Route Smoke Runtime Plan

Created: 2026-05-21

## Purpose

This is the operational runtime plan for V4 Wave 21. It exists to rerun safe
route-level checks after the latest V2/V4-safe route work without claiming
runtime proof from upload readiness or static/local checks.

## Safety Boundary

Allowed in this plan:

- authenticated Devvit WebView GET route checks;
- explicit safe Redis/Reddit diagnostic smoke routes already present in the
  app;
- synthetic retention cleanup smoke only, not real operational-record deletion.

Not allowed in this plan:

- live Reddit remove/approve/ignore-reports execution;
- public comments, private messages, modmail, Mod Discussion sends, or native
  Mod Notes;
- scheduler registration or job runs;
- external AI provider calls;
- real privacy deletion against operational records;
- true non-mod or limited-mod account proof, which belongs to the access test
  plan.

## Required Evidence

For each route/control, record:

- date and timezone;
- workspace path;
- branch and git status;
- Devvit account from `npx devvit whoami`;
- app version shown by `npm run dev` or the WebView;
- subreddit;
- account type used;
- route, method, and UI control if triggered from Settings;
- HTTP status;
- top-level `ok`;
- concise route-specific result;
- whether the result is live, demo, synthetic, fallback, or blocked.

## Route Set

### Required no-state GET routes

- `GET /api/health`
- `GET /api/runtime-verification`
- `GET /api/runtime-capabilities`
- `GET /api/access/diagnostics`
- `GET /api/command-center`
- `GET /api/policy-workbench`
- `GET /api/review-room`
- `GET /api/onboarding`
- `GET /api/demo/manifest`
- `GET /api/community-health`
- `GET /api/policy-health`
- `GET /api/analytics/consistency`
- `GET /api/config/templates`
- `GET /api/digest/capabilities`
- `GET /api/delivery/capabilities`
- `GET /api/ai/capabilities`

### Allowed safe diagnostic POST routes

- `POST /api/smoke/redis`
- `POST /api/smoke/redis-zset`
- `POST /api/smoke/redis-storage`
- `POST /api/smoke/reddit`
- `POST /api/smoke/retention-cleanup`

## Current Rehearsal Result

On 2026-05-21 at 19:18 IST, this workspace was blocked from starting its own
playtest because port `5678` was already owned by an Antigravity/Gemini
worktree process:

```txt
node --no-warnings=ExperimentalWarning /Users/arshdeepsingh/.gemini/antigravity/worktrees/ModMirror/refresh-minimalist-ui-design/node_modules/.bin/devvit playtest
```

The process was not killed. Direct local route probes against
`http://127.0.0.1:5678` returned `HTTP/1.1 426 Upgrade Required` for
`/api/health`, `/api/runtime-capabilities`, and `/api/demo/manifest`, so those
curl probes are blocker evidence only. They are not route-level JSON proof.

On 2026-05-21 at 21:49 IST, the same blocker was still present. Port `5678`
was still owned by PID `42407`, with observed elapsed time `03:45:08`, from the
dirty Gemini/Antigravity `refresh-minimalist-ui-design` worktree. `npx devvit
whoami` still passed as `u/BrightyBrainiac`, but the current `master` workspace
could not start a clean playtest without disturbing that process.

## Next Unblock Step

Use one of these non-conflicting paths:

- have the Antigravity/Gemini playtest owner run the WebView console probe from
  `docs/master-plan/v4-production-grade/waves/wave-21-safe-route-smoke/README.md`;
- wait for port `5678` to be free, then run `npm run dev` in this workspace and
  perform the WebView route checks;
- use a separate approved Devvit playtest port/session if Devvit supports one
  without disrupting the existing process.
