import { redis } from '@devvit/web/server';
import { PRIVACY_RETENTION_CATEGORY_VALUES } from '../../shared/constants';
import type {
  ActionReceipt,
  EvidenceBoardThread,
  LastScanMetadata,
  PrivacyDeletionRequest,
  PrivacyDeletionResult,
  PrivacyRetentionCategory,
  PrivacyRetentionCategoryReport,
  PrivacyRetentionExport,
  PrivacyRetentionSettings,
  PrivacyRetentionUpdateRequest,
  RetentionCleanupSmokeResult,
  TeamDeliveryReceipt,
} from '../../shared/schema';
import { listEvidenceBoards } from './evidenceBoard';
import { listActionReceipts } from './receipts';
import {
  deleteKeys,
  readJson,
  redisKeys,
  serializeJson,
  writeJson,
} from './redis';
import {
  getLastScanMetadata,
  listScanMetadata,
} from './scans';
import { listTeamDeliveryReceipts } from './teamDelivery';

const PRIVACY_LIST_LIMIT = 1000;

export type PrivacyRetentionDependencies = {
  now?: () => string;
  listScans?: (subreddit: string) => Promise<LastScanMetadata[]>;
  getLastScan?: typeof getLastScanMetadata;
  listReceipts?: (subreddit: string) => Promise<ActionReceipt[]>;
  listEvidenceBoards?: (subreddit: string) => Promise<EvidenceBoardThread[]>;
  listTeamDeliveryReceipts?: (
    subreddit: string
  ) => Promise<TeamDeliveryReceipt[]>;
  deleteKeys?: (...keys: string[]) => Promise<void>;
  zRem?: (key: string, members: string[]) => Promise<unknown>;
};

export async function getPrivacyRetentionSettings(
  subreddit: string
): Promise<PrivacyRetentionSettings> {
  return (
    (await readJson<PrivacyRetentionSettings>(
      redisKeys.privacyRetentionSettings(subreddit)
    )) ?? defaultPrivacyRetentionSettings(subreddit)
  );
}

export async function updatePrivacyRetentionSettings(options: {
  subreddit: string;
  updatedBy?: string;
  request: PrivacyRetentionUpdateRequest;
}): Promise<PrivacyRetentionSettings> {
  const current = await getPrivacyRetentionSettings(options.subreddit);
  const updated: PrivacyRetentionSettings = {
    ...current,
    updatedAt: new Date().toISOString(),
    scanHistoryDays: normalizeRetentionDays(
      options.request.scanHistoryDays,
      current.scanHistoryDays
    ),
    actionReceiptDays: normalizeRetentionDays(
      options.request.actionReceiptDays,
      current.actionReceiptDays
    ),
    evidenceBoardDays: normalizeRetentionDays(
      options.request.evidenceBoardDays,
      current.evidenceBoardDays
    ),
    teamDeliveryReceiptDays: normalizeRetentionDays(
      options.request.teamDeliveryReceiptDays,
      current.teamDeliveryReceiptDays
    ),
    aiAdvisoryLogDays: normalizeRetentionDays(
      options.request.aiAdvisoryLogDays,
      current.aiAdvisoryLogDays
    ),
    casePacketDays: normalizeRetentionDays(
      options.request.casePacketDays,
      current.casePacketDays
    ),
    protectPolicyHistory: true,
  };
  if (options.updatedBy !== undefined) {
    updated.updatedBy = options.updatedBy;
  }
  await writeJson(redisKeys.privacyRetentionSettings(options.subreddit), updated);
  return updated;
}

export async function exportPrivacyRetentionInventory(options: {
  subreddit: string;
  dependencies?: PrivacyRetentionDependencies;
}): Promise<PrivacyRetentionExport> {
  const settings = await getPrivacyRetentionSettings(options.subreddit);
  const deps = withDependencies(options.dependencies);
  const inventory = await collectInventory(options.subreddit, deps);

  return {
    subreddit: options.subreddit,
    exportedAt: deps.now(),
    settings,
    categories: buildInventoryReports(inventory),
    warnings: [
      'This privacy export is an inventory, not a private-log export.',
      'Policy history is protected and is not included in deletion controls.',
      'Case Packets and AI advisory logs are not persisted as first-class records in this build.',
    ],
  };
}

