# AI Advisory Safety Spec

AI is optional and advisory only.

## Allowed

- Draft policy suggestions from deterministic evidence.
- Summarize drift findings.
- Summarize case packets.
- Explain evidence in plain English.
- Generate mod-team digest summaries.

## Forbidden

- Deciding enforcement.
- Executing actions.
- Overriding policy.
- Presenting AI judgment as fact.
- Using AI output without showing deterministic evidence base.

## Requirements

- Disabled without provider config.
- No hardcoded keys.
- Failure-safe fallback.
- Output labeled AI draft/advisory.
- Evidence IDs included in prompt and response metadata where possible.
