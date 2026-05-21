# Runtime Research Targets

These are not optional if the associated feature is enabled.

## Reddit moderation execution

Verify on safe test content:
- `reddit.remove(id, isSpam)` works for posts.
- `reddit.remove(id, isSpam)` works for comments.
- `reddit.approve(id)` works for posts.
- `reddit.approve(id)` works for comments.
- `ignoreReports()` works on supported targets.
- Permission failure shape is captured and logged.
- Operation result/target state can be confirmed.

## Comment delivery

Verify:
- Can submit comment before removal?
- Can submit comment after removal?
- Can distinguish/sticky the comment?
- Can app vs user identity be selected through `runAs`?
- What happens on locked/deleted/removed targets?

Keep public comment delivery disabled until verified.

## Native Mod Notes

Verify:
- `addModNote` works in playtest.
- Required permissions.
- Error shape.
- Whether notes are visible as expected.
- Whether duplicate note prevention is needed.

## Modmail / mod discussion

Verify:
- Internal mod-team discussion creation works.
- No accidental user-facing message.
- Preview/confirm path is safe.
- Delivery receipt can be stored.

## Scheduler

Verify:
- Scheduler registration is possible in this app shape.
- Jobs run in playtest.
- Job identity/context.
- Redis/history access from scheduler.
- Safe opt-in behavior.

## External AI fetch

Verify:
- Server can call external API.
- Secret handling path exists and is safe.
- Latency is acceptable.
- Failure gracefully degrades.
- No AI output is used as authoritative enforcement.
