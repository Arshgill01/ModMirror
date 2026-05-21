# State Reload Protocol

Before implementation, run and record:

```bash
git status --short
git branch --all
git log --oneline --decorate --graph -40
git worktree list
```

Find and read:

```bash
find . -maxdepth 3 -iname '*exec*' -o -iname '*plan*' -o -iname '*report*' -o -iname '*wave*'
```

Inspect:
- `AGENTS.md`, `PLAN.md`, `RESEARCH.md`, `README.md`, `TODO.md`
- `docs/**`, `prompts/**`, `.codex/**`, `scripts/**`
- route files, service files, shared files, client files, and tests

Create:

`docs/expansion-waves/REPO_CONTEXT_RELOAD.md`

Include:
- actual repo state,
- current feature map,
- actual runtime proof map,
- current safety gates,
- current technical debt,
- wave implementation order chosen,
- risks.

No production coding before this file exists.
