import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
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

describe('team delivery service', () => {
  beforeEach(() => {
    redisState.strings.clear();
    redisState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('reports manual copy as enabled and runtime delivery as unavailable or unverified', async () => {
    const { getTeamDeliveryCapabilities } = await import('./teamDelivery');

    const capabilities = getTeamDeliveryCapabilities();

    expect(capabilities.manualMarkdown.state).toBe('enabled');
    expect(capabilities.modDiscussion.state).toBe('unverified');
    expect(capabilities.scheduler.state).toBe('unavailable');
  });

  it('builds a preview without attempting delivery', async () => {
    const { buildTeamDeliveryPreview } = await import('./teamDelivery');

    const preview = buildTeamDeliveryPreview({
      subreddit: 'ExampleLearning',
      request: {
        channel: 'mod_discussion',
        subjectType: 'digest',
        subjectId: 'digest-1',
        title: 'Weekly ModMirror digest',
        markdown: '# Digest\n\nRule 2 needs review.',
      },
    });

    expect(preview.deliveryWillBeAttempted).toBe(false);
    expect(preview.requiresExplicitConfirmation).toBe(true);
    expect(preview.warnings).toContain(
      'Confirming now will store a receipt but will not send a Reddit message.'
    );
  });

  it('stores a manual receipt for Markdown copy fallback', async () => {
    const { confirmTeamDelivery, listTeamDeliveryReceipts } = await import(
      './teamDelivery'
    );

    const response = await confirmTeamDelivery({
      subreddit: 'ExampleLearning',
      requestedBy: 'leadmod',
      request: {
        confirmed: true,
        channel: 'manual_markdown',
        subjectType: 'case_packet',
        subjectId: 'case-packet-1',
        title: 'Weekly ModMirror digest',
        markdown: '# Digest\n\nRule 2 needs review.',
      },
    });
    const receipts = await listTeamDeliveryReceipts('ExampleLearning');

    expect(response.receipt.status).toBe('manual_ready');
    expect(response.receipt.subjectType).toBe('case_packet');
    expect(response.receipt.subjectId).toBe('case-packet-1');
    expect(response.receipt.deliveryAttempted).toBe(false);
    expect(receipts[0]?.id).toBe(response.receipt.id);
  });

  it('stores a skipped receipt for unverified mod discussion delivery', async () => {
    const { confirmTeamDelivery } = await import('./teamDelivery');

    const response = await confirmTeamDelivery({
      subreddit: 'ExampleLearning',
      requestedBy: 'leadmod',
      request: {
        confirmed: true,
        channel: 'mod_discussion',
        subjectType: 'digest',
        title: 'Weekly ModMirror digest',
        markdown: '# Digest\n\nRule 2 needs review.',
      },
    });

    expect(response.receipt.status).toBe('skipped');
    expect(response.receipt.deliveryAttempted).toBe(false);
    expect(response.receipt.errorMessage).toContain('not runtime-verified');
  });

  it('can send through an injected adapter only when explicitly enabled and verified', async () => {
    const { confirmTeamDelivery } = await import('./teamDelivery');
    const adapter = {
      sendModDiscussion: vi.fn().mockResolvedValue({
        conversationId: 'modmail-conversation-1',
      }),
    };

    const response = await confirmTeamDelivery({
      subreddit: 'ExampleLearning',
      requestedBy: 'leadmod',
      liveDeliveryEnabled: true,
      runtimeVerified: true,
      adapter,
      request: {
        confirmed: true,
        channel: 'mod_discussion',
        subjectType: 'policy_proposal',
        subjectId: 'policy-1-v2',
        title: 'Policy proposal: Rule 2',
        markdown: 'Please review the proposed Rule 2 ladder.',
      },
    });

    expect(response.receipt.status).toBe('sent');
    expect(response.receipt.deliveryAttempted).toBe(true);
    expect(response.receipt.providerReferenceId).toBe('modmail-conversation-1');
    expect(adapter.sendModDiscussion).toHaveBeenCalledTimes(1);
  });
});
