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
    expect(api.kind).toBe('api_error');
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
