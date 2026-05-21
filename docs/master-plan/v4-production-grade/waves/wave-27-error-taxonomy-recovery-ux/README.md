# Wave 27: Error Taxonomy And Recovery UX

Status: complete

## Scope

Wave 27 normalizes user-facing recovery guidance for the failure classes called
out in the V4 production-grade plan.

## Delivered

- Distinct client error classes for access denied, subreddit isolation,
  unavailable runtime capabilities, partial data, offline/network failures,
  validation failures, static preview, timeout, API, clipboard, and unknown
  errors.
- Formatted notices now include a stable title, plain-language message, and
  explicit next action.
- Existing `normalizeClientError(...)` and clipboard handling paths pick up the
  improved notices without broad UI rewiring.
- Focused tests cover the newly added classes and formatted output.

## Verification

See `execution-log.md` for exact commands and pass/fail status.
