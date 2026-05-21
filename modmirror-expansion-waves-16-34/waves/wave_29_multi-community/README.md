# Wave 29: Multi-Community Architecture

## Objective

Strengthen per-subreddit isolation and optional template reuse.

## Deliverables

- isolation audit
- key guards
- API permission checks
- tests

## Acceptance Criteria

- routes derive/validate subreddit safely
- no cross-subreddit logs leak
- templates copy non-sensitive data only
- isolation tests

## Branch Suggestion

`expansion/w29-multi-community`

## Non-goal

Do not do submission, Devpost, public publish, final marketing, or demo-video work in this wave.
