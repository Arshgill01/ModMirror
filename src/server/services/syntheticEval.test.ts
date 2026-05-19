import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  SYNTHETIC_EVAL_SCENARIO_IDS,
  buildAllSyntheticEvalDatasets,
  buildSyntheticEvalDataset,
  buildSyntheticEvalManifest,
  evaluateSyntheticEvalDataset,
  validateSyntheticEvalDatasets,
} from './syntheticEval';
import type { SyntheticEvalManifest } from './syntheticEval';

const goldenPath = fileURLToPath(
  new URL('../../../docs/expansion-waves/synthetic-eval-golden.json', import.meta.url)
);

describe('synthetic evaluation harness', () => {
  it('builds every required expansion scenario deterministically', () => {
    const datasets = buildAllSyntheticEvalDatasets();

    expect(datasets.map((dataset) => dataset.id)).toEqual([
      ...SYNTHETIC_EVAL_SCENARIO_IDS,
    ]);
    expect(buildSyntheticEvalManifest()).toEqual(buildSyntheticEvalManifest());
    expect(
      datasets.every((dataset) =>
        dataset.notes.some((note) => note.includes('Synthetic fixtures'))
      )
    ).toBe(true);
  });

  it('validates replay, drift, analytics, and safety expectations', () => {
    const result = validateSyntheticEvalDatasets();

    expect(result.failures).toEqual([]);
    expect(result.passed).toBe(true);
    expect(result.manifest.scenarioCount).toBe(8);
  });

  it('keeps synthetic scans and receipts out of live execution claims', () => {
    for (const dataset of buildAllSyntheticEvalDatasets()) {
      expect(dataset.actions.some((action) => action.source === 'live')).toBe(false);
      expect(dataset.scans.every((scan) => scan.source === 'demo')).toBe(true);
      expect(
        dataset.scans.every((scan) =>
          scan.warnings.some((warning) => warning.includes('Synthetic evaluation'))
        )
      ).toBe(true);
      expect(
        dataset.receipts.some(
          (receipt) =>
            receipt.executionMode === 'live' && receipt.executionAttempted
        )
      ).toBe(false);
    }
  });

  it('captures policy replay edge cases in named scenarios', () => {
    const repeated = evaluateSyntheticEvalDataset(
      buildSyntheticEvalDataset('repeated_offender')
    );
    const noisy = evaluateSyntheticEvalDataset(
      buildSyntheticEvalDataset('noisy_attribution')
    );
    const improved = evaluateSyntheticEvalDataset(
      buildSyntheticEvalDataset('policy_improved')
    );

    expect(repeated.replay).toMatchObject({
      totalActionsEvaluated: 5,
      changedRecommendationCount: 3,
    });
    expect(noisy.replay.skippedActionCount).toBe(3);
    expect(improved.analytics.policyImpactStatusByRule).toEqual({
      'low-effort-questions-2': 'improving',
    });
  });

  it('matches the checked-in golden evaluation manifest', () => {
    const golden = JSON.parse(
      readFileSync(goldenPath, 'utf8')
    ) as SyntheticEvalManifest;

    expect(buildSyntheticEvalManifest()).toEqual(golden);
    expect(validateSyntheticEvalDatasets(golden).passed).toBe(true);
  });
});
