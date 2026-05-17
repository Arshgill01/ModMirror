# Skill Installation Report

Date: 2026-05-17

Source requested by user: `https://github.com/mattpocock/skills`

## Installed From `mattpocock/skills`

Installed into `~/.codex/skills`:

- `diagnose`
- `grill-with-docs`
- `prototype`
- `setup-matt-pocock-skills`
- `tdd`
- `to-issues`
- `to-prd`
- `triage`
- `zoom-out`
- `review`
- `handoff`
- `grill-me`
- `setup-pre-commit`
- `migrate-to-shoehorn`

Install command:

```sh
python3 /Users/arshdeepsingh/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo mattpocock/skills --path skills/engineering/diagnose skills/engineering/grill-with-docs skills/engineering/prototype skills/engineering/setup-matt-pocock-skills skills/engineering/tdd skills/engineering/to-issues skills/engineering/to-prd skills/engineering/triage skills/engineering/zoom-out skills/in-progress/review skills/productivity/handoff skills/productivity/grill-me skills/misc/setup-pre-commit skills/misc/migrate-to-shoehorn
```

## Skipped From `mattpocock/skills`

- Deprecated skills: `design-an-interface`, `qa`,
  `request-refactor-plan`, `ubiquitous-language`.
- Personal/workflow-specific skills: `edit-article`, `obsidian-vault`.
- Low relevance for ModMirror: `caveman`, `scaffold-exercises`.
- Claude-specific guardrail skill: `git-guardrails-claude-code`.
- Duplicate capability: `improve-codebase-architecture` already existed in
  the local skill set.

## Additional Skills Installed

Installed high-signal OpenAI curated skills:

- `screenshot`
- `security-best-practices`
- `security-threat-model`
- `security-ownership-map`
- `playwright-interactive`

Install command:

```sh
python3 /Users/arshdeepsingh/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo openai/skills --path skills/.curated/screenshot skills/.curated/security-best-practices skills/.curated/security-threat-model skills/.curated/security-ownership-map skills/.curated/playwright-interactive
```

## Search Results Not Installed

`npx skills find "frontend design ui prototype dashboard"` returned mostly
low-install third-party UI skills. They were not installed because they were
lower-signal than the existing local `frontend-design`, `uncodixfy`,
`agent-browser`, and Playwright capabilities.

## Notes

The newly installed skills may require a fresh Codex session before they appear
in the automatic skill list. For this pass, the `prototype` instructions were
read directly from `~/.codex/skills/prototype/SKILL.md` and applied manually.