export async function deletePrivacyData(options: {
  subreddit: string;
  request: PrivacyDeletionRequest;
  dependencies?: PrivacyRetentionDependencies;
}): Promise<PrivacyDeletionResult> {
  const settings = await getPrivacyRetentionSettings(options.subreddit);
  const deps = withDependencies(options.dependencies);
  const categories = normalizeCategories(options.request.categories);
  const dryRun = options.request.dryRun ?? false;
  const expiredOnly = options.request.expiredOnly ?? false;
  if (!dryRun && options.request.confirmDeletion !== true) {
    throw new Error('Real privacy deletion requires explicit confirmation.');
  }
  const inventory = await collectInventory(options.subreddit, deps);
  const reports: PrivacyRetentionCategoryReport[] = [];

  for (const category of categories) {
    const records = selectRecordsForDeletion({
      category,
      inventory,
      settings,
      now: deps.now(),
      expiredOnly,
    });
    if (!dryRun) {
      await deleteCategoryRecords(options.subreddit, category, records, deps);
    }
    reports.push({
      category,
      retainedCount: Math.max(inventory[category].length - records.length, 0),
      deletedCount: records.length,
      protected: false,
      detail: expiredOnly
        ? 'Expired records selected by retention settings.'
        : 'Manual category deletion selected by moderator.',
    });
  }

  reports.push(policyHistoryProtectedReport());

  return {
    subreddit: options.subreddit,
    dryRun,
    deletedAt: deps.now(),
    categories: reports,
    warnings: [
      dryRun ? 'Dry run only. No keys were deleted.' : 'Selected private data keys were deleted from Redis indexes and detail records.',
      'Policy history remains protected by default.',
      'Case Packets and AI advisory logs have no persisted first-class records to delete in this build.',
    ],
  };
}

export async function cleanupExpiredPrivacyData(options: {
  subreddit: string;
  dryRun?: boolean;
  dependencies?: PrivacyRetentionDependencies;
}): Promise<PrivacyDeletionResult> {
  return deletePrivacyData({
    subreddit: options.subreddit,
    request: {
      categories: [...PRIVACY_RETENTION_CATEGORY_VALUES],
      expiredOnly: true,
      ...(options.dryRun !== undefined ? { dryRun: options.dryRun } : {}),
      ...(options.dryRun === false ? { confirmDeletion: true } : {}),
    },
    ...(options.dependencies !== undefined
      ? { dependencies: options.dependencies }
      : {}),
  });
}

