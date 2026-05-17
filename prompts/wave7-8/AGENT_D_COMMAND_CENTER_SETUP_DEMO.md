# AGENT D — Command Center + Setup Wizard + Demo Scenario

Goal: make the first real dashboard screen operational and make demo mode tell the full story.

Tasks:
1. Build Command Center with score, top issue, unresolved overrides, policy count, last scan, data mode, primary next action, secondary actions.
2. Implement primary next action logic: no data -> Load demo/Run scan; no policies -> Create policy; overrides -> Review; unhealthy policy -> Review policy; stable -> Generate digest/run scan.
3. Add setup wizard: choose live/demo, run scan/load demo, create policy, apply/sample policy, review results.
4. Make ExampleLearning demo scenario prominent and guided.
5. Ensure demo data is clearly labeled and separate.

Acceptance: Command Center replaces Overview; demo scenario can drive a 3-minute presentation.
