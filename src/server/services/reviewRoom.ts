import { redis } from '@devvit/web/server';
import type {
  CommunityHealthSummary,
  DriftRadarResponse,
  EvidenceBoardThread,
  PolicyHealthOverview,
  ReviewRoomResponse,
  ReviewTask,
  ReviewTaskStatus,
  RulePolicy,
  TrustLabel,
} from '../../shared/schema';
import { listEvidenceBoards } from './evidenceBoard';
import { getPolicyHealthOverview } from './policyHealth';
import { parseJson, redisKeys, serializeJson, writeJson } from './redis';
import { getCommunityHealthSummary } from './communityHealth';
import { privacyTrustLabel } from './v2Trust';

export type ReviewRoomDependencies = {
  listStoredTasks?: (subreddit: string) => Promise<ReviewTask[]>;
  listEvidenceBoards?: typeof listEvidenceBoards;
  getPolicyHealth?: typeof getPolicyHealthOverview;
  getCommunityHealth?: typeof getCommunityHealthSummary;
};

export async function getReviewRoom(options: {
  subreddit: string;
  driftRadar?: DriftRadarResponse;
  policies?: RulePolicy[];
  dependencies?: ReviewRoomDependencies;
}): Promise<ReviewRoomResponse> {
  const deps = {
    listStoredTasks: options.dependencies?.listStoredTasks ?? listStoredReviewTasks,
    listEvidenceBoards: options.dependencies?.listEvidenceBoards ?? listEvidenceBoards,
    getPolicyHealth: options.dependencies?.getPolicyHealth ?? getPolicyHealthOverview,
    getCommunityHealth:
      options.dependencies?.getCommunityHealth ?? getCommunityHealthSummary,
  };
  const [storedTasks, boards, policyHealth, communityHealth] = await Promise.all([
    deps.listStoredTasks(options.subreddit),
    deps.listEvidenceBoards(options.subreddit),
    deps.getPolicyHealth(options.subreddit),
    deps.getCommunityHealth(options.subreddit),
  ]);
  const taskInput: Parameters<typeof buildReviewTasks>[0] = {
    subreddit: options.subreddit,
    generatedAt: new Date().toISOString(),
    policyHealth,
    communityHealth,
    boards,
    policies: options.policies ?? [],
  };
  if (options.driftRadar !== undefined) {
    taskInput.driftRadar = options.driftRadar;
  }
  const generated = buildReviewTasks(taskInput);
  const storedById = new Map(storedTasks.map((task) => [task.id, task]));
  const tasks = generated.map((task) => storedById.get(task.id) ?? task);

  return {
    subreddit: options.subreddit,
    generatedAt: new Date().toISOString(),
    tasks: tasks.sort(compareTasks),
    trustLabels: [privacyTrustLabel(), reviewRoomProofLabel()],
  };
}

export function buildReviewTasks(input: {
  subreddit: string;
  generatedAt: string;
  policyHealth: PolicyHealthOverview;
  communityHealth: CommunityHealthSummary;
  boards: EvidenceBoardThread[];
  driftRadar?: DriftRadarResponse;
  policies: RulePolicy[];
}): ReviewTask[] {
  return [
    ...input.policyHealth.summaries
      .filter(
        (summary) =>
          summary.status === 'needs_review' ||
          summary.status === 'at_risk' ||
          summary.unresolvedOverrideCount > 0
      )
      .map((summary) => policyHealthTask(input.subreddit, input.generatedAt, summary)),
    ...input.boards
      .filter((board) => board.status !== 'resolved' && board.status !== 'archived')
      .map((board) => evidenceBoardTask(input.subreddit, input.generatedAt, board)),
    ...input.policies
      .filter((policy) => policy.lifecycleState === 'proposed' || policy.proposedVersionId)
      .map((policy) => ratificationTask(input.subreddit, input.generatedAt, policy)),
    ...(input.driftRadar?.details ?? [])
      .filter((detail) => Object.keys(detail.actionDistribution).length > 1)
      .slice(0, 3)
      .map((detail) => driftTask(input.subreddit, input.generatedAt, detail)),
    communityHealthTask(input),
  ].filter((task): task is ReviewTask => task !== undefined);
}

export async function listStoredReviewTasks(subreddit: string): Promise<ReviewTask[]> {
  const rows = await redis.zRange(redisKeys.reviewTasks(subreddit), 0, 100, {
    by: 'rank',
    reverse: true,
  });
  return rows
    .map((row: { member: string }) => parseJson<ReviewTask>(row.member))
    .filter((task): task is ReviewTask => task !== undefined);
}

export async function updateReviewTaskStatus(options: {
  subreddit: string;
  taskId: string;
  status: ReviewTaskStatus;
}): Promise<ReviewTask | undefined> {
  const existing = await listStoredReviewTasks(options.subreddit);
  const current = existing.find((task) => task.id === options.taskId);
  if (current === undefined) {
    return undefined;
  }
  const updated: ReviewTask = {
    ...current,
    status: options.status,
    updatedAt: new Date().toISOString(),
  };
  await saveReviewTask(updated);
  return updated;
}

