import { context, reddit } from '@devvit/web/server';
import { isT1, isT3, type T1, type T3 } from '@devvit/shared-types/tid.js';
import type {
  ModerationTargetContext,
  ModerationTargetType,
} from '../../shared/schema';

type PostLike = {
  id: string;
  authorName?: string | undefined;
  subredditName?: string | undefined;
  title?: string | undefined;
  body?: string | undefined;
  permalink?: string | undefined;
};

type CommentLike = {
  id: string;
  authorName?: string | undefined;
  subredditName?: string | undefined;
  body?: string | undefined;
  permalink?: string | undefined;
  postId?: string | undefined;
};

type CurrentUserLike = {
  username: string;
  getModPermissionsForSubreddit?: (subredditName: string) => Promise<string[]>;
};

export type TargetContextDependencies = {
  getPostById: (id: T3) => Promise<PostLike>;
  getCommentById: (id: T1) => Promise<CommentLike>;
  getCurrentUser: () => Promise<CurrentUserLike | undefined>;
  contextUsername?: string | undefined;
};

export function getTargetType(targetThingId: string): ModerationTargetType {
  if (isT3(targetThingId)) {
    return 'post';
  }
  if (isT1(targetThingId)) {
    return 'comment';
  }
  return 'unknown';
}

export async function resolveModerationTargetContext(
  targetThingId: string,
  dependencies: TargetContextDependencies = defaultDependencies()
): Promise<ModerationTargetContext> {
  const normalizedTargetId = targetThingId.trim();
  if (!normalizedTargetId) {
    throw new Error('targetThingId is required');
  }

  const targetType = getTargetType(normalizedTargetId);
  const warnings: string[] = [];

  if (targetType === 'unknown') {
    return {
      targetThingId: normalizedTargetId,
      targetType,
      warnings: ['Unsupported target type. Expected a post t3_ or comment t1_ ID.'],
    };
  }

  const target =
    targetType === 'post'
      ? await dependencies.getPostById(normalizedTargetId as T3)
      : await dependencies.getCommentById(normalizedTargetId as T1);

  const resolved: ModerationTargetContext = {
    targetThingId: target.id,
    targetType,
    warnings,
  };

  if (target.subredditName !== undefined) {
    resolved.subreddit = target.subredditName;
  }
  if (target.authorName !== undefined) {
    resolved.authorName = target.authorName;
  }
  if ('title' in target && target.title !== undefined) {
    resolved.title = target.title;
  }
  if (target.body !== undefined) {
    resolved.body = truncateBody(target.body);
  }
  if (target.permalink !== undefined) {
    resolved.permalink = toRedditUrl(target.permalink);
  }

  const currentUser = await dependencies.getCurrentUser().catch((error) => {
    warnings.push(`Unable to resolve current moderator: ${formatError(error)}`);
    return undefined;
  });
  const currentModerator = dependencies.contextUsername ?? currentUser?.username;
  if (currentModerator !== undefined) {
    resolved.currentModerator = currentModerator;
  }

  if (
    currentUser?.getModPermissionsForSubreddit !== undefined &&
    resolved.subreddit !== undefined
  ) {
    try {
      resolved.modPermissions =
        await currentUser.getModPermissionsForSubreddit(resolved.subreddit);
    } catch (error) {
      warnings.push(`Unable to resolve moderator permissions: ${formatError(error)}`);
    }
  } else {
    warnings.push('Moderator permissions were not available in this context.');
  }

  return resolved;
}

function defaultDependencies(): TargetContextDependencies {
  return {
    getPostById: (id) => reddit.getPostById(id),
    getCommentById: (id) => reddit.getCommentById(id),
    getCurrentUser: () => reddit.getCurrentUser(),
    contextUsername: context.username,
  };
}

function truncateBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= 500) {
    return trimmed;
  }
  return `${trimmed.slice(0, 497)}...`;
}

function toRedditUrl(permalink: string): string {
  return permalink.startsWith('http')
    ? permalink
    : `https://www.reddit.com${permalink}`;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
