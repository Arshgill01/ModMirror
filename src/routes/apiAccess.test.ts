import { beforeEach, describe, expect, it, vi } from 'vitest';

const devvitState = vi.hoisted(() => ({
  context: {
    appSlug: 'modmirror',
    appVersion: '0.0.1.test',
    subredditId: 't5_modmirror',
    subredditName: 'modmirror_dev',
    username: undefined as string | undefined,
    postData: undefined,
  },
  currentUser: undefined as
    | {
        username: string;
        getModPermissionsForSubreddit?: (subredditName: string) => Promise<string[]>;
      }
    | undefined,
  strings: new Map<string, string>(),
  sortedSets: new Map<string, Array<{ member: string; score: number }>>(),
}));

vi.mock('@devvit/web/server', () => ({
  context: devvitState.context,
  reddit: {
    getCurrentUser: vi.fn(() => Promise.resolve(devvitState.currentUser)),
  },
  redis: {
    get: vi.fn((key: string) => Promise.resolve(devvitState.strings.get(key))),
    set: vi.fn((key: string, value: string) => {
      devvitState.strings.set(key, value);
      return Promise.resolve();
    }),
    del: vi.fn((...keys: string[]) => {
      for (const key of keys) {
        devvitState.strings.delete(key);
        devvitState.sortedSets.delete(key);
      }
      return Promise.resolve();
    }),
    exists: vi.fn((...keys: string[]) =>
      Promise.resolve(
        keys.filter(
          (key) =>
            devvitState.strings.has(key) || devvitState.sortedSets.has(key)
        ).length
      )
    ),
    zAdd: vi.fn((key: string, ...values: { member: string; score: number }[]) => {
      const rows = devvitState.sortedSets.get(key) ?? [];
      rows.push(...values);
      devvitState.sortedSets.set(key, rows);
      return Promise.resolve(values.length);
    }),
    zCard: vi.fn((key: string) =>
      Promise.resolve(devvitState.sortedSets.get(key)?.length ?? 0)
    ),
    zScore: vi.fn((key: string, member: string) =>
      Promise.resolve(
        devvitState.sortedSets.get(key)?.find((row) => row.member === member)
          ?.score
      )
    ),
    zRange: vi.fn(
      (
        key: string,
        start: number,
        end: number,
        options?: { reverse?: boolean }
      ) => {
        const rows = [...(devvitState.sortedSets.get(key) ?? [])].sort(
          (left, right) =>
            options?.reverse ? right.score - left.score : left.score - right.score
        );
        const normalizedEnd = end < 0 ? rows.length : end + 1;
        return Promise.resolve(rows.slice(start, normalizedEnd));
      }
    ),
  },
}));

