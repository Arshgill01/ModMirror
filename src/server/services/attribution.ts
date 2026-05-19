import { confidenceLabel, normalizeForMatching } from '../../shared/scoring';
import type {
  AttributedModAction,
  AttributionResult,
  NormalizedModAction,
  NormalizedRemovalReason,
  NormalizedRule,
} from '../../shared/schema';
import {
  applyAttributionCorrection,
  type AttributionCorrectionIndex,
} from './attributionCalibration';

const HIGH_CONFIDENCE_SCORE = 0.8;
const MEDIUM_CONFIDENCE_SCORE = 0.55;
const LOW_CONFIDENCE_SCORE = 0.3;

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'be',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'not',
  'of',
  'on',
  'or',
  'our',
  'please',
  'that',
  'the',
  'this',
  'to',
  'with',
  'you',
  'your',
]);

type RuleCandidate = {
  rule: NormalizedRule;
  score: number;
  evidence: string[];
};

export function attributeActions(
  actions: NormalizedModAction[],
  rules: NormalizedRule[],
  removalReasons: NormalizedRemovalReason[],
  correctionIndex?: AttributionCorrectionIndex
): AttributedModAction[] {
  return actions.map((action) =>
    attributeAction(action, rules, removalReasons, correctionIndex)
  );
}

export function attributeAction(
  action: NormalizedModAction,
  rules: NormalizedRule[],
  removalReasons: NormalizedRemovalReason[],
  correctionIndex?: AttributionCorrectionIndex
): AttributedModAction {
  const result = inferAttribution(action, rules, removalReasons, correctionIndex);
  const attributed: AttributedModAction = {
    id: action.id,
    subreddit: action.subreddit,
    source: action.source,
    rawActionType: action.rawActionType,
    createdAt: action.createdAt,
    confidence: result.confidence,
    evidence: result.evidence,
    attributionKind:
      result.attributionKind ??
      (result.confidence === 'unmatched' ? 'unmatched' : 'inferred'),
  };

  if (action.normalizedAction) {
    attributed.normalizedAction = action.normalizedAction;
  }
  if (action.targetThingId) {
    attributed.targetThingId = action.targetThingId;
  }
  if (action.targetAuthor) {
    attributed.targetAuthor = action.targetAuthor;
  }
  if (action.moderator) {
    attributed.moderator = action.moderator;
  }
  if (result.inferredRuleKey) {
    attributed.inferredRuleKey = result.inferredRuleKey;
  }
  if (result.inferredRuleName) {
    attributed.inferredRuleName = result.inferredRuleName;
  }
  if (result.correction) {
    attributed.correction = result.correction;
  }

  return attributed;
}

export function inferAttribution(
  action: NormalizedModAction,
  rules: NormalizedRule[],
  removalReasons: NormalizedRemovalReason[],
  correctionIndex?: AttributionCorrectionIndex
): AttributionResult {
  if (action.directRuleKey) {
    const directResult: AttributionResult = {
      actionId: action.id,
      inferredRuleKey: action.directRuleKey,
      confidence: 'high',
      score: 1,
      attributionKind: 'direct',
      evidence: ['ModMirror metadata includes an explicit rule reference.'],
    };
    if (action.directRuleName) {
      directResult.inferredRuleName = action.directRuleName;
    }

    return directResult;
  }

  const removalReason = findRemovalReason(action, removalReasons);
  const actionText = actionSearchText(action, removalReason);
  const candidates = rules.map((rule) =>
    scoreRuleCandidate(rule, actionText, removalReason)
  );
  const best = candidates.sort(compareCandidates)[0];

  if (!best || best.score < LOW_CONFIDENCE_SCORE) {
    return applyAttributionCorrection(action, {
      actionId: action.id,
      confidence: 'unmatched',
      score: 0,
      attributionKind: 'unmatched',
      evidence: ['No rule signal met the minimum attribution threshold.'],
    }, correctionIndex);
  }

  const confidence = confidenceLabel(best.score);

  return applyAttributionCorrection(action, {
    actionId: action.id,
    inferredRuleKey: best.rule.ruleKey,
    inferredRuleName: best.rule.ruleName,
    confidence,
    score: roundScore(best.score),
    attributionKind: 'inferred',
    evidence: best.evidence,
  }, correctionIndex);
}

