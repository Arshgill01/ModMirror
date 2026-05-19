import { context, reddit } from '@devvit/web/server';
import type { JsonObject, JsonValue } from '@devvit/shared-types/json.js';
import type { PostData } from '@devvit/shared-types/PostData.js';
import { isT1, isT3, type T1, type T3 } from '@devvit/shared-types/tid.js';
import type {
  LaunchContextResponse,
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

export function buildApplyPolicyLaunchPostData(
  target: ModerationTargetContext,
  createdAt = new Date().toISOString()
): PostData {
  const launchTarget = compactJson({
    targetThingId: target.targetThingId,
    targetType: target.targetType,
    subreddit: target.subreddit,
    authorName: target.authorName,
    title: target.title,
    body: target.body,
    permalink: target.permalink,
    currentModerator: target.currentModerator,
    warnings: target.warnings,
  });

  return {
    modmirrorLaunchContext: compactJson({
      version: 1,
      source: 'apply_policy_menu',
      createdAt,
      target: launchTarget,
    }),
  };
}

export function readApplyPolicyLaunchContext(
  postData: PostData | undefined
): LaunchContextResponse {
  const warnings: string[] = [];
  if (postData === undefined) {
    return { warnings };
  }

  const raw = postData.modmirrorLaunchContext;
  if (!isJsonObject(raw)) {
    return { warnings };
  }
  if (raw.source !== 'apply_policy_menu') {
    warnings.push('Custom post launch context was not an Apply Policy context.');
    return { warnings };
  }

  const target = parseLaunchTarget(raw.target);
  if (target === undefined) {
    warnings.push('Custom post launch context did not contain a valid moderation target.');
    return { source: 'apply_policy_menu', warnings };
  }

  const response: LaunchContextResponse = {
    target,
    source: 'apply_policy_menu',
    warnings,
  };
  if (typeof raw.createdAt === 'string') {
    response.createdAt = raw.createdAt;
  }
  return response;
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

function parseLaunchTarget(value: unknown): ModerationTargetContext | undefined {
  if (!isJsonObject(value)) {
    return undefined;
  }
  if (
    typeof value.targetThingId !== 'string' ||
    typeof value.targetType !== 'string' ||
    !['post', 'comment', 'unknown'].includes(value.targetType)
  ) {
    return undefined;
  }

  const target: ModerationTargetContext = {
    targetThingId: value.targetThingId,
    targetType: value.targetType as ModerationTargetType,
    warnings: parseStringArray(value.warnings),
  };
  copyString(value.subreddit, (text) => {
    target.subreddit = text;
  });
  copyString(value.authorName, (text) => {
    target.authorName = text;
  });
  copyString(value.title, (text) => {
    target.title = text;
  });
  copyString(value.body, (text) => {
    target.body = text;
  });
  copyString(value.permalink, (text) => {
    target.permalink = text;
  });
  copyString(value.currentModerator, (text) => {
    target.currentModerator = text;
  });
  return target;
}

function compactJson(input: Record<string, JsonValue | undefined>): JsonObject {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as JsonObject;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function copyString(value: unknown, assign: (text: string) => void): void {
  if (typeof value === 'string') {
    assign(value);
  }
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}
