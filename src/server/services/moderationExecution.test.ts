import { describe, expect, it, vi } from 'vitest';
import type {
  ModerationExecutionCapabilities,
  ModerationExecutionDependencies,
} from './moderationExecution';
import { executeModerationAction, getRedditOperation } from './moderationExecution';

const enabledCapabilities: ModerationExecutionCapabilities = {
  liveRedditActionsEnabled: true,
  redditActionsRuntimeVerified: true,
  receiptCreationAvailable: true,
};

function dependencies(
  overrides: Partial<ModerationExecutionDependencies> = {}
): ModerationExecutionDependencies {
  const reddit = {
    approve: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    getPostById: vi.fn().mockResolvedValue({
      ignoreReports: vi.fn().mockResolvedValue(undefined),
    }),
    getCommentById: vi.fn().mockResolvedValue({
      ignoreReports: vi.fn().mockResolvedValue(undefined),
    }),
  };

  return {
    reddit,
    capabilities: enabledCapabilities,
    now: () => '2026-05-18T00:00:00.000Z',
    ...overrides,
  };
}

describe('moderation execution service', () => {
  it('maps enforcement actions to Reddit operations', () => {
    expect(getRedditOperation('remove')).toBe('remove');
    expect(getRedditOperation('approve')).toBe('approve');
    expect(getRedditOperation('ignore_reports')).toBe('ignore_reports');
    expect(getRedditOperation('warn')).toBe('none');
  });

  it('skips log-only actions without a Reddit attempt', async () => {
    const deps = dependencies();
    const result = await executeModerationAction(
      {
        selectedAction: 'warn',
        confirmed: true,
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        executionMode: 'log_only',
        executionAttempted: false,
        executionResult: 'skipped',
        redditOperation: 'none',
        capabilityState: 'not_applicable',
      })
    );
    expect(deps.reddit.remove).not.toHaveBeenCalled();
    expect(deps.reddit.approve).not.toHaveBeenCalled();
  });

  it('keeps live Reddit execution disabled when runtime proof is missing', async () => {
    const deps = dependencies({
      capabilities: {
        liveRedditActionsEnabled: true,
        redditActionsRuntimeVerified: false,
        receiptCreationAvailable: true,
      },
    });

    const result = await executeModerationAction(
      {
        selectedAction: 'remove',
        targetThingId: 't3_target_post',
        confirmed: true,
        executionMode: 'live',
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        executionMode: 'unverified_disabled',
        executionAttempted: false,
        executionResult: 'skipped',
        redditOperation: 'remove',
        capabilityState: 'unverified_disabled',
      })
    );
    expect(deps.reddit.remove).not.toHaveBeenCalled();
  });

  it('requires receipts before live Reddit execution', async () => {
    const deps = dependencies({
      capabilities: {
        liveRedditActionsEnabled: true,
        redditActionsRuntimeVerified: true,
        receiptCreationAvailable: false,
      },
    });

    const result = await executeModerationAction(
      {
        selectedAction: 'approve',
        targetThingId: 't1_target_comment',
        confirmed: true,
        executionMode: 'live',
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        executionMode: 'unverified_disabled',
        executionAttempted: false,
        executionResult: 'skipped',
        redditOperation: 'approve',
        capabilityState: 'receipt_required',
      })
    );
    expect(deps.reddit.approve).not.toHaveBeenCalled();
  });

  it('executes approved live remove calls when all gates pass', async () => {
    const deps = dependencies();
    const result = await executeModerationAction(
      {
        selectedAction: 'remove',
        targetThingId: 't3_target_post',
        targetType: 'post',
        confirmed: true,
        executionMode: 'live',
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        executionMode: 'live',
        executionAttempted: true,
        executionResult: 'success',
        redditOperation: 'remove',
        capabilityState: 'enabled',
      })
    );
    expect(deps.reddit.remove).toHaveBeenCalledWith('t3_target_post', false);
  });

  it('captures permission failures as typed execution failures', async () => {
    const deps = dependencies({
      reddit: {
        approve: vi.fn().mockRejectedValue(new Error('403 forbidden')),
        remove: vi.fn().mockResolvedValue(undefined),
        getPostById: vi.fn(),
        getCommentById: vi.fn(),
      },
    });

    const result = await executeModerationAction(
      {
        selectedAction: 'approve',
        targetThingId: 't1_target_comment',
        confirmed: true,
        executionMode: 'live',
      },
      deps
    );

    expect(result).toEqual(
      expect.objectContaining({
        executionMode: 'live',
        executionAttempted: true,
        executionResult: 'failure',
        redditOperation: 'approve',
        errorCode: 'permission_denied',
        errorMessage: '403 forbidden',
      })
    );
  });

  it('executes ignore reports through the target model', async () => {
    const ignoreReports = vi.fn().mockResolvedValue(undefined);
    const deps = dependencies({
      reddit: {
        approve: vi.fn(),
        remove: vi.fn(),
        getPostById: vi.fn().mockResolvedValue({ ignoreReports }),
        getCommentById: vi.fn(),
      },
    });

    const result = await executeModerationAction(
      {
        selectedAction: 'ignore_reports',
        targetThingId: 't3_target_post',
        confirmed: true,
        executionMode: 'live',
      },
      deps
    );

    expect(result.executionResult).toBe('success');
    expect(deps.reddit.getPostById).toHaveBeenCalledWith('t3_target_post');
    expect(ignoreReports).toHaveBeenCalled();
  });
});
