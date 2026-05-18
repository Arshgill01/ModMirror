import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import {
  EVIDENCE_BOARD_EVIDENCE_SOURCE_VALUES,
  EVIDENCE_BOARD_STATUS_VALUES,
} from '../../shared/constants';
import type {
  ActionReceipt,
  CasePacket,
  ComparableCase,
  ContentSnapshot,
  EvidenceBoardCreateRequest,
  EvidenceBoardEvidenceItem,
  EvidenceBoardEvidencePrivacy,
  EvidenceBoardEvidenceSource,
  EvidenceBoardSourceRef,
  EvidenceBoardStatus,
  EvidenceBoardStatusChange,
  EvidenceBoardStatusUpdateRequest,
  EvidenceBoardSubject,
  EvidenceBoardThread,
  OverrideEvent,
  PolicyChangeEvent,
} from '../../shared/schema';
import { getOverrideEvent } from './audit';
import { listPolicyChangeEvents } from './policies';
import { getActionReceipt } from './receipts';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';

export type EvidenceBoardDependencies = {
  getReceipt?: typeof getActionReceipt;
  getOverride?: typeof getOverrideEvent;
  listPolicyChanges?: typeof listPolicyChangeEvents;
};

export type CreateEvidenceBoardOptions = {
  request: EvidenceBoardCreateRequest;
  subreddit: string;
  createdBy?: string;
  dependencies?: EvidenceBoardDependencies;
};

export type UpdateEvidenceBoardStatusOptions = {
  subreddit: string;
  boardId: string;
  request: EvidenceBoardStatusUpdateRequest;
  changedBy?: string;
};

const BOARD_LIST_LIMIT = 25;
const EVIDENCE_SUMMARY_LIMIT = 220;
const TITLE_LIMIT = 120;

export async function createEvidenceBoard(
  options: CreateEvidenceBoardOptions
): Promise<EvidenceBoardThread> {
  const request = normalizeCreateRequest(options.request);
  const now = new Date().toISOString();
  const subject = buildSubject(request);
  const evidence = await collectEvidence({
    subreddit: options.subreddit,
    request,
    dependencies: options.dependencies,
  });
  const initialStatus: EvidenceBoardStatus = 'open';
  const board: EvidenceBoardThread = {
    id: `evidence-board-${randomUUID()}`,
    subreddit: options.subreddit,
    title: request.title,
    status: initialStatus,
    subject,
    evidence,
    statusHistory: [
      buildStatusChange({
        toStatus: initialStatus,
        changedAt: now,
        changedBy: options.createdBy,
        note: request.note,
      }),
    ],
    createdAt: now,
    updatedAt: now,
  };
  if (options.createdBy !== undefined) {
    board.createdBy = options.createdBy;
  }

  await saveEvidenceBoard(board);
  return board;
}

export async function listEvidenceBoards(
  subreddit: string,
  limit = BOARD_LIST_LIMIT
): Promise<EvidenceBoardThread[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(
    redisKeys.evidenceBoards(subreddit),
    0,
    limit - 1,
    {
      by: 'rank',
      reverse: true,
    }
  );
  const boards = rows
    .map((row: { member: string }) => parseJson<EvidenceBoardThread>(row.member))
    .filter((board): board is EvidenceBoardThread => board !== undefined);
  const byId = new Map<string, EvidenceBoardThread>();
  for (const board of boards) {
    if (!byId.has(board.id)) {
      byId.set(board.id, board);
    }
  }

  return [...byId.values()].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  );
}

export async function getEvidenceBoard(
  subreddit: string,
  boardId: string
): Promise<EvidenceBoardThread | undefined> {
  return readJson<EvidenceBoardThread>(
    redisKeys.evidenceBoard(subreddit, boardId)
  );
}

export async function updateEvidenceBoardStatus(
  options: UpdateEvidenceBoardStatusOptions
): Promise<EvidenceBoardThread | undefined> {
  validateEvidenceBoardStatus(options.request.status);
  const board = await getEvidenceBoard(options.subreddit, options.boardId);
  if (board === undefined) {
    return undefined;
  }

  const now = new Date().toISOString();
  const updated: EvidenceBoardThread = {
    ...board,
    status: options.request.status,
    updatedAt: now,
    statusHistory: [
      ...board.statusHistory,
      buildStatusChange({
        fromStatus: board.status,
        toStatus: options.request.status,
        changedAt: now,
        changedBy: options.changedBy,
        note: options.request.note,
      }),
    ],
  };

  await saveEvidenceBoard(updated);
  return updated;
}

