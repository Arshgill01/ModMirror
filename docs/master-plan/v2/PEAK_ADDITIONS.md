# Peak Additions

This file answers the hard question: what are we actually building?

## 1. Command Center

Current dashboards can feel like collections of features. The Command Center is
the first-impression product hook. It should show an overall consistency score,
rule health rows, biggest drift candidate, confidence caveat, demo/live state,
and the next best action.

Build signal: a moderator can understand ModMirror in under 10 seconds.

## 2. Drift Radar

Mirror Scan should not stop at "we found drift." It should show which rule is
drifting, what action spread caused the drift, what confidence supports the
bucket, what is unmatched, and which examples are worth reviewing.

Build signal: drift is inspectable without pretending attribution is perfect.

## 3. Policy Workbench

Policy Agreement should feel like a team decision system, not a form. It needs
drafts, missing-step warnings, version compare, adoption state, policy health,
starter templates, and links back to drift evidence.

Build signal: a lead mod can turn drift into a policy in one coherent flow.

## 4. Apply Policy Cockpit

Apply Policy should feel like a case decision surface. It needs target context,
policy step, recommendation, user history, response preview, override reason,
execution mode, and receipt preview before confirmation.

Build signal: human confirmation is preserved while the team norm is obvious.

## 5. Team Calibration Studio

This is the memorable addition. It lets moderators practice real scenarios and
compare choices to the team policy. It must be aggregate, private, non-punitive,
and useful for onboarding.

Build signal: a new mod can learn the team norm without being ranked.

## 6. Scenario Lab

Team Calibration needs authoring. Leads should create scenarios from demo cases,
receipts, drift examples, or manual text. Scenarios need expected policy step,
acceptable alternatives, explanation, and privacy-safe metadata.

Build signal: calibration is not just hardcoded demo content.

## 7. Policy Simulator

Before adopting a stricter or looser policy ladder, a team should preview how it
would classify recent cases. This is deterministic replay, not AI prediction.

Build signal: policy changes can be evaluated before adoption.

## 8. Evidence Graph

Receipts, case packets, evidence boards, content snapshots, policy versions,
and overrides should reference each other consistently.

Build signal: every decision can be explained from connected records.

## 9. Review Room

Review currently risks being scattered. Build one place for unresolved
overrides, policy impact, ratification requests, case packets, and evidence
boards.

Build signal: the team can close the loop after enforcement.

## 10. Demo Orchestration Engine

Demo mode should be resettable, deterministic, and full-loop. It should seed
scan history, policies, target cases, receipts, overrides, calibration
scenarios, and review tasks.

Build signal: the product can prove itself even with an empty test subreddit.

