import { redis } from '@devvit/web/server';
import { randomUUID } from 'node:crypto';
import { DEMO_SUBREDDIT_NAME, ENFORCEMENT_ACTION_VALUES } from '../../shared/constants';
import type {
  CalibrationAnswerInput,
  CalibrationAnswerResult,
  CalibrationPackResponse,
  CalibrationScenario,
  CalibrationScenarioSource,
  DriftCandidate,
  EnforcementAction,
} from '../../shared/schema';
import { parseJson, readJson, redisKeys, serializeJson, writeJson } from './redis';
import { privacyTrustLabel, sourceTrustLabel } from './v2Trust';

const DEMO_BASE_TIME = '2026-05-21T00:00:00.000Z';
const SCENARIO_LIST_LIMIT = 100;

export type ScenarioDraftInput = {
  subreddit: string;
  title: string;
  prompt: string;
  ruleKey: string;
  ruleName: string;
  expectedAction: EnforcementAction;
  acceptableAlternatives?: EnforcementAction[];
  explanation: string;
  source: CalibrationScenarioSource;
  sourceId?: string;
  active?: boolean;
  teachingReason?: string;
  containsRealUserContent?: boolean;
};

export async function getCalibrationPack(
  subreddit: string
): Promise<CalibrationPackResponse> {
  const stored = await listCalibrationScenarios(subreddit, { activeOnly: true });
  const scenarios =
    stored.length > 0 || subreddit !== DEMO_SUBREDDIT_NAME
      ? stored
      : buildDemoCalibrationScenarios();

  return {
    subreddit,
    generatedAt: new Date().toISOString(),
    scenarios,
    trustLabels: [sourceTrustLabel(resolvePackSource(subreddit, scenarios)), privacyTrustLabel()],
  };
}

export function buildDemoCalibrationScenarios(): CalibrationScenario[] {
  return [
    demoScenario({
      id: 'demo-calibration-rule2-first',
      title: 'First low-effort question',
      prompt:
        'A new learner posts a one-line homework question with no code, context, or prior attempt.',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      expectedAction: 'warn',
      acceptableAlternatives: ['remove'],
      explanation:
        'The team norm is remove plus warning for first captured Rule 2 cases, with stricter action only when repeat history is visible.',
    }),
    demoScenario({
      id: 'demo-calibration-rule2-repeat',
      title: 'Repeat low-effort pattern',
      prompt:
        'The same author has three recent low-effort removals and posts another no-context question.',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      expectedAction: 'temporary_ban_suggested',
      acceptableAlternatives: ['manual_review'],
      explanation:
        'Escalation is acceptable when the repeat pattern is captured and a moderator still confirms the action.',
    }),
    demoScenario({
      id: 'demo-calibration-rule3-showcase',
      title: 'Drive-by promotion',
      prompt:
        'A user drops a referral link and no learning context outside the weekly showcase thread.',
      ruleKey: 'self-promotion-3',
      ruleName: 'Self-promotion',
      expectedAction: 'remove',
      acceptableAlternatives: ['warn'],
      explanation:
        'Rule 3 is mostly stable in the demo data: remove and redirect promotional content.',
    }),
    demoScenario({
      id: 'demo-calibration-rule1-severe',
      title: 'Severe personal attack',
      prompt:
        'A heated reply includes targeted harassment after prior warnings in the same discussion.',
      ruleKey: 'be-civil-1',
      ruleName: 'Be civil',
      expectedAction: 'temporary_ban_suggested',
      acceptableAlternatives: ['manual_review'],
      explanation:
        'Severe context can justify escalation, but the action remains moderator-confirmed.',
    }),
    demoScenario({
      id: 'demo-calibration-rule2-edge',
      title: 'Borderline beginner post',
      prompt:
        'A beginner asks a vague question but includes a clear goal and one failed attempt.',
      ruleKey: 'low-effort-questions-2',
      ruleName: 'Low-effort questions',
      expectedAction: 'manual_review',
      acceptableAlternatives: ['warn'],
      explanation:
        'Borderline cases should not be treated as automatic violations; use discretion and explain the team norm.',
    }),
  ];
}

