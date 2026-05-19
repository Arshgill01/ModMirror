const SAFE_SUBREDDIT_PATTERN = /^[A-Za-z0-9_]{2,21}$/;

export class SubredditIsolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubredditIsolationError';
  }
}

export type SubredditScopeInput = {
  requestedSubreddit?: string | undefined;
  currentSubreddit?: string | undefined;
  demoSubreddit: string;
};

export function resolveSubredditScope(input: SubredditScopeInput): string {
  const current = normalizeSubredditName(input.currentSubreddit);
  const requested = normalizeSubredditName(input.requestedSubreddit);
  const demo = normalizeSubredditName(input.demoSubreddit) ?? input.demoSubreddit;

  if (requested === undefined) {
    return current ?? demo;
  }
  assertSafeSubredditName(requested);

  if (equalsSubreddit(requested, demo)) {
    return demo;
  }
  if (current !== undefined && equalsSubreddit(requested, current)) {
    return current;
  }

  throw new SubredditIsolationError(
    'Requested subreddit does not match the current Devvit subreddit context.'
  );
}

export function resolveLiveSubredditScope(input: {
  requestedSubreddit?: string | undefined;
  currentSubreddit?: string | undefined;
}): string | undefined {
  const current = normalizeSubredditName(input.currentSubreddit);
  const requested = normalizeSubredditName(input.requestedSubreddit);

  if (requested === undefined) {
    return current;
  }
  assertSafeSubredditName(requested);

  if (current !== undefined && equalsSubreddit(requested, current)) {
    return current;
  }

  throw new SubredditIsolationError(
    'Live subreddit requests must match the current Devvit subreddit context.'
  );
}

export function assertSafeSubredditName(subreddit: string): void {
  if (!SAFE_SUBREDDIT_PATTERN.test(subreddit)) {
    throw new SubredditIsolationError(
      'Subreddit names must be 2-21 letters, numbers, or underscores.'
    );
  }
}

export function isSubredditIsolationError(
  error: unknown
): error is SubredditIsolationError {
  return error instanceof SubredditIsolationError;
}

function normalizeSubredditName(value: string | undefined): string | undefined {
  const trimmed = value?.trim().replace(/^r\//i, '');
  return trimmed ? trimmed : undefined;
}

function equalsSubreddit(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}
