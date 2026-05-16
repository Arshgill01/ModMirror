# AGENT B — Wave 1 Redis/Data Layer

## Mission

Create the Redis/data-access skeleton for ModMirror.

You own Redis key namespacing, persistence interfaces, basic read/write smoke methods, and service structure. You do not own dashboard UI or full product logic.

## Read First

- AGENTS.md
- PLAN.md
- RESEARCH.md
- docs/DATA_MODEL.md
- docs/DECISIONS.md
- .codex/skills/devvit-research/SKILL.md
- .codex/skills/wave-execution/SKILL.md

## Scope

Create or update server-side files such as:

- `src/server/services/redis.ts`
- `src/server/services/config.ts`
- `src/server/services/policies.ts`
- `src/server/services/audit.ts`
- `src/server/services/scans.ts`
- `src/server/types/` if useful

Use the actual scaffold paths from Wave 0. Do not fight the generated structure.

## Required Implementation

### 1. Redis Key Helper

Implement a single namespacing helper.

Example:

```ts
export function mmKey(subreddit: string, suffix: string): string {
  return `modmirror:${subreddit}:${suffix}`;
}
```

Centralize all key construction.

### 2. Repository/Service Interfaces

Add simple functions for:

- get/set app config
- get/set demo mode flag
- get/set policy by rule
- list policies
- save last scan metadata
- get last scan metadata
- save audit event
- list recent override/audit events if feasible

Use placeholder/minimal implementations if actual Redis SDK behavior from RESEARCH.md requires adaptation.

### 3. Redis Smoke Method

Expose a minimal server-side method/route/hook that proves read/write works.

If the project already has a health route, integrate there. If not, create a small service method and document how Agent C can call it.

### 4. Types

Import shared types from `src/shared/schema.ts` if Agent A exists. If not, create minimal local types and leave TODO comments for integration.

## Non-goals

Do not:
- build dashboard UI,
- implement full Mirror Scan,
- implement attribution,
- implement full policy editor,
- add external database,
- store unnecessary sensitive data.

## Safety / Privacy

Store only what is needed.

Do not store:
- full comment/post body unless needed later and explicitly decided,
- private messages,
- raw large mod logs indefinitely.

Prefer:
- IDs,
- usernames only where necessary,
- action type,
- rule ID/name,
- timestamps,
- confidence,
- aggregate counts.

## Acceptance Criteria

- Redis helper exists.
- Basic read/write service exists.
- Services compile.
- Keys are namespaced.
- TODO.md documents any unresolved Redis limitations.
- RESEARCH.md is updated if new Redis behavior is discovered.
- Commit changes with granular commit messages.

## Completion Report

At the end, report:

- files changed,
- Redis functions added,
- exact key patterns,
- commands run,
- blockers,
- integration notes for Agent C.
