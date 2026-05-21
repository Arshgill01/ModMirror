import { describe, expect, it } from 'vitest';
import {
  classifyClientError,
  classifyClipboardFailure,
  formatClientNotice,
} from './clientResilience';

describe('client resilience helpers', () => {
  it('labels static preview API failures with a Devvit playtest fallback', () => {
    const notice = classifyClientError(
      new Error('Unexpected token < in JSON at position 0'),
      'Policies are unavailable.'
    );

    expect(notice.kind).toBe('static_preview');
    expect(notice.title).toBe('Static Preview');
    expect(formatClientNotice(notice)).toContain('Devvit playtest');
    expect(formatClientNotice(notice)).toContain('labeled demo data');
  });

  it('turns slow requests into actionable timeout messages', () => {
    const notice = classifyClientError(
      new Error('Request to /api/scan timed out after 12000ms'),
      'Scan failed.'
    );

    expect(notice.kind).toBe('timeout');
    expect(notice.action).toContain('Retry');
    expect(notice.action).toContain('fallback');
  });

  it('keeps network failures distinct from server validation errors', () => {
    const network = classifyClientError(
      new Error('Failed to fetch'),
      'Receipts are unavailable.'
    );
    const api = classifyClientError(
      new Error('API request returned 400: targetThingId is required'),
      'Apply Policy failed.'
    );

    expect(network.kind).toBe('network_unavailable');
    expect(api.kind).toBe('validation_error');
    expect(api.message).toContain('targetThingId is required');
  });

  it('labels moderator access failures with a moderator-account action', () => {
    const notice = classifyClientError(
      new Error(
        'API error (moderator_access_required): Moderator permissions are required for ModMirror API access.'
      ),
      'Policies are unavailable.'
    );

    expect(notice.kind).toBe('access_denied');
    expect(notice.message).toContain('moderator_access_required');
    expect(notice.action).toContain('moderator account');
  });

  it('labels subreddit isolation failures with a reload-in-context action', () => {
    const notice = classifyClientError(
      new Error(
        'API error (subreddit_isolation_failed): Requested subreddit does not match the current Devvit subreddit context.'
      ),
      'Policies are unavailable.'
    );

    expect(notice.kind).toBe('subreddit_isolation');
    expect(notice.title).toBe('Subreddit Context Mismatch');
    expect(notice.action).toContain('target subreddit');
  });

  it('labels unavailable runtime capabilities without implying live proof', () => {
    const notice = classifyClientError(
      new Error('HTTP/1.1 426 Upgrade Required'),
      'Route smoke could not run.'
    );

    expect(notice.kind).toBe('runtime_unavailable');
    expect(notice.title).toBe('Runtime Capability Unavailable');
    expect(notice.action).toContain('runtime-verified');
  });

  it('labels partial data states with a policy-claim guardrail', () => {
    const notice = classifyClientError(
      new Error('Small-subreddit fallback data is being used for this scan.'),
      'Scan finished with limited history.'
    );

    expect(notice.kind).toBe('partial_data');
    expect(notice.action).toContain('before making policy claims');
  });

  it('labels validation failures with a no-action-taken recovery path', () => {
    const notice = classifyClientError(
      new Error('API error (policy_validation_failed): ruleName is required'),
      'Policy save failed.'
    );

    expect(notice.kind).toBe('validation_error');
    expect(formatClientNotice(notice)).toContain('Input Needs Attention');
    expect(notice.action).toContain('No Reddit action was taken');
  });

  it('labels missing and denied clipboard paths separately', () => {
    const unavailable = classifyClipboardFailure({
      hasClipboardApi: false,
      subject: 'Case Packet Markdown',
    });
    const denied = classifyClipboardFailure({
      hasClipboardApi: true,
      error: new Error('NotAllowedError: permission denied'),
      subject: 'Digest Markdown',
    });

    expect(unavailable.kind).toBe('clipboard_unavailable');
    expect(unavailable.action).toContain('copy it from the export box');
    expect(denied.kind).toBe('clipboard_denied');
    expect(denied.action).toContain('copy manually');
  });
});
