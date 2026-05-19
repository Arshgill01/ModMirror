import type {
  CasePacket,
  TeamDeliveryChannel,
  TeamDeliveryPreviewRequest,
} from './schema';

const TEAM_DELIVERY_TITLE_LIMIT = 100;

export function buildCasePacketDeliveryDraft(
  packet: CasePacket,
  channel: TeamDeliveryChannel = 'manual_markdown'
): TeamDeliveryPreviewRequest {
  return {
    channel,
    subjectType: 'case_packet',
    subjectId: packet.id,
    title: buildCasePacketDeliveryTitle(packet),
    markdown: renderCasePacketDeliveryMarkdown(packet),
  };
}

export function buildCasePacketDeliveryTitle(packet: CasePacket): string {
  const ruleName =
    packet.action?.ruleName ??
    packet.policyContext.ruleName ??
    packet.policyContext.ruleKey ??
    'case packet';
  const subject =
    packet.action?.targetThingId ??
    packet.action?.actionId ??
    packet.action?.receiptId ??
    packet.subject.actionId ??
    packet.subject.receiptId ??
    packet.subject.targetThingId ??
    packet.id;

  return truncateDeliveryTitle(`ModMirror case packet: ${ruleName} (${subject})`);
}

export function renderCasePacketDeliveryMarkdown(packet: CasePacket): string {
  return [
    packet.markdown,
    '',
    '---',
    'ModMirror delivery note',
    '- This packet is for moderator review and appeal context only.',
    '- It is not an automated appeal decision.',
    '- Confirming delivery in ModMirror stores a delivery receipt; Reddit Mod Discussion delivery remains disabled until runtime-verified.',
  ].join('\n');
}

function truncateDeliveryTitle(title: string): string {
  if (title.length <= TEAM_DELIVERY_TITLE_LIMIT) {
    return title;
  }
  return `${title.slice(0, TEAM_DELIVERY_TITLE_LIMIT - 3).trimEnd()}...`;
}