export async function runRetentionCleanupSmoke(
  subreddit: string
): Promise<RetentionCleanupSmokeResult> {
  const checkedAt = new Date().toISOString();
  const oldCreatedAt = '2000-01-01T00:00:00.000Z';
  const ids = {
    scanId: 'retention-smoke-scan',
    receiptId: 'retention-smoke-receipt',
    evidenceBoardId: 'retention-smoke-board',
    deliveryReceiptId: 'retention-smoke-delivery',
  };
  const scan = syntheticScanMetadata(subreddit, ids.scanId, oldCreatedAt);
  const receipt = syntheticActionReceipt(subreddit, ids.receiptId, oldCreatedAt);
  const board = syntheticEvidenceBoard(
    subreddit,
    ids.evidenceBoardId,
    oldCreatedAt
  );
  const deliveryReceipt = syntheticTeamDeliveryReceipt(
    subreddit,
    ids.deliveryReceiptId,
    oldCreatedAt
  );
  const detailKeys = [
    redisKeys.scan(subreddit, scan.id),
    redisKeys.receipt(subreddit, receipt.id),
    redisKeys.evidenceBoard(subreddit, board.id),
    redisKeys.deliveryReceipt(subreddit, deliveryReceipt.id),
  ];
  const indexMembers = [
    {
      key: redisKeys.scans(subreddit),
      member: serializeJson(scan),
    },
    {
      key: redisKeys.scansBySource(subreddit, scan.source),
      member: serializeJson(scan),
    },
    {
      key: redisKeys.receipts(subreddit),
      member: serializeJson(receipt),
    },
    {
      key: redisKeys.receiptsByTarget(subreddit, receipt.targetThingId ?? ''),
      member: serializeJson(receipt),
    },
    {
      key: redisKeys.evidenceBoards(subreddit),
      member: serializeJson(board),
    },
    {
      key: redisKeys.deliveryReceipts(subreddit),
      member: serializeJson(deliveryReceipt),
    },
  ];

  await deleteKeys(...detailKeys);
  await Promise.all(
    indexMembers.map(({ key, member }) => redis.zRem(key, [member]))
  );

  await Promise.all([
    writeJson(redisKeys.scan(subreddit, scan.id), scan),
    redis.zAdd(redisKeys.scans(subreddit), {
      member: serializeJson(scan),
      score: Date.parse(scan.createdAt),
    }),
    redis.zAdd(redisKeys.scansBySource(subreddit, scan.source), {
      member: serializeJson(scan),
      score: Date.parse(scan.createdAt),
    }),
    writeJson(redisKeys.receipt(subreddit, receipt.id), receipt),
    redis.zAdd(redisKeys.receipts(subreddit), {
      member: serializeJson(receipt),
      score: Date.parse(receipt.createdAt),
    }),
    redis.zAdd(redisKeys.receiptsByTarget(subreddit, receipt.targetThingId ?? ''), {
      member: serializeJson(receipt),
      score: Date.parse(receipt.createdAt),
    }),
    writeJson(redisKeys.evidenceBoard(subreddit, board.id), board),
    redis.zAdd(redisKeys.evidenceBoards(subreddit), {
      member: serializeJson(board),
      score: Date.parse(board.updatedAt),
    }),
    writeJson(
      redisKeys.deliveryReceipt(subreddit, deliveryReceipt.id),
      deliveryReceipt
    ),
    redis.zAdd(redisKeys.deliveryReceipts(subreddit), {
      member: serializeJson(deliveryReceipt),
      score: Date.parse(deliveryReceipt.createdAt),
    }),
  ]);

  const deletion = await deletePrivacyData({
    subreddit,
    request: {
      categories: [
        'scan_history',
        'action_receipts',
        'evidence_boards',
        'team_delivery_receipts',
      ],
      dryRun: false,
      expiredOnly: true,
      confirmDeletion: true,
    },
    dependencies: {
      now: () => checkedAt,
      listScans: async () => [scan],
      getLastScan: async () => undefined,
      listReceipts: async () => [receipt],
      listEvidenceBoards: async () => [board],
      listTeamDeliveryReceipts: async () => [deliveryReceipt],
    },
  });

  const [detailKeysRemaining, indexScores] = await Promise.all([
    redis.exists(...detailKeys),
    Promise.all(
      indexMembers.map(({ key, member }) => redis.zScore(key, member))
    ),
  ]);
  const observed = {
    scanHistoryDeleted: deletedCount(deletion, 'scan_history'),
    actionReceiptsDeleted: deletedCount(deletion, 'action_receipts'),
    evidenceBoardsDeleted: deletedCount(deletion, 'evidence_boards'),
    teamDeliveryReceiptsDeleted: deletedCount(
      deletion,
      'team_delivery_receipts'
    ),
    detailKeysRemaining,
    indexReferencesRemaining: indexScores.filter((score) => score !== undefined)
      .length,
  };
  const expected = {
    scanHistoryDeleted: 1,
    actionReceiptsDeleted: 1,
    evidenceBoardsDeleted: 1,
    teamDeliveryReceiptsDeleted: 1,
  };

  return {
    subreddit,
    syntheticIds: ids,
    expected,
    observed,
    ok:
      observed.scanHistoryDeleted === expected.scanHistoryDeleted &&
      observed.actionReceiptsDeleted === expected.actionReceiptsDeleted &&
      observed.evidenceBoardsDeleted === expected.evidenceBoardsDeleted &&
      observed.teamDeliveryReceiptsDeleted ===
        expected.teamDeliveryReceiptsDeleted &&
      observed.detailKeysRemaining === 0 &&
      observed.indexReferencesRemaining === 0,
  };
}