export async function saveReviewTask(task: ReviewTask): Promise<void> {
  const score = Date.parse(task.updatedAt);
  await Promise.all([
    writeJson(redisKeys.reviewTask(task.subreddit, task.id), task),
    redis.zAdd(redisKeys.reviewTasks(task.subreddit), {
      score: Number.isNaN(score) ? Date.now() : score,
      member: serializeJson(task),
    }),
  ]);
}

function policyHealthTask(
  subreddit: string,
  createdAt: string,
  summary: PolicyHealthOverview['summaries'][number]
): ReviewTask {
  return {
    id: `review-policy-health-${summary.policyId}`,
    subreddit,
    source: 'policy_health',
    sourceId: summary.policyId,
    title: `${summary.ruleName} needs policy review`,
    severity: summary.status === 'at_risk' || summary.status === 'needs_review' ? 'urgent' : 'watch',
    status: 'unresolved',
    dueSignal: `${summary.unresolvedOverrideCount} unresolved override(s), ${Math.round(summary.overrideRate * 100)}% override rate.`,
    linkedEvidence: [{ label: 'Policy health', target: summary.policyId }],
    nextAction: summary.recommendations[0] ?? 'Review recent exceptions.',
    createdAt,
    updatedAt: createdAt,
  };
}

function evidenceBoardTask(
  subreddit: string,
  createdAt: string,
  board: EvidenceBoardThread
): ReviewTask {
  return {
    id: `review-evidence-board-${board.id}`,
    subreddit,
    source: 'evidence_board',
    sourceId: board.id,
    title: board.title,
    severity: board.status === 'needs_policy_change' ? 'urgent' : 'watch',
    status: 'unresolved',
    dueSignal: `Evidence board is ${board.status}.`,
    linkedEvidence: [{ label: 'Evidence board', target: board.id }],
    nextAction: 'Review linked evidence and choose a board status.',
    createdAt,
    updatedAt: createdAt,
  };
}

function ratificationTask(
  subreddit: string,
  createdAt: string,
  policy: RulePolicy
): ReviewTask {
  return {
    id: `review-ratification-${policy.id}`,
    subreddit,
    source: 'policy_ratification',
    sourceId: policy.id,
    title: `${policy.ruleName} is awaiting team adoption`,
    severity: 'watch',
    status: 'unresolved',
    dueSignal:
      policy.ratificationSummary?.adoptionBlockedReason ??
      'Policy proposal needs moderator review.',
    linkedEvidence: [{ label: 'Policy proposal', target: policy.id }],
    nextAction: 'Review, request changes, or adopt the proposed policy version.',
    createdAt,
    updatedAt: createdAt,
  };
}

function driftTask(
  subreddit: string,
  createdAt: string,
  detail: DriftRadarResponse['details'][number]
): ReviewTask {
  const task: ReviewTask = {
    id: `review-drift-${detail.ruleKey ?? detail.ruleName}`,
    subreddit,
    source: 'drift',
    title: `${detail.ruleName} drift needs agreement`,
    severity: 'watch',
    status: 'unresolved',
    dueSignal: `${Object.keys(detail.actionDistribution).length} action types appear in this bucket.`,
    linkedEvidence: [{ label: 'Drift Radar', target: detail.ruleKey ?? detail.ruleName }],
    nextAction: detail.policyQuestions[0] ?? 'Create or update the policy ladder.',
    createdAt,
    updatedAt: createdAt,
  };
  if (detail.ruleKey !== undefined) {
    task.sourceId = detail.ruleKey;
  }
  return task;
}

function communityHealthTask(input: {
  subreddit: string;
  generatedAt: string;
  communityHealth: CommunityHealthSummary;
}): ReviewTask | undefined {
  if (
    input.communityHealth.status !== 'needs_review' &&
    input.communityHealth.status !== 'watch'
  ) {
    return undefined;
  }
  return {
    id: 'review-community-health',
    subreddit: input.subreddit,
    source: 'community_health',
    title: 'Community health radar needs attention',
    severity: input.communityHealth.status === 'needs_review' ? 'urgent' : 'watch',
    status: 'unresolved',
    dueSignal: `${input.communityHealth.unresolvedOverrideCount} unresolved override(s), ${input.communityHealth.policyChurnCount} policy change(s).`,
    linkedEvidence: [{ label: 'Community health', target: input.subreddit }],
    nextAction: 'Review aggregate signals before changing policy.',
    createdAt: input.generatedAt,
    updatedAt: input.generatedAt,
  };
}

function compareTasks(left: ReviewTask, right: ReviewTask): number {
  const severityRank = { urgent: 3, watch: 2, info: 1 };
  const severity = severityRank[right.severity] - severityRank[left.severity];
  if (severity !== 0) {
    return severity;
  }
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function reviewRoomProofLabel(): TrustLabel {
  return {
    kind: 'proof',
    label: 'Persisted local review workflow',
    detail: 'Review tasks are generated from ModMirror records and do not imply Reddit-side execution.',
    tone: 'neutral',
  };
}
