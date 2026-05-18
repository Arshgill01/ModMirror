import { describe, expect, it } from 'vitest';
import type { ContentSnapshotDependencies } from './contentSnapshots';
import { captureContentSnapshot } from './contentSnapshots';

const dependencies: ContentSnapshotDependencies = {
  now: () => '2026-05-18T10:00:00.000Z',
  contextUsername: 'mod_a',
  getCurrentUser: () =>
    Promise.resolve({
      username: 'mod_a',
      getModPermissionsForSubreddit: () => Promise.resolve(['all']),
    }),
  getPostById: () =>
    Promise.resolve({
      id: 't3_post_1',
      authorName: 'learner_1',
      subredditName: 'ExampleLearning',
      title: 'How do I learn everything quickly?',
      body: 'I need the full shortcut for the exam by tomorrow.',
      permalink: '/r/ExampleLearning/comments/post_1/example/',
    }),
  getCommentById: () =>
    Promise.resolve({
      id: 't1_comment_1',
      authorName: 'learner_2',
      subredditName: 'ExampleLearning',
      body: 'same question, no details',
      permalink: '/r/ExampleLearning/comments/post_1/example/comment_1/',
      postId: 't3_post_1',
    }),
};

describe('content snapshots', () => {
  it('captures a post snapshot with bounded content and privacy metadata', async () => {
    const snapshot = await captureContentSnapshot(
      {
        targetThingId: 't3_post_1',
        targetType: 'post',
        source: 'menu',
      },
      dependencies
    );

    expect(snapshot).toEqual(
      expect.objectContaining({
        schemaVersion: 1,
        targetThingId: 't3_post_1',
        targetType: 'post',
        subreddit: 'ExampleLearning',
        authorName: 'learner_1',
        titleExcerpt: 'How do I learn everything quickly?',
        bodyExcerpt: 'I need the full shortcut for the exam by tomorrow.',
        fetchStatus: 'captured',
        source: 'menu',
        fetchedAt: '2026-05-18T10:00:00.000Z',
      })
    );
    expect(snapshot.permalink).toBe(
      'https://www.reddit.com/r/ExampleLearning/comments/post_1/example/'
    );
    expect(snapshot.privacy).toEqual(
      expect.objectContaining({
        retentionCategory: 'moderation_evidence',
        authorStored: true,
        titleExcerptStored: true,
        bodyExcerptStored: true,
        permalinkStored: true,
      })
    );
  });

  it('captures a comment snapshot', async () => {
    const snapshot = await captureContentSnapshot(
      {
        targetThingId: 't1_comment_1',
        targetType: 'comment',
        source: 'menu',
      },
      dependencies
    );

    expect(snapshot).toEqual(
      expect.objectContaining({
        targetThingId: 't1_comment_1',
        targetType: 'comment',
        authorName: 'learner_2',
        bodyExcerpt: 'same question, no details',
        fetchStatus: 'captured',
      })
    );
  });

  it('returns a truthful degraded snapshot when fetching fails', async () => {
    const snapshot = await captureContentSnapshot(
      {
        targetThingId: 't3_post_1',
        targetType: 'post',
        source: 'api',
      },
      {
        ...dependencies,
        getPostById: () => Promise.reject(new Error('permission denied')),
      }
    );

    expect(snapshot.fetchStatus).toBe('degraded');
    expect(snapshot.targetThingId).toBe('t3_post_1');
    expect(snapshot.warnings.join(' ')).toContain('permission denied');
  });

  it('returns a not-provided snapshot without a target', async () => {
    const snapshot = await captureContentSnapshot({}, dependencies);

    expect(snapshot.fetchStatus).toBe('not_provided');
    expect(snapshot.targetType).toBe('unknown');
    expect(snapshot.warnings[0]).toMatch(/No Reddit post\/comment target/);
  });
});