export function validateEvidenceBoardStatus(
  status: string
): asserts status is EvidenceBoardStatus {
  if (!EVIDENCE_BOARD_STATUS_VALUES.includes(status as EvidenceBoardStatus)) {
    throw new Error('Invalid evidence board status.');
  }
}

function normalizeCreateRequest(
  request: EvidenceBoardCreateRequest
): EvidenceBoardCreateRequest {
  const title = request.title.trim();
  if (title.length === 0) {
    throw new Error('Evidence board title is required.');
  }
  if (title.length > TITLE_LIMIT) {
    throw new Error(`Evidence board title must be ${TITLE_LIMIT} characters or fewer.`);
  }

  return {
    ...request,
    title,
    sourceRefs: normalizeSourceRefs(request.sourceRefs ?? []),
  };
}

function normalizeSourceRefs(
  refs: EvidenceBoardSourceRef[]
): EvidenceBoardSourceRef[] {
  const normalized: EvidenceBoardSourceRef[] = [];
  const seen = new Set<string>();
  for (const ref of refs) {
    if (!EVIDENCE_BOARD_EVIDENCE_SOURCE_VALUES.includes(ref.source)) {
      throw new Error('Unsupported evidence source.');
    }
    if (ref.id.trim().length === 0) {
      throw new Error('Evidence source ID is required.');
    }
    const key = `${ref.source}:${ref.policyId ?? ''}:${ref.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const normalizedRef: EvidenceBoardSourceRef = {
      source: ref.source,
      id: ref.id.trim(),
    };
    if (ref.policyId !== undefined && ref.policyId.trim().length > 0) {
      normalizedRef.policyId = ref.policyId.trim();
    }
    normalized.push(normalizedRef);
  }
  return normalized;
}

function buildSubject(request: EvidenceBoardCreateRequest): EvidenceBoardSubject {
  const subject: EvidenceBoardSubject = {
    ...(request.subject ?? {}),
  };
  const packet = request.casePacket;
  if (packet !== undefined) {
    subject.casePacketId = packet.id;
    if (packet.action?.targetThingId !== undefined) {
      subject.targetThingId = packet.action.targetThingId;
    }
    if (packet.policyContext.ruleKey !== undefined) {
      subject.ruleKey = packet.policyContext.ruleKey;
    }
    if (packet.policyContext.policyId !== undefined) {
      subject.policyId = packet.policyContext.policyId;
    }
    if (packet.policyContext.policyVersionId !== undefined) {
      subject.policyVersionId = packet.policyContext.policyVersionId;
    }
    if (packet.action?.receiptId !== undefined) {
      subject.receiptId = packet.action.receiptId;
    }
  }
  return subject;
}

async function collectEvidence(options: {
  subreddit: string;
  request: EvidenceBoardCreateRequest;
  dependencies?: EvidenceBoardDependencies | undefined;
}): Promise<EvidenceBoardEvidenceItem[]> {
  const evidence: EvidenceBoardEvidenceItem[] = [];
  const dependencies = {
    getReceipt: options.dependencies?.getReceipt ?? getActionReceipt,
    getOverride: options.dependencies?.getOverride ?? getOverrideEvent,
    listPolicyChanges:
      options.dependencies?.listPolicyChanges ?? listPolicyChangeEvents,
  };

  for (const ref of options.request.sourceRefs ?? []) {
    if (ref.source === 'receipt') {
      const receipt = await dependencies.getReceipt(options.subreddit, ref.id);
      if (receipt !== undefined) {
        evidence.push(...buildReceiptEvidence(receipt));
        if (receipt.overrideEventId !== undefined) {
          const override = await dependencies.getOverride(
            options.subreddit,
            receipt.overrideEventId
          );
          if (override !== undefined) {
            evidence.push(buildOverrideEvidence(override));
          }
        }
      }
    }
    if (ref.source === 'override') {
      const override = await dependencies.getOverride(options.subreddit, ref.id);
      if (override !== undefined) {
        evidence.push(buildOverrideEvidence(override));
      }
    }
    if (ref.source === 'policy_change' && ref.policyId !== undefined) {
      const changes = await dependencies.listPolicyChanges(
        options.subreddit,
        ref.policyId
      );
      const change = changes.find((item) => item.id === ref.id);
      if (change !== undefined) {
        evidence.push(buildPolicyChangeEvidence(change));
      }
    }
  }

  if (options.request.casePacket !== undefined) {
    evidence.push(...buildCasePacketEvidence(options.request.casePacket));
  }

  return dedupeEvidence(evidence);
}

function buildReceiptEvidence(receipt: ActionReceipt): EvidenceBoardEvidenceItem[] {
  const items = [
    evidenceItem({
      source: 'receipt',
      sourceId: receipt.id,
      label: 'Action receipt',
      summary: `${receipt.recommendation.ruleName ?? receipt.recommendation.ruleKey}: recommended ${receipt.recommendation.recommendedAction}, selected ${receipt.selectedAction}, execution ${receipt.executionResult}.`,
      occurredAt: receipt.createdAt,
      privacy: privacySummary({
        sourceContainsAuthor: receipt.targetSnapshot.authorName !== undefined,
        redactionNotes: [
          'Moderator username and target author are not copied into the board summary.',
          'Receipt remains the source of truth for full audit fields.',
        ],
      }),
    }),
  ];

  if (receipt.contentSnapshot !== undefined) {
    items.push(buildContentSnapshotEvidence(receipt.contentSnapshot, receipt.id));
  }

  return items;
}

function buildContentSnapshotEvidence(
  snapshot: ContentSnapshot,
  sourceId: string
): EvidenceBoardEvidenceItem {
  const excerpt =
    snapshot.titleExcerpt ?? snapshot.bodyExcerpt ?? 'No content excerpt copied.';
  return evidenceItem({
    source: 'content_snapshot',
    sourceId,
    label: 'Content snapshot',
    summary: `Snapshot ${snapshot.fetchStatus}: ${truncateSummary(excerpt)}`,
    occurredAt: snapshot.fetchedAt,
    privacy: privacySummary({
      sourceContainsAuthor: snapshot.authorName !== undefined,
      contentExcerptCopiedToBoard:
        snapshot.titleExcerpt !== undefined || snapshot.bodyExcerpt !== undefined,
      redactionNotes: [
        'Only a bounded excerpt is copied to the board.',
        ...snapshot.privacy.redactionNotes,
      ],
    }),
  });
}

function buildOverrideEvidence(override: OverrideEvent): EvidenceBoardEvidenceItem {
  return evidenceItem({
    source: 'override',
    sourceId: override.id,
    label: 'Override review',
    summary: `${override.ruleName ?? override.ruleKey}: selected ${override.selectedAction} over ${override.recommendedAction}; reason ${override.overrideReason}; review ${override.reviewStatus}.`,
    occurredAt: override.createdAt,
    privacy: privacySummary({
      sourceContainsAuthor: override.targetAuthor !== undefined,
      redactionNotes: [
        'Moderator username and target author are not copied into the board summary.',
      ],
    }),
  });
}

function buildCasePacketEvidence(packet: CasePacket): EvidenceBoardEvidenceItem[] {
  const items: EvidenceBoardEvidenceItem[] = [
    evidenceItem({
      source: 'case_packet',
      sourceId: packet.id,
      label: 'Case packet',
      summary: `${packet.packetType}: ${packet.consistencyStatus}; posture ${packet.appealPosture}; ${packet.evidence.length} evidence labels.`,
      occurredAt: packet.generatedAt,
      privacy: privacySummary({
        sourceContainsAuthor: packet.action?.targetAuthor !== undefined,
        redactionNotes: [
          'Case Packet Markdown remains separate; the board stores a short packet summary and source ID.',
        ],
      }),
    }),
  ];

  for (const comparable of packet.comparableCases.slice(0, 5)) {
    items.push(buildComparableEvidence(comparable));
  }

  return items;
}

function buildComparableEvidence(
  comparable: ComparableCase
): EvidenceBoardEvidenceItem {
  return evidenceItem({
    source: 'comparable_case',
    sourceId: comparable.receiptId ?? comparable.actionId,
    label: 'Comparable case',
    summary: `${comparable.ruleName ?? comparable.ruleKey ?? 'Rule unavailable'}: selected ${comparable.selectedAction ?? 'unknown'}; matched by ${comparable.matchReasons.join(', ')}.`,
    occurredAt: comparable.createdAt,
    privacy: privacySummary({
      sourceContainsAuthor: comparable.anonymizedTargetAuthor !== undefined,
      redactionNotes: ['Comparable authors stay anonymized in board summaries.'],
    }),
  });
}

function buildPolicyChangeEvidence(
  change: PolicyChangeEvent
): EvidenceBoardEvidenceItem {
  return evidenceItem({
    source: 'policy_change',
    sourceId: change.id,
    label: 'Policy change',
    summary: `${change.ruleName}: ${change.changeType} version ${change.policyVersionNumber}${change.changeSummary ? ` - ${change.changeSummary}` : ''}.`,
    occurredAt: change.changedAt,
    privacy: privacySummary({
      redactionNotes: [
        'Policy change summaries do not include target users or moderation subjects.',
      ],
    }),
  });
}

function evidenceItem(options: {
  source: EvidenceBoardEvidenceSource;
  sourceId?: string;
  label: string;
  summary: string;
  occurredAt?: string;
  privacy: EvidenceBoardEvidencePrivacy;
}): EvidenceBoardEvidenceItem {
  const item: EvidenceBoardEvidenceItem = {
    id: `evidence-${randomUUID()}`,
    source: options.source,
    label: options.label,
    summary: truncateSummary(options.summary),
    addedAt: new Date().toISOString(),
    privacy: options.privacy,
  };
  if (options.sourceId !== undefined) {
    item.sourceId = options.sourceId;
  }
  if (options.occurredAt !== undefined) {
    item.occurredAt = options.occurredAt;
  }
  return item;
}

function privacySummary(options: {
  sourceContainsAuthor?: boolean;
  contentExcerptCopiedToBoard?: boolean;
  redactionNotes: string[];
}): EvidenceBoardEvidencePrivacy {
  return {
    sourceContainsAuthor: options.sourceContainsAuthor ?? false,
    authorCopiedToBoard: false,
    contentExcerptCopiedToBoard: options.contentExcerptCopiedToBoard ?? false,
    moderatorNameCopiedToBoard: false,
    retentionCategory: 'moderation_evidence',
    redactionNotes: options.redactionNotes,
  };
}

function buildStatusChange(options: {
  fromStatus?: EvidenceBoardStatus | undefined;
  toStatus: EvidenceBoardStatus;
  changedAt: string;
  changedBy?: string | undefined;
  note?: string | undefined;
}): EvidenceBoardStatusChange {
  const change: EvidenceBoardStatusChange = {
    toStatus: options.toStatus,
    changedAt: options.changedAt,
  };
  if (options.fromStatus !== undefined) {
    change.fromStatus = options.fromStatus;
  }
  if (options.changedBy !== undefined) {
    change.changedBy = options.changedBy;
  }
  if (options.note !== undefined && options.note.trim().length > 0) {
    change.note = options.note.trim();
  }
  return change;
}

function dedupeEvidence(
  evidence: EvidenceBoardEvidenceItem[]
): EvidenceBoardEvidenceItem[] {
  const seen = new Set<string>();
  const deduped: EvidenceBoardEvidenceItem[] = [];
  for (const item of evidence) {
    const key = `${item.source}:${item.sourceId ?? item.summary}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
}

async function saveEvidenceBoard(board: EvidenceBoardThread): Promise<void> {
  const score = Date.parse(board.updatedAt);
  await Promise.all([
    writeJson(redisKeys.evidenceBoard(board.subreddit, board.id), board),
    redis.zAdd(redisKeys.evidenceBoards(board.subreddit), {
      member: serializeJson(board),
      score: Number.isNaN(score) ? Date.now() : score,
    }),
  ]);
}

function truncateSummary(summary: string): string {
  if (summary.length <= EVIDENCE_SUMMARY_LIMIT) {
    return summary;
  }
  return `${summary.slice(0, EVIDENCE_SUMMARY_LIMIT - 3).trimEnd()}...`;
}