function defaultPrivacyRetentionSettings(
  subreddit: string
): PrivacyRetentionSettings {
  return {
    subreddit,
    updatedAt: new Date(0).toISOString(),
    scanHistoryDays: 90,
    actionReceiptDays: 180,
    evidenceBoardDays: 365,
    teamDeliveryReceiptDays: 180,
    aiAdvisoryLogDays: 30,
    casePacketDays: 180,
    protectPolicyHistory: true,
  };
}

function normalizeRetentionDays(value: number | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isFinite(value)) {
    throw new Error('Retention days must be finite numbers.');
  }
  return Math.min(Math.max(Math.floor(value), 1), 3650);
}

type PrivacyInventory = {
  scan_history: LastScanMetadata[];
  action_receipts: ActionReceipt[];
  evidence_boards: EvidenceBoardThread[];
  team_delivery_receipts: TeamDeliveryReceipt[];
  case_packets: [];
  ai_advisory_logs: [];
};

async function collectInventory(
  subreddit: string,
  deps: Required<PrivacyRetentionDependencies>
): Promise<PrivacyInventory> {
  const [scans, receipts, boards, deliveryReceipts] = await Promise.all([
    deps.listScans(subreddit),
    deps.listReceipts(subreddit),
    deps.listEvidenceBoards(subreddit),
    deps.listTeamDeliveryReceipts(subreddit),
  ]);

  return {
    scan_history: scans,
    action_receipts: receipts,
    evidence_boards: boards,
    team_delivery_receipts: deliveryReceipts,
    case_packets: [],
    ai_advisory_logs: [],
  };
}

function buildInventoryReports(
  inventory: PrivacyInventory
): PrivacyRetentionCategoryReport[] {
  return [
    ...PRIVACY_RETENTION_CATEGORY_VALUES.map((category) => ({
      category,
      retainedCount: inventory[category].length,
      deletedCount: 0,
      protected: false,
      detail:
        category === 'case_packets' || category === 'ai_advisory_logs'
          ? 'No persisted first-class records in this build.'
          : 'Retained records currently visible to privacy controls.',
    })),
    policyHistoryProtectedReport(),
  ];
}

function selectRecordsForDeletion(options: {
  category: PrivacyRetentionCategory;
  inventory: PrivacyInventory;
  settings: PrivacyRetentionSettings;
  now: string;
  expiredOnly: boolean;
}): PrivacyInventory[PrivacyRetentionCategory] {
  const records = options.inventory[options.category];
  if (!options.expiredOnly) {
    return records;
  }
  const cutoff = retentionCutoff(options.settings, options.category, options.now);
  return records.filter((record) => {
    const createdAt = getRecordTimestamp(options.category, record);
    return createdAt !== undefined && Date.parse(createdAt) < cutoff;
  }) as PrivacyInventory[PrivacyRetentionCategory];
}

function retentionCutoff(
  settings: PrivacyRetentionSettings,
  category: PrivacyRetentionCategory,
  now: string
): number {
  const days = {
    scan_history: settings.scanHistoryDays,
    action_receipts: settings.actionReceiptDays,
    evidence_boards: settings.evidenceBoardDays,
    team_delivery_receipts: settings.teamDeliveryReceiptDays,
    case_packets: settings.casePacketDays,
    ai_advisory_logs: settings.aiAdvisoryLogDays,
  }[category];
  return Date.parse(now) - days * 24 * 60 * 60 * 1000;
}

function getRecordTimestamp(
  category: PrivacyRetentionCategory,
  record: LastScanMetadata | ActionReceipt | EvidenceBoardThread | TeamDeliveryReceipt
): string | undefined {
  if (category === 'evidence_boards') {
    return (record as EvidenceBoardThread).updatedAt;
  }
  return (record as { createdAt?: string }).createdAt;
}

