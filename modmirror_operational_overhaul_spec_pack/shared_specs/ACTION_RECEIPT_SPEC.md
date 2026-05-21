# Action Receipt Spec

Every confirmed Apply Policy operation must create an Action Receipt.

## Required fields

- `id`
- `subreddit`
- `targetThingId`
- `targetType`: post/comment/unknown
- `targetSnapshot`
- `modUsername`
- `createdAt`
- `source`: menu/dashboard/demo/simulator
- `policySnapshot`
- `recommendation`
- `selectedAction`
- `deviatesFromPolicy`
- `overrideReason` if deviation
- `overrideNote` if provided
- `executionMode`: live/log_only/dry_run/unverified_disabled
- `executionAttempted`: boolean
- `executionResult`: success/failure/skipped
- `redditOperation`: remove/approve/ignore_reports/comment/mod_note/none
- `redditResultMetadata`
- `errorCode`
- `errorMessage`
- `capabilityState`

## Rules

- Failed execution still gets a receipt.
- Log-only execution still gets a receipt.
- Demo receipts must be marked demo.
- Never mark success unless the Reddit operation returned success.
- Receipts should be usable by Case Packets, Digests, Review, and Analytics.
