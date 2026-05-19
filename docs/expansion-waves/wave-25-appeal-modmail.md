# Wave 25: Appeal Modmail / Case Packet Delivery

## Summary

Wave 25 connects Case Packets to the existing preview-first team delivery
system. Case Packets can now be prepared as delivery drafts, copied manually,
and recorded with delivery receipts. Mod Discussion delivery remains disabled
until runtime-verified.

## Capability Proof

Evidence checked:

- Official Reddit for Developers docs list
  `ModMailService.createModDiscussionConversation({ subject, bodyMarkdown, subredditId })`
  for internal Mod Discussions:
  `https://developers.reddit.com/docs/api/redditapi/models/classes/ModMailService`.
- Installed typings expose `reddit.modMail` on
  `node_modules/@devvit/reddit/RedditClient.d.ts`.
- Installed typings expose `createConversation`,
  `createModDiscussionConversation`, `createModInboxConversation`, and
  `createModNotification` in
  `node_modules/@devvit/reddit/models/ModMail.d.ts`.

Runtime proof was not obtained in this wave. No Modmail or Mod Discussion
message was sent.

## What Changed

- Added `case_packet` as a team delivery subject type.
- Added `src/shared/casePacketDelivery.ts` to build Case Packet delivery
  drafts with Reddit Modmail-safe subject titles.
- Added tests for draft generation, content safety notes, and title length.
- Updated team delivery tests so manual receipts can store Case Packet subject
  IDs.
- Added Prove-page controls to:
  - copy Case Packet Markdown;
  - save a manual delivery receipt;
  - save a Mod Discussion draft receipt that does not send a Reddit message.
- Updated TODO and research notes with the type-only Mod Discussion status.

## Files Changed

- `src/shared/schema.ts`
- `src/shared/constants.ts`
- `src/shared/casePacketDelivery.ts`
- `src/shared/casePacketDelivery.test.ts`
- `src/server/services/teamDelivery.test.ts`
- `src/client/main.ts`
- `src/client/styles.css`
- `TODO.md`
- `RESEARCH.md`
- `docs/expansion-waves/wave-25-appeal-modmail.md`

## Runtime Proof Status

Local/type/build verified only.

Manual Case Packet delivery is implemented as Markdown copy plus an auditable
receipt. Mod Discussion delivery remains blocked by the existing W11 gates:
product routes do not inject a live adapter, and unverified delivery stores a
skipped receipt instead of sending a Reddit message.

## Commands Run

- `npm install`
- `npm test -- src/shared/casePacketDelivery.test.ts src/server/services/teamDelivery.test.ts`
- `npm run type-check`
- `npm run lint`
- `npm test`
- `npm run build`
- `git diff --check`

## Known Gaps

- Redis-backed delivery receipt persistence still needs Devvit playtest proof.
- Internal Mod Discussion destination, permissions, returned conversation ID,
  and failure shape still need safe runtime verification.
- No appeal-user-facing Modmail flow is enabled; this wave is internal
  moderator review only.

## Safety Notes

- The UI labels manual copy as the supported path.
- The Mod Discussion button stores a draft/skipped receipt in the default
  product path; it does not send a Reddit message.
- The delivery draft text states that a Case Packet is not an automated appeal
  decision.
