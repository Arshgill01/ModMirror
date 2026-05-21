# ModMirror App Listing Draft

## Name

ModMirror

## Tagline

Find enforcement drift before your users do.

## Short Description

ModMirror helps Reddit moderator teams find enforcement drift, agree on rule
policies, review exceptions, generate appeal context, and share deterministic
governance digests.

This exact short description should also be used for app directory metadata
where space allows. The package metadata now carries the shorter upload-safe
description: `Find enforcement drift before your users do.`

## What It Does

ModMirror turns moderation history and team policy into a consistency workflow:

- Mirror Scan reviews recent moderation patterns and labels attribution
  confidence honestly.
- Policy Agreement Flow turns drift findings into explicit rule ladders.
- Apply Policy shows the team recommendation and records log-only decisions.
- Override Review helps the team resolve exceptions without per-mod blame.
- Case Packets create exportable appeal context from tracked ModMirror records.
- Digest generates a saved Markdown report for the mod team.

## Safety And Data Practices

- No LLMs or AI moderation judgment.
- No automatic bans.
- No external analytics service.
- No cross-subreddit benchmarking.
- Manual digest copy is the supported launch delivery path.
- Public comment, private message, modmail, native Mod Notes delivery, and
  scheduler posting remain disabled until runtime-verified and explicitly
  enabled by moderators.

## Best For

- Large or medium moderator teams.
- Learning/help communities with repeated rule patterns.
- Communities where appeals often cite inconsistent enforcement.
- Teams onboarding new moderators into established norms.

## Known Limitations

Historical rule attribution depends on available Reddit moderation log,
removal-reason, and rule data. ModMirror uses confidence labels and does not
claim perfect inference. Sparse communities may start with policy-first setup
or demo mode.

## App Directory Metadata Status

- Latest uploaded app version: `0.0.2`.
- Latest verified Devvit public API version: `0.12.24`.
- Latest upload proof: `npm run deploy` passed and uploaded four WebView
  assets.
- `npx devvit view --json` confirmed app capabilities `[10, 11]`, mapped in
  installed Devvit protos to `MODERATOR` and `WEBVIEW`.
- The current CLI help exposes `upload`, `publish`, and `view`, but no safe
  local command for setting app listing links. Terms and privacy links must be
  set on the app details page before any public publish request.
