import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import type {
  ActionEvent,
  ActionReceipt,
  ActionReceiptSource,
  ApplyPolicyConfirmInput,
  ApplyPolicyPreview,
  ApplyPolicySource,
  ModerationExecutionResult,
  NativeModNoteAttempt,
  OverrideEvent,
} from '../../shared/schema';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';

export type ActionReceiptInput = Omit<ActionReceipt, 'id' | 'createdAt'> & {
  id?: string;
  createdAt?: string;
};

export function createActionReceiptInput(options: {
  preview: ApplyPolicyPreview;
  input: ApplyPolicyConfirmInput;
  actionEvent: ActionEvent;
  execution: ModerationExecutionResult;
  nativeModNote?: NativeModNoteAttempt;
  overrideEvent?: OverrideEvent;
  modUsername?: string;
}): ActionReceiptInput {
  const receipt: ActionReceiptInput = {
    actionEventId: options.actionEvent.id,
    subreddit: options.actionEvent.subreddit,
    targetType: options.preview.targetSnapshot.targetType,
    targetSnapshot: options.preview.targetSnapshot,
    modUsername: options.modUsername ?? 'unknown',
    source: toReceiptSource(options.input.source),
    recommendation: options.preview.recommendation,
    selectedAction: options.input.selectedAction,
    deviatesFromPolicy: options.preview.recommendation.deviatesFromPolicy,
    executionMode: options.execution.executionMode,
    executionAttempted: options.execution.executionAttempted,
    executionResult: options.execution.executionResult,
    redditOperation: options.execution.redditOperation,
    capabilityState: options.execution.capabilityState,
  };

  if (options.input.targetThingId !== undefined) {
    receipt.targetThingId = options.input.targetThingId;
  }
  if (options.preview.contentSnapshot !== undefined) {
    receipt.contentSnapshot = options.preview.contentSnapshot;
  }
  if (options.preview.policySnapshot !== undefined) {
    receipt.policySnapshot = options.preview.policySnapshot;
  }
  if (options.preview.responsePreview !== undefined) {
    receipt.responsePreview = options.preview.responsePreview;
  }
  if (options.nativeModNote !== undefined) {
    receipt.nativeModNote = options.nativeModNote;
  }
  if (options.overrideEvent !== undefined) {
    receipt.overrideEventId = options.overrideEvent.id;
    receipt.overrideReason = options.overrideEvent.overrideReason;
    if (options.overrideEvent.overrideNote !== undefined) {
      receipt.overrideNote = options.overrideEvent.overrideNote;
    }
  } else {
    if (options.input.overrideReason !== undefined) {
      receipt.overrideReason = options.input.overrideReason;
    }
    if (options.input.overrideNote !== undefined) {
      receipt.overrideNote = options.input.overrideNote;
    }
  }
  if (options.execution.redditResultMetadata !== undefined) {
    receipt.redditResultMetadata = options.execution.redditResultMetadata;
  }
  if (options.execution.errorCode !== undefined) {
    receipt.errorCode = options.execution.errorCode;
  }
  if (options.execution.errorMessage !== undefined) {
    receipt.errorMessage = options.execution.errorMessage;
  }

  return receipt;
}

export async function saveActionReceipt(
  input: ActionReceiptInput
): Promise<ActionReceipt> {
  const receipt: ActionReceipt = {
    id: input.id ?? `receipt-${randomUUID()}`,
    actionEventId: input.actionEventId,
    subreddit: input.subreddit,
    targetType: input.targetType,
    targetSnapshot: input.targetSnapshot,
    modUsername: input.modUsername,
    source: input.source,
    recommendation: input.recommendation,
    selectedAction: input.selectedAction,
    deviatesFromPolicy: input.deviatesFromPolicy,
    executionMode: input.executionMode,
    executionAttempted: input.executionAttempted,
    executionResult: input.executionResult,
    redditOperation: input.redditOperation,
    capabilityState: input.capabilityState,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  copyOptionalReceiptFields(receipt, input);

  const createdAtScore = Date.parse(receipt.createdAt);
  const score = Number.isNaN(createdAtScore) ? Date.now() : createdAtScore;

  await Promise.all([
    writeJson(redisKeys.receipt(receipt.subreddit, receipt.id), receipt),
    redis.zAdd(redisKeys.receipts(receipt.subreddit), {
      member: serializeJson(receipt),
      score,
    }),
    receipt.targetThingId === undefined
      ? Promise.resolve()
      : redis.zAdd(
          redisKeys.receiptsByTarget(receipt.subreddit, receipt.targetThingId),
          {
            member: serializeJson(receipt),
            score,
          }
        ),
  ]);

  return receipt;
}

export function toReceiptSource(
  source: ApplyPolicySource | undefined
): ActionReceiptSource {
  if (source === 'demo') {
    return 'demo';
  }
  if (source === 'simulator' || source === undefined) {
    return 'simulator';
  }
  return 'dashboard';
}

export async function getActionReceipt(
  subreddit: string,
  receiptId: string
): Promise<ActionReceipt | undefined> {
  return readJson<ActionReceipt>(redisKeys.receipt(subreddit, receiptId));
}

export async function listActionReceipts(
  subreddit: string,
  limit = 25
): Promise<ActionReceipt[]> {
  return listReceiptsFromKey(redisKeys.receipts(subreddit), limit);
}

export async function listActionReceiptsByTarget(
  subreddit: string,
  targetThingId: string,
  limit = 25
): Promise<ActionReceipt[]> {
  return listReceiptsFromKey(
    redisKeys.receiptsByTarget(subreddit, targetThingId),
    limit
  );
}

async function listReceiptsFromKey(
  key: string,
  limit: number
): Promise<ActionReceipt[]> {
  if (limit <= 0) {
    return [];
  }

  const rows = await redis.zRange(key, 0, limit - 1, {
    by: 'rank',
    reverse: true,
  });

  return rows
    .map((row: { member: string }) => parseJson<ActionReceipt>(row.member))
    .filter((receipt): receipt is ActionReceipt => receipt !== undefined);
}

function copyOptionalReceiptFields(
  receipt: ActionReceipt,
  input: ActionReceiptInput
): void {
  if (input.targetThingId !== undefined) {
    receipt.targetThingId = input.targetThingId;
  }
  if (input.policySnapshot !== undefined) {
    receipt.policySnapshot = input.policySnapshot;
  }
  if (input.contentSnapshot !== undefined) {
    receipt.contentSnapshot = input.contentSnapshot;
  }
  if (input.responsePreview !== undefined) {
    receipt.responsePreview = input.responsePreview;
  }
  if (input.nativeModNote !== undefined) {
    receipt.nativeModNote = input.nativeModNote;
  }
  if (input.overrideEventId !== undefined) {
    receipt.overrideEventId = input.overrideEventId;
  }
  if (input.overrideReason !== undefined) {
    receipt.overrideReason = input.overrideReason;
  }
  if (input.overrideNote !== undefined) {
    receipt.overrideNote = input.overrideNote;
  }
  if (input.redditResultMetadata !== undefined) {
    receipt.redditResultMetadata = input.redditResultMetadata;
  }
  if (input.errorCode !== undefined) {
    receipt.errorCode = input.errorCode;
  }
  if (input.errorMessage !== undefined) {
    receipt.errorMessage = input.errorMessage;
  }
}
