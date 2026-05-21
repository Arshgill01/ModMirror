import { beforeEach, describe, expect, it, vi } from 'vitest';

const reddit = vi.hoisted(() => ({
  getCurrentSubreddit: vi.fn(),
  getRules: vi.fn(),
  getSubredditRemovalReasons: vi.fn(),
  getModerationLog: vi.fn(),
}));

vi.mock('@devvit/web/server', () => ({
  context: {
    subredditName: 'ExampleLearning',
  },
  reddit,
}));

describe('live reddit scan sources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reddit.getRules.mockResolvedValue([
      {
        shortName: 'Low-effort questions',
        priority: 2,
      },
    ]);
    reddit.getSubredditRemovalReasons.mockResolvedValue([
      {
        id: 'reason-1',
        title: 'Low-effort questions',
      },
    ]);
    reddit.getModerationLog.mockReturnValue({
      all: vi.fn().mockResolvedValue([
        {
          id: 'mod-action-1',
          type: 'removelink',
          moderatorName: 'mod_a',
          createdAt: new Date('2026-05-18T00:00:00.000Z'),
          target: {
            id: 't3_target_post',
            author: 'learner_1',
            title: 'Low effort homework question',
          },
        },
      ]),
    });
  });

  it('uses standard scan depth by default', async () => {
    const { loadLiveMirrorScanSources } = await import('./redditSources');
    const sources = await loadLiveMirrorScanSources();

    expect(reddit.getModerationLog).toHaveBeenCalledWith({
      subredditName: 'ExampleLearning',
      limit: 60,
      pageSize: 60,
    });
    expect(sources.scanDepth).toEqual(
      expect.objectContaining({
        depth: 'standard',
        requestedLimit: 60,
        pageSize: 60,
        fetchedActions: 1,
        hitLimit: false,
        paginationStrategy: 'listing_all',
        runtimeVerified: false,
      })
    );
    expect(sources.warnings).toContainEqual(
      expect.stringContaining('returned 1 of 60 requested')
    );
  });

  it('uses deep scan caps when requested', async () => {
    const { loadLiveMirrorScanSources } = await import('./redditSources');
    await loadLiveMirrorScanSources({ depth: 'deep' });

    expect(reddit.getModerationLog).toHaveBeenCalledWith({
      subredditName: 'ExampleLearning',
      limit: 250,
      pageSize: 100,
    });
  });

  it('records cap warnings when fetched actions hit the limit', async () => {
    reddit.getModerationLog.mockReturnValue({
      all: vi.fn().mockResolvedValue(
        Array.from({ length: 25 }, (_, index) => ({
          id: `mod-action-${index}`,
          type: 'removecomment',
          createdAt: '2026-05-18T00:00:00.000Z',
        }))
      ),
    });

    const { loadLiveMirrorScanSources } = await import('./redditSources');
    const sources = await loadLiveMirrorScanSources({ depth: 'quick' });

    expect(sources.scanDepth?.hitLimit).toBe(true);
    expect(sources.warnings).toContainEqual(
      expect.stringContaining('reached the configured quick cap')
    );
  });

  it('records observed listing page fetches when the Devvit listing exposes them', async () => {
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      id: `mod-action-page-1-${index}`,
      type: 'removecomment',
      createdAt: '2026-05-18T00:00:00.000Z',
    }));
    const secondPage = Array.from({ length: 20 }, (_, index) => ({
      id: `mod-action-page-2-${index}`,
      type: 'removelink',
      createdAt: '2026-05-18T00:00:00.000Z',
    }));
    const listing = {
      children: [] as unknown[],
      get hasMore() {
        return this.children.length < 120;
      },
      get: vi.fn(async () => {
        if (listing.children.length === 0) {
          listing.children.push(...firstPage);
        } else {
          listing.children.push(...secondPage);
        }
        return listing.children;
      }),
    };
    reddit.getModerationLog.mockReturnValue(listing);

    const { loadLiveMirrorScanSources } = await import('./redditSources');
    const sources = await loadLiveMirrorScanSources({ depth: 'deep' });

    expect(listing.get).toHaveBeenCalledTimes(2);
    expect(sources.actions).toHaveLength(120);
    expect(sources.scanDepth).toEqual(
      expect.objectContaining({
        depth: 'deep',
        requestedLimit: 250,
        pageSize: 100,
        fetchedActions: 120,
        paginationStrategy: 'listing_get_pages',
        observedPageFetches: 2,
        observedMultiplePages: true,
        runtimeStatus: 'multiple_pages_observed',
      })
    );
    expect(sources.warnings).toContainEqual(
      expect.stringContaining('observed 2 moderation-log page fetches')
    );
  });

  it('falls back to empty actions when moderation-log fetch fails', async () => {
    reddit.getModerationLog.mockReturnValue({
      all: vi.fn().mockRejectedValue(new Error('permission denied')),
    });

    const { loadLiveMirrorScanSources } = await import('./redditSources');
    const sources = await loadLiveMirrorScanSources({ depth: 'deep' });

    expect(sources.actions).toEqual([]);
    expect(sources.scanDepth).toEqual(
      expect.objectContaining({
        depth: 'deep',
        requestedLimit: 250,
        fetchedActions: 0,
      })
    );
    expect(sources.warnings).toContain(
      'Unable to load moderation log: permission denied'
    );
  });
});
