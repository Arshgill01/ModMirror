# TODO.md — Current Work Queue

## Current Phase

Wave 0 — Research + Scaffold Proof

## Immediate Tasks

- [ ] Create Devvit app using current Reddit Developer Platform template.
- [ ] Confirm Node/npm versions.
- [ ] Confirm Devvit CLI auth with `npx devvit login` and `npx devvit whoami`.
- [ ] Start playtest with generated dev command.
- [ ] Complete RESEARCH.md.
- [ ] Build smallest possible Redis smoke test.
- [ ] Build smallest possible Reddit API smoke test.
- [ ] Build smallest possible menu action/form smoke test if supported.
- [ ] Verify whether app can comment before/after removal.
- [ ] Verify whether private message or modmail delivery is feasible.
- [ ] Verify whether native Mod Notes are accessible.
- [ ] Verify whether current user/mod permissions can be checked.
- [ ] Update PLAN.md if any assumption breaks.

## Wave 0 Research Questions

See `docs/DEVVIT_RESEARCH_QUESTIONS.md`.

## Do Not Start Yet

Do not implement these until Wave 0 is complete:

- Full dashboard UI
- Mirror scan scoring
- Policy editor
- Apply Policy flow
- Override audit dashboard
- Devpost submission copy

## Definition of Done for Wave 0

Wave 0 is done only when:

- [ ] The app scaffolds successfully.
- [ ] The app runs in playtest.
- [ ] RESEARCH.md answers every required question.
- [ ] At least one Redis read/write is proven or failure is documented.
- [ ] At least one Reddit API read is proven or failure is documented.
- [ ] Menu/form capability is proven or limitation is documented.
- [ ] Comment-after-removal behavior is tested or explicitly deferred with reason.
- [ ] TODO.md lists exact next steps for Wave 1.
