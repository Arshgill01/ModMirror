import { context, reddit } from '@devvit/web/server';
import { isT1, isT3 } from '@devvit/shared-types/tid.js';
import {
  runRedisDataSmoke,
  runRedisStorageSmoke as runRedisStorageDataSmoke,
  runRedisSortedSetSmoke as runRedisSortedSetDataSmoke,
} from '../server/services/redis';
import { runRetentionCleanupSmoke as runRetentionCleanupDataSmoke } from '../server/services/privacyRetention';

export type SmokeTargetSummary = {
  id: string;
  kind: 'post' | 'comment' | 'unknown';
  authorName?: string;
  subredditName?: string;
};

export async function runRedisSmoke() {
  const subreddit = context.subredditName || context.subredditId || 'unknown';
  return runRedisDataSmoke(subreddit);
}

export async function runRedisSortedSetSmoke() {
  const subreddit = context.subredditName || context.subredditId || 'unknown';
  return runRedisSortedSetDataSmoke(subreddit);
}

export async function runRedisStorageSmoke() {
  const subreddit = context.subredditName || context.subredditId || 'unknown';
  return runRedisStorageDataSmoke(subreddit);
}

export async function runRetentionCleanupSmoke() {
  const subreddit = context.subredditName || context.subredditId || 'unknown';
  return runRetentionCleanupDataSmoke(subreddit);
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
