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

type RedditListingLike<T> = {
  all?: () => Promise<T[]>;
  get?: (count: number) => Promise<T[]>;
  hasMore?: boolean;
  children?: T[];
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
    const listing = reddit.getModerationLog({
      subredditName,
      limit: scanDepth.requestedLimit,
      pageSize: scanDepth.pageSize,
    }) as RedditListingLike<RedditModActionLike>;
    const {
      actions,
      observedPageFetches,
      observedMultiplePages,
      paginationStrategy,
    } = await collectListingWithPageEvidence(
      listing,
      scanDepth.requestedLimit,
      scanDepth.pageSize
    );
    const normalized = actions.map((action) =>
      normalizeModAction(action, subredditName)
    );
    const metadata: MirrorScanDepthMetadata = {
      ...scanDepth,
      fetchedActions: normalized.length,
      hitLimit: normalized.length >= scanDepth.requestedLimit,
      paginationStrategy,
      observedPageFetches,
      observedMultiplePages,
      runtimeStatus:
        paginationStrategy === 'listing_get_pages'
          ? observedMultiplePages
            ? 'multiple_pages_observed'
            : observedPageFetches === 1
              ? 'single_page_observed'
              : 'not_observed'
          : 'not_observed',
      runtimeVerified: false,
    };

    if (metadata.observedMultiplePages && metadata.observedPageFetches) {
      warnings.push(
        `Live ${metadata.depth} scan observed ${metadata.observedPageFetches} moderation-log page fetches with page size ${metadata.pageSize}. Historical attribution remains confidence-scored.`
      );
    } else {
      warnings.push(
        `Live ${metadata.depth} scan requested up to ${metadata.requestedLimit} moderation-log actions with page size ${metadata.pageSize}. Pagination is type-verified but not playtest-verified.`
      );
    }
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
        observedPageFetches: 0,
        observedMultiplePages: false,
        runtimeStatus: 'fetch_failed',
        runtimeVerified: false,
      },
    };
  }
}

async function collectListingWithPageEvidence<T>(
  listing: RedditListingLike<T>,
  requestedLimit: number,
  pageSize: number
): Promise<{
  actions: T[];
  observedPageFetches: number;
  observedMultiplePages: boolean;
  paginationStrategy: MirrorScanDepthMetadata['paginationStrategy'];
}> {
  if (
    typeof listing.get !== 'function' ||
    !Array.isArray(listing.children) ||
    typeof listing.hasMore !== 'boolean'
  ) {
    const actions =
      typeof listing.all === 'function' ? await listing.all() : [];
    return {
      actions: actions.slice(0, requestedLimit),
      observedPageFetches: actions.length > 0 ? 1 : 0,
      observedMultiplePages: false,
      paginationStrategy: 'listing_all',
    };
  }

  let observedPageFetches = 0;
  let previousLength = listing.children.length;

  while (listing.hasMore && listing.children.length < requestedLimit) {
    const targetCount = Math.min(
      requestedLimit,
      listing.children.length + pageSize
    );
    await listing.get(targetCount);

    const currentLength = listing.children.length;
    if (currentLength <= previousLength) {
      break;
    }

    observedPageFetches += 1;
    previousLength = currentLength;
  }

  const actions = listing.children.slice(0, requestedLimit);
  return {
    actions,
    observedPageFetches,
    observedMultiplePages: observedPageFetches > 1,
    paginationStrategy: 'listing_get_pages',
  };
}

function resolveScanDepth(
  options: LiveMirrorScanSourceOptions
): Pick<MirrorScanDepthMetadata, 'depth' | 'requestedLimit' | 'pageSize'> {
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
