# Agent D — Scheduler + Digest Settings

## Goal

Add opt-in digest scheduling if Devvit scheduler is supported and stable.

## Important

Scheduler is optional.

Manual Generate Digest Now is mandatory.

## Tasks

1. Research current Devvit scheduler support.
2. Update RESEARCH.md.
3. Add digest settings:
   - enabled/disabled,
   - weekly cadence,
   - delivery mode,
   - last generated,
   - next scheduled if available.
4. If scheduler works:
   - register scheduled job,
   - add test path if possible,
   - log scheduled digest results.
5. If scheduler does not work:
   - mark scheduling unavailable.

## Safety Rules

- Default scheduling off.
- Explicit opt-in only.
- No automatic posting unless delivery is verified and configured.
