import { reddit } from '@devvit/web/server';
import type { T1, T3 } from '@devvit/shared-types/tid.js';
import type {
  ApplyPolicyResponsePreview,
  NativeModNoteAttempt,
  NativeModNoteCapabilityState,
  NativeModNoteMode,
  PolicyRecommendation,
} from '../../shared/schema';

const MAX_NATIVE_MOD_NOTE_LENGTH = 250;

type NativeModNoteClient = {
  addModNote: (options: {
    subreddit: string;
    user: string;
    note: string;
    redditId?: T1 | T3;
  }) => Promise<{ id: string }>;
};

export type NativeModNoteCapabilities = {
  nativeModNotesEnabled: boolean;
  nativeModNotesRuntimeVerified: boolean;
  receiptCreationAvailable: boolean;
};

export type NativeModNoteDependencies = {
  reddit: NativeModNoteClient;
  capabilities: NativeModNoteCapabilities;
  now: () => string;
};

export type NativeModNoteInput = {
  mode?: NativeModNoteMode;
  confirmed: boolean;
  subreddit: string;
  targetAuthor?: string;
  targetThingId?: string;
  responsePreview?: ApplyPolicyResponsePreview;
  recommendation: PolicyRecommendation;
};

export async function attemptNativeModNote(
  input: NativeModNoteInput,
  dependencies: NativeModNoteDependencies = defaultDependencies()
): Promise<NativeModNoteAttempt> {
  const startedAt = dependencies.now();
  const mode = input.mode ?? 'log_only';
  const noteBody = buildModNoteBody(input);

  if (mode === 'none') {
    return skipped({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      capabilityState: 'not_applicable',
      errorCode: 'mod_note_not_requested',
      errorMessage: 'Native Mod Note was not requested.',
    });
  }

  if (!input.confirmed) {
    return skipped({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      capabilityState: 'disabled',
      errorCode: 'confirmation_required',
      errorMessage: 'Explicit moderator confirmation is required.',
    });
  }

  if (mode === 'log_only') {
    return skipped({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      capabilityState: 'disabled',
      errorCode: 'log_only_mode',
      errorMessage:
        'Generated Mod Note was stored on the ModMirror receipt only.',
    });
  }

  if (input.targetAuthor === undefined || !input.targetAuthor.trim()) {
    return skipped({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      capabilityState: 'not_applicable',
      errorCode: 'target_author_required',
      errorMessage: 'Native Mod Notes require a target author.',
    });
  }

  const gate = getNativeModNoteGateState(dependencies.capabilities);
  if (gate !== 'enabled') {
    return skipped({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      capabilityState: gate,
      errorCode: gate,
      errorMessage: getNativeModNoteGateMessage(gate),
    });
  }

  try {
    const created = await dependencies.reddit.addModNote({
      subreddit: input.subreddit,
      user: input.targetAuthor,
      note: noteBody,
      ...(input.targetThingId === undefined
        ? {}
        : { redditId: input.targetThingId as T1 | T3 }),
    });

    const attempt = baseAttempt({
      input,
      mode,
      noteBody,
      startedAt,
      completedAt: dependencies.now(),
      status: 'sent',
      deliveryAttempted: true,
      capabilityState: 'enabled',
    });
    attempt.noteId = created.id;
    return attempt;
  } catch (error) {
    return {
      ...baseAttempt({
        input,
        mode,
        noteBody,
        startedAt,
        completedAt: dependencies.now(),
        status: 'failed',
        deliveryAttempted: true,
        capabilityState: 'enabled',
      }),
      errorCode: classifyModNoteError(error),
      errorMessage: formatError(error),
    };
  }
}

export function getDefaultNativeModNoteCapabilities(): NativeModNoteCapabilities {
  return {
    nativeModNotesEnabled:
      process.env.MODMIRROR_ENABLE_NATIVE_MOD_NOTES === 'true',
    nativeModNotesRuntimeVerified:
      process.env.MODMIRROR_NATIVE_MOD_NOTES_RUNTIME_VERIFIED === 'true',
    receiptCreationAvailable:
      process.env.MODMIRROR_ACTION_RECEIPTS_AVAILABLE !== 'false',
  };
}

