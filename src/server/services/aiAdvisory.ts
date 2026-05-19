import {
  AI_ADVISORY_EVIDENCE_SOURCE_VALUES,
  AI_ADVISORY_KIND_VALUES,
} from '../../shared/constants';
import type {
  AiAdvisoryCapabilities,
  AiAdvisoryEvidenceInput,
  AiAdvisoryKind,
  AiAdvisoryProviderMetadata,
  AiAdvisoryRequest,
  AiAdvisoryResponse,
} from '../../shared/schema';

export type AiAdvisoryProviderResult = {
  text: string;
  citedEvidenceIds: string[];
};

export type AiAdvisoryProvider = {
  id: string;
  label: string;
  generate(request: AiAdvisoryProviderRequest): Promise<AiAdvisoryProviderResult>;
};

export type AiAdvisoryProviderRequest = {
  kind: AiAdvisoryKind;
  prompt: string;
  evidence: AiAdvisoryEvidenceInput[];
  maxWords: number;
};

export type GenerateAiAdvisoryOptions = {
  request: AiAdvisoryRequest;
  provider?: AiAdvisoryProvider;
  enabled?: boolean;
};

const DEFAULT_MAX_WORDS = 180;
const MAX_MAX_WORDS = 500;

const DISABLED_PROVIDER: AiAdvisoryProviderMetadata = {
  id: 'disabled',
  label: 'No AI provider configured',
  state: 'disabled',
};

export function getAiAdvisoryCapabilities(options?: {
  providerConfigured?: boolean;
  enabled?: boolean;
}): AiAdvisoryCapabilities {
  const enabled = options?.enabled ?? isAiAdvisoryEnabled();
  const providerConfigured = options?.providerConfigured ?? false;
  const overallState = !enabled
    ? 'disabled'
    : providerConfigured
      ? 'type_only'
      : 'unconfigured';

  return {
    overall: {
      state: overallState,
      label:
        overallState === 'disabled'
          ? 'AI advisory disabled'
          : overallState === 'unconfigured'
            ? 'AI advisory unconfigured'
            : 'AI advisory type-only',
      detail:
        overallState === 'disabled'
          ? 'ModMirror does not call an external AI provider unless explicitly configured in a later runtime-verified build.'
          : overallState === 'unconfigured'
            ? 'External fetch and secrets have documented/type support, but no provider is configured for this build.'
            : 'A provider abstraction is available, but this branch has not runtime-verified external AI calls.',
      runtimeProof: overallState === 'type_only' ? 'type_only' : 'not_verified',
    },
    externalFetch: {
      state: 'type_only',
      label: 'Server fetch type-supported',
      detail:
        'Devvit Web documents server-side fetch to allow-listed external domains, but W10 did not run a live external AI call.',
      runtimeProof: 'type_only',
    },
    secretStorage: {
      state: 'type_only',
      label: 'App secret storage type-supported',
      detail:
        'Devvit documents app-scoped secret settings via CLI; ModMirror has no committed key and no runtime secret proof in W10.',
      runtimeProof: 'type_only',
    },
    enforcementUse: {
      state: 'disabled',
      label: 'AI enforcement disabled',
      detail:
        'AI output is advisory only and is never accepted as an enforcement decision or action executor.',
      runtimeProof: 'not_verified',
    },
    supportedKinds: [...AI_ADVISORY_KIND_VALUES],
    providerConfigured,
  };
}

