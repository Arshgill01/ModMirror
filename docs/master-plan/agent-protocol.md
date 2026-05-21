# Master Plan Agent Protocol

## Context Discipline

Use repository files as the source of truth. If a strategy file conflicts with
source code, inspect source code and update the strategy file only when the
change is durable.

Do not re-discover everything. Start with:

- `CONTEXT.md`
- `TODO.md`
- `docs/operational-overhaul/RUNTIME_PROOF_BACKLOG.md`
- the wave README
- source files named by the wave

## Execution Log Contract

Each wave folder has a `README.md` and an `execution-log.md`. Keep the log
current with:

- start time and agent identity if known
- files inspected
- files changed
- decisions made
- rejected options
- commands run
- runtime proof steps attempted
- screenshots or artifact paths if relevant to development QA
- open risks

Do not wait until the end to write the log. The log is how later agents recover
context after context windows expire.

## Branching Guidance

If the user or maintainer has not provided branch instructions, use scoped
branches named:

```txt
master-plan/wNN-short-name
```

Do not create parallel branches that edit the same source area unless the
agents have explicitly divided ownership.

## Parallel Work Rules

Safe parallel lanes:

- one agent works on server services and tests
- one agent works on client UI and static render QA
- one agent works on runtime proof documentation and non-destructive playtest
- one agent works on fixtures/golden tests

Unsafe parallel lanes:

- two agents editing `src/client/main.ts`
- two agents editing the same shared schema/types
- one agent changing Redis key shape while another writes storage tests
- runtime proof that depends on unmerged local code

## Submission Artifact Ban

Do not create or edit:

- `docs/DEVPOST_DRAFT.md`
- `docs/SUBMISSION_NOTES.md`
- `docs/DEMO_SCRIPT.md`
- `docs/APP_LISTING_DRAFT.md`
- video scripts
- Devpost copy
- public launch copy

The only exception is correcting factual inaccuracies discovered during
development if the user explicitly asks for it.

## Runtime Safety

Do not perform destructive or public Reddit actions without explicit user
approval. This includes:

- remove/approve/ignore-report actions
- public comments
- private messages or modmail
- Mod Discussion sends
- native Mod Notes writes
- scheduler jobs that send anything
- deletion of real operational records
- external AI calls

Runtime proof must distinguish:

- local/type verified
- desktop Devvit WebView runtime verified
- native mobile runtime verified
- disabled by design
- blocked by platform/API behavior

## Completion Audit

Before marking a wave complete, build a checklist from the wave README:

- every deliverable
- every acceptance criterion
- every command
- every required doc update
- every runtime proof item

Then map each item to evidence. If evidence is missing, the wave is not done.
