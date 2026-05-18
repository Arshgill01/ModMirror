import { describe, expect, it } from 'vitest';
import type { CasePacket } from './schema';
import {
  buildCasePacketDeliveryDraft,
  buildCasePacketDeliveryTitle,
  renderCasePacketDeliveryMarkdown,
} from './casePacketDelivery';

const packet: CasePacket = {
  id: 'case-packet-1',
  generatedAt: '2026-05-18T12:00:00.000Z',
  subreddit: 'ExampleLearning',
  packetType: 'appeal_context',
  subject: {
    type: 'action',
    actionId: 'action-1',
  },
  action: {
    actionId: 'action-1',
    receiptId: 'receipt-1',
    targetThingId: 't3_target',
    ruleName: 'Low-effort questions',
    selectedAction: 'remove',
    recommendedAction: 'warn',
  },
  policyContext: {
    ruleKey: 'rule-2',
    ruleName: 'Low-effort questions',
  },
  consistencyStatus: 'stricter_than_policy',
  userHistory: [],
  comparableCases: [],
  evidence: [],
  appealPosture: 'review_recommended',
  caveats: ['Runtime delivery has not been verified.'],
  markdown: '# ModMirror Case Packet\n\n## Action Summary\n- Action ID: action-1',
};

describe('case packet delivery drafts', () => {
  it('builds a manual delivery request for case packets by default', () => {
    const draft = buildCasePacketDeliveryDraft(packet);

    expect(draft.channel).toBe('manual_markdown');
    expect(draft.subjectType).toBe('case_packet');
    expect(draft.subjectId).toBe(packet.id);
    expect(draft.title).toBe(
      'ModMirror case packet: Low-effort questions (t3_target)'
    );
    expect(draft.markdown).toContain('# ModMirror Case Packet');
    expect(draft.markdown).toContain('not an automated appeal decision');
  });

  it('can prepare an unverified mod discussion draft without changing content', () => {
    const draft = buildCasePacketDeliveryDraft(packet, 'mod_discussion');

    expect(draft.channel).toBe('mod_discussion');
    expect(draft.markdown).toBe(renderCasePacketDeliveryMarkdown(packet));
  });

  it('keeps delivery titles within the Reddit Modmail subject limit', () => {
    const longTitle = buildCasePacketDeliveryTitle({
      ...packet,
      action: {
        ...packet.action,
        ruleName: 'A very long rule name that keeps describing edge cases until the title would otherwise exceed the Modmail subject limit',
      },
    });

    expect(longTitle.length).toBeLessThanOrEqual(100);
    expect(longTitle.endsWith('...')).toBe(true);
  });
});
