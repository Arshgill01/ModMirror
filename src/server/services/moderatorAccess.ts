export type CurrentUserWithModPermissions = {
  username: string;
  getModPermissionsForSubreddit?: (subredditName: string) => Promise<string[]>;
};

export type ModeratorAccessInput = {
  currentSubreddit?: string | undefined;
  contextUsername?: string | undefined;
  getCurrentUser: () => Promise<CurrentUserWithModPermissions | undefined>;
};

export type ModeratorAccessResult = {
  allowed: true;
  evidence:
    | 'skipped_no_subreddit_context'
    | 'moderator_permissions_verified';
  subreddit?: string;
  username?: string;
  permissions?: string[];
};

export type ModeratorAccessErrorCode =
  | 'current_user_required'
  | 'current_user_lookup_failed'
  | 'moderator_permissions_unavailable'
  | 'moderator_permissions_failed'
  | 'moderator_permissions_empty';

export class ModeratorAccessError extends Error {
  readonly code: ModeratorAccessErrorCode;

  constructor(code: ModeratorAccessErrorCode, message: string) {
    super(message);
    this.name = 'ModeratorAccessError';
    this.code = code;
  }
}

export async function assertModeratorAccess(
  input: ModeratorAccessInput
): Promise<ModeratorAccessResult> {
  const subreddit = normalizeSubredditName(input.currentSubreddit);
  if (subreddit === undefined) {
    return {
      allowed: true,
      evidence: 'skipped_no_subreddit_context',
    };
  }

  const currentUser = await input.getCurrentUser().catch((error: unknown) => {
    throw new ModeratorAccessError(
      'current_user_lookup_failed',
      `Unable to resolve current Reddit user: ${formatError(error)}`
    );
  });
  if (currentUser === undefined) {
    throw new ModeratorAccessError(
      'current_user_required',
      'A signed-in Reddit user is required for ModMirror API access.'
    );
  }
  if (currentUser.getModPermissionsForSubreddit === undefined) {
    throw new ModeratorAccessError(
      'moderator_permissions_unavailable',
      'Moderator permission checks are unavailable in this Devvit context.'
    );
  }

  const permissions = await currentUser
    .getModPermissionsForSubreddit(subreddit)
    .catch((error: unknown) => {
      throw new ModeratorAccessError(
        'moderator_permissions_failed',
        `Unable to verify moderator permissions: ${formatError(error)}`
      );
    });
  const normalizedPermissions = permissions
    .map((permission) => permission.trim())
    .filter(Boolean);

  if (normalizedPermissions.length === 0) {
    throw new ModeratorAccessError(
      'moderator_permissions_empty',
      'Moderator permissions are required for ModMirror API access.'
    );
  }

  const result: ModeratorAccessResult = {
    allowed: true,
    evidence: 'moderator_permissions_verified',
    subreddit,
    permissions: normalizedPermissions,
  };
  const username = input.contextUsername ?? currentUser.username;
  if (username !== undefined) {
    result.username = username;
  }
  return result;
}

export function isModeratorAccessError(
  error: unknown
): error is ModeratorAccessError {
  return error instanceof ModeratorAccessError;
}

function normalizeSubredditName(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/^r\//i, '');
  return normalized ? normalized : undefined;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