async function deleteCategoryRecords(
  subreddit: string,
  category: PrivacyRetentionCategory,
  records: PrivacyInventory[PrivacyRetentionCategory],
  deps: Required<PrivacyRetentionDependencies>
): Promise<void> {
  if (records.length === 0) {
    return;
  }

  if (category === 'scan_history') {
    await deleteScans(subreddit, records as LastScanMetadata[], deps);
  } else if (category === 'action_receipts') {
    await deleteReceipts(subreddit, records as ActionReceipt[], deps);
  } else if (category === 'evidence_boards') {
    await deleteEvidenceBoards(subreddit, records as EvidenceBoardThread[], deps);
  } else if (category === 'team_delivery_receipts') {
    await deleteTeamDeliveryReceipts(
      subreddit,
      records as TeamDeliveryReceipt[],
      deps
    );
  }
}

async function deleteScans(
  subreddit: string,
  scans: LastScanMetadata[],
  deps: Required<PrivacyRetentionDependencies>
): Promise<void> {
  const detailKeys = scans.map((scan) => redisKeys.scan(subreddit, scan.id));
  const lastScan = await deps.getLastScan(subreddit);
  if (lastScan !== undefined && scans.some((scan) => scan.id === lastScan.id)) {
    detailKeys.push(redisKeys.scanLast(subreddit));
  }
  await deps.deleteKeys(...detailKeys);
  await removeFromSortedSet(
    deps,
    redisKeys.scans(subreddit),
    scans.map((scan) => serializeJson(scan))
  );
  for (const source of ['live', 'demo'] as const) {
    await removeFromSortedSet(
      deps,
      redisKeys.scansBySource(subreddit, source),
      scans
        .filter((scan) => scan.source === source)
        .map((scan) => serializeJson(scan))
    );
  }
}

async function deleteReceipts(
  subreddit: string,
  receipts: ActionReceipt[],
  deps: Required<PrivacyRetentionDependencies>
): Promise<void> {
  await deps.deleteKeys(
    ...receipts.map((receipt) => redisKeys.receipt(subreddit, receipt.id))
  );
  await removeFromSortedSet(
    deps,
    redisKeys.receipts(subreddit),
    receipts.map((receipt) => serializeJson(receipt))
  );
  for (const receipt of receipts) {
    if (receipt.targetThingId !== undefined) {
      await removeFromSortedSet(
        deps,
        redisKeys.receiptsByTarget(subreddit, receipt.targetThingId),
        [serializeJson(receipt)]
      );
    }
  }
}

async function deleteEvidenceBoards(
  subreddit: string,
  boards: EvidenceBoardThread[],
  deps: Required<PrivacyRetentionDependencies>
): Promise<void> {
  await deps.deleteKeys(
    ...boards.map((board) => redisKeys.evidenceBoard(subreddit, board.id))
  );
  await removeFromSortedSet(
    deps,
    redisKeys.evidenceBoards(subreddit),
    boards.map((board) => serializeJson(board))
  );
}

async function deleteTeamDeliveryReceipts(
  subreddit: string,
  receipts: TeamDeliveryReceipt[],
  deps: Required<PrivacyRetentionDependencies>
): Promise<void> {
  await deps.deleteKeys(
    ...receipts.map((receipt) => redisKeys.deliveryReceipt(subreddit, receipt.id))
  );
  await removeFromSortedSet(
    deps,
    redisKeys.deliveryReceipts(subreddit),
    receipts.map((receipt) => serializeJson(receipt))
  );
}

async function removeFromSortedSet(
  deps: Required<PrivacyRetentionDependencies>,
  key: string,
  members: string[]
): Promise<void> {
  if (members.length === 0) {
    return;
  }
  await deps.zRem(key, members);
}

function normalizeCategories(
  categories: PrivacyRetentionCategory[] | undefined
): PrivacyRetentionCategory[] {
  if (categories === undefined || categories.length === 0) {
    return [...PRIVACY_RETENTION_CATEGORY_VALUES];
  }
  const unique = new Set<PrivacyRetentionCategory>();
  for (const category of categories) {
    if (!PRIVACY_RETENTION_CATEGORY_VALUES.includes(category)) {
      throw new Error(`Unsupported privacy deletion category: ${category}`);
    }
    unique.add(category);
  }
  return [...unique];
}

