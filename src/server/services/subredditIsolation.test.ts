import { describe, expect, it, vi } from 'vitest';
import {
  resolveLiveSubredditScope,
  resolveSubredditScope,
  SubredditIsolationError,
} from './subredditIsolation';

vi.mock('@devvit/web/server', () => ({
  redis: {},
}));

describe('subreddit isolation', () => {
  it('defaults to the current Devvit subreddit context', () => {
    expect(
      resolveSubredditScope({
        currentSubreddit: 'modmirror_dev',
        demoSubreddit: 'ExampleLearning',
      })
    ).toBe('modmirror_dev');
  });

  it('allows the explicitly labeled demo subreddit', () => {
    expect(
      resolveSubredditScope({
        requestedSubreddit: 'ExampleLearning',
        currentSubreddit: 'modmirror_dev',
        demoSubreddit: 'ExampleLearning',
      })
    ).toBe('ExampleLearning');
  });

  it('rejects cross-subreddit API requests', () => {
    expect(() =>
      resolveSubredditScope({
        requestedSubreddit: 'OtherCommunity',
        currentSubreddit: 'modmirror_dev',
        demoSubreddit: 'ExampleLearning',
      })
    ).toThrow(SubredditIsolationError);
  });

  it('rejects live subreddit requests without matching runtime context', () => {
    expect(() =>
      resolveLiveSubredditScope({
        requestedSubreddit: 'OtherCommunity',
        currentSubreddit: undefined,
      })
    ).toThrow(SubredditIsolationError);
  });

  it('rejects unsafe subreddit names before Redis key creation', async () => {
    const { mmKey } = await import('./redis');

    expect(mmKey('modmirror_dev', 'policies')).toBe(
      'modmirror:modmirror_dev:policies'
    );
    expect(() => mmKey('modmirror_dev:OtherCommunity', 'policies')).toThrow(
      SubredditIsolationError
    );
  });
});
