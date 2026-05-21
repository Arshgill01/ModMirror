export type ClientErrorKind =
  | 'access_denied'
  | 'api_error'
  | 'clipboard_denied'
  | 'clipboard_unavailable'
  | 'invalid_response'
  | 'network_unavailable'
  | 'partial_data'
  | 'runtime_unavailable'
  | 'static_preview'
  | 'subreddit_isolation'
  | 'timeout'
  | 'validation_error'
  | 'unknown';

export interface ClientErrorNotice {
  kind: ClientErrorKind;
  title: string;
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
      title: 'Request Timed Out',
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
      title: 'Static Preview',
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
      title: 'Network Unavailable',
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
      title: 'Moderator Access Required',
      message: message || fallback,
      action:
        'Open ModMirror from a moderator account for this subreddit, or ask a moderator with access to run this action.',
    };
  }

  if (
    lower.includes('subreddit_isolation_failed') ||
    lower.includes('requested subreddit does not match') ||
    lower.includes('live subreddit requests must match') ||
    lower.includes('subreddit names must be')
  ) {
    return {
      kind: 'subreddit_isolation',
      title: 'Subreddit Context Mismatch',
      message: message || fallback,
      action:
        'Reload ModMirror inside the target subreddit and avoid mixing demo/live subreddit parameters.',
    };
  }

  if (
    lower.includes('upgrade required') ||
    lower.includes('runtime api') ||
    lower.includes('runtime capability') ||
    lower.includes('devvit context') ||
    lower.includes('not runtime-verified') ||
    lower.includes('not available in this webview') ||
    lower.includes('capability is disabled')
  ) {
    return {
      kind: 'runtime_unavailable',
      title: 'Runtime Capability Unavailable',
      message: message || fallback,
      action:
        'Use the labeled preview/log-only path and rerun the control after the capability is runtime-verified.',
    };
  }

  if (
    lower.includes('partial data') ||
    lower.includes('partial response') ||
    lower.includes('insufficient data') ||
    lower.includes('small-subreddit') ||
    lower.includes('small subreddit') ||
    lower.includes('fallback data')
  ) {
    return {
      kind: 'partial_data',
      title: 'Partial Data',
      message: message || fallback,
      action:
        'Continue with the visible labeled data only; run a fresh scan or enable demo data before making policy claims.',
    };
  }

  if (
    lower.includes('validation_failed') ||
    lower.includes('validation failed') ||
    lower.includes(' is required') ||
    lower.includes(' are required') ||
    lower.includes('invalid ') ||
    lower.includes('must be ')
  ) {
    return {
      kind: 'validation_error',
      title: 'Input Needs Attention',
      message: message || fallback,
      action: 'Fix the highlighted input and retry. No Reddit action was taken.',
    };
  }

  if (lower.includes('api request returned') || lower.includes('api error')) {
    return {
      kind: 'api_error',
      title: 'API Request Failed',
      message: message || fallback,
      action: 'Review the message, keep destructive actions paused, and retry after fixing the input.',
    };
  }

  return {
    kind: 'unknown',
    title: 'Unexpected Error',
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
      title: 'Clipboard Unavailable',
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
      title: 'Clipboard Permission Denied',
      message: `${options.subject} could not be copied because clipboard permission was denied.`,
      action: 'Use the export box and copy manually.',
    };
  }

  return {
    kind: 'clipboard_unavailable',
    title: 'Clipboard Unavailable',
    message: `${options.subject} could not be copied in this WebView.`,
    action: 'Use the export box and copy manually.',
  };
}

export function formatClientNotice(notice: ClientErrorNotice): string {
  return `${notice.title}: ${notice.message} Next action: ${notice.action}`;
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
