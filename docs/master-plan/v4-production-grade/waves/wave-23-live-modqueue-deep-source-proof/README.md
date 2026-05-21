# Wave 23: Live Modqueue, Deep Scan, And Reddit Source Proof

Status: partially complete

## Goal

Execute safe read-only runtime proof for:

- live same-subreddit modqueue reads through the Act-page Operational Queue and
  `/api/modqueue/triage`;
- deep moderation-log pagination through the Scan-page `Deep Live Scan` control
  and, when possible, `POST /api/scan` with
  `{"mode":"live","depth":"deep"}`.

## Runtime Evidence

On 2026-05-21, after the user approved taking over the stale
Gemini/Antigravity port `5678` listener, current `master` reached authenticated
Reddit WebView playtest `v0.0.2.6` for `r/modmirror_dev` as
`u/BrightyBrainiac`.

Read-only checks performed:

- Act page Operational Queue `Refresh` entered the loading state and returned
  the labeled type-supported/no-items fallback. This did not prove live
  `reddit_modqueue` item reads.
- Scan page `Deep Live Scan` completed against live subreddit data with source
  `Live data`, depth `Deep`, `120` actions scanned, `1` attributed, and `119`
  unmatched. Because the UI reported a deep request of `250` actions with page
  size `100`, the WebView proof demonstrates a live result above one page of
  moderation-log data.
- The scan preserved conservative warnings: pagination is still labeled
  type-verified in the UI copy, the scan returned `120` of `250` requested
  actions, and `1` moderator attribution correction was applied.
- No public Reddit writes, reports, moderation actions, native Mod Notes,
  delivery actions, scheduler jobs, retention deletion, or external AI calls
  were performed.

## Current Safe State

- `docs/operational-overhaul/MODQUEUE_RUNTIME_TEST_PLAN.md` already defines the
  safe modqueue proof boundary. It remains open because no live queue item or
  exact adapter failure was captured.
- `docs/operational-overhaul/DEEP_SCAN_RUNTIME_TEST_PLAN.md` defines the
  deep-scan proof boundary. The WebView UI now proves live deep source data
  above one page, but an exact authenticated `POST /api/scan` response excerpt
  was not captured in this pass.

## Unblock Step

For modqueue, use existing safe queued content if available, or ask before
creating/reporting throwaway content. Mark modqueue runtime-verified only after
`source: "reddit_modqueue"` returns at least one safe item or an exact Devvit
adapter/runtime failure is captured.

For deep scan, capture the authenticated API response excerpt in a future pass
if browser tooling exposes it safely; do not weaken the UI warnings unless the
implementation also records page/cursor counts explicitly.
