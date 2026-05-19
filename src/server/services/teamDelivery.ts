import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  TEAM_DELIVERY_CHANNEL_VALUES,
  TEAM_DELIVERY_SUBJECT_TYPE_VALUES,
} from '../../shared/constants';
import type {
  TeamDeliveryCapabilities,
  TeamDeliveryCapabilityStatus,
  TeamDeliveryChannel,
  TeamDeliveryConfirmRequest,
  TeamDeliveryConfirmResponse,
  TeamDeliveryPreview,
  TeamDeliveryPreviewRequest,
  TeamDeliveryReceipt,
} from '../../shared/schema';
import { parseJson, redisKeys, serializeJson, writeJson } from './redis';

export type TeamDeliveryAdapter = {
  sendModDiscussion(input: {
    subreddit: string;
    title: string;
    markdown: string;
  }): Promise<{ conversationId: string }>;
};

export type ConfirmTeamDeliveryOptions = {
  request: TeamDeliveryConfirmRequest;
  subreddit: string;
  requestedBy: string;
  adapter?: TeamDeliveryAdapter;
  liveDeliveryEnabled?: boolean;
  runtimeVerified?: boolean;
};

const DELIVERY_RECEIPT_LIMIT = 25;

export function getTeamDeliveryCapabilities(): TeamDeliveryCapabilities {
  return {
    manualMarkdown: {
      state: 'enabled',
      label: 'Manual Markdown copy',
      detail:
        'Manual copy remains the supported delivery path. It creates no Reddit-side message.',
      runtimeProof: 'verified',
    },
    modDiscussion: {
      state: 'unverified',
      label: 'Mod discussion delivery',
      detail:
        'Devvit exposes internal Mod Discussion APIs, but ModMirror has not runtime-verified safe delivery.',
      runtimeProof: 'type_only',
    },
    scheduler: {
      state: 'unavailable',
      label: 'Weekly scheduler',
      detail:
        'Devvit exposes scheduler APIs, but no ModMirror scheduler task is registered in devvit.json.',
      runtimeProof: 'type_only',
    },
  };
}

export function buildTeamDeliveryPreview(options: {
  request: TeamDeliveryPreviewRequest;
  subreddit: string;
}): TeamDeliveryPreview {
  const request = normalizePreviewRequest(options.request);
  const capability = getCapabilityForChannel(request.channel);
  const deliveryWillBeAttempted =
    capability.state === 'enabled' &&
    request.channel !== 'manual_markdown' &&
    isLiveDeliveryEnabled() &&
    isRuntimeVerified();

  const preview: TeamDeliveryPreview = {
    subreddit: options.subreddit,
    channel: request.channel,
    subjectType: request.subjectType,
    title: request.title,
    markdown: request.markdown,
    capability,
    warnings: buildWarnings(request.channel, capability, deliveryWillBeAttempted),
    requiresExplicitConfirmation: true,
    deliveryWillBeAttempted,
  };
  if (request.subjectId !== undefined) {
    preview.subjectId = request.subjectId;
  }
  return preview;
}

export async function confirmTeamDelivery(
  options: ConfirmTeamDeliveryOptions
): Promise<TeamDeliveryConfirmResponse> {
  if (!options.request.confirmed) {
    throw new Error('Team delivery confirmation is required.');
  }

  const preview = buildTeamDeliveryPreview({
    request: options.request,
    subreddit: options.subreddit,
  });
  const liveDeliveryEnabled =
    options.liveDeliveryEnabled ?? isLiveDeliveryEnabled();
  const runtimeVerified = options.runtimeVerified ?? isRuntimeVerified();
  const receiptBase = createReceiptBase({
    preview,
    requestedBy: options.requestedBy,
    runtimeVerified,
  });

  if (preview.channel === 'manual_markdown') {
    const receipt = await saveTeamDeliveryReceipt({
      ...receiptBase,
      status: 'manual_ready',
      deliveryAttempted: false,
      destination: 'manual_copy',
    });
    return { preview, receipt };
  }

  if (!liveDeliveryEnabled || !runtimeVerified || options.adapter === undefined) {
    const receipt = await saveTeamDeliveryReceipt({
      ...receiptBase,
      status: 'skipped',
      deliveryAttempted: false,
      errorMessage:
        'Delivery skipped because this channel is not runtime-verified and enabled.',
    });
    return { preview, receipt };
  }

  try {
    const result = await options.adapter.sendModDiscussion({
      subreddit: preview.subreddit,
      title: preview.title,
      markdown: preview.markdown,
    });
    const receipt = await saveTeamDeliveryReceipt({
      ...receiptBase,
      status: 'sent',
      deliveryAttempted: true,
      destination: 'mod_discussion',
      providerReferenceId: result.conversationId,
    });
    return { preview, receipt };
  } catch (error) {
    const receipt = await saveTeamDeliveryReceipt({
      ...receiptBase,
      status: 'failed',
      deliveryAttempted: true,
      destination: 'mod_discussion',
      errorMessage:
        error instanceof Error ? error.message : 'Team delivery failed.',
    });
    return { preview, receipt };
  }
}

