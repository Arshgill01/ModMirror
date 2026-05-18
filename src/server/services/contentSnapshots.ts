import type {
  ApplyPolicyPreviewInput,
  ContentSnapshot,
  ContentSnapshotSource,
  ModerationTargetContext,
  ModerationTargetType,
} from '../../shared/schema';
import {
  getTargetType,
  resolveModerationTargetContext,
  type TargetContextDependencies,
} from './targetContext';

const TITLE_EXCERPT_LIMIT = 160;
const BODY_EXCERPT_LIMIT = 500;

export type ContentSnapshotInput = {
  targetThingId?: string;
  targetType?: ModerationTargetType;
  subreddit?: string;
  authorName?: string;
  title?: string;
  body?: string;
  permalink?: string;
  source?: ContentSnapshotSource;
};

export type ContentSnapshotDependencies = TargetContextDependencies & {
  now: () => string;
};

export async function captureContentSnapshot(
  input: ContentSnapshotInput,
  dependencies?: ContentSnapshotDependencies
): Promise<ContentSnapshot> {
  const fetchedAt = dependencies?.now() ?? new Date().toISOString();
  const targetThingId = input.targetThingId?.trim();

  if (!targetThingId) {
    return createSnapshot({
      input,
      fetchedAt,
      targetType: 'unknown',
      fetchStatus: 'not_provided',
      warnings: [
        'No Reddit post/comment target was provided, so no content snapshot was captured.',
      ],
    });
  }

  if (hasProvidedContent(input)) {
    return createSnapshot({
      input,
      fetchedAt,
      targetType: input.targetType ?? getTargetType(targetThingId),
      fetchStatus: 'captured',
      warnings: [],
    });
  }

  if (dependencies === undefined) {
    return createSnapshot({
      input,
      fetchedAt,
      targetType: input.targetType ?? getTargetType(targetThingId),
      fetchStatus: 'degraded',
      warnings: [
        'Content fetch was skipped because no Reddit fetch dependencies were available in this context.',
      ],
    });
  }

  try {
    const target = await resolveModerationTargetContext(targetThingId, dependencies);
    return contentSnapshotFromTargetContext(target, {
      fetchedAt,
      source: input.source ?? 'api',
    });
  } catch (error) {
    return createSnapshot({
      input,
      fetchedAt,
      targetType: input.targetType ?? getTargetType(targetThingId),
      fetchStatus: 'degraded',
      warnings: [`Unable to fetch Reddit target content: ${formatError(error)}`],
    });
  }
}

export async function captureContentSnapshotForApplyPolicy(
  input: ApplyPolicyPreviewInput
): Promise<ContentSnapshot> {
  if (input.contentSnapshot !== undefined) {
    return input.contentSnapshot;
  }

  const snapshotInput: ContentSnapshotInput = {
    source: input.source === 'demo' ? 'demo' : 'provided',
  };
  if (input.targetThingId !== undefined) {
    snapshotInput.targetThingId = input.targetThingId;
  }
  if (input.targetType !== undefined) {
    snapshotInput.targetType = input.targetType;
  }
  if (input.subreddit !== undefined) {
    snapshotInput.subreddit = input.subreddit;
  }
  if (input.targetAuthor !== undefined) {
    snapshotInput.authorName = input.targetAuthor;
  }
  if (input.targetTitle !== undefined) {
    snapshotInput.title = input.targetTitle;
  }
  if (input.targetBody !== undefined) {
    snapshotInput.body = input.targetBody;
  }
  if (input.targetPermalink !== undefined) {
    snapshotInput.permalink = input.targetPermalink;
  }

  return captureContentSnapshot(snapshotInput);
}