export function extractRuleNumbers(value: string): number[] {
  const normalized = normalizeForMatching(value);
  const matches = normalized.matchAll(/\b(?:rule|r)\s*([0-9]+)\b/g);
  return Array.from(matches, (match) => Number(match[1])).filter(Number.isFinite);
}

export function tokenizeForAttribution(value: string): string[] {
  return normalizeForMatching(value)
    .split(' ')
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

function scoreRuleCandidate(
  rule: NormalizedRule,
  actionText: string,
  removalReason?: NormalizedRemovalReason
): RuleCandidate {
  const evidence: string[] = [];
  let score = 0;
  const ruleText = ruleSearchText(rule);
  const ruleName = normalizeForMatching(rule.ruleName);
  const actionNormalized = normalizeForMatching(actionText);
  const ruleNumbers = extractRuleNumbers(actionText);

  if (
    typeof rule.priority === 'number' &&
    ruleNumbers.includes(rule.priority)
  ) {
    score = Math.max(score, 0.95);
    evidence.push(`Action text references Rule ${rule.priority}.`);
  }

  if (removalReason) {
    const reasonTitle = normalizeForMatching(stripRulePrefix(removalReason.title));
    if (reasonTitle && reasonTitle === stripRulePrefix(rule.ruleName)) {
      score = Math.max(score, 0.9);
      evidence.push('Removal reason title exactly matches the rule title.');
    } else if (
      reasonTitle &&
      (reasonTitle.includes(ruleName) || ruleName.includes(reasonTitle))
    ) {
      score = Math.max(score, 0.82);
      evidence.push('Removal reason title contains the rule title.');
    }
  }

  if (ruleName && actionNormalized.includes(ruleName)) {
    score = Math.max(score, HIGH_CONFIDENCE_SCORE);
    evidence.push('Action text contains the rule title.');
  }

  const overlap = keywordOverlap(actionText, ruleText);
  if (overlap.score >= 0.6) {
    score = Math.max(score, 0.68);
    evidence.push(
      `Strong keyword overlap with rule text: ${overlap.keywords.join(', ')}.`
    );
  } else if (overlap.score >= 0.34) {
    score = Math.max(score, MEDIUM_CONFIDENCE_SCORE);
    evidence.push(
      `Moderate keyword overlap with rule text: ${overlap.keywords.join(', ')}.`
    );
  } else if (overlap.score >= 0.18) {
    score = Math.max(score, LOW_CONFIDENCE_SCORE);
    evidence.push(
      `Weak keyword overlap with rule text: ${overlap.keywords.join(', ')}.`
    );
  }

  return {
    rule,
    score,
    evidence,
  };
}

function findRemovalReason(
  action: NormalizedModAction,
  removalReasons: NormalizedRemovalReason[]
): NormalizedRemovalReason | undefined {
  if (action.removalReasonId) {
    const byId = removalReasons.find(
      (reason) => reason.id === action.removalReasonId
    );
    if (byId) {
      return byId;
    }
  }

  if (!action.removalReasonTitle) {
    return undefined;
  }

  const title = normalizeForMatching(action.removalReasonTitle);
  return removalReasons.find(
    (reason) => normalizeForMatching(reason.title) === title
  );
}

function actionSearchText(
  action: NormalizedModAction,
  removalReason?: NormalizedRemovalReason
): string {
  return [
    action.rawActionType,
    action.detailsText,
    action.removalReasonTitle,
    removalReason?.title,
    removalReason?.message,
  ]
    .filter(Boolean)
    .join(' ');
}

function ruleSearchText(rule: NormalizedRule): string {
  return [rule.ruleName, rule.description, rule.violationReason]
    .filter(Boolean)
    .join(' ');
}

function keywordOverlap(left: string, right: string) {
  const leftTokens = new Set(tokenizeForAttribution(left));
  const rightTokens = new Set(tokenizeForAttribution(right));
  const keywords = Array.from(leftTokens).filter((token) =>
    rightTokens.has(token)
  );
  const denominator = Math.max(Math.min(leftTokens.size, rightTokens.size), 1);

  return {
    score: keywords.length / denominator,
    keywords,
  };
}

function stripRulePrefix(value: string): string {
  return normalizeForMatching(value).replace(/^rule [0-9]+ /, '');
}

function compareCandidates(left: RuleCandidate, right: RuleCandidate): number {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  return left.rule.ruleName.localeCompare(right.rule.ruleName);
}

function roundScore(score: number): number {
  return Math.round(score * 100) / 100;
}
