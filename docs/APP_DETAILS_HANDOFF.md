# App Details Handoff

Date: 2026-05-21

This file collects the current public app-details values for the Devvit
Developer Portal. Do not run `devvit publish` until the user explicitly
approves publishing.

## Current App

- App slug: `modmirror`
- Latest uploaded version: `0.0.2`
- Verified public API version: `0.12.24`
- Verified uploaded capabilities: `MODERATOR`, `WEBVIEW`

## Listing Copy

Name:

```txt
ModMirror
```

Tagline:

```txt
Find enforcement drift before your users do.
```

Short description:

```txt
ModMirror helps Reddit moderator teams find enforcement drift, agree on rule policies, review exceptions, generate appeal context, and share deterministic governance digests.
```

Safety summary:

```txt
No LLM moderation judgment. No automatic bans. Human confirmation remains required for meaningful enforcement actions. Public/private delivery, scheduler, native Mod Notes, real retention deletion, and destructive moderation execution remain disabled or approval-gated until dedicated runtime proof exists.
```

## Terms And Privacy Links

Draft content has been committed and is currently reachable through GitHub raw
links:

- Privacy draft:
  `https://raw.githubusercontent.com/Arshgill01/ModMirror/master/docs/PRIVACY_POLICY_DRAFT.md`
- Terms draft:
  `https://raw.githubusercontent.com/Arshgill01/ModMirror/master/docs/TERMS_DRAFT.md`

These drafts still need owner/legal review before being used as final public
links. If the review changes the copy, update the repo documents first and
verify the raw links after pushing.

## Publish Safety

Do not publish until all are true:

- draft terms/privacy copy has been reviewed and accepted;
- the Devvit app details page has the accepted public links;
- `npm run deploy` passes again on the intended publish commit;
- the user explicitly approves `devvit publish`;
- route-level WebView smoke blockers are either resolved or disclosed as known
  limitations in the submission notes.

## Sources Checked

- Reddit for Developers, "Publish your app": apps using HTTP fetch capability
  must provide terms and privacy links before publishing, added on the app
  details page.
- Installed `devvit publish --help`: publishing creates a new version, uploads
  source for review, and files a publish request.
- Installed `devvit upload --help`: uploading keeps the app visible only to the
  owner for small test subreddit installs.
