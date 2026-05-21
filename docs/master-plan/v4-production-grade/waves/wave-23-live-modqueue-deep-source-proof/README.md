# Wave 23: Live Modqueue, Deep Scan, And Reddit Source Proof

Status: blocked

## Goal

Execute safe read-only runtime proof for:

- live same-subreddit modqueue reads through the Act-page Operational Queue and
  `/api/modqueue/triage`;
- deep moderation-log pagination through the Scan-page `Deep Live Scan` control
  and `POST /api/scan` with `{"mode":"live","depth":"deep"}`.

## Blocker

The current session cannot honestly execute the Reddit-hosted runtime proof.
Port `5678` is already owned by an Antigravity/Gemini `devvit playtest` process
from another worktree, and this wave must not kill or reuse that process.

The active Devvit identity is `u/BrightyBrainiac`, but no authenticated WebView
session under this wave's branch was opened for a controlled proof pass.

## Current Safe State

- `docs/operational-overhaul/MODQUEUE_RUNTIME_TEST_PLAN.md` already defines the
  safe modqueue proof boundary.
- `docs/operational-overhaul/DEEP_SCAN_RUNTIME_TEST_PLAN.md` now defines the
  safe deep-scan proof boundary.
- Existing docs still describe live modqueue reads and deep pagination as
  unverified unless a wave report records authenticated runtime evidence.

## Unblock Step

Run the modqueue and deep-scan plans from an authenticated Reddit-hosted Devvit
WebView for `r/modmirror_dev`, with port `5678` owned by the active wave or a
known approved session. Record either real read-only Reddit source evidence or
the exact Devvit adapter/runtime failure shape.
