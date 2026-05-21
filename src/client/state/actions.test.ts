import { describe, expect, it, vi } from 'vitest';

import type { MirrorScan, MirrorScanRecord } from '../../shared/schema';
import {
  fetchApi,
  normalizeClientError,
  resetDemoAction,
  runScanAction,
} from './actions';

describe('client state actions', () => {
  it('unwraps successful API responses and preserves API errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        ok: true,
        data: { value: 42 },
      })
    );

    await expect(fetchApi<{ value: number }>('/api/example', undefined, { fetchImpl })).resolves.toEqual({
      value: 42,
    });

    fetchImpl.mockResolvedValueOnce(
      jsonResponse({
        ok: false,
        error: {
          code: 'blocked',
          message: 'No access.',
        },
      })
    );

    await expect(fetchApi('/api/example', undefined, { fetchImpl })).rejects.toThrow(
      'API error (blocked): No access.'
    );
  });

  it('runs a scan action and loads the stored scan record', async () => {
    const scan = mirrorScan('scan-1');
    const record = mirrorScanRecord(scan);
    const fetcher = vi.fn().mockResolvedValue(scan);
    const loadScanRecord = vi.fn().mockResolvedValue(record);

    await expect(
      runScanAction({
        mode: 'live',
        depth: 'quick',
        loadScanRecord,
        createDemoFallback: () => mirrorScan('fallback'),
        fetcher,
      })
    ).resolves.toEqual({ scan, record });
    expect(fetcher).toHaveBeenCalledWith('/api/scan', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'live', depth: 'quick' }),
    });
    expect(loadScanRecord).toHaveBeenCalledWith(scan);
  });

  it('uses the labeled demo fallback when demo scan API calls fail', async () => {
    const fallback = mirrorScan('fallback');

    await expect(
      runScanAction({
        mode: 'demo',
        depth: 'standard',
        loadScanRecord: vi.fn(),
        createDemoFallback: () => fallback,
        fetcher: vi.fn().mockRejectedValue(new Error('offline')),
      })
    ).resolves.toEqual({ scan: fallback, record: undefined });
  });

  it('posts the demo reset action through the shared fetch helper', async () => {
    const manifest = {
      subreddit: 'ExampleLearning',
      generatedAt: '2026-05-21T00:00:00.000Z',
      deterministicSeed: 'demo-seed',
      scanCount: 1,
      policyCount: 1,
      receiptCount: 1,
      overrideCount: 1,
      calibrationScenarioCount: 1,
      reviewTaskCount: 1,
      evidenceItemCount: 1,
      storyChecks: [],
      trustLabels: [],
    };
    const fetcher = vi.fn().mockResolvedValue(manifest);

    await expect(resetDemoAction(fetcher)).resolves.toBe(manifest);
    expect(fetcher).toHaveBeenCalledWith('/api/demo/reset', {
      method: 'POST',
    });
  });

  it('normalizes client errors through the shared resilience taxonomy', () => {
    expect(normalizeClientError(new Error('moderator access required'), 'Fallback')).toContain(
      'Next action'
    );
  });
});

function jsonResponse(payload: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function mirrorScan(id: string): MirrorScan {
  return {
    id,
    subreddit: 'ExampleLearning',
    createdAt: '2026-05-21T00:00:00.000Z',
    source: 'demo',
    totalActionsScanned: 0,
    attributedCount: 0,
    unmatchedCount: 0,
    confidenceBreakdown: {
      high: 0,
      medium: 0,
      low: 0,
      unmatched: 0,
    },
    driftCandidates: [],
    smallSubredditStatus: {
      meetsThreshold: true,
      observedActions: 0,
      minimumActions: 0,
      message: 'Sufficient data for test scan.',
    },
    scanDepth: {
      depth: 'standard',
      requestedLimit: 50,
      pageSize: 50,
      fetchedActions: 0,
      hitLimit: false,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    },
    warnings: [],
  };
}

function mirrorScanRecord(scan: MirrorScan): MirrorScanRecord {
  return {
    ...scan,
    attributedActions: [],
    unmatchedActions: [],
    retention: {
      maxScansPerSubreddit: 10,
      storedActionCount: 0,
    },
  };
}
