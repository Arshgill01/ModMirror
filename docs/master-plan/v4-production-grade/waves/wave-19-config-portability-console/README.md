# Wave 19: Config Portability Console

Status: complete

## Goal

Make configuration export/import reviewable enough for production use. A mod
team must be able to see what is portable, what is excluded, and what an import
would write before accepting it.

## Delivered

- Added server-backed policy diff metadata to portable config import results.
- Added a readable dry-run/import diff in Settings with per-policy status,
  step count, delivery mode, action summary, and review disposition.
- Added an export safety summary that explicitly confirms private history is
  excluded and imports remain drafts/proposed updates.
- Kept the existing import behavior: new policies are inactive drafts and
  changed policies are proposed updates, not silently adopted enforcement.

## Safety Boundary

Portable config still excludes receipts, scans, overrides, content snapshots,
case packets, evidence boards, delivery receipts, and incident reports. Import
does not execute Reddit actions and does not adopt policy changes without the
normal review path.
