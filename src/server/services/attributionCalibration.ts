import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import type {
  AttributionCorrection,
  AttributionCorrectionInput,
  AttributionCorrectionSnapshot,
  AttributionResult,
  AttributedModAction,
  NormalizedModAction,
} from '../../shared/schema';
import { parseJson, redisKeys, serializeJson } from './redis';

export type AttributionCorrectionIndex = {
  byActionId: Map<string, AttributionCorrection>;
  byTargetThingId: Map<string, AttributionCorrection>;
};

export async function saveAttributionCorrection(
  input: AttributionCorrectionInput
): Promise<AttributionCorrection> {
  const correction = normalizeCorrectionInput(input);
  const score = Date.parse(correction.correctedAt);

  await Promise.all([
    redis.hSet(redisKeys.attributionCorrections(correction.subreddit), {
      [correction.actionId]: serializeJson(correction),
    }),
    redis.zAdd(redisKeys.attributionCorrectionHistory(correction.subreddit), {
      member: serializeJson(correction),
      score: Number.isNaN(score) ? Date.now() : score,
    }),
  ]);

  return correction;
}

export async function listAttributionCorrections(
  subreddit: string
): Promise<AttributionCorrection[]> {
  const rows = await redis.hGetAll(redisKeys.attributionCorrections(subreddit));
  return Object.values(rows as Record<string, string>)
    .map((value) => parseJson<AttributionCorrection>(value))
    .filter((correction): correction is AttributionCorrection => correction !== undefined);
}

export function createAttributionCorrectionIndex(
  corrections: AttributionCorrection[]
): AttributionCorrectionIndex {
  const byActionId = new Map<string, AttributionCorrection>();
  const byTargetThingId = new Map<string, AttributionCorrection>();

  for (const correction of corrections) {
    byActionId.set(correction.actionId, correction);
    if (
      correction.targetThingId !== undefined &&
      isContentThingId(correction.targetThingId)
    ) {
      byTargetThingId.set(correction.targetThingId, correction);
    }
  }

  return { byActionId, byTargetThingId };
}

export function applyAttributionCorrectionsToStoredActions(
  actions: AttributedModAction[],
  corrections: AttributionCorrection[]
): AttributedModAction[] {
  if (corrections.length === 0) {
    return actions;
  }

  const correctionIndex = createAttributionCorrectionIndex(corrections);
  return actions.map((action) =>
    applyStoredAttributionCorrection(action, correctionIndex)
  );
}

export function applyAttributionCorrection(
  action: NormalizedModAction,
  result: AttributionResult,
  correctionIndex?: AttributionCorrectionIndex
): AttributionResult {
  if (correctionIndex === undefined || action.directRuleKey !== undefined) {
    return result;
  }

  const correction =
    correctionIndex.byActionId.get(action.id) ??
    (action.targetThingId === undefined
      ? undefined
      : correctionIndex.byTargetThingId.get(action.targetThingId));

  if (correction === undefined) {
    return result;
  }

  const corrected: AttributionResult = {
    actionId: action.id,
    inferredRuleKey: correction.correctedRuleKey,
    confidence: 'high',
    score: 1,
    attributionKind: 'corrected',
    correction: toCorrectionSnapshot(correction, result),
    evidence: [
      `Moderator correction applied by ${correction.correctedBy}.`,
      `Original attribution was ${formatOriginalAttribution(result)}.`,
      ...result.evidence,
    ],
  };
  if (correction.correctedRuleName !== undefined) {
    corrected.inferredRuleName = correction.correctedRuleName;
  }

  return corrected;
}

