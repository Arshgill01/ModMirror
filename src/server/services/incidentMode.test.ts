import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActionReceipt } from '../../shared/schema';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => Promise.resolve(redisState.strings.get(key))),
    set: vi.fn((key: string, value: string) => {
      redisState.strings.set(key, value);
      return Promise.resolve();
    }),
    zAdd: vi.fn((key: string, value: { member: string; score: number }) => {
      const rows = redisState.sortedSets.get(key) ?? [];
      rows.push(value);
      redisState.sortedSets.set(key, rows);
      return Promise.resolve();
    }),
    zRange: vi.fn((key: string, start: number, end: number) => {
      const rows = [...(redisState.sortedSets.get(key) ?? [])].sort(
        (left, right) => right.score - left.score
      );
      const normalizedEnd = end < 0 ? rows.length : end + 1;
      return Promise.resolve(rows.slice(start, normalizedEnd));
    }),
  },
}));

describe('incident mode service', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('starts explicit temporary incident mode with preset suggestions and triage groups', async () => {
    const { getActiveIncidentMode, startIncidentMode } = await import(
      './incidentMode'
    );

    const incident = await startIncidentMode({
      subreddit: 'ExampleLearning',
      startedBy: 'lead_mod',
      dependencies: {
        now: () => '2026-05-18T10:00:00.000Z',
      },
      request: {
        reason: 'spam_flood',
        description: 'Queue volume spiked.',
        durationMinutes: 45,
      },
    });
    const active = await getActiveIncidentMode(
      'ExampleLearning',
      '2026-05-18T10:10:00.000Z'
    );

    expect(incident.status).toBe('active');
    expect(incident.expiresAt).toBe('2026-05-18T10:45:00.000Z');
    expect(incident.presetSuggestions[0]?.safetyNote).toContain(
      'Moderator confirmation'
    );
    expect(incident.triageGroups[0]?.id).toBe('repeat-patterns');
    expect(active?.id).toBe(incident.id);
  });

  it('ends incident mode and reports tagged receipts without creating actions', async () => {
    const { endIncidentMode, startIncidentMode } = await import('./incidentMode');

    const incident = await startIncidentMode({
      subreddit: 'ExampleLearning',
      request: {
        reason: 'raid',
      },
      dependencies: {
        now: () => '2026-05-18T10:00:00.000Z',
      },
    });
    const report = await endIncidentMode({
      subreddit: 'ExampleLearning',
      incidentId: incident.id,
      endedBy: 'lead_mod',
      request: {
        reviewNote: 'Raid passed.',
      },
      dependencies: {
        now: () => '2026-05-18T11:00:00.000Z',
        listReceipts: vi.fn().mockResolvedValue([
          receipt('receipt-1', incident.id, true),
          receipt('receipt-2', incident.id, false),
          receipt('receipt-other', 'incident-other', true),
        ]),
      },
    });

    expect(report?.incident.status).toBe('ended');
    expect(report?.receiptCount).toBe(2);
    expect(report?.overrideCount).toBe(1);
    expect(report?.executionResults.skipped).toBe(2);
    expect(report?.taggedReceiptIds).toEqual(['receipt-1', 'receipt-2']);
    expect(report?.caveats.join(' ')).toContain('does not auto-remove');
  });

  it('treats expired incident mode as inactive', async () => {
    const { getActiveIncidentMode, startIncidentMode } = await import(
      './incidentMode'
    );

    await startIncidentMode({
      subreddit: 'ExampleLearning',
      request: {
        reason: 'other',
        durationMinutes: 1,
      },
      dependencies: {
        now: () => '2026-05-18T10:00:00.000Z',
      },
    });

    await expect(
      getActiveIncidentMode('ExampleLearning', '2026-05-18T10:02:00.000Z')
    ).resolves.toMatchObject({ status: 'expired' });
  });
});

function receipt(
  id: string,
  incidentId: string,
  deviatesFromPolicy: boolean
): ActionReceipt {
  return {
    id,
    incidentId,
    actionEventId: `action-${id}`,
    subreddit: 'ExampleLearning',
    targetType: 'post',
    targetSnapshot: {
      targetType: 'post',
      source: 'provided',
      warnings: [],
    },
    modUsername: 'mod_a',
    source: 'dashboard',
    recommendation: {
      ruleKey: 'rule-2',
      offenseCount: 1,
      recommendedAction: 'warn',
      messageDeliveryMode: 'log_only',
      requiresOverrideReason: deviatesFromPolicy,
      selectedAction: deviatesFromPolicy ? 'remove' : 'warn',
      deviatesFromPolicy,
      fallbackReason: 'policy_found',
      message: 'Team policy recommends warn.',
    },
    selectedAction: deviatesFromPolicy ? 'remove' : 'warn',
    deviatesFromPolicy,
    executionMode: 'log_only',
    executionAttempted: false,
    executionResult: 'skipped',
    redditOperation: 'none',
    capabilityState: 'not_applicable',
    createdAt: '2026-05-18T10:00:00.000Z',
  };
}
