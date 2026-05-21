# Scan History Spec

ModMirror must persist full scan outputs, not only counts.

## Required scan record

- `id`
- `subreddit`
- `source`: live/demo
- `createdAt`
- `createdBy`
- `scanDepthRequested`
- `scanDepthReturned`
- `paginationMode`
- `warnings`
- `rulesSnapshot`
- `removalReasonsSnapshot`
- `attributedActions`
- `unmatchedActions`
- `driftCandidates`
- `confidenceBreakdown`
- `schemaVersion`

## Retention

Implement a conservative retention policy:
- Keep latest N full scans per subreddit.
- Keep metadata longer if cheap.
- Store large action bodies carefully; consider truncation/anonymization.
- Document what is stored.

## Consumers

- Drift-over-time analytics.
- Policy impact analytics.
- Case Packet comparable cases.
- Digest.
