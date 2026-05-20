import type {
  ActionSource,
  Confidence,
  ModerationExecutionCapabilityState,
  TrustLabel,
} from '../../shared/schema';

export function sourceTrustLabel(source: ActionSource | 'mixed' | 'unknown'): TrustLabel {
  if (source === 'demo') {
    return {
      kind: 'source',
      label: 'Demo data',
      detail: 'ExampleLearning fixtures are labeled and separate from live subreddit state.',
      tone: 'neutral',
    };
  }
  if (source === 'live') {
    return {
      kind: 'source',
      label: 'Live subreddit data',
      detail: 'Values come from the current subreddit context when Reddit reads are available.',
      tone: 'good',
    };
  }
  if (source === 'mixed') {
    return {
      kind: 'source',
      label: 'Mixed source',
      detail: 'This view combines persisted live records with labeled demo or synthetic records.',
      tone: 'watch',
    };
  }
  return {
    kind: 'source',
    label: 'No source yet',
    detail: 'Run a scan or reset demo mode to populate this view.',
    tone: 'watch',
  };
}

export function confidenceTrustLabel(confidence: Confidence): TrustLabel {
  const tone = confidence === 'high' ? 'good' : confidence === 'unmatched' ? 'blocked' : 'watch';
  return {
    kind: 'confidence',
    label: `${formatToken(confidence)} confidence`,
    detail:
      confidence === 'unmatched'
        ? 'This record is intentionally not attributed to a rule.'
        : 'Historical rule attribution is deterministic and confidence-scored.',
    tone,
  };
}

export function privacyTrustLabel(detail = 'Aggregate views avoid per-mod leaderboards and omit moderator blame fields.'): TrustLabel {
  return {
    kind: 'privacy',
    label: 'Aggregate privacy',
    detail,
    tone: 'good',
  };
}

export function proofTrustLabel(
  label: string,
  detail: string,
  proven: boolean
): TrustLabel {
  return {
    kind: 'proof',
    label,
    detail,
    tone: proven ? 'good' : 'watch',
  };
}

export function executionTrustLabel(
  capabilityState: ModerationExecutionCapabilityState
): TrustLabel {
  const blocked =
    capabilityState === 'disabled' || capabilityState === 'unverified_disabled';
  return {
    kind: 'execution',
    label: blocked ? 'Preview or log-only' : 'Execution gated',
    detail: blocked
      ? 'Destructive Reddit actions remain disabled unless runtime proof and explicit approval exist.'
      : 'Meaningful enforcement still requires moderator confirmation.',
    tone: blocked ? 'blocked' : 'watch',
  };
}

function formatToken(value: string): string {
  return value
    .split('_')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
