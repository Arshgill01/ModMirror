# Wave 06 — Judge Demo Path Orchestrator

Status: complete

## Objective

Make the Rule 2 story runnable from one Command Center action without asking a
judge or moderator to stitch together separate demo controls.

## Scope

- Add a Command Center `Run Judge Demo` action for the deterministic
  ExampleLearning path.
- Keep the orchestrated state demo-only and log-only.
- Select the adopted Rule 2 policy, preview a stricter Apply Policy action,
  record a labeled override receipt, and prepare proof surfaces.
- Populate the Prove workspace with the Case Packet, Evidence Board, evidence
  graph, and digest-ready report.

## Acceptance Evidence

- The Command Center exposes one obvious `Run Judge Demo` action in loaded and
  no-data states.
- The path uses `DEMO_SUBREDDIT_NAME`, `DEMO_POLICY`, simulator source, and
  log-only Apply Policy state; it does not attempt Reddit execution.
- The UI records visible progress steps and lands on Prove with receipt-linked
  proof surfaces ready.
- Static browser smoke covered the one-click path from built client output.