export function contentSnapshotFromTargetContext(
  target: ModerationTargetContext,
  options: {
    fetchedAt?: string;
    source?: ContentSnapshotSource;
  } = {}
): ContentSnapshot {
  const input: ContentSnapshotInput = {
    targetThingId: target.targetThingId,
    targetType: target.targetType,
    source: options.source ?? 'menu',
  };
  if (target.subreddit !== undefined) {
    input.subreddit = target.subreddit;
  }
  if (target.authorName !== undefined) {
    input.authorName = target.authorName;
  }
  if (target.title !== undefined) {
    input.title = target.title;
  }
  if (target.body !== undefined) {
    input.body = target.body;
  }
  if (target.permalink !== undefined) {
    input.permalink = target.permalink;
  }

  return createSnapshot({
    input,
    fetchedAt: options.fetchedAt ?? new Date().toISOString(),
    targetType: target.targetType,
    fetchStatus: target.targetType === 'unknown' ? 'degraded' : 'captured',
    warnings: target.warnings,
  });
}

function createSnapshot(options: {
  input: ContentSnapshotInput;
  fetchedAt: string;
  targetType: ModerationTargetType;
  fetchStatus: ContentSnapshot['fetchStatus'];
  warnings: string[];
}): ContentSnapshot {
  const snapshot: ContentSnapshot = {
    schemaVersion: 1,
    targetType: options.targetType,
    fetchedAt: options.fetchedAt,
    fetchStatus: options.fetchStatus,
    source: options.input.source ?? 'api',
    warnings: [...options.warnings],
    privacy: buildPrivacyMetadata(options.input),
  };

  copySnapshotFields(snapshot, options.input);
  return snapshot;
}

function copySnapshotFields(
  snapshot: ContentSnapshot,
  input: ContentSnapshotInput
): void {
  if (input.targetThingId !== undefined && input.targetThingId.trim()) {
    snapshot.targetThingId = input.targetThingId.trim();
  }
  if (input.subreddit !== undefined && input.subreddit.trim()) {
    snapshot.subreddit = input.subreddit.trim();
  }
  if (input.authorName !== undefined && input.authorName.trim()) {
    snapshot.authorName = input.authorName.trim();
  }
  const titleExcerpt = excerpt(input.title, TITLE_EXCERPT_LIMIT);
  if (titleExcerpt !== undefined) {
    snapshot.titleExcerpt = titleExcerpt;
  }
  const bodyExcerpt = excerpt(input.body, BODY_EXCERPT_LIMIT);
  if (bodyExcerpt !== undefined) {
    snapshot.bodyExcerpt = bodyExcerpt;
  }
  if (input.permalink !== undefined && input.permalink.trim()) {
    snapshot.permalink = toRedditUrl(input.permalink.trim());
  }
}

function buildPrivacyMetadata(
  input: ContentSnapshotInput
): ContentSnapshot['privacy'] {
  const bodyExcerptStored = Boolean(excerpt(input.body, BODY_EXCERPT_LIMIT));
  const redactionNotes = [
    `Title excerpts are capped at ${TITLE_EXCERPT_LIMIT} characters.`,
    `Body excerpts are capped at ${BODY_EXCERPT_LIMIT} characters.`,
    'Full Reddit content is not stored by the snapshot layer.',
  ];
  if (bodyExcerptStored && input.body && input.body.trim().length > BODY_EXCERPT_LIMIT) {
    redactionNotes.push('Body was truncated before storage.');
  }

  return {
    retentionCategory: 'moderation_evidence',
    authorStored: Boolean(input.authorName?.trim()),
    titleExcerptStored: Boolean(excerpt(input.title, TITLE_EXCERPT_LIMIT)),
    bodyExcerptStored,
    permalinkStored: Boolean(input.permalink?.trim()),
    redactionNotes,
  };
}

function hasProvidedContent(input: ContentSnapshotInput): boolean {
  return (
    Boolean(input.authorName?.trim()) ||
    Boolean(input.title?.trim()) ||
    Boolean(input.body?.trim()) ||
    Boolean(input.permalink?.trim()) ||
    Boolean(input.subreddit?.trim())
  );
}

function excerpt(value: string | undefined, limit: number): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return undefined;
  }
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit - 3)}...`;
}

function toRedditUrl(permalink: string): string {
  return permalink.startsWith('http')
    ? permalink
    : `https://www.reddit.com${permalink}`;
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}
