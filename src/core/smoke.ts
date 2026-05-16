import { context, reddit, redis } from '@devvit/web/server';
import { isT1, isT3 } from '@devvit/shared-types/tid.js';
import { mmKey } from '../shared';

export type SmokeTargetSummary = {
  id: string;
  kind: 'post' | 'comment' | 'unknown';
  authorName?: string;
  subredditName?: string;
};

export async function runRedisSmoke() {
  const subreddit = context.subredditName || context.subredditId || 'unknown';
  const key = mmKey(subreddit, 'wave0:redis-smoke');
  const value = JSON.stringify({
    appSlug: context.appSlug,
    subredditId: context.subredditId,
    subredditName: context.subredditName,
    checkedAt: new Date().toISOString(),
  });

  await redis.set(key, value);
  const readBack = await redis.get(key);

  return {
    key,
    readBack,
    ok: readBack === value,
  };
}

export async function getTargetSummary(
  targetId: string
): Promise<SmokeTargetSummary> {
  if (isT3(targetId)) {
    const post = await reddit.getPostById(targetId);
    return {
      id: post.id,
      kind: 'post',
      authorName: post.authorName,
      subredditName: post.subredditName,
    };
  }

  if (isT1(targetId)) {
    const comment = await reddit.getCommentById(targetId);
    return {
      id: comment.id,
      kind: 'comment',
      authorName: comment.authorName,
      subredditName: comment.subredditName,
    };
  }

  return {
    id: targetId,
    kind: 'unknown',
  };
}

export async function runRedditSmoke() {
  const subreddit = await reddit.getCurrentSubreddit();
  const currentUser = await reddit.getCurrentUser();
  const subredditName = subreddit.name;

  const [rules, removalReasons, modActions] = await Promise.all([
    reddit.getRules(subredditName),
    reddit.getSubredditRemovalReasons(subredditName),
    reddit
      .getModerationLog({
        subredditName,
        limit: 5,
        pageSize: 5,
      })
      .all(),
  ]);

  const modPermissions = currentUser
    ? await currentUser.getModPermissionsForSubreddit(subredditName)
    : [];

  return {
    context: {
      appSlug: context.appSlug,
      subredditId: context.subredditId,
      subredditName: context.subredditName,
      username: context.username,
    },
    currentUser: currentUser
      ? {
          id: currentUser.id,
          username: currentUser.username,
          modPermissions,
        }
      : undefined,
    subreddit: {
      id: subreddit.id,
      name: subreddit.name,
    },
    rules: rules.map((rule) => rule.toJSON()),
    removalReasons,
    modActions: modActions.map((action) => ({
      id: action.id,
      type: action.type,
      moderatorName: action.moderatorName,
      createdAt: action.createdAt.toISOString(),
      subredditName: action.subredditName,
      description: action.description,
      details: action.details,
      target: action.target,
    })),
  };
}
