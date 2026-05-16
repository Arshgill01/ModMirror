---
name: mirror-scan-attribution
description: Build or review ModMirror Mirror Scan, deterministic rule/removal-reason attribution, confidence scoring, drift candidates, and demo scan summaries. Use when working on scan services, attribution functions, scoring tests, or scan UI/API output.
---

# Mirror Scan Attribution

Use this skill for the scanning and inference layer. Keep it deterministic and honest.

## Inputs

Use available sources in this order:

1. ModMirror-created action records with explicit rule IDs.
2. Reddit moderation log actions from `reddit.getModerationLog`.
3. Subreddit removal reasons from `reddit.getSubredditRemovalReasons`.
4. Subreddit rules from `reddit.getRules`.
5. Demo seed data when live history is sparse.

The installed SDK does not expose structured rule/removal reason fields on `ModAction`; treat historical attribution as inferred.

## Attribution Rules

- Prefer exact deterministic matches before softer matches.
- Use boring, testable scoring functions.
- Never force a rule match when evidence is weak.
- Return evidence strings that explain why a confidence label was assigned.
- Keep matching logic in pure functions where possible.

Suggested confidence labels:

- `high`: exact rule/removal reason/title/rule number match or ModMirror-created direct rule reference.
- `medium`: strong keyword overlap between action text/removal reason and rule text.
- `low`: weak textual signal that may help triage but should not drive strong claims.
- `unmatched`: insufficient evidence.

## Drift Output

Mirror Scan output should include:

- actions scanned
- likely rule buckets
- confidence breakdown
- unmatched count
- drift candidates
- small-subreddit/demo fallback state

Drift candidates should describe inconsistent action distribution, not assign blame.

## Testing

Add focused tests for:

- exact rule number/title matching
- removal reason title/message matching
- low-confidence text overlap
- unmatched no-signal actions
- drift distribution summaries
- demo seed scan output
