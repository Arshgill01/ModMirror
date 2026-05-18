import { DEFAULT_POLICY_REQUIRED_APPROVALS } from '../../shared/constants';
import type {
  PolicyRatificationSettings,
  PolicyRatificationSummary,
  PolicyReviewRecord,
} from '../../shared/schema';

export function normalizeRatificationSettings(
  input?: Partial<PolicyRatificationSettings>
): PolicyRatificationSettings {
  const requiredApprovals = Number.isFinite(input?.requiredApprovals)
    ? Math.floor(Number(input?.requiredApprovals))
    : DEFAULT_POLICY_REQUIRED_APPROVALS;

  return {
    requiredApprovals: Math.max(1, requiredApprovals),
    allowSingleModAdoption: input?.allowSingleModAdoption ?? true,
  };
}

export function upsertPolicyReviewRecord(
  records: PolicyReviewRecord[],
  review: PolicyReviewRecord
): PolicyReviewRecord[] {
  const existingIndex = records.findIndex(
    (record) => record.reviewer.toLowerCase() === review.reviewer.toLowerCase()
  );

  if (existingIndex === -1) {
    return [...records, review];
  }

  return records.map((record, index) =>
    index === existingIndex ? review : record
  );
}

export function summarizePolicyRatification(options: {
  reviewRecords?: PolicyReviewRecord[] | undefined;
  settings?: Partial<PolicyRatificationSettings> | undefined;
}): PolicyRatificationSummary {
  const settings = normalizeRatificationSettings(options.settings);
  const latestByReviewer = new Map<string, PolicyReviewRecord>();

  for (const record of options.reviewRecords ?? []) {
    latestByReviewer.set(record.reviewer.toLowerCase(), record);
  }

  const latestReviews = [...latestByReviewer.values()];
  const approvals = latestReviews.filter(
    (record) => record.decision === 'approve'
  ).length;
  const requestsForChanges = latestReviews.filter(
    (record) => record.decision === 'request_changes'
  ).length;
  const abstentions = latestReviews.filter(
    (record) => record.decision === 'abstain'
  ).length;
  const canAdopt =
    requestsForChanges === 0 && approvals >= settings.requiredApprovals;

  const summary: PolicyRatificationSummary = {
    requiredApprovals: settings.requiredApprovals,
    approvals,
    requestsForChanges,
    abstentions,
    latestReviewCount: latestReviews.length,
    canAdopt,
  };

  if (requestsForChanges > 0) {
    summary.adoptionBlockedReason =
      'At least one reviewer requested changes on this version.';
  } else if (!canAdopt) {
    summary.adoptionBlockedReason = `Requires ${settings.requiredApprovals} approval vote(s) before adoption.`;
  }

  return summary;
}
