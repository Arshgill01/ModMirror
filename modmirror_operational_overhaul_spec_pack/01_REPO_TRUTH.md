# Repo Truth Codex Must Use

## Product state

ModMirror currently has impressive infrastructure but is not yet a real time-saving moderator tool.

It has:
- Devvit Web + Hono server scaffold.
- Redis-backed config/policies/audit/digest pieces.
- Typed shared schema.
- Mirror Scan demo/live source path.
- Deterministic attribution engine.
- Policy CRUD/versioning.
- Apply Policy simulator.
- Override audit/review.
- Policy health scoring.
- Case Packet generator.
- Manual digest/history.
- Productized dashboard UI.
- Unit tests across core services.

But it lacks:
- Real post/comment moderation execution.
- Real post/comment policy action entrypoints.
- Full scan history persistence.
- Drift-over-time analytics.
- True multi-mod policy agreement.
- Strong evidence-rich case packets.
- Runtime-verified delivery/modmail/scheduler/native Mod Notes.
- Non-mod permission proof.
- Mobile/runtime confidence.

## Smoking-gun issues

1. `devvit.json` still exposes two `"ModMirror smoke test"` menu entries for moderators.
2. `Apply Policy` calls `createLogOnlyActionInput` and writes to Redis; it does not call real Reddit moderation methods.
3. Live scan defaults to a shallow moderation-log window.
4. Full attributed scan action sets are not persisted.
5. "Policy Agreement" is currently policy edit/versioning, not team agreement.
6. Client demo fallbacks can make static preview look more functional than live runtime.
7. Launch checklist has unchecked runtime items; do not hide this.

## Strategic direction

Stop expanding reporting-only surfaces. Build operational credibility.

The app must become useful at the actual moment of moderation:
- post/comment context
- team policy recommendation
- explicit confirmation
- real Reddit action
- durable receipt
- override reason when policy is bypassed
- later consistency proof

## Safety/product principles

- Human-confirmed actions only.
- No silent destructive actions.
- No AI as judge.
- Demo mode clearly labeled.
- Runtime claims require runtime proof.
- Per-mod analytics avoided or heavily gated.
- Live data separate from demo data.
- Log-only fallback always available.
