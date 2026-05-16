import { context, reddit } from '@devvit/web/server';
import type { MirrorScanSources } from '../../shared/schema';
import {
  normalizeModAction,
  normalizeRedditRule,
  normalizeRemovalReason,
  type RedditModActionLike,
  type RedditRemovalReasonLike,
  type RedditRuleLike,
} from './normalizers';

export type LiveMirrorScanSourceOptions = {
  subredditName?: string;
  limit?: number;
  pageSize?: number;
};

export async function loadLiveMirrorScanSources(
  options: LiveMirrorScanSourceOptions = {}
): Promise<MirrorScanSources> {
  const warnings: string[] = [];
  const subreddit = await resolveSubredditName(options.subredditName, warnings);

  if (!subreddit) {
    return {
      subreddit: 'unknown',
      source: 'live',
      rules: [],
      removalReasons: [],
      actions: [],
      warnings,
    };
  }

  const [rules, removalReasons, actions] = await Promise.all([
    fetchRules(subreddit, warnings),
    fetchRemovalReasons(subreddit, warnings),
    fetchModerationLog(subreddit, options, warnings),
  ]);

  return {
    subreddit,
    source: 'live',
    rules,
    removalReasons,
    actions,
    warnings,
  };
}

async function resolveSubredditName(
  requestedSubreddit: string | undefined,
  warnings: string[]
): Promise<string | undefined> {
  if (requestedSubreddit) {
    return requestedSubreddit;
  }

  if (context.subredditName) {
    return context.subredditName;
  }

  try {
    return (await reddit.getCurrentSubreddit()).name;
  } catch (error) {
    warnings.push(
      `Unable to resolve current subreddit for live scan: ${formatError(error)}`
    );
    return undefined;
  }
}

async function fetchRules(subredditName: string, warnings: string[]) {
  try {
    const rules = (await reddit.getRules(subredditName)) as RedditRuleLike[];
    return rules.map(normalizeRedditRule);
  } catch (error) {
    warnings.push(`Unable to load subreddit rules: ${formatError(error)}`);
    return [];
  }
}

async function fetchRemovalReasons(subredditName: string, warnings: string[]) {
  try {
    const reasons = (await reddit.getSubredditRemovalReasons(
      subredditName
    )) as RedditRemovalReasonLike[];
    return reasons.map(normalizeRemovalReason);
  } catch (error) {
    warnings.push(`Unable to load removal reasons: ${formatError(error)}`);
    return [];
  }
}

async function fetchModerationLog(
  subredditName: string,
  options: LiveMirrorScanSourceOptions,
  warnings: string[]
) {
  try {
    const actions = (await reddit
      .getModerationLog({
        subredditName,
        limit: options.limit ?? 60,
        pageSize: options.pageSize ?? 60,
      })
      .all()) as RedditModActionLike[];
    return actions.map((action) => normalizeModAction(action, subredditName));
  } catch (error) {
    warnings.push(`Unable to load moderation log: ${formatError(error)}`);
    return [];
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