export function buildModNoteBody(input: NativeModNoteInput): string {
  const template = input.responsePreview?.templates.find(
    (candidate) => candidate.kind === 'mod_note_summary'
  );
  const body =
    template?.body ??
    `ModMirror ${input.recommendation.ruleName ?? input.recommendation.ruleKey}: recommended ${input.recommendation.recommendedAction.replaceAll('_', ' ')} for offense ${input.recommendation.offenseCount}.`;
  return truncateModNote(body);
}

function defaultDependencies(): NativeModNoteDependencies {
  return {
    reddit,
    capabilities: getDefaultNativeModNoteCapabilities(),
    now: () => new Date().toISOString(),
  };
}

function getNativeModNoteGateState(
  capabilities: NativeModNoteCapabilities
): NativeModNoteCapabilityState {
  if (!capabilities.nativeModNotesEnabled) {
    return 'disabled';
  }
  if (!capabilities.nativeModNotesRuntimeVerified) {
    return 'unverified_disabled';
  }
  if (!capabilities.receiptCreationAvailable) {
    return 'receipt_required';
  }
  return 'enabled';
}

function getNativeModNoteGateMessage(
  state: NativeModNoteCapabilityState
): string {
  if (state === 'receipt_required') {
    return 'Native Mod Notes are blocked until action receipts are available.';
  }
  if (state === 'unverified_disabled') {
    return 'Native Mod Notes are disabled until playtest runtime proof is recorded.';
  }
  if (state === 'disabled') {
    return 'Native Mod Notes are disabled by configuration.';
  }
  return 'No native Mod Note is applicable for this action.';
}

function skipped(options: {
  input: NativeModNoteInput;
  mode: NativeModNoteMode;
  noteBody: string;
  startedAt: string;
  completedAt: string;
  capabilityState: NativeModNoteCapabilityState;
  errorCode: string;
  errorMessage: string;
}): NativeModNoteAttempt {
  return {
    ...baseAttempt({
      input: options.input,
      mode: options.mode,
      noteBody: options.noteBody,
      startedAt: options.startedAt,
      completedAt: options.completedAt,
      status: 'skipped',
      deliveryAttempted: false,
      capabilityState: options.capabilityState,
    }),
    errorCode: options.errorCode,
    errorMessage: options.errorMessage,
  };
}

function baseAttempt(options: {
  input: NativeModNoteInput;
  mode: NativeModNoteMode;
  noteBody: string;
  startedAt: string;
  completedAt: string;
  status: NativeModNoteAttempt['status'];
  deliveryAttempted: boolean;
  capabilityState: NativeModNoteCapabilityState;
}): NativeModNoteAttempt {
  const attempt: NativeModNoteAttempt = {
    mode: options.mode,
    status: options.status,
    deliveryAttempted: options.deliveryAttempted,
    capabilityState: options.capabilityState,
    subreddit: options.input.subreddit,
    noteBody: options.noteBody,
    startedAt: options.startedAt,
    completedAt: options.completedAt,
  };
  if (options.input.targetAuthor !== undefined) {
    attempt.targetAuthor = options.input.targetAuthor;
  }
  if (options.input.targetThingId !== undefined) {
    attempt.targetThingId = options.input.targetThingId;
  }
  return attempt;
}

function truncateModNote(body: string): string {
  const normalized = body.replace(/\s+/g, ' ').trim();
  if (normalized.length <= MAX_NATIVE_MOD_NOTE_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_NATIVE_MOD_NOTE_LENGTH - 3).trimEnd()}...`;
}

function classifyModNoteError(error: unknown): string {
  const message = formatError(error).toLowerCase();
  if (
    message.includes('permission') ||
    message.includes('forbidden') ||
    message.includes('403')
  ) {
    return 'permission_denied';
  }
  if (message.includes('not found') || message.includes('404')) {
    return 'target_not_found';
  }
  return 'native_mod_note_failed';
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
