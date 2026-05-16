# DEVVIT_RESEARCH_QUESTIONS.md

Wave 0 must answer these before product implementation.

## Setup

1. What is the current recommended project creation flow?
2. What files does the selected Devvit template generate?
3. What Node version is used locally?
4. What Devvit package/CLI version is installed?
5. What command runs playtest?
6. What command builds?
7. What command uploads?
8. What command publishes?

## Devvit Web

1. Is this project using Devvit Web?
2. Where is the client entry?
3. Where is the server entry?
4. Do endpoints need `/api/` prefix?
5. What server framework is generated?
6. Are endpoint calls authenticated automatically?

## Reddit API

1. How do server endpoints access Reddit API?
2. Is `getModerationLog()` available?
3. What fields does `getModerationLog()` return?
4. Is `getSubredditRemovalReasons()` available?
5. What fields do removal reasons include?
6. Is there a subreddit rules API?
7. Can the app remove posts/comments?
8. Can the app approve posts/comments?
9. Can the app ignore reports?
10. Can the app submit comments?
11. Can the app send private messages?
12. Can the app create modmail conversations?
13. Can the app add/read native Mod Notes?

## Critical Behavior

1. Can the app comment on a post after removing it?
2. If not, can it comment before removal and then remove?
3. Can it comment on removed comments?
4. Can it sticky/distinguish a removal comment?
5. Can a post/comment menu action access target ID?
6. Can a post/comment menu action access target author?
7. Can menu actions be restricted to moderators?
8. Can a menu action open a form?
9. Can forms chain into other forms?
10. Can forms call server endpoints?

## Redis

1. How is Redis imported?
2. What data structures are available?
3. Is storage per subreddit install?
4. What limits matter?
5. Does Redis survive app updates?
6. What is the recommended key naming pattern?

## Permissions

1. What exact `devvit.json` permissions are needed for Reddit API?
2. What exact config is needed for Redis?
3. What exact config is needed for forms/menu actions?
4. What exact config is needed for triggers, if used?
5. Can current user permissions be checked?
6. Can we detect full/manage mod permissions?

## Testing

1. Can pure functions be unit tested locally?
2. What test runner is generated or easy to add?
3. Can server endpoints be tested without Reddit?
4. What must be tested only in playtest?

## Output Required

For each question:

- answer,
- source or code proof,
- whether it is verified in playtest,
- any limitation,
- next action if unresolved.
