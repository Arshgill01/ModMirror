# RESEARCH.md — Devvit Platform Findings

This document is the source of truth for verified Devvit behavior in this repo.

Do not assume Devvit API behavior. Verify it here.

## Research Status

Status: Not started

Last updated:

Updated by:

## Environment

| Item | Finding |
|---|---|
| Node version | TBD |
| npm version | TBD |
| Devvit CLI/package version | TBD |
| Template used | TBD |
| App name in devvit.json | TBD |
| Test subreddit | TBD |
| Dev command | TBD |
| Build command | TBD |
| Upload command | TBD |
| Publish command | TBD |

## Project Structure

Paste generated tree here:

```txt
TBD
```

Notes:

- TBD

## Devvit Configuration

### devvit.json

Important fields discovered:

```json
{}
```

### Required permissions/capabilities

| Capability | Required config | Verified? | Notes |
|---|---|---:|---|
| Reddit API read | TBD | No | TBD |
| Reddit API write | TBD | No | TBD |
| Redis | TBD | No | TBD |
| Menu actions | TBD | No | TBD |
| Forms | TBD | No | TBD |
| Triggers | TBD | No | TBD |
| Devvit Web dashboard | TBD | No | TBD |

## Reddit API Findings

### getModerationLog

| Question | Answer |
|---|---|
| Exists in SDK? | TBD |
| Method path/import | TBD |
| Required permission | TBD |
| Works in playtest? | TBD |
| Returns action type? | TBD |
| Returns target ID? | TBD |
| Returns target author? | TBD |
| Returns moderator name? | TBD |
| Returns removal reason? | TBD |
| Returns subreddit rule ID/name? | TBD |
| Pagination/limit behavior | TBD |

Raw sample shape:

```ts
// Paste redacted sample shape here.
```

Conclusion:

- TBD

### getSubredditRemovalReasons

| Question | Answer |
|---|---|
| Exists in SDK? | TBD |
| Required permission | TBD |
| Returns ID? | TBD |
| Returns title? | TBD |
| Returns message/body? | TBD |
| Works in playtest? | TBD |

Raw sample shape:

```ts
// Paste redacted sample shape here.
```

Conclusion:

- TBD

### Subreddit Rules API

| Question | Answer |
|---|---|
| Exists in SDK? | TBD |
| Method name | TBD |
| Required permission | TBD |
| Returns rule ID? | TBD |
| Returns short name/title? | TBD |
| Returns full description? | TBD |

Raw sample shape:

```ts
// Paste redacted sample shape here.
```

Conclusion:

- TBD

## Menu/Form Findings

### Post/comment menu actions

| Question | Answer |
|---|---|
| Can add post menu item? | TBD |
| Can add comment menu item? | TBD |
| Can restrict to moderators? | TBD |
| Can access post/comment ID? | TBD |
| Can access author? | TBD |
| Can trigger form? | TBD |
| Can chain forms? | TBD |
| Can open dashboard/custom post? | TBD |

Conclusion:

- TBD

## Enforcement Action Findings

### submitComment

| Question | Answer |
|---|---|
| Method exists? | TBD |
| Can comment on normal post? | TBD |
| Can comment after removing post? | TBD |
| If not, can comment before removal then remove? | TBD |
| Can distinguish bot/app author? | TBD |

Conclusion:

- TBD

### remove/approve content

| Question | Answer |
|---|---|
| Remove post method exists? | TBD |
| Remove comment method exists? | TBD |
| Approve method exists? | TBD |
| Ignore reports method exists? | TBD |
| Required permission | TBD |

Conclusion:

- TBD

### Private message / modmail

| Question | Answer |
|---|---|
| Can send private message? | TBD |
| Can create modmail conversation? | TBD |
| Can send as subreddit/mod team? | TBD |
| Any deprecated APIs to avoid? | TBD |

Conclusion:

- TBD

### Native Mod Notes

| Question | Answer |
|---|---|
| Can add native Mod Note? | TBD |
| Can read native Mod Notes? | TBD |
| Can delete/update native Mod Notes? | TBD |
| Required permission | TBD |
| Note labels available? | TBD |

Conclusion:

- TBD

## Redis Findings

| Question | Answer |
|---|---|
| Redis client import | TBD |
| String read/write works? | TBD |
| Hash/list/sorted-set availability | TBD |
| Namespacing behavior | TBD |
| Per-installation storage confirmed? | TBD |
| Practical limits | TBD |

Smoke test notes:

- TBD

## Permission / Visibility Findings

| Question | Answer |
|---|---|
| Can identify current user? | TBD |
| Can identify whether current user is moderator? | TBD |
| Can inspect moderator permissions? | TBD |
| Can distinguish full/manage permissions? | TBD |

Conclusion:

- TBD

## Build/Test Findings

| Command | Result |
|---|---|
| npm install | TBD |
| npm run dev | TBD |
| npm run build | TBD |
| npm test | TBD |
| npx devvit whoami | TBD |

## Broken Assumptions

List every assumption that failed.

- None yet.

## Decisions Based on Research

Record decisions made after testing.

- None yet.

## Links Consulted

Add official links only unless a non-official link is necessary.

- https://developers.reddit.com/docs
- https://developers.reddit.com/docs/quickstart
- https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_overview
