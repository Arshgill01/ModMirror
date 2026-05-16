# WAVE5_EXECUTION_NOTES.md — Governance Core

## Wave 5 Goal

Wave 5 upgrades ModMirror from "detect drift and apply policy" into a governance loop.

Build:

1. Policy Version History
2. Policy Health Dashboard
3. Override Review Inbox
4. Governance dashboard UI
5. Tests/docs/runtime QA

Do **not** build Wave 6 Case Packets in this wave.

## Why Wave 5 Stands Alone

Policy versioning changes the trust model of the product. Every future appeal packet, digest, health metric, and audit story depends on accurate policy versions.

Wave 6 should not start until Wave 5 proves:

- policy edits create immutable versions,
- actions are stamped with active policy version,
- overrides can be reviewed,
- health metrics are deterministic and test-covered,
- dashboard exposes the governance loop clearly.

## Product Story After Wave 5

Before Wave 5:

> ModMirror finds drift and nudges actions.

After Wave 5:

> ModMirror finds drift, helps teams create policy, records enforcement against policy versions, reviews exceptions, and shows which rules need policy attention.

## New Demo Moment

1. Rule 2 policy exists.
2. A moderator applies policy.
3. The moderator overrides the recommended action.
4. Override appears in the review inbox.
5. Rule 2 health changes from Stable/Watch to At Risk.
6. Lead mod marks override as "Policy needs update."
7. Policy is edited, creating a new version.
8. Old actions remain attached to the old version.

## Non-goals

- Case Packet / Appeal Context
- Weekly Digest
- Scheduler
- Mod Discussion export
- Calibration Mode
- Full queue dashboard
- AI rule classifier
- Automatic ban execution
