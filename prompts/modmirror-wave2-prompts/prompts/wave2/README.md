# Wave 2 Prompt Pack — ModMirror

Wave 2 goal: build the Mirror Scan foundation.

Wave 2 is about turning Wave 0/1 scaffolding into the first real product surface:

1. Fetch/normalize moderation data sources.
2. Implement deterministic rule/removal-reason attribution.
3. Add mandatory demo seed data.
4. Display Mirror Scan results in the dashboard.
5. Add tests/docs so later waves can build policy flows safely.

Use the modular prompts for parallel agents, or use `WAVE2_MASTER_GOAL.md` as a single `/goal` prompt that executes all parts sequentially with worktrees and an integration branch.

Recommended if using one Codex agent:

```txt
prompts/wave2/WAVE2_MASTER_GOAL.md
```

Recommended if using parallel agents:

```txt
AGENT_A_LIVE_SOURCES.md
AGENT_B_ATTRIBUTION_ENGINE.md
AGENT_C_DEMO_SEED_DATA.md
AGENT_D_DASHBOARD_SCAN_UI.md
AGENT_E_TESTS_DOCS.md
```
