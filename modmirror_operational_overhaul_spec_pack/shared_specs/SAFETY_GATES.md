# Safety Gates

## Gates for live moderation execution

Required before enabling live execution:
- target context resolved
- current user is moderator
- action is compatible with target type
- preview generated
- explicit confirmation received
- capability enabled
- feature not marked unverified_disabled
- receipt creation path available

## Gates for comments/modmail/mod notes/scheduler

Required:
- runtime proof in docs
- explicit moderator confirmation
- delivery preview
- receipt on success/failure
- manual fallback

## Always blocked

- auto-removal without confirmation
- AI-decided enforcement
- hidden destructive actions
- public/user-facing delivery without preview