export function buildScenarioFromDrift(
  candidate: DriftCandidate,
  subreddit = DEMO_SUBREDDIT_NAME
): CalibrationScenario {
  const actions = Object.entries(candidate.actionDistribution).sort(
    (left, right) => (right[1] ?? 0) - (left[1] ?? 0)
  );
  const expectedAction = normalizeAction(actions[0]?.[0]) ?? 'manual_review';
  const scenario: CalibrationScenario = {
    id: `scenario-drift-${candidate.ruleKey ?? 'unmatched'}`,
    subreddit,
    title: `${candidate.ruleName} drift practice`,
    prompt: candidate.summary,
    ruleKey: candidate.ruleKey ?? 'unmatched',
    ruleName: candidate.ruleName,
    expectedAction,
    acceptableAlternatives: actions
      .slice(1, 3)
      .map(([action]) => normalizeAction(action))
      .filter((action): action is EnforcementAction => action !== undefined),
    explanation: candidate.recommendation,
    source: 'drift_candidate',
    active: true,
    privacy: {
      containsRealUserContent: false,
      authorCopied: false,
      moderatorCopied: false,
      notes: ['Generated from aggregate drift distribution, not copied user content.'],
    },
    createdAt: DEMO_BASE_TIME,
    updatedAt: DEMO_BASE_TIME,
  };
  if (candidate.ruleKey !== undefined) {
    scenario.sourceId = candidate.ruleKey;
  }
  return scenario;
}

