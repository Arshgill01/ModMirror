import { describe, expect, it, vi } from 'vitest';

import type {
  CalibrationAnswerResult,
  CalibrationScenario,
  EnforcementAction,
} from '../../shared/schema';
import {
  buildCalibrationQuizSummary,
  getGlobalState,
  registerListener,
  saveThemePreference,
  syncQuizStateForScenarios,
  updateState,
} from './store';

describe('client state store', () => {
  it('initializes with compact dashboard defaults outside the Devvit WebView', () => {
    const state = getGlobalState();

    expect(state.dashboardOpen).toBe(false);
    expect(state.activePage).toBe('act');
    expect(state.scanState.loading).toBe(false);
  });

  it('notifies registered listeners after state updates', () => {
    const listener = vi.fn();
    registerListener(listener);

    updateState((state) => {
      state.activePage = 'scan';
    });

    expect(listener).toHaveBeenCalledOnce();
    expect(getGlobalState().activePage).toBe('scan');
  });

  it('updates the theme preference without requiring browser storage', () => {
    saveThemePreference('dark');

    expect(getGlobalState().themePreference).toBe('dark');
  });

  it('keeps calibration quiz state scoped to active scenarios', () => {
    const state = syncQuizStateForScenarios(
      {
        currentScenarioIndex: 5,
        selectedActions: {
          kept: 'warn',
          stale: 'remove',
        },
        submittedAnswers: {
          kept: true,
          stale: true,
        },
        answerResults: {
          kept: answerResult('kept', 'warn', 'aligned'),
          stale: answerResult('stale', 'remove', 'review_recommended'),
        },
        submittingScenarioId: 'stale',
        error: 'Previous error',
      },
      [scenario('kept')]
    );

    expect(state.currentScenarioIndex).toBe(0);
    expect(state.selectedActions).toEqual({ kept: 'warn' });
    expect(state.submittedAnswers).toEqual({ kept: true });
    expect(Object.keys(state.answerResults)).toEqual(['kept']);
    expect(state.submittingScenarioId).toBeUndefined();
    expect(state.error).toBe('Previous error');
  });

  it('builds an aggregate non-leaderboard quiz summary', () => {
    const summary = buildCalibrationQuizSummary(
      [scenario('first'), scenario('second'), scenario('third')],
      {
        first: answerResult('first', 'warn', 'aligned'),
        second: answerResult('second', 'remove', 'acceptable_alternative'),
        ignored: answerResult('ignored', 'manual_review', 'review_recommended'),
      }
    );

    expect(summary).toEqual({
      totalCount: 3,
      completedCount: 2,
      alignedCount: 1,
      acceptableAlternativeCount: 1,
      reviewRecommendedCount: 0,
      completedAll: false,
    });
  });
});

function scenario(id: string): CalibrationScenario {
  return {
    id,
    subreddit: 'ExampleLearning',
    title: `${id} scenario`,
    prompt: 'A deterministic team-policy practice scenario.',
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    expectedAction: 'warn',
    acceptableAlternatives: ['remove'],
    explanation: 'Use the team norm and discuss exceptions without scoreboards.',
    source: 'demo_fixture',
    active: true,
    privacy: {
      containsRealUserContent: false,
      authorCopied: false,
      moderatorCopied: false,
      notes: ['Demo scenario.'],
    },
    createdAt: '2026-05-21T00:00:00.000Z',
    updatedAt: '2026-05-21T00:00:00.000Z',
  };
}

function answerResult(
  scenarioId: string,
  selectedAction: EnforcementAction,
  alignment: CalibrationAnswerResult['alignment']
): CalibrationAnswerResult {
  return {
    scenarioId,
    selectedAction,
    expectedAction: 'warn',
    alignment,
    explanation: 'Deterministic policy explanation.',
    aggregateSummary: {
      completedCount: 1,
      alignedCount: alignment === 'aligned' ? 1 : 0,
      note: 'Results are returned for practice only and are not stored with moderator names.',
    },
  };
}
