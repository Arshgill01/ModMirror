import { describe, expect, it, vi } from 'vitest';
import { assertModeratorAccess } from './moderatorAccess';

describe('moderator access guard', () => {
  it('skips enforcement when Devvit has no subreddit context', async () => {
    const result = await assertModeratorAccess({
      getCurrentUser: vi.fn(),
    });

    expect(result).toEqual({
      allowed: true,
      evidence: 'skipped_no_subreddit_context',
    });
  });

  it('allows a user with any subreddit moderator permission', async () => {
    const getModPermissionsForSubreddit = vi.fn(async () => [
      'posts',
      'access',
    ]);

    const result = await assertModeratorAccess({
      currentSubreddit: 'r/modmirror_dev',
      contextUsername: 'context_mod',
      getCurrentUser: vi.fn(async () => ({
        username: 'api_mod',
        getModPermissionsForSubreddit,
      })),
    });

    expect(getModPermissionsForSubreddit).toHaveBeenCalledWith('modmirror_dev');
    expect(result).toMatchObject({
      allowed: true,
      evidence: 'moderator_permissions_verified',
      subreddit: 'modmirror_dev',
      username: 'context_mod',
      permissions: ['posts', 'access'],
    });
  });

  it('denies access when no signed-in user is available', async () => {
    await expect(
      assertModeratorAccess({
        currentSubreddit: 'modmirror_dev',
        getCurrentUser: vi.fn(async () => undefined),
      })
    ).rejects.toMatchObject({
      code: 'current_user_required',
    });
  });

  it('denies access when permission checks are unavailable', async () => {
    await expect(
      assertModeratorAccess({
        currentSubreddit: 'modmirror_dev',
        getCurrentUser: vi.fn(async () => ({
          username: 'maybe_mod',
        })),
      })
    ).rejects.toMatchObject({
      code: 'moderator_permissions_unavailable',
    });
  });

  it('denies access when the user has no subreddit moderator permissions', async () => {
    await expect(
      assertModeratorAccess({
        currentSubreddit: 'modmirror_dev',
        getCurrentUser: vi.fn(async () => ({
          username: 'not_mod',
          getModPermissionsForSubreddit: vi.fn(async () => []),
        })),
      })
    ).rejects.toMatchObject({
      code: 'moderator_permissions_empty',
    });
  });

  it('denies access when the Reddit permission check fails', async () => {
    await expect(
      assertModeratorAccess({
        currentSubreddit: 'modmirror_dev',
        getCurrentUser: vi.fn(async () => ({
          username: 'maybe_mod',
          getModPermissionsForSubreddit: vi.fn(async () => {
            throw new Error('permission denied');
          }),
        })),
      })
    ).rejects.toMatchObject({
      code: 'moderator_permissions_failed',
      message: 'Unable to verify moderator permissions: permission denied',
    });
  });
});