export async function listCalibrationScenarios(
  subreddit: string,
  options: { activeOnly?: boolean } = {}
): Promise<CalibrationScenario[]> {
  const rows = await redis.zRange(
    redisKeys.calibrationScenarios(subreddit),
    0,
    SCENARIO_LIST_LIMIT - 1,
    { by: 'rank', reverse: true }
  );
  const latestById = new Map<string, CalibrationScenario>();
  for (const scenario of rows
    .map((row: { member: string }) => parseJson<CalibrationScenario>(row.member))
    .filter((scenario): scenario is CalibrationScenario => scenario !== undefined)) {
    if (!latestById.has(scenario.id)) {
      latestById.set(scenario.id, scenario);
    }
  }

  return [...latestById.values()]
    .filter((scenario) => (options.activeOnly ? scenario.active : true))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

export async function createScenarioDraft(
  input: ScenarioDraftInput
): Promise<CalibrationScenario> {
  const now = new Date().toISOString();
  const scenario: CalibrationScenario = {
    id: `calibration-scenario-${randomUUID()}`,
    subreddit: input.subreddit,
    title: requireText(input.title, 'Scenario title'),
    prompt: requireText(input.prompt, 'Scenario prompt'),
    ruleKey: requireText(input.ruleKey, 'Rule key'),
    ruleName: requireText(input.ruleName, 'Rule name'),
    expectedAction: validateAction(input.expectedAction),
    acceptableAlternatives: (input.acceptableAlternatives ?? []).map(validateAction),
    explanation: requireText(input.explanation, 'Scenario explanation'),
    source: input.source,
    active: input.active ?? false,
    privacy: {
      containsRealUserContent: input.containsRealUserContent ?? false,
      authorCopied: false,
      moderatorCopied: false,
      notes: buildPrivacyNotes(input),
    },
    createdAt: now,
    updatedAt: now,
  };
  if (input.sourceId !== undefined && input.sourceId.trim().length > 0) {
    scenario.sourceId = input.sourceId.trim();
  }

  await saveCalibrationScenario(scenario);
  return scenario;
}

export async function updateScenarioDraft(
  subreddit: string,
  scenarioId: string,
  input: Partial<ScenarioDraftInput>
): Promise<CalibrationScenario | undefined> {
  const existing = await readJson<CalibrationScenario>(
    redisKeys.calibrationScenario(subreddit, scenarioId)
  );
  if (existing === undefined) {
    return undefined;
  }
  const updatedAt = nextScenarioTimestamp(existing.updatedAt);
  const updated: CalibrationScenario = {
    ...existing,
    title: input.title === undefined ? existing.title : requireText(input.title, 'Scenario title'),
    prompt:
      input.prompt === undefined ? existing.prompt : requireText(input.prompt, 'Scenario prompt'),
    ruleKey:
      input.ruleKey === undefined ? existing.ruleKey : requireText(input.ruleKey, 'Rule key'),
    ruleName:
      input.ruleName === undefined ? existing.ruleName : requireText(input.ruleName, 'Rule name'),
    expectedAction:
      input.expectedAction === undefined
        ? existing.expectedAction
        : validateAction(input.expectedAction),
    acceptableAlternatives:
      input.acceptableAlternatives === undefined
        ? existing.acceptableAlternatives
        : input.acceptableAlternatives.map(validateAction),
    explanation:
      input.explanation === undefined
        ? existing.explanation
        : requireText(input.explanation, 'Scenario explanation'),
    active: input.active ?? existing.active,
    updatedAt,
  };
  await saveCalibrationScenario(updated);
  return updated;
}

export async function archiveScenario(
  subreddit: string,
  scenarioId: string
): Promise<CalibrationScenario | undefined> {
  return updateScenarioDraft(subreddit, scenarioId, { active: false });
}

export async function submitCalibrationAnswer(
  input: CalibrationAnswerInput
): Promise<CalibrationAnswerResult> {
  const subreddit = input.subreddit ?? DEMO_SUBREDDIT_NAME;
  const scenarios = await getCalibrationPack(subreddit);
  const scenario = scenarios.scenarios.find((item) => item.id === input.scenarioId);
  if (scenario === undefined) {
    throw new Error('Calibration scenario was not found.');
  }
  const selectedAction = validateAction(input.selectedAction);
  const alignment =
    selectedAction === scenario.expectedAction
      ? 'aligned'
      : scenario.acceptableAlternatives.includes(selectedAction)
        ? 'acceptable_alternative'
        : 'review_recommended';
  await redis.zAdd(redisKeys.calibrationAnswers(subreddit), {
    score: Date.now(),
    member: serializeJson({
      scenarioId: scenario.id,
      selectedAction,
      alignment,
      answeredAt: new Date().toISOString(),
    }),
  });

  return {
    scenarioId: scenario.id,
    selectedAction,
    expectedAction: scenario.expectedAction,
    alignment,
    explanation: scenario.explanation,
    aggregateSummary: {
      completedCount: 1,
      alignedCount: alignment === 'aligned' ? 1 : 0,
      note: 'Results are returned for practice only and are not stored with moderator names.',
    },
  };
}

async function saveCalibrationScenario(
  scenario: CalibrationScenario
): Promise<void> {
  await writeJson(redisKeys.calibrationScenario(scenario.subreddit, scenario.id), scenario);
  await redis.zAdd(redisKeys.calibrationScenarios(scenario.subreddit), {
    score: Date.parse(scenario.updatedAt),
    member: serializeJson(scenario),
  });
}

function demoScenario(
  input: Omit<
    CalibrationScenario,
    'subreddit' | 'source' | 'active' | 'privacy' | 'createdAt' | 'updatedAt'
  >
): CalibrationScenario {
  return {
    ...input,
    subreddit: DEMO_SUBREDDIT_NAME,
    source: 'demo_fixture',
    active: true,
    privacy: {
      containsRealUserContent: false,
      authorCopied: false,
      moderatorCopied: false,
      notes: ['Demo scenario contains no real subreddit user content.'],
    },
    createdAt: DEMO_BASE_TIME,
    updatedAt: DEMO_BASE_TIME,
  };
}

function resolvePackSource(
  subreddit: string,
  scenarios: CalibrationScenario[]
): 'demo' | 'live' | 'unknown' {
  if (
    subreddit === DEMO_SUBREDDIT_NAME ||
    scenarios.every((scenario) => scenario.source === 'demo_fixture')
  ) {
    return 'demo';
  }
  return scenarios.length > 0 ? 'live' : 'unknown';
}

function buildPrivacyNotes(input: ScenarioDraftInput): string[] {
  const notes = [
    'Scenario storage does not copy moderator names and does not create leaderboards.',
  ];
  if (input.teachingReason !== undefined && input.teachingReason.trim().length > 0) {
    notes.push(`Teaching reason: ${input.teachingReason.trim()}`);
  }
  if (input.containsRealUserContent) {
    notes.push('Source may contain real content; author and moderator fields are not copied.');
  }
  return notes;
}

function requireText(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function nextScenarioTimestamp(previous: string): string {
  const previousTime = Date.parse(previous);
  const now = Date.now();
  if (Number.isFinite(previousTime) && now <= previousTime) {
    return new Date(previousTime + 1).toISOString();
  }
  return new Date(now).toISOString();
}

function validateAction(action: EnforcementAction): EnforcementAction {
  if (!ENFORCEMENT_ACTION_VALUES.includes(action)) {
    throw new Error('Unsupported calibration action.');
  }
  return action;
}

function normalizeAction(action: string | undefined): EnforcementAction | undefined {
  return ENFORCEMENT_ACTION_VALUES.find((value) => value === action);
}