export async function generateAiAdvisory(
  options: GenerateAiAdvisoryOptions
): Promise<AiAdvisoryResponse> {
  const request = normalizeAiAdvisoryRequest(options.request);
  const generatedAt = new Date().toISOString();
  const enabled = options.enabled ?? isAiAdvisoryEnabled();
  const provider = options.provider;

  if (!enabled || provider === undefined) {
    return {
      kind: request.kind,
      status: 'disabled',
      generatedAt,
      advisoryText:
        'AI advisory is disabled. Review the deterministic evidence, receipts, scans, and policy records directly.',
      citedEvidenceIds: request.evidence.map((item) => item.id),
      caveats: buildCaveats(),
      provider: DISABLED_PROVIDER,
      moderatorReviewRequired: true,
      mayDecideEnforcement: false,
    };
  }

  const result = await provider.generate({
    kind: request.kind,
    prompt: buildAiAdvisoryPrompt(request),
    evidence: request.evidence,
    maxWords: request.maxWords ?? DEFAULT_MAX_WORDS,
  });
  const citedEvidenceIds = validateEvidenceCitations(
    result.citedEvidenceIds,
    request.evidence
  );
  const text = result.text.trim();

  if (text.length === 0 || citedEvidenceIds.length === 0) {
    return {
      kind: request.kind,
      status: 'rejected',
      generatedAt,
      advisoryText:
        'AI advisory output was rejected because it did not cite deterministic ModMirror evidence.',
      citedEvidenceIds,
      caveats: buildCaveats(),
      provider: {
        id: provider.id,
        label: provider.label,
        state: 'available',
      },
      moderatorReviewRequired: true,
      mayDecideEnforcement: false,
    };
  }

  return {
    kind: request.kind,
    status: 'generated',
    generatedAt,
    advisoryText: text,
    citedEvidenceIds,
    caveats: buildCaveats(),
    provider: {
      id: provider.id,
      label: provider.label,
      state: 'available',
    },
    moderatorReviewRequired: true,
    mayDecideEnforcement: false,
  };
}

export function buildAiAdvisoryPrompt(request: AiAdvisoryRequest): string {
  const lines = [
    'You are writing an advisory draft for a human Reddit moderation team.',
    'Do not decide enforcement, execute actions, or present inferred data as certain.',
    'Cite deterministic ModMirror evidence IDs in the response metadata.',
    `Advisory kind: ${request.kind}`,
  ];
  if (request.prompt !== undefined && request.prompt.trim().length > 0) {
    lines.push(`Moderator prompt: ${request.prompt.trim()}`);
  }
  lines.push('Evidence:');
  for (const item of request.evidence) {
    lines.push(
      `- ${item.id} [${item.source}] ${item.label}: ${item.summary}`
    );
  }
  return lines.join('\n');
}

export function normalizeAiAdvisoryRequest(
  request: AiAdvisoryRequest
): AiAdvisoryRequest {
  if (!AI_ADVISORY_KIND_VALUES.includes(request.kind)) {
    throw new Error('Unsupported AI advisory kind.');
  }
  if (request.evidence.length === 0) {
    throw new Error('AI advisory requires deterministic evidence.');
  }

  const maxWords =
    request.maxWords === undefined
      ? DEFAULT_MAX_WORDS
      : Math.min(Math.max(Math.round(request.maxWords), 1), MAX_MAX_WORDS);

  return {
    ...request,
    evidence: request.evidence.map(normalizeEvidence),
    maxWords,
  };
}

function validateEvidenceCitations(
  citedEvidenceIds: string[],
  evidence: AiAdvisoryEvidenceInput[]
): string[] {
  const knownIds = new Set(evidence.map((item) => item.id));
  return [...new Set(citedEvidenceIds)].filter((id) => knownIds.has(id));
}

function normalizeEvidence(
  evidence: AiAdvisoryEvidenceInput
): AiAdvisoryEvidenceInput {
  const id = evidence.id.trim();
  const label = evidence.label.trim();
  const summary = evidence.summary.trim();
  if (id.length === 0 || label.length === 0 || summary.length === 0) {
    throw new Error('AI advisory evidence requires id, label, and summary.');
  }
  if (!AI_ADVISORY_EVIDENCE_SOURCE_VALUES.includes(evidence.source)) {
    throw new Error('Unsupported AI advisory evidence source.');
  }
  return {
    ...evidence,
    id,
    label,
    summary,
  };
}

function buildCaveats(): string[] {
  return [
    'AI advisory output is a draft for moderator review, not an enforcement decision.',
    'Only deterministic evidence IDs supplied to the request may be cited.',
    'ModMirror keeps Reddit moderation actions behind explicit human confirmation and existing safety gates.',
  ];
}

function isAiAdvisoryEnabled(): boolean {
  return process.env.MODMIRROR_ENABLE_AI_ADVISORY === 'true';
}