function normalizeCorrectionInput(
  input: AttributionCorrectionInput
): AttributionCorrection {
  const correctedRuleKey = input.correctedRuleKey.trim();
  if (!correctedRuleKey) {
    throw new Error('correctedRuleKey is required');
  }

  const correction: AttributionCorrection = {
    id: `attr-correction-${randomUUID()}`,
    subreddit: input.subreddit,
    actionId: input.actionId,
    originalConfidence: input.originalConfidence,
    correctedRuleKey,
    correctedBy: input.correctedBy,
    correctedAt: new Date().toISOString(),
  };

  copyString(input.targetThingId, (value) => {
    if (!isContentThingId(value)) {
      return;
    }
    correction.targetThingId = value;
  });
  copyString(input.sourceScanId, (value) => {
    correction.sourceScanId = value;
  });
  copyString(input.originalRuleKey, (value) => {
    correction.originalRuleKey = value;
  });
  copyString(input.originalRuleName, (value) => {
    correction.originalRuleName = value;
  });
  copyString(input.correctedRuleName, (value) => {
    correction.correctedRuleName = value;
  });
  copyString(input.note, (value) => {
    correction.note = value;
  });

  return correction;
}

function applyStoredAttributionCorrection(
  action: AttributedModAction,
  correctionIndex: AttributionCorrectionIndex
): AttributedModAction {
  if (action.attributionKind === 'direct') {
    return action;
  }

  const correction =
    correctionIndex.byActionId.get(action.id) ??
    (action.targetThingId === undefined
      ? undefined
      : correctionIndex.byTargetThingId.get(action.targetThingId));
  if (correction === undefined) {
    return action;
  }

  const originalConfidence =
    action.correction?.originalConfidence ?? action.confidence;
  const originalRuleKey =
    action.correction?.originalRuleKey ??
    action.inferredRuleKey ??
    correction.originalRuleKey;
  const originalRuleName =
    action.correction?.originalRuleName ??
    action.inferredRuleName ??
    correction.originalRuleName;

  const corrected: AttributedModAction = {
    ...action,
    inferredRuleKey: correction.correctedRuleKey,
    confidence: 'high',
    attributionKind: 'corrected',
    correction: {
      correctionId: correction.id,
      correctedRuleKey: correction.correctedRuleKey,
      correctedBy: correction.correctedBy,
      correctedAt: correction.correctedAt,
      originalConfidence,
    },
    evidence: [
      `Moderator correction applied by ${correction.correctedBy}.`,
      `Original attribution was ${formatOriginalStoredAttribution(
        originalRuleName ?? originalRuleKey,
        originalConfidence
      )}.`,
      ...action.evidence,
    ],
  };

  copyString(correction.correctedRuleName, (value) => {
    corrected.inferredRuleName = value;
    corrected.correction!.correctedRuleName = value;
  });
  copyString(originalRuleKey, (value) => {
    corrected.correction!.originalRuleKey = value;
  });
  copyString(originalRuleName, (value) => {
    corrected.correction!.originalRuleName = value;
  });
  copyString(correction.note, (value) => {
    corrected.correction!.note = value;
  });

  return corrected;
}

function toCorrectionSnapshot(
  correction: AttributionCorrection,
  originalResult: AttributionResult
): AttributionCorrectionSnapshot {
  const snapshot: AttributionCorrectionSnapshot = {
    correctionId: correction.id,
    correctedRuleKey: correction.correctedRuleKey,
    correctedBy: correction.correctedBy,
    correctedAt: correction.correctedAt,
    originalConfidence: originalResult.confidence,
  };

  copyString(correction.correctedRuleName, (value) => {
    snapshot.correctedRuleName = value;
  });
  copyString(originalResult.inferredRuleKey ?? correction.originalRuleKey, (value) => {
    snapshot.originalRuleKey = value;
  });
  copyString(originalResult.inferredRuleName ?? correction.originalRuleName, (value) => {
    snapshot.originalRuleName = value;
  });
  copyString(correction.note, (value) => {
    snapshot.note = value;
  });

  return snapshot;
}

function formatOriginalAttribution(result: AttributionResult): string {
  const rule = result.inferredRuleName ?? result.inferredRuleKey ?? 'unmatched';
  return `${rule} (${result.confidence})`;
}

function formatOriginalStoredAttribution(
  rule: string | undefined,
  confidence: AttributedModAction['confidence']
): string {
  return `${rule ?? 'unmatched'} (${confidence})`;
}

function copyString(
  value: string | undefined,
  assign: (value: string) => void
): void {
  const trimmed = value?.trim();
  if (trimmed) {
    assign(trimmed);
  }
}

function isContentThingId(value: string): boolean {
  return value.startsWith('t1_') || value.startsWith('t3_');
}
