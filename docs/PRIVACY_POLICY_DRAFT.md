# ModMirror Privacy Policy Draft

Last updated: 2026-05-21

Status: draft for review before public publishing. This is not legal advice and
should be reviewed before being used as the public app details link.

## App Summary

ModMirror is a Reddit Devvit moderation app for moderator teams. It helps teams
review enforcement drift, define rule policies, apply those policies with human
confirmation, and review consistency exceptions.

## Data ModMirror Processes

ModMirror may process the minimum Reddit and moderation data needed for its
moderation consistency workflow:

- subreddit name or install context;
- subreddit rules and removal-reason metadata when available through Devvit;
- recent moderation-log style action metadata available to moderators;
- target post/comment identifiers and limited target context needed to build
  moderator-facing receipts or case packets;
- target author username when available and needed for same-rule history;
- moderator username only where needed for operational audit receipts;
- ModMirror policy configuration, policy versions, override reasons, manual
  runtime proof entries, and saved digest or case-packet records.

ModMirror does not collect payment information, email addresses, precise
location, device identifiers, advertising identifiers, or contact lists.

## How Data Is Used

ModMirror uses this data to:

- surface likely enforcement drift with confidence labels;
- help moderator teams define explicit rule policies;
- show consistency nudges before a moderator confirms an action;
- store log-only receipts and override reasons for team review;
- generate moderator-facing case packets and manual digests;
- show runtime capability and proof status inside Settings.

ModMirror does not use data for advertising, cross-subreddit benchmarking,
selling user profiles, or unrelated analytics.

## AI And External Services

ModMirror does not use LLMs or AI moderation judgment in the current build.
External AI and external service calls remain disabled unless separately
approved, runtime-verified, and documented.

## Storage

ModMirror stores app state in Reddit Devvit infrastructure, primarily Devvit
Redis. Stored records are namespaced by subreddit/install context.

ModMirror stores only the operational data needed for the product workflow and
keeps destructive deletion behind explicit confirmation and runtime proof
controls. Synthetic retention cleanup is runtime-verified; deletion of real
operational records remains disabled until a separate controlled proof run is
approved and completed.

## Sharing

ModMirror does not sell data and does not share data with third-party analytics
or advertising services.

Data is shown to subreddit moderators inside the installed subreddit context.
Aggregate consistency views are the default. Sensitive per-moderator views are
hidden unless a stronger permission level is runtime-verified.

## User And Moderator Control

Moderators can disable demo mode, keep delivery in log-only mode, and avoid
unverified public/private delivery paths. Subreddit moderators can uninstall
the app from their subreddit through Reddit/Devvit app management.

For data deletion or privacy requests, contact the app owner through the Reddit
account or support route shown on the public app listing.

## Limitations

Historical attribution is not perfect. Reddit moderation history may not expose
structured rule or removal-reason metadata for every action. ModMirror labels
inferred attribution with confidence levels and does not claim certainty.

## Reddit Platform Policies

ModMirror runs on Reddit's Developer Platform and must comply with Reddit's
Developer Terms, Devvit Rules, and other applicable Reddit policies. Reddit's
own privacy policy and platform terms also apply to Reddit and Devvit
infrastructure.

## References Checked

- Reddit for Developers, "Publish your app" notes that apps using HTTP fetch
  capability must provide terms and privacy links before publishing, and that
  those links are added on the Developer Portal app details page.
- Reddit Devvit Rules and Reddit Developer Terms require compliance with
  Reddit's developer, data protection, and other applicable platform policies.
