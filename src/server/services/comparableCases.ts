import type {
  ActionEvent,
  CasePacketActionFamily,
  CasePacketOffenseBucket,
  ComparableCase,
  EnforcementAction,
} from '../../shared/schema';

export type ComparableCaseOptions = {
  currentAction: ActionEvent;
  actions: ActionEvent[];
  timeWindowDays?: number;
  maxCases?: number;
};

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_MAX_CASES = 5;

const ACTION_FAMILY_BY_ACTION: Partial<
  Record<EnforcementAction, CasePacketActionFamily>
> = {
  approve: 'approve',
  remove: 'remove',
  warn: 'warn',
  note: 'note',
  temporary_ban_suggested: 'temporary_ban_suggested',
  permanent_ban_suggested: 'permanent_ban_suggested',
  manual_review: 'manual_review',
  ignore_reports: 'ignore_reports',
};

export function findComparableCases(
  options: ComparableCaseOptions
): ComparableCase[] {
  const windowDays = options.timeWindowDays ?? DEFAULT_WINDOW_DAYS;
  const maxCases = options.maxCases ?? DEFAULT_MAX_CASES;
  const currentTime = Date.parse(options.currentAction.createdAt);
  const currentSelectedFamily = toActionFamily(
    options.currentAction.selectedAction
  );
  const currentRecommendedFamily = toActionFamily(
    options.currentAction.recommendedAction
  );
  const currentOffenseBucket = getOffenseBucket(
    getOffenseCountAtAction(options.currentAction, options.actions)
  );
  const currentTargetType = getTargetType(options.currentAction.targetThingId);

  if (Number.isNaN(currentTime) || maxCases <= 0) {
    return [];
  }

  return options.actions
    .filter((candidate) =>
      isComparableCandidate({
        candidate,
        allActions: options.actions,
        currentAction: options.currentAction,
        currentTime,
        currentSelectedFamily,
        currentRecommendedFamily,
        currentOffenseBucket,
        windowDays,
      })
    )
    .map((candidate) =>
      toComparableCase({
        candidate,
        allActions: options.actions,
        currentSelectedFamily,
        currentRecommendedFamily,
        currentOffenseBucket,
        currentTargetType,
        windowDays,
      })
    )
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
    .slice(0, maxCases);
}

export function toActionFamily(
  action: EnforcementAction | undefined
): CasePacketActionFamily {
  if (!action) {
    return 'unknown';
  }

  return ACTION_FAMILY_BY_ACTION[action] ?? 'unknown';
}

export function getOffenseBucket(
  offenseCount: number | undefined
): CasePacketOffenseBucket {
  if (offenseCount === undefined) {
    return 'unknown';
  }
  if (offenseCount <= 1) {
    return 'first_offense';
  }
  if (offenseCount === 2) {
    return 'second_offense';
  }
  return 'third_or_more';
}

export function getOffenseCountAtAction(
  action: ActionEvent,
  actions: ActionEvent[]
): number | undefined {
  if (!action.targetAuthor) {
    return undefined;
  }

  const actionTime = Date.parse(action.createdAt);
  if (Number.isNaN(actionTime)) {
    return undefined;
  }

  const author = action.targetAuthor.toLowerCase();
  return actions.filter((candidate) => {
    if (candidate.ruleKey !== action.ruleKey) {
      return false;
    }
    if (candidate.targetAuthor?.toLowerCase() !== author) {
      return false;
    }
    const candidateTime = Date.parse(candidate.createdAt);
    return !Number.isNaN(candidateTime) && candidateTime <= actionTime;
  }).length;
}

export function getTargetType(
  targetThingId: string | undefined
): 'post' | 'comment' | 'unknown' {
  if (!targetThingId) {
    return 'unknown';
  }
  if (targetThingId.startsWith('t3_')) {
    return 'post';
  }
  if (targetThingId.startsWith('t1_')) {
    return 'comment';
  }
  return 'unknown';
}

