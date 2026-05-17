# Launch Readiness Checklist — ModMirror

## Local Checks

- [ ] `npm install`
- [ ] `npm run build`
- [ ] `npm run type-check`
- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm audit` reviewed and documented

## Runtime Checks

- [ ] Devvit app identity valid.
- [ ] Playtest starts.
- [ ] Inline card works.
- [ ] Expanded dashboard works.
- [ ] Command Center works.
- [ ] Demo scenario works.
- [ ] Live empty state is useful.
- [ ] Mirror Scan works or degrades gracefully.
- [ ] Policies create/edit.
- [ ] Apply Policy works.
- [ ] Override review works.
- [ ] Case Packet works.
- [ ] Manual Digest works.
- [ ] Markdown copy/export works.
- [ ] Runtime Settings shows capability status.

## Role Checks

- [ ] app owner/developer
- [ ] subreddit moderator
- [ ] regular user/non-mod if possible

Expected:

- [ ] non-mods cannot access sensitive mod workflows.
- [ ] mod-only actions are hidden or blocked.
- [ ] aggregate data is safe.
- [ ] per-mod data is gated or omitted.

## Device Checks

- [ ] desktop web
- [ ] narrow viewport
- [ ] mobile web if possible
- [ ] Reddit mobile app if possible
- [ ] dark Reddit UI

## UX Checks

- [ ] first screen explains value in < 10 seconds.
- [ ] no dead-end empty states.
- [ ] demo mode is obvious.
- [ ] primary CTAs are clear.
- [ ] loading states exist.
- [ ] error states are useful.
- [ ] copy avoids unsupported claims.
- [ ] no generic card-grid AI slop.
- [ ] visual hierarchy is strong.

## Data Practices

- [ ] stored data documented.
- [ ] sensitive data minimized.
- [ ] no external services.
- [ ] no LLMs.
- [ ] no cross-subreddit analytics.
- [ ] no automatic punitive actions without human confirmation.
- [ ] override data framed as team governance, not surveillance.

## Submission Assets

- [ ] README complete.
- [ ] App listing draft complete.
- [ ] Devpost draft complete.
- [ ] Project impact copy complete.
- [ ] Screenshots captured.
- [ ] Demo video script complete.
- [ ] Known limitations clear.
- [ ] Developer feedback notes drafted.
- [ ] Final report complete.

## Do Not Do Without Human Confirmation

- [ ] submit Devpost.
- [ ] publish app publicly.
- [ ] contact communities.
- [ ] claim partnerships.
- [ ] enable automatic scheduled posting on a real subreddit.
