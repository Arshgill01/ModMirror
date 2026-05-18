import { describe, expect, it, vi } from 'vitest';
import type { AiAdvisoryEvidenceInput } from '../../shared/schema';
import {
  buildAiAdvisoryPrompt,
  generateAiAdvisory,
  getAiAdvisoryCapabilities,
} from './aiAdvisory';

const evidence: AiAdvisoryEvidenceInput[] = [
  {
    id: 'receipt-action-1',
    source: 'receipt',
    label: 'Action receipt',
    summary: 'Receipt shows a log-only Rule 2 warning recommendation.',
  },
  {
    id: 'scan-rule-2',
    source: 'scan',
    label: 'Mirror Scan Rule 2',
    summary: 'Scan found mixed first-offense outcomes for Rule 2.',
  },
];

describe('ai advisory service', () => {
  it('reports disabled capabilities by default', () => {
    const capabilities = getAiAdvisoryCapabilities();

    expect(capabilities.overall.state).toBe('disabled');
    expect(capabilities.externalFetch.runtimeProof).toBe('type_only');
    expect(capabilities.secretStorage.runtimeProof).toBe('type_only');
    expect(capabilities.enforcementUse.state).toBe('disabled');
    expect(capabilities.supportedKinds).toContain('case_packet_summary');
  });

  it('returns a no-provider fallback without calling external AI', async () => {
    const response = await generateAiAdvisory({
      request: {
        kind: 'drift_explanation',
        evidence,
      },
    });

    expect(response.status).toBe('disabled');
    expect(response.provider.id).toBe('disabled');
    expect(response.citedEvidenceIds).toEqual([
      'receipt-action-1',
      'scan-rule-2',
    ]);
    expect(response.mayDecideEnforcement).toBe(false);
    expect(response.moderatorReviewRequired).toBe(true);
  });

  it('generates advisory text only when a mocked provider cites known evidence', async () => {
    const provider = {
      id: 'mock',
      label: 'Mock AI provider',
      generate: vi.fn().mockResolvedValue({
        text: 'Draft advisory: Rule 2 shows inconsistent first-offense outcomes.',
        citedEvidenceIds: ['scan-rule-2'],
      }),
    };

    const response = await generateAiAdvisory({
      enabled: true,
      provider,
      request: {
        kind: 'policy_draft_suggestion',
        evidence,
      },
    });

    expect(response.status).toBe('generated');
    expect(response.provider.id).toBe('mock');
    expect(response.citedEvidenceIds).toEqual(['scan-rule-2']);
    expect(response.mayDecideEnforcement).toBe(false);
    expect(provider.generate).toHaveBeenCalledTimes(1);
  });

  it('rejects provider output that does not cite deterministic evidence', async () => {
    const response = await generateAiAdvisory({
      enabled: true,
      provider: {
        id: 'mock',
        label: 'Mock AI provider',
        generate: vi.fn().mockResolvedValue({
          text: 'Draft advisory with no usable citation.',
          citedEvidenceIds: ['unknown-id'],
        }),
      },
      request: {
        kind: 'case_packet_summary',
        evidence,
      },
    });

    expect(response.status).toBe('rejected');
    expect(response.citedEvidenceIds).toEqual([]);
    expect(response.advisoryText).toContain('rejected');
  });

  it('includes evidence IDs in provider prompts', () => {
    const prompt = buildAiAdvisoryPrompt({
      kind: 'digest_summary',
      evidence,
      prompt: 'Summarize for the weekly mod discussion.',
    });

    expect(prompt).toContain('receipt-action-1');
    expect(prompt).toContain('scan-rule-2');
    expect(prompt).toContain('Do not decide enforcement');
  });
});
