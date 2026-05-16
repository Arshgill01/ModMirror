# Wave 3/4 Prompt Pack

This pack clubs:

- Wave 3: Policy Agreement Flow
- Wave 4: Apply Policy Action

Use `WAVE3_4_MASTER_GOAL.md` as the main `/goal` prompt if you want one Codex agent to run the whole wave end-to-end.

## Files

- `PREFLIGHT_DEVVIT_IDENTITY_FIX.md`
- `WAVE3_4_MASTER_GOAL.md`
- `WAVE3_4_ORCHESTRATOR.md`
- `AGENT_A_POLICY_DATA_CONTRACTS.md`
- `AGENT_B_POLICY_DASHBOARD_UI.md`
- `AGENT_C_APPLY_POLICY_FLOW.md`
- `AGENT_D_ACTION_AUDIT_OVERRIDE.md`
- `AGENT_E_TESTS_DOCS_RUNTIME.md`
- `MERGE_CHECKLIST.md`

## Recommended Use

1. Start from clean `master`.
2. Fix Devvit identity/playtest blocker first.
3. Run the master goal.
4. Let the master goal create worktrees for each pass.
5. Merge into `integration/wave3-4-policy-loop`.
6. Verify.
7. Merge into `master`.
8. Push only after checks pass.
