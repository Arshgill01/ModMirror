# PREFLIGHT_DEVVIT_IDENTITY_FIX.md

## Goal

Resolve the Wave 2 runtime blocker:

> `npm run dev` starts building, but Devvit reports the app does not exist yet and asks for app initialization/binding.

Do this before Wave 3/4 product implementation.

## Context

Wave 2 local implementation passed:

- `npm install`
- `npm run build`
- `npm test`
- `npm run type-check`
- `npm run lint`
- `npx devvit whoami`

Runtime playtest was partial/blocked because the Devvit app identity was not created or bound.

## Rules

- Do not overwrite product source files.
- Do not re-scaffold the entire project over the current repo without first backing up and inspecting what will change.
- Do not delete Wave 1/2 implementation.
- Do not change the app name casually; if the app slug is unavailable, choose a documented fallback and update all docs/config references.
- Record exact commands and outputs in `RESEARCH.md`.
- Update `TODO.md` with the final runtime status.

## Steps

1. Start clean.

```bash
git checkout master
git status
```

2. Confirm current Devvit state.

```bash
npx devvit whoami
npx devvit version || true
npx devvit view --json || npx devvit view || true
cat devvit.json
```

3. Inspect the actual CLI help for the installed version.

```bash
npx devvit help
npx devvit help init || true
npx devvit help new || true
npx devvit help playtest || true
```

4. If the CLI explicitly says to run an init/bind command, inspect help first, then run the least destructive command.

Examples, depending on installed CLI support:

```bash
npx devvit init
```

or:

```bash
npx devvit new --here
```

Only use `new --here` if the CLI confirms it will bind/create an app without overwriting product files, or after making a temporary backup/branch.

5. If CLI creation is unclear, use the Developer Portal flow:
   - Go to `developers.reddit.com/new`.
   - Create a Devvit Web / React app identity for ModMirror.
   - Ensure the `name` in `devvit.json` matches the registered app slug.
   - Keep the current codebase; do not replace it with a fresh template unless intentionally migrating config only.

6. Re-run:

```bash
npm run build
npm test
npm run type-check || true
npm run lint || true
npm run dev
```

7. Expected result:

`npm run dev` should reach Playtest ready, or the exact remaining blocker should be documented.

## Documentation Required

Update `RESEARCH.md` with:

- CLI version.
- App slug/name.
- Whether `npx devvit init` exists.
- Whether `npx devvit new --here` was used or avoided.
- Exact command that created/bound the app identity.
- Whether `npm run dev` reached Playtest ready.
- Playtest subreddit used, if known.
- Any runtime errors.

Update `TODO.md` with:

- identity fixed or still blocked,
- next command to run,
- remaining risk.

## Completion Criteria

This preflight is complete when:

- `npm run dev` reaches Playtest ready, OR
- the app identity issue is reduced to a specific documented external blocker that cannot be resolved from code.
