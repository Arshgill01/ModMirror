# Wave 05 — Full Scan Persistence

## Objective

Persist full attributed scan output so ModMirror can reason over history instead of only last-scan counts.

## Branch / worktree

Recommended branch: `overhaul/w05-scan-persistence`

## Agents to use

- Schema Agent
- Redis Agent
- Scanner Agent
- Test Agent

## Tasks

1. Design scan persistence schema: scan metadata, attributed actions, unmatched actions, drift candidates, confidence evidence, warnings.
2. Store scan records with retention/caps.
3. Add indexes by subreddit, ruleKey, targetAuthor hash/anonymized ID if needed, scan timestamp.
4. Update `runMirrorScan` to persist full scan output, not just metadata.
5. Add API to list scans, get scan detail, compare scans.
6. Ensure demo scans and live scans are clearly separated.

## Deliverables

- Full scan storage service.
- Scan detail/list APIs.
- Updated scanner integration.
- Tests for persistence, retention, demo/live separation.

## Tests / verification

- type-check
- lint
- test
- build

## Constraints

Avoid unbounded Redis growth. Store enough for product value while documenting retention.

## Notes

Document all assumptions, runtime proof gaps, and integration dependencies.
