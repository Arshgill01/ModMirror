# Wave 22: True Non-Mod And Limited-Mod Access Proof

Status: blocked

## Goal

Execute `docs/operational-overhaul/ACCESS_RUNTIME_TEST_PLAN.md` with account
types that can prove real access behavior:

- a true non-moderator account with no moderator permissions in
  `r/modmirror_dev`;
- optionally, a deliberately lower-permission moderator account.

## Blocker

This Codex session only has the existing Devvit identity
`u/BrightyBrainiac`, which is the full moderator account already documented in
runtime proof as returning permission `all`.

Without a separate authenticated Reddit session for a true non-mod account,
ModMirror cannot honestly claim protected-route blocking runtime proof.
Without a limited moderator account, it also cannot capture lower-permission
role strings.

## Current Safe State

- Local access guard tests already cover no-user, empty-permission,
  unavailable-permission, and permission-failure denial paths.
- Runtime proof for the current full moderator permission string already exists.
- Per-mod/manage-level visibility remains aggregate-only unless the runtime
  permission list includes `all`.

## Unblock Step

Provide or open an authenticated Reddit session for a true non-moderator account
that is not a moderator of `r/modmirror_dev`. For the optional limited-mod proof,
provide a moderator account whose permissions are deliberately lower than `all`.