export async function listTeamDeliveryReceipts(
  subreddit: string,
  limit = DELIVERY_RECEIPT_LIMIT
): Promise<TeamDeliveryReceipt[]> {
  if (limit <= 0) {
    return [];
  }
  const rows = await redis.zRange(
    redisKeys.deliveryReceipts(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );

  return rows
    .map((row: { member: string }) => parseJson<TeamDeliveryReceipt>(row.member))
    .filter((receipt): receipt is TeamDeliveryReceipt => receipt !== undefined);
}

async function saveTeamDeliveryReceipt(
  input: Omit<TeamDeliveryReceipt, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  }
): Promise<TeamDeliveryReceipt> {
  const receipt: TeamDeliveryReceipt = {
    ...input,
    id: input.id ?? `delivery-${randomUUID()}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const score = Date.parse(receipt.createdAt);

  await Promise.all([
    writeJson(redisKeys.deliveryReceipt(receipt.subreddit, receipt.id), receipt),
    redis.zAdd(redisKeys.deliveryReceipts(receipt.subreddit), {
      member: serializeJson(receipt),
      score: Number.isNaN(score) ? Date.now() : score,
    }),
  ]);

  return receipt;
}

function createReceiptBase(options: {
  preview: TeamDeliveryPreview;
  requestedBy: string;
  runtimeVerified: boolean;
}): Omit<TeamDeliveryReceipt, 'id' | 'createdAt' | 'status' | 'deliveryAttempted'> {
  const receipt: Omit<
    TeamDeliveryReceipt,
    'id' | 'createdAt' | 'status' | 'deliveryAttempted'
  > = {
    subreddit: options.preview.subreddit,
    channel: options.preview.channel,
    subjectType: options.preview.subjectType,
    title: options.preview.title,
    requestedBy: options.requestedBy,
    runtimeVerified: options.runtimeVerified,
    previewMarkdown: options.preview.markdown,
  };
  if (options.preview.subjectId !== undefined) {
    receipt.subjectId = options.preview.subjectId;
  }
  return receipt;
}

function normalizePreviewRequest(
  request: TeamDeliveryPreviewRequest
): TeamDeliveryPreviewRequest {
  if (!TEAM_DELIVERY_CHANNEL_VALUES.includes(request.channel)) {
    throw new Error('Unsupported team delivery channel.');
  }
  if (!TEAM_DELIVERY_SUBJECT_TYPE_VALUES.includes(request.subjectType)) {
    throw new Error('Unsupported team delivery subject type.');
  }
  const title = request.title.trim();
  const markdown = request.markdown.trim();
  if (title.length === 0 || markdown.length === 0) {
    throw new Error('Team delivery preview requires title and markdown.');
  }
  if (title.length > 100) {
    throw new Error('Team delivery title must be 100 characters or fewer.');
  }

  const normalized: TeamDeliveryPreviewRequest = {
    ...request,
    title,
    markdown,
  };
  if (request.subjectId !== undefined && request.subjectId.trim().length > 0) {
    normalized.subjectId = request.subjectId.trim();
  }
  return normalized;
}

function getCapabilityForChannel(
  channel: TeamDeliveryChannel
): TeamDeliveryCapabilityStatus {
  const capabilities = getTeamDeliveryCapabilities();
  if (channel === 'manual_markdown') {
    return capabilities.manualMarkdown;
  }
  if (channel === 'mod_discussion') {
    return capabilities.modDiscussion;
  }
  return capabilities.scheduler;
}

function buildWarnings(
  channel: TeamDeliveryChannel,
  capability: TeamDeliveryCapabilityStatus,
  deliveryWillBeAttempted: boolean
): string[] {
  const warnings = [
    'Preview this content before any team delivery.',
    'Manual Markdown copy remains available even when delivery is unavailable.',
  ];
  if (channel === 'scheduler') {
    warnings.push('Scheduler delivery is unavailable because no job is registered.');
  }
  if (capability.state !== 'enabled') {
    warnings.push('This delivery channel is not runtime-verified in ModMirror.');
  }
  if (!deliveryWillBeAttempted) {
    warnings.push('Confirming now will store a receipt but will not send a Reddit message.');
  }
  return warnings;
}

function isLiveDeliveryEnabled(): boolean {
  return process.env.MODMIRROR_ENABLE_TEAM_DELIVERY === 'true';
}

function isRuntimeVerified(): boolean {
  return process.env.MODMIRROR_TEAM_DELIVERY_RUNTIME_VERIFIED === 'true';
}
