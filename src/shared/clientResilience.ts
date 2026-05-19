export type ClientErrorKind =
  | 'access_denied'
  | 'api_error'
  | 'clipboard_denied'
  | 'clipboard_unavailable'
  | 'invalid_response'
  | 'network_unavailable'
  | 'static_preview'
  | 'timeout'
  | 'unknown';

export interface ClientErrorNotice {
  kind: ClientErrorKind;
  message: string;
  action: string;
}

export function classifyClientError(
  error: unknown,
  fallback: string
): ClientErrorNotice {
  const message = errorMessage(error);
  const lower = message.toLowerCase();

  if (
    lower.includes('timed out') ||
    lower.includes('aborterror') ||
    lower.includes('the operation was aborted')
  ) {
    return {
      kind: 'timeout',
      message: `${fallback} The request timed out.`,
      action: 'Retry in Devvit WebView or use the labeled demo/log-only fallback.',
    };
  }

  if (
    lower.includes('unexpected token') ||
    lower.includes('<!doctype') ||
    lower.includes('returned 404') ||
    lower.includes('not json')
  ) {
    return {
      kind: 'static_preview',
      message: `${fallback} The live API is not available in this static preview.`,
      action: 'Open the app through Devvit playtest for live data, or use labeled demo data.',
    };
  }

  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return {
      kind: 'network_unavailable',
      message: `${fallback} The network request did not complete.`,
      action: 'Check the Reddit WebView connection, then retry the action.',
    };
  }

  if (
    lower.includes('moderator_access_required') ||
    lower.includes('moderator permissions are required') ||
    lower.includes('signed-in reddit user is required') ||
    lower.includes('permission checks are unavailable') ||
    lower.includes('unable to verify moderator permissions')
  ) {
    return {
      kind: 'access_denied',
      message: message || fallback,
      action:
        'Open ModMirror from a moderator account for this subreddit, or ask a moderator with access to run this action.',
    };
  }

  if (lower.includes('api request returned') || lower.includes('api error')) {
    return {
      kind: 'api_error',
      message: message || fallback,
      action: 'Review the message, keep destructive actions paused, and retry after fixing the input.',
    };
  }

  return {
    kind: 'unknown',
    message: message || fallback,
    action: 'Retry once; if it repeats, use the log-only or demo fallback and record the failure.',
  };
}

export function classifyClipboardFailure(options: {
  hasClipboardApi: boolean;
  error?: unknown;
  subject: string;
}): ClientErrorNotice {
  if (!options.hasClipboardApi) {
    return {
      kind: 'clipboard_unavailable',
      message: `${options.subject} could not be copied because this WebView does not expose clipboard access.`,
      action: 'Select the text manually and copy it from the export box.',
    };
  }

  const message = errorMessage(options.error).toLowerCase();
  if (
    message.includes('notallowed') ||
    message.includes('denied') ||
    message.includes('permission')
  ) {
    return {
      kind: 'clipboard_denied',
      message: `${options.subject} could not be copied because clipboard permission was denied.`,
      action: 'Use the export box and copy manually.',
    };
  }

  return {
    kind: 'clipboard_unavailable',
    message: `${options.subject} could not be copied in this WebView.`,
    action: 'Use the export box and copy manually.',
  };
}

export function formatClientNotice(notice: ClientErrorNotice): string {
  return `${notice.message} ${notice.action}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '';
}