describe('api moderator access guard', () => {
  beforeEach(() => {
    devvitState.context.subredditName = 'modmirror_dev';
    devvitState.context.username = undefined;
    devvitState.currentUser = undefined;
    devvitState.strings.clear();
    devvitState.sortedSets.clear();
    vi.clearAllMocks();
  });

  it('leaves public health metadata reachable without a current user', async () => {
    const { api } = await import('./api');

    const response = await api.request('/health');
    const payload = (await response.json()) as {
      ok: true;
      subreddit: { name: string | null };
    };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.subreddit.name).toBe('modmirror_dev');
  });

  it('blocks protected routes when the current user is not available', async () => {
    const { api } = await import('./api');

    const response = await api.request('/policies');
    const payload = (await response.json()) as {
      ok: false;
      error: { code: string; message: string };
    };

    expect(response.status).toBe(403);
    expect(payload.error.code).toBe('moderator_access_required');
    expect(payload.error.message).toContain('signed-in Reddit user');
  });

  it('allows protected routes when moderator permissions are present', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => ['posts']);
    devvitState.context.username = 'mod_a';
    devvitState.currentUser = {
      username: 'mod_a',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/runtime-capabilities');
    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(getModPermissionsForSubreddit).toHaveBeenCalledWith('modmirror_dev');
  });

  it('returns the current moderator permission strings from the protected diagnostic route', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => [
      'all',
      'posts',
      'access',
    ]);
    devvitState.context.username = 'mod_a';
    devvitState.currentUser = {
      username: 'mod_a',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/access/diagnostics');
    const payload = (await response.json()) as {
      ok: true;
      data: {
        subreddit: string;
        username: string;
        evidence: string;
        permissionCount: number;
        permissions: string[];
        moderatorVisibilityLevel: string;
        source: string;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.data).toEqual({
      subreddit: 'modmirror_dev',
      username: 'mod_a',
      evidence: 'moderator_permissions_verified',
      permissionCount: 3,
      permissions: ['all', 'posts', 'access'],
      moderatorVisibilityLevel: 'full_moderator',
      source: 'current_user_permissions',
    });
    expect(getModPermissionsForSubreddit).toHaveBeenCalledWith('modmirror_dev');
  });

  it('keeps diagnostic visibility aggregate-only without the all permission', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => ['posts']);
    devvitState.context.username = 'mod_b';
    devvitState.currentUser = {
      username: 'mod_b',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/access/diagnostics');
    const payload = (await response.json()) as {
      ok: true;
      data: {
        moderatorVisibilityLevel: string;
      };
    };

    expect(response.status).toBe(200);
    expect(payload.data.moderatorVisibilityLevel).toBe('aggregate_only');
    expect(getModPermissionsForSubreddit).toHaveBeenCalledWith('modmirror_dev');
  });

  it('records protected manual runtime capability events', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => ['all']);
    devvitState.context.username = 'mod_a';
    devvitState.currentUser = {
      username: 'mod_a',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/runtime-capabilities/events', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        subreddit: 'modmirror_dev',
        capabilityId: 'menu-entrypoints',
        status: 'passed',
        source: 'manual_qa',
        message: 'Post menu target capture observed in desktop playtest.',
      }),
    });
    const eventPayload = (await response.json()) as {
      ok: true;
      data: {
        capabilityId: string;
        status: string;
        source: string;
      };
    };

    expect(response.status).toBe(201);
    expect(eventPayload.data).toMatchObject({
      capabilityId: 'menu-entrypoints',
      status: 'passed',
      source: 'manual_qa',
    });

    const matrixResponse = await api.request(
      '/runtime-capabilities?subreddit=modmirror_dev'
    );
    const matrixPayload = (await matrixResponse.json()) as {
      ok: true;
      data: {
        entries: Array<{
          id: string;
          state: string;
          lastHealthEvent?: { source: string; message: string };
        }>;
      };
    };
    const menuEntry = matrixPayload.data.entries.find(
      (entry) => entry.id === 'menu-entrypoints'
    );

    expect(matrixResponse.status).toBe(200);
    expect(menuEntry).toMatchObject({
      state: 'verified_runtime',
      lastHealthEvent: {
        source: 'manual_qa',
        message: 'Post menu target capture observed in desktop playtest.',
      },
    });
  });

  it('records Redis sorted-set smoke results as runtime health events', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => ['all']);
    devvitState.context.username = 'mod_a';
    devvitState.currentUser = {
      username: 'mod_a',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/smoke/redis-zset', {
      method: 'POST',
    });
    const payload = (await response.json()) as {
      ok: boolean;
      addCount: number;
      cardinality: number;
      expectedOrder: string[];
      observedOrder: string[];
      observedScores: number[];
      scoreChecks: Record<string, number | undefined>;
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      addCount: 3,
      cardinality: 3,
      expectedOrder: ['newest', 'middle', 'oldest'],
      observedOrder: ['newest', 'middle', 'oldest'],
      observedScores: [3000, 2000, 1000],
      scoreChecks: {
        newest: 3000,
        middle: 2000,
        oldest: 1000,
      },
    });

    const matrixResponse = await api.request(
      '/runtime-capabilities?subreddit=modmirror_dev'
    );
    const matrixPayload = (await matrixResponse.json()) as {
      ok: true;
      data: {
        entries: Array<{
          id: string;
          state: string;
          lastHealthEvent?: { source: string; message: string };
        }>;
      };
    };
    const zsetEntry = matrixPayload.data.entries.find(
      (entry) => entry.id === 'redis-zset-ordering'
    );

    expect(matrixResponse.status).toBe(200);
    expect(zsetEntry).toMatchObject({
      state: 'verified_runtime',
      lastHealthEvent: {
        source: 'smoke_route',
        message: 'Redis sorted-set reverse-rank order matched.',
      },
    });
  });

  it('records Redis storage-envelope smoke results as runtime health events', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => ['all']);
    devvitState.context.username = 'mod_a';
    devvitState.currentUser = {
      username: 'mod_a',
      getModPermissionsForSubreddit,
    };

    const { api } = await import('./api');

    const response = await api.request('/smoke/redis-storage', {
      method: 'POST',
    });
    const payload = (await response.json()) as {
      ok: boolean;
      expected: {
        scanMetadataCount: number;
        actionEventCount: number;
        overrideEventCount: number;
      };
      observed: {
        scanIndexCardinality: number;
        actionIndexCardinality: number;
        overrideIndexCardinality: number;
        postCleanupExistingKeys: number;
      };
    };

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      ok: true,
      expected: {
        scanMetadataCount: 10,
        actionEventCount: 500,
        overrideEventCount: 500,
      },
      observed: {
        scanIndexCardinality: 10,
        actionIndexCardinality: 500,
        overrideIndexCardinality: 500,
        postCleanupExistingKeys: 0,
      },
    });

    const matrixResponse = await api.request(
      '/runtime-capabilities?subreddit=modmirror_dev'
    );
    const matrixPayload = (await matrixResponse.json()) as {
      ok: true;
      data: {
        entries: Array<{
          id: string;
          state: string;
          lastHealthEvent?: { source: string; message: string };
        }>;
      };
    };
    const storageEntry = matrixPayload.data.entries.find(
      (entry) => entry.id === 'redis-storage-envelope'
    );

    expect(matrixResponse.status).toBe(200);
    expect(storageEntry).toMatchObject({
      state: 'verified_runtime',
      lastHealthEvent: {
        source: 'smoke_route',
        message:
          'Redis storage envelope smoke matched expected counts and cleaned up.',
      },
    });
  });
});