function isComparableCandidate(options: {
  candidate: ActionEvent;
  allActions: ActionEvent[];
  currentAction: ActionEvent;
  currentTime: number;
  currentSelectedFamily: CasePacketActionFamily;
  currentRecommendedFamily: CasePacketActionFamily;
  currentOffenseBucket: CasePacketOffenseBucket;
  windowDays: number;
}): boolean {
  if (options.candidate.id === options.currentAction.id) {
    return false;
  }
  if (options.candidate.ruleKey !== options.currentAction.ruleKey) {
    return false;
  }

  const candidateTime = Date.parse(options.candidate.createdAt);
  if (Number.isNaN(candidateTime) || candidateTime > options.currentTime) {
    return false;
  }

  const windowMs = options.windowDays * 86_400_000;
  if (options.currentTime - candidateTime > windowMs) {
    return false;
  }

  const selectedFamily = toActionFamily(options.candidate.selectedAction);
  const recommendedFamily = toActionFamily(options.candidate.recommendedAction);
  const hasSelectedMatch =
    options.currentSelectedFamily !== 'unknown' &&
    selectedFamily === options.currentSelectedFamily;
  const hasRecommendedMatch =
    options.currentRecommendedFamily !== 'unknown' &&
    recommendedFamily === options.currentRecommendedFamily;
  if (!hasSelectedMatch && !hasRecommendedMatch) {
    return false;
  }

  const candidateBucket = getOffenseBucket(
    getOffenseCountAtAction(options.candidate, options.allActions)
  );
  if (
    options.currentOffenseBucket !== 'unknown' &&
    candidateBucket !== 'unknown' &&
    candidateBucket !== options.currentOffenseBucket
  ) {
    return false;
  }

  return true;
}

function toComparableCase(options: {
  candidate: ActionEvent;
  allActions: ActionEvent[];
  currentSelectedFamily: CasePacketActionFamily;
  currentRecommendedFamily: CasePacketActionFamily;
  currentOffenseBucket: CasePacketOffenseBucket;
  currentTargetType: 'post' | 'comment' | 'unknown';
  windowDays: number;
}): ComparableCase {
  const selectedActionFamily = toActionFamily(options.candidate.selectedAction);
  const recommendedActionFamily = toActionFamily(
    options.candidate.recommendedAction
  );
  const offenseBucket = getOffenseBucket(
    getOffenseCountAtAction(options.candidate, options.allActions)
  );
  const targetType = getTargetType(options.candidate.targetThingId);
  const matchReasons = ['same rule', `within ${options.windowDays}-day window`];

  if (
    offenseBucket !== 'unknown' &&
    offenseBucket === options.currentOffenseBucket
  ) {
    matchReasons.push(`same ${offenseBucket.replaceAll('_', '-')} bucket`);
  }
  if (
    options.currentSelectedFamily !== 'unknown' &&
    selectedActionFamily === options.currentSelectedFamily
  ) {
    matchReasons.push('same selected action family');
  }
  if (
    options.currentRecommendedFamily !== 'unknown' &&
    recommendedActionFamily === options.currentRecommendedFamily
  ) {
    matchReasons.push('same recommended action family');
  }
  if (targetType !== 'unknown' && targetType === options.currentTargetType) {
    matchReasons.push(`same ${targetType} target type`);
  }

  const comparable: ComparableCase = {
    actionId: options.candidate.id,
    createdAt: options.candidate.createdAt,
    ruleKey: options.candidate.ruleKey,
    selectedAction: options.candidate.selectedAction,
    recommendedAction: options.candidate.recommendedAction,
    offenseBucket,
    selectedActionFamily,
    recommendedActionFamily,
    targetType,
    matchReasons,
  };

  if (options.candidate.ruleName !== undefined) {
    comparable.ruleName = options.candidate.ruleName;
  }
  if (options.candidate.targetAuthor !== undefined) {
    comparable.anonymizedTargetAuthor = anonymizeAuthor(
      options.candidate.targetAuthor
    );
  }

  return comparable;
}

function anonymizeAuthor(username: string): string {
  const normalized = username.trim();
  if (!normalized) {
    return 'unknown user';
  }

  return `${normalized.slice(0, 3)}...`;
}