function policyHistoryProtectedReport(): PrivacyRetentionCategoryReport {
  return {
    category: 'policy_history',
    retainedCount: 0,
    deletedCount: 0,
    protected: true,
    detail: 'Policy versions and policy change history are protected by default.',
  };
}

function deletedCount(
  deletion: PrivacyDeletionResult,
  category: PrivacyRetentionCategory
): number {
  return (
    deletion.categories.find((report) => report.category === category)
      ?.deletedCount ?? 0
  );
}

function syntheticScanMetadata(
  subreddit: string,
  id: string,
  createdAt: string
): LastScanMetadata {
  return {
    id,
    subreddit,
    createdAt,
    createdBy: 'retention_smoke',
    source: 'live',
    totalActionsScanned: 1,
    attributedCount: 1,
    unmatchedCount: 0,
    confidenceBreakdown: {
      high: 1,
      medium: 0,
      low: 0,
      unmatched: 0,
    },
    driftCandidateCount: 0,
  };
}

function syntheticActionReceipt(
  subreddit: string,
  id: string,
  createdAt: string
): ActionReceipt {
  return {
    id,
    actionEventId: `action-${id}`,
    subreddit,
    targetThingId: 't3_retention_smoke',
    targetType: 'post',
    targetSnapshot: {
      targetThingId: 't3_retention_smoke',
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    modUsername: 'retention_smoke',
    source: 'dashboard',
    recommendation: {
      ruleKey: 'retention-smoke-rule',
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: false,
      selectedAction: 'warn',
      deviatesFromPolicy: false,
      fallbackReason: 'policy_found',
      message: 'Synthetic retention cleanup smoke receipt.',
    },
    selectedAction: 'warn',
    deviatesFromPolicy: false,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt,
  };
}

function syntheticEvidenceBoard(
  subreddit: string,
  id: string,
  updatedAt: string
): EvidenceBoardThread {
  return {
    id,
    subreddit,
    title: 'Retention cleanup smoke',
    status: 'open',
    subject: {
      policyId: 'retention-smoke-policy',
    },
    evidence: [],
    statusHistory: [
      {
        toStatus: 'open',
        changedAt: updatedAt,
      },
    ],
    createdAt: updatedAt,
    updatedAt,
  };
}

function syntheticTeamDeliveryReceipt(
  subreddit: string,
  id: string,
  createdAt: string
): TeamDeliveryReceipt {
  return {
    id,
    subreddit,
    channel: 'manual_markdown',
    subjectType: 'digest',
    title: 'Retention cleanup smoke',
    status: 'manual_ready',
    requestedBy: 'retention_smoke',
    createdAt,
    deliveryAttempted: false,
    runtimeVerified: false,
    previewMarkdown: '# Retention cleanup smoke',
  };
}

function withDependencies(
  dependencies: PrivacyRetentionDependencies | undefined
): Required<PrivacyRetentionDependencies> {
  return {
    now: dependencies?.now ?? (() => new Date().toISOString()),
    listScans:
      dependencies?.listScans ??
      ((subreddit) => listScanMetadata(subreddit, { limit: PRIVACY_LIST_LIMIT })),
    getLastScan: dependencies?.getLastScan ?? getLastScanMetadata,
    listReceipts:
      dependencies?.listReceipts ??
      ((subreddit) => listActionReceipts(subreddit, PRIVACY_LIST_LIMIT)),
    listEvidenceBoards:
      dependencies?.listEvidenceBoards ??
      ((subreddit) => listEvidenceBoards(subreddit, PRIVACY_LIST_LIMIT)),
    listTeamDeliveryReceipts:
      dependencies?.listTeamDeliveryReceipts ??
      ((subreddit) => listTeamDeliveryReceipts(subreddit, PRIVACY_LIST_LIMIT)),
    deleteKeys: dependencies?.deleteKeys ?? deleteKeys,
    zRem: dependencies?.zRem ?? ((key, members) => redis.zRem(key, members)),
  };
}
