# App Review and Data Practices — ModMirror

## Purpose

ModMirror helps Reddit mod teams detect enforcement drift, define rule policies, guide policy-consistent actions, review overrides, generate case packets, and create moderator digests.

## Human-in-the-loop Safety

ModMirror does not replace moderators.

It may recommend actions, but moderators remain responsible for final decisions.

Automatic punitive enforcement is not part of the core launch behavior.

## Data Stored

ModMirror may store:

- subreddit policy configuration,
- policy versions,
- policy health aggregates,
- ModMirror-created action records,
- override events and review statuses,
- digest history,
- demo mode state.

## Data Minimization

Avoid storing unnecessary post/comment body text.

Store IDs, rule labels, action types, timestamps, confidence levels, policy snapshots, and minimal context necessary for governance.

## Sensitive Data

Usernames may appear in action records, override records, or case packets when required for moderator context.

Do not expose sensitive mod data to non-moderators.

Prefer aggregate analytics over per-moderator blame.

## External Services

No external services in MVP.

No LLMs, embeddings, analytics SaaS, or external databases.

## Automation

Manual digest generation is safe.

Mod discussion delivery and scheduled digest are opt-in only and must be runtime-verified.

No silent posting.

No spam behavior.

## Limitations

Historical rule attribution is best-effort and confidence-scored.

ModMirror does not claim perfect rule inference.

Low-volume communities may use policy-first setup instead of historical drift detection.

## Support

TODO: Add GitHub issue link or support contact.
