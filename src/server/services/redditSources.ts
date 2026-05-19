import { context, reddit } from '@devvit/web/server';
import { MIRROR_SCAN_DEPTH_CONFIG } from '../../shared/constants';
import type {
  MirrorScanDepth,
  MirrorScanDepthMetadata,
  MirrorScanSources,
} from '../../shared/schema';
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
  depth?: MirrorScanDepth;
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

  const [rules, removalReasons, moderationLog] = await Promise.all([
    fetchRules(subreddit, warnings),
    fetchRemovalReasons(subreddit, warnings),
    fetchModerationLog(subreddit, options, warnings),
  ]);

  return {
    subreddit,
    source: 'live',
    rules,
    removalReasons,
    actions: moderationLog.actions,
    scanDepth: moderationLog.scanDepth,
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
): Promise<{
  actions: ReturnType<typeof normalizeModAction>[];
  scanDepth: MirrorScanDepthMetadata;
}> {
  const scanDepth = resolveScanDepth(options);
  try {
    const actions = (await reddit
      .getModerationLog({
        subredditName,
        limit: scanDepth.requestedLimit,
        pageSize: scanDepth.pageSize,
      })
      .all()) as RedditModActionLike[];
    const normalized = actions.map((action) =>
      normalizeModAction(action, subredditName)
    );
    const metadata: MirrorScanDepthMetadata = {
      ...scanDepth,
      fetchedActions: normalized.length,
      hitLimit: normalized.length >= scanDepth.requestedLimit,
      paginationStrategy: 'listing_all',
      runtimeVerified: false,
    };

    warnings.push(
      `Live ${metadata.depth} scan requested up to ${metadata.requestedLimit} moderation-log actions with page size ${metadata.pageSize}. Pagination is type-verified but not playtest-verified.`
    );
    if (metadata.hitLimit) {
      warnings.push(
        `Live scan reached the configured ${metadata.depth} cap. Older moderation actions may exist but were intentionally not fetched.`
      );
    } else if (metadata.fetchedActions < metadata.requestedLimit) {
      warnings.push(
        `Live scan returned ${metadata.fetchedActions} of ${metadata.requestedLimit} requested moderation-log actions. This may mean history is sparse or pagination stopped before the cap.`
      );
    }

    return {
      actions: normalized,
      scanDepth: metadata,
    };
  } catch (error) {
    warnings.push(`Unable to load moderation log: ${formatError(error)}`);
    return {
      actions: [],
      scanDepth: {
        ...scanDepth,
        fetchedActions: 0,
        hitLimit: false,
        paginationStrategy: 'listing_all',
        runtimeVerified: false,
      },
    };
  }
}

function resolveScanDepth(
  options: LiveMirrorScanSourceOptions
): Pick<
  MirrorScanDepthMetadata,
  'depth' | 'requestedLimit' | 'pageSize'
> {
  const depth = options.depth ?? 'standard';
  const config = MIRROR_SCAN_DEPTH_CONFIG[depth];

  return {
    depth,
    requestedLimit: options.limit ?? config.requestedLimit,
    pageSize: options.pageSize ?? config.pageSize,
  };
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
