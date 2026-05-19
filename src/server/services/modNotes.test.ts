import { describe, expect, it, vi } from 'vitest';
import type { NativeModNoteCapabilities } from './modNotes';
import { attemptNativeModNote, buildModNoteBody } from './modNotes';

const enabledCapabilities: NativeModNoteCapabilities = {
  nativeModNotesEnabled: true,
  nativeModNotesRuntimeVerified: true,
  receiptCreationAvailable: true,
};

function baseInput() {
  return {
    mode: 'native' as const,
    confirmed: true,
    subreddit: 'ExampleLearning',
    targetAuthor: 'learner_1',
    targetThingId: 't3_case',
    responsePreview: {
      stepOffenseCount: 2,
      deliveryWillBeAttempted: false as const,
      warnings: [],
      templates: [
        {
          kind: 'mod_note_summary' as const,
          title: 'Mod Note',
          body: 'Repeat Low-effort questions case.',
          deliveryMode: 'log_only' as const,
          source: 'policy_template' as const,
          missingVariables: [],
          deliveryGated: true as const,
        },
      ],
    },
    recommendation: {
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      offenseCount: 2,
      recommendedAction: 'note' as const,
      messageDeliveryMode: 'log_only' as const,
      requiresOverrideReason: false,
      deviatesFromPolicy: false,
      fallbackReason: 'policy_found' as const,
      message: 'Team policy recommends note.',
    },
  };
}

function dependencies(capabilities = enabledCapabilities) {
  return {
    reddit: {
      addModNote: vi.fn().mockResolvedValue({
        id: 'ModNote_1',
        type: 'NOTE',
        createdAt: new Date('2026-05-18T00:00:00.000Z'),
        operator: {},
        user: {},
        subreddit: {},
      }),
    },
    capabilities,
    now: () => '2026-05-18T00:00:00.000Z',
  };
}

describe('native Mod Notes service', () => {
  it('keeps native Mod Notes disabled without runtime proof', async () => {
    const deps = dependencies({
      nativeModNotesEnabled: true,
      nativeModNotesRuntimeVerified: false,
      receiptCreationAvailable: true,
    });

    const result = await attemptNativeModNote(baseInput(), deps);

    expect(result).toEqual(
      expect.objectContaining({
        mode: 'native',
        status: 'skipped',
        deliveryAttempted: false,
        capabilityState: 'unverified_disabled',
        errorCode: 'unverified_disabled',
      })
    );
    expect(deps.reddit.addModNote).not.toHaveBeenCalled();
  });

  it('adds a native Mod Note and records the returned ID when all gates pass', async () => {
    const deps = dependencies();

    const result = await attemptNativeModNote(baseInput(), deps);

    expect(deps.reddit.addModNote).toHaveBeenCalledWith({
      subreddit: 'ExampleLearning',
      user: 'learner_1',
      note: 'Repeat Low-effort questions case.',
      redditId: 't3_case',
    });
    expect(result).toEqual(
      expect.objectContaining({
        status: 'sent',
        deliveryAttempted: true,
        capabilityState: 'enabled',
        noteId: 'ModNote_1',
      })
    );
  });

  it('records native Mod Note failures visibly', async () => {
    const deps = dependencies();
    deps.reddit.addModNote.mockRejectedValue(new Error('403 forbidden'));

    const result = await attemptNativeModNote(baseInput(), deps);

    expect(result).toEqual(
      expect.objectContaining({
        status: 'failed',
        deliveryAttempted: true,
        capabilityState: 'enabled',
        errorCode: 'permission_denied',
        errorMessage: '403 forbidden',
      })
    );
  });

  it('keeps generated notes on the receipt in log-only mode', async () => {
    const deps = dependencies();
    const result = await attemptNativeModNote(
      {
        ...baseInput(),
        mode: 'log_only',
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        status: 'skipped',
        deliveryAttempted: false,
        capabilityState: 'disabled',
        noteBody: 'Repeat Low-effort questions case.',
        errorCode: 'log_only_mode',
      })
    );
    expect(deps.reddit.addModNote).not.toHaveBeenCalled();
  });

  it('truncates fallback note text to the native 250 character limit', () => {
    const source = baseInput();
    const body = buildModNoteBody({
      mode: source.mode,
      confirmed: source.confirmed,
      subreddit: source.subreddit,
      targetAuthor: source.targetAuthor,
      targetThingId: source.targetThingId,
      recommendation: {
        ...source.recommendation,
        ruleName: 'A'.repeat(300),
      },
    });

    expect(body.length).toBeLessThanOrEqual(250);
    expect(body.endsWith('...')).toBe(true);
  });
});
