# Multi-Moderator Ratification Runtime Test Plan

Created: 2026-05-21

## Current Status

ModMirror locally verifies policy proposal, review, threshold blocking, and
reviewed adoption logic. The current runtime proof covers a single moderator
account creating a proposal and recording the under-review/blocked state.

Distinct-moderator runtime proof is not complete because this environment does
not have two authenticated moderator accounts for `r/modmirror_dev`.

## Scope

Allowed in this test:

- Use `r/modmirror_dev`.
- Use an intentionally non-destructive draft policy or starter-template policy.
- Have moderator A propose a policy version.
- Have moderator B review that version.
- Optionally have moderator C review the same version if a two-approval
  threshold is being proven.
- Record reviewer names only as needed for audit proof; do not create
  per-moderator performance analytics or leaderboards.

Not allowed in this test:

- Adding or removing moderators without explicit user approval.
- Using non-consenting moderator accounts.
- Running destructive moderation actions, delivery sends, native Mod Notes,
  scheduler jobs, retention deletion, public content setup, or external AI.
- Treating local mocked reviewer names as runtime proof of distinct logged-in
  accounts.

## Preflight

- `git status --short --branch` is captured.
- `npx devvit whoami` is captured for each moderator session.
- `npm run type-check`, `npm run lint`, `npm test`, and `npm run build` pass if
  code changed since the last broad validation.
- The test policy rule, proposal note, required approvals, and account list are
  recorded before the first write.
- The moderator sessions are confirmed to be distinct Reddit accounts.

## Runtime Steps

1. Moderator A creates or selects a draft policy with
   `allowSingleModAdoption: false`.
2. Moderator A proposes a new version with a clear test note.
3. Moderator A attempts adoption and records the expected threshold block.
4. Moderator B reviews the same version.
5. If the threshold is two approvals, moderator C reviews the same version, or
   moderator B's single approval remains blocked and is recorded honestly.
6. Attempt adoption only after the configured threshold is met.
7. Record the final lifecycle state, latest review count, approval count, and
   audit trail.
8. Confirm duplicate reviews by the same moderator replace that moderator's
   latest vote instead of inflating the approval count.

## Evidence To Record

- Account names used, without credentials.
- Devvit app version and subreddit.
- Exact UI controls/routes used.
- Policy ID, proposal note, required approval count, and quick-adoption setting.
- Reviewer accounts, decisions, latest review count, and approval count.
- Adoption block message before threshold.
- Adoption result after threshold, if enough accounts are available.
- Confirmation that no destructive or delivery path was used.

## Completion Criteria

Multi-moderator ratification may be marked runtime-verified only when:

- The proof used distinct authenticated moderator accounts in Devvit runtime.
- Duplicate-review prevention was observed or explicitly tested.
- Threshold blocking and threshold adoption were both observed, or insufficient
  account availability was recorded as the remaining blocker.
- `RESEARCH.md`, `TODO.md`, `CAPABILITY_MATRIX.md`,
  `RUNTIME_VERIFICATION_MATRIX.md`, and the runtime proof backlog are updated.
- No per-moderator blame surface, destructive action, or delivery side effect
  was introduced.
