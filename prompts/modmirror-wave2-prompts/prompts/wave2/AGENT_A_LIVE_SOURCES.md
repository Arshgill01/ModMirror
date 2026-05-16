# Agent A — Wave 2 Live Sources + Normalization

## Role

Implement the live Reddit/Devvit source adapter layer for Mirror Scan.

You are responsible for fetching and normalizing data from Devvit/Reddit APIs verified during Wave 0.

## Read First

- `AGENTS.md`
- `PLAN.md`
- `RESEARCH.md`
- `docs/DATA_MODEL.md`
- `prompts/wave2/WAVE2_ORCHESTRATOR.md`
- `.codex/skills/devvit-research/SKILL.md`

If the actual API details in `RESEARCH.md` differ from this prompt, follow `RESEARCH.md`.

## Goal

Create a stable server-side source layer that can provide Mirror Scan with:

- recent moderation actions,
- subreddit removal reasons,
- subreddit rules if available,
- normalized internal data shapes,
- graceful fallbacks for missing/unsupported APIs.

## Suggested Files

Adapt to the actual scaffold, but prefer:

```txt
src/server/services/redditSources.ts
src/server/services/normalizers.ts
src/server/services/mirrorScan.ts
src/shared/schema.ts
src/shared/constants.ts
```

Do not create duplicate schema files if Wave 1 already created them. Extend existing ones.

## Required Interfaces

Create or align with interfaces similar to:

```ts
export interface NormalizedRule {
  id: string;
  name: string;
  description?: string;
  source: 'reddit_rule' | 'manual' | 'demo';
}

export interface NormalizedRemovalReason {
  id: string;
  title: string;
  message?: string;
  source: 'reddit_removal_reason' | 'demo';
}

export interface NormalizedModAction {
  id: string;
  rawActionType: string;
  createdAt: string;
  moderator?: string;
  targetThingId?: string;
  targetAuthor?: string;
  detailsText?: string;
  removalReasonId?: string;
  removalReasonTitle?: string;
  raw?: unknown;
}

export interface MirrorScanSources {
  subreddit: string;
  rules: NormalizedRule[];
  removalReasons: NormalizedRemovalReason[];
  actions: NormalizedModAction[];
  source: 'live' | 'demo';
  warnings: string[];
}
```

Use existing names if already defined.

## API Behavior

Use verified Wave 0 APIs only.

Likely sources:

- `getModerationLog()` or equivalent
- `getSubredditRemovalReasons()` or equivalent
- subreddit rules method if verified

If an API is missing or returns less data than expected:

- do not fake live results,
- return empty arrays plus warnings,
- document it in `RESEARCH.md` if new,
- let demo mode provide rich data.

## Normalization Rules

1. Preserve raw action type.
2. Preserve any useful text fields that may help attribution.
3. Preserve removal reason title/message if available.
4. Preserve target author only if available and needed.
5. Avoid storing unnecessary sensitive fields.
6. Never throw the entire scan just because one source fails.

## Deliverables

- Source adapter function, e.g. `loadLiveMirrorScanSources(context)`.
- Normalizers for mod actions, removal reasons, and rules.
- Graceful warning collection.
- Integration point in existing mirror scan endpoint/service if present.
- Minimal smoke test/manual verification instructions.

## Acceptance Criteria

- Code compiles.
- Source layer can return a `MirrorScanSources` object.
- Failures are represented as warnings rather than crashes when possible.
- No hallucinated Devvit API calls remain.
- Any uncertainty is documented in `RESEARCH.md` or TODO.

## Commit Guidance

Make granular commits, for example:

```bash
git add src/server/services/redditSources.ts src/server/services/normalizers.ts src/shared/schema.ts
git commit -m "feat: add live Mirror Scan source adapters"
```
