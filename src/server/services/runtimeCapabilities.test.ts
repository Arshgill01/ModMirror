import { beforeEach, describe, expect, it, vi } from 'vitest';

const redisState = vi.hoisted(() => ({
  strings: new Map<string, string>(),
}));

vi.mock('@devvit/web/server', () => ({
  redis: {
    get: vi.fn((key: string) => Promise.resolve(redisState.strings.get(key))),
    set: vi.fn((key: string, value: string) => {
      redisState.strings.set(key, value);
      return Promise.resolve();
    }),
  },
}));

describe('runtime capability observability', () => {
  beforeEach(() => {
    redisState.strings.clear();
    vi.clearAllMocks();
  });

  it('distinguishes runtime, static, type, demo, disabled, and deferred states', async () => {
    const { getRuntimeCapabilityMatrix } = await import('./runtimeCapabilities');

    const matrix = await getRuntimeCapabilityMatrix(
      'ExampleLearning',
      '2026-05-18T00:00:00.000Z'
    );

    expect(matrix.summary.total).toBe(matrix.entries.length);
    expect(matrix.summary.typeOnly).toBeGreaterThanOrEqual(3);
    expect(matrix.summary.verifiedStatic).toBeGreaterThanOrEqual(1);
    expect(matrix.summary.demoOnly).toBe(1);
    expect(matrix.summary.disabled).toBeGreaterThanOrEqual(3);
    expect(matrix.summary.deferred).toBeGreaterThanOrEqual(1);
    expect(matrix.entries.find((entry) => entry.id === 'demo-fallbacks')).toMatchObject({
      state: 'demo_only',
      evidenceKind: 'demo',
    });
    expect(
      matrix.entries.find((entry) => entry.id === 'redis-storage-envelope')
    ).toMatchObject({
      state: 'type_only',
      evidenceKind: 'type',
      safeToTest: true,
    });
  });

  it('records health events and promotes capabilities after passing checks', async () => {
    const {
      getRuntimeCapabilityMatrix,
      listRuntimeHealthEvents,
      recordRuntimeHealthEvent,
    } = await import('./runtimeCapabilities');

    await recordRuntimeHealthEvent({
      subreddit: 'ExampleLearning',
      capabilityId: 'redis-smoke',
      status: 'passed',
      source: 'smoke_route',
      message: 'Redis write/read matched.',
      diagnosticRoute: '/api/smoke/redis',
      observedAt: '2026-05-18T01:00:00.000Z',
    });

    const matrix = await getRuntimeCapabilityMatrix(
      'ExampleLearning',
      '2026-05-18T01:05:00.000Z'
    );
    const redis = matrix.entries.find((entry) => entry.id === 'redis-smoke');

    expect(await listRuntimeHealthEvents('ExampleLearning')).toHaveLength(1);
    expect(redis).toMatchObject({
      state: 'verified_runtime',
      evidenceKind: 'runtime',
      lastHealthEvent: {
        status: 'passed',
        source: 'smoke_route',
      },
    });
    expect(matrix.summary.verifiedRuntime).toBeGreaterThanOrEqual(2);
  });

  it('records failures without enabling unsafe capabilities', async () => {
    const { getRuntimeCapabilityMatrix, recordRuntimeHealthEvent } = await import(
      './runtimeCapabilities'
    );

    await recordRuntimeHealthEvent({
      subreddit: 'ExampleLearning',
      capabilityId: 'reddit-api-smoke',
      status: 'failed',
      source: 'playtest',
      message: 'Reddit smoke route failed.',
      errorCode: 'reddit_smoke_failed',
      errorMessage: 'getModerationLog returned permission denied.',
      observedAt: '2026-05-18T01:00:00.000Z',
    });
    await recordRuntimeHealthEvent({
      subreddit: 'ExampleLearning',
      capabilityId: 'execution-operations',
      status: 'passed',
      source: 'manual_qa',
      message: 'Manual note only; this must not enable live execution.',
      observedAt: '2026-05-18T01:10:00.000Z',
    });

    const matrix = await getRuntimeCapabilityMatrix(
      'ExampleLearning',
      '2026-05-18T01:15:00.000Z'
    );
    const reddit = matrix.entries.find((entry) => entry.id === 'reddit-api-smoke');
    const execution = matrix.entries.find(
      (entry) => entry.id === 'execution-operations'
    );

    expect(reddit).toMatchObject({
      state: 'failed_runtime',
      evidenceKind: 'failed',
      nextAction: 'getModerationLog returned permission denied.',
    });
    expect(execution).toMatchObject({
      state: 'disabled',
      destructive: true,
      safeToTest: false,
    });
    expect(matrix.summary.failedRuntime).toBe(1);
    expect(matrix.warnings.join(' ')).toContain('recorded failure');
  });
});
