import { describe, expect, it, vi } from 'vitest';
import {
  getTargetType,
  resolveModerationTargetContext,
  type TargetContextDependencies,
} from './targetContext';

describe('target context service', () => {
  it('detects supported Reddit target types', () => {
    expect(getTargetType('t3_post')).toBe('post');
    expect(getTargetType('t1_comment')).toBe('comment');
    expect(getTargetType('t5_subreddit')).toBe('unknown');
  });

  it('resolves post context with moderator permissions', async () => {
    const deps: TargetContextDependencies = {
      getPostById: vi.fn(async () => ({
        id: 't3_post',
        authorName: 'poster',
        subredditName: 'modmirror_dev',
        title: 'Target post',
        body: 'Body text',
        permalink: '/r/modmirror_dev/comments/post/target_post/',
      })),
      getCommentById: vi.fn(),
      getCurrentUser: vi.fn(async () => ({
        username: 'mod_a',
        getModPermissionsForSubreddit: vi.fn(async () => ['posts', 'access']),
      })),
      contextUsername: 'mod_a',
    };

    const context = await resolveModerationTargetContext('t3_post', deps);

    expect(context).toMatchObject({
      targetThingId: 't3_post',
      targetType: 'post',
      subreddit: 'modmirror_dev',
      authorName: 'poster',
      title: 'Target post',
      body: 'Body text',
      permalink: 'https://www.reddit.com/r/modmirror_dev/comments/post/target_post/',
      currentModerator: 'mod_a',
      modPermissions: ['posts', 'access'],
      warnings: [],
    });
    expect(deps.getCommentById).not.toHaveBeenCalled();
  });

  it('resolves comment context', async () => {
    const deps: TargetContextDependencies = {
      getPostById: vi.fn(),
      getCommentById: vi.fn(async () => ({
        id: 't1_comment',
        authorName: 'commenter',
        subredditName: 'modmirror_dev',
        body: 'Comment body',
        permalink: '/r/modmirror_dev/comments/post/_/comment/',
      })),
      getCurrentUser: vi.fn(async () => undefined),
    };

    const context = await resolveModerationTargetContext('t1_comment', deps);

    expect(context.targetType).toBe('comment');
    expect(context.authorName).toBe('commenter');
    expect(context.body).toBe('Comment body');
    expect(context.warnings).toContain(
      'Moderator permissions were not available in this context.'
    );
    expect(deps.getPostById).not.toHaveBeenCalled();
  });

  it('returns an unsupported target result without fetching Reddit data', async () => {
    const deps: TargetContextDependencies = {
      getPostById: vi.fn(),
      getCommentById: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    const context = await resolveModerationTargetContext('t5_subreddit', deps);

    expect(context).toEqual({
      targetThingId: 't5_subreddit',
      targetType: 'unknown',
      warnings: ['Unsupported target type. Expected a post t3_ or comment t1_ ID.'],
    });
    expect(deps.getPostById).not.toHaveBeenCalled();
    expect(deps.getCommentById).not.toHaveBeenCalled();
    expect(deps.getCurrentUser).not.toHaveBeenCalled();
  });
});
