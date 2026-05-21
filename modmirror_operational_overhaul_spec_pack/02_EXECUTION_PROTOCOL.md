# Execution Protocol

## Branch/worktree discipline

Use git worktrees for major waves. Do not implement the whole overhaul on `master`.

Recommended pattern:

```bash
git fetch origin --prune
git checkout master
git pull --ff-only origin master

git worktree add ../modmirror-w00-truth -b overhaul/w00-truth master
git worktree add ../modmirror-w01-entrypoints -b overhaul/w01-entrypoints master
```

If a later wave depends on earlier code, branch it from the integration branch after that dependency lands.

## Commit discipline

Use small meaningful commits:
- `chore: remove prototype smoke menu surfaces`
- `feat: add policy application target context`
- `feat: add moderation execution receipts`
- `test: cover moderation execution safety gates`
- `docs: record runtime verification results`

Avoid one giant commit.

## PR discipline

Open PRs for waves or coherent groups. Each PR must include:
- Summary
- Files changed
- Safety notes
- Runtime assumptions
- Tests run
- Remaining risks
- Screenshots for UI work where applicable
- Whether it changes live Reddit behavior

## Sub-agent usage

Use sub-agents if available:
- Runtime Research Agent: Devvit APIs, installed typings, official docs, playtest proof.
- Server Agent: Hono routes, services, Redis, Reddit API methods.
- Schema Agent: shared contracts and migrations.
- Frontend Agent: UI state/rendering/IA with strict product constraints.
- QA Agent: unit/integration/runtime smoke/playwright.
- Docs Agent: execution logs and non-submission implementation docs.

## Tool usage

Use available tools:
- `uncodexify` for frontend/UX cleanup if installed.
- Playwright/browser-use/screenshot skills for runtime and UI verification.
- Gemini CLI or other model CLIs for UI critique if installed/configured.
- Web search for Devvit docs/runtime behavior when necessary.
- Installed SDK typings as source of truth.
- Local tests/build/typecheck/lint before marking work complete.

## Reporting

Each wave must produce:
- `docs/operational-overhaul/waveXX-*.md`
- What changed
- What was verified
- What remains unsafe/unverified
- Commands run
- Screenshots/logs paths if any
- Next-wave integration notes

## Do not do

- Do not publish app.
- Do not submit Devpost.
- Do not write final submission copy.
- Do not contact communities.
- Do not enable default destructive action without explicit confirmation.
- Do not make AI output authoritative.
- Do not hide uncertainty.
