# SUBMISSION_NOTES.md — Devpost Draft Material

## Project Name

ModMirror

## Tagline

Find enforcement drift before your users do.

## Category

Best New Mod Tool

## Short Description

ModMirror is a Devvit moderation app that helps Reddit mod teams enforce rules consistently. It scans recent moderation patterns, identifies enforcement drift, helps teams agree on rule policies, and gives moderators live consistency nudges when handling posts or comments.

## Tool Overview Draft

Moderation teams often do not realize when they are enforcing the same rule differently. One moderator may warn a first-time offender, another may remove without explanation, and another may escalate to a temporary ban. This creates appeal friction, user distrust, and inconsistent onboarding for new moderators.

ModMirror gives mod teams a shared consistency layer.

The app runs a Mirror Scan over recent moderation activity, compares actions against subreddit rules and removal reasons using deterministic matching, and surfaces potential enforcement drift with confidence labels. Moderators can turn those findings into explicit rule policies using the Policy Agreement Flow. Once policies exist, moderators can apply them from post/comment actions and receive a live consistency nudge when their selected action differs from the team policy.

ModMirror does not replace moderators or auto-judge content. It keeps humans in control while making team norms visible, repeatable, and auditable.

## Project Impact Draft

Communities that would benefit:

1. Large Q&A or advice communities
   - High moderation volume means small inconsistencies can become visible to users quickly.
   - ModMirror helps teams keep enforcement aligned across many moderators.

2. Learning/help communities such as programming or language-learning communities
   - Beginner posts are often repetitive, but harsh or inconsistent moderation can discourage users.
   - ModMirror helps define consistent escalation paths for low-effort, duplicate, or self-promotion rules.

3. Mid-size hobby communities
   - Community culture depends heavily on fair and predictable moderation.
   - ModMirror helps new moderators follow existing norms instead of guessing.

## What Makes It New

Existing tools help with removal speed, notes, strikes, or queue handling. ModMirror focuses on team consistency:

- surfacing drift,
- converting drift into policy,
- nudging future actions,
- logging justified exceptions.

## Human-in-the-loop Safety

ModMirror does not automatically ban users by default. It recommends, nudges, and logs. Moderators remain responsible for final decisions.

## Known Limitations

- Historical rule attribution depends on available mod log/removal reason data.
- ModMirror uses confidence levels and does not claim perfect attribution.
- Low-volume communities may see less historical drift at first, so ModMirror includes policy-first setup and demo mode.
