# Wave 15 — Override Resolution Inbox

Status: complete

## Objective

Turn override review from a passive exception list into an open queue where
moderators choose a resolution and persist the team note.

## Scope

- Show only unresolved overrides in the open resolution inbox.
- Provide four explicit resolution actions:
  accepted exception, policy needs update, needs team discussion, and reviewed.
- Keep the review note textarea next to the resolution actions.
- Remove resolved overrides from the open queue immediately after the API
  confirms the persisted review.

## Acceptance Evidence

- `/api/overrides?status=unresolved` remains the data source for the open
  queue.
- `POST /api/overrides/:id/review` is still used for status and note
  persistence.
- A resolved override is filtered out of client state after a successful review
  response.
- The empty state now describes the open queue rather than all historical
  override records.
