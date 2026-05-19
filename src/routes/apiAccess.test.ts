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
      }
      return Promise.resolve();
    }),
  },
}));

describe('api moderator access guard', () => {
  beforeEach(() => {
    devvitState.context.subredditName = 'modmirror_dev';
    devvitState.context.username = undefined;
    devvitState.currentUser = undefined;
    devvitState.strings.clear();
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
});
