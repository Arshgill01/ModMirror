# Wave 08 - Safe Platform Capability Closure

## Objective

Close the highest-value platform proof gaps that are safe to close, and keep
dangerous capabilities gated.

## Dependencies

- Wave 03
- Wave 04
- Wave 05

## Candidate Proof Items

- native Reddit mobile app behavior
- multi-moderator policy ratification
- real operational-record retention dry-run, not destructive deletion unless
  explicitly approved
- public/private delivery preview paths, not sends unless explicitly approved

## Guardrails

- No destructive moderation execution without explicit approval.
- No public comments/messages without explicit approval.
- No scheduler sends.
- No external AI calls.
- No native Mod Notes writes without explicit approval.

## Deliverables

- Updated proof docs for every proof attempted.
- UI labels adjusted to match newly proven or still-disabled capabilities.
- Tests for changed gates or status mappings.

## Acceptance Criteria

- Every changed capability has matching docs, tests, and UI labels.
- Disabled capabilities remain disabled unless proven and approved.
- Full validation commands pass.
