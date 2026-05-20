import type {
  CalibrationPackResponse,
  MirrorScan,
  OnboardingPath,
  ReviewRoomResponse,
  RulePolicy,
} from '../../shared/schema';

export function buildOnboardingPaths(input: {
  scan?: MirrorScan;
  policies: RulePolicy[];
  reviewRoom?: ReviewRoomResponse;
  calibration?: CalibrationPackResponse;
}): OnboardingPath[] {
  const scanComplete = input.scan !== undefined;
  const activePolicyCount = input.policies.filter((policy) => policy.active).length;
  const hasActivePolicy = activePolicyCount > 0;
  const hasUnresolvedReview =
    (input.reviewRoom?.tasks.some((task) => task.status !== 'resolved') ?? false);
  const hasCalibration = (input.calibration?.scenarios.length ?? 0) > 0;
  const isSmallSubreddit =
    input.scan?.smallSubredditStatus.meetsThreshold === false ||
    (scanComplete && input.scan !== undefined && input.scan.totalActionsScanned < 8);

  return [
    {
      id: 'new-mod-learn-policy',
      label: 'Learn the team norm',
      audience: 'new_mod',
      steps: [
        step('Load scan or demo', 'scan', scanComplete),
        step('Read active policy', 'agree', hasActivePolicy, scanComplete && !hasActivePolicy),
        step('Practice calibration', 'calibration', hasCalibration, hasActivePolicy && !hasCalibration),
        step('Apply with confirmation', 'act', false, hasActivePolicy && hasCalibration),
      ],
    },
    {
      id: 'lead-mod-resolve-drift',
      label: 'Resolve drift',
      audience: 'lead_mod',
      steps: [
        step('Open Drift Radar', 'scan', scanComplete),
        step('Draft policy ladder', 'agree', hasActivePolicy, scanComplete && !hasActivePolicy),
        step('Review exceptions', 'review', !hasUnresolvedReview, hasActivePolicy && hasUnresolvedReview),
        step('Prove with evidence graph', 'review', false, hasActivePolicy && !hasUnresolvedReview),
      ],
    },
    {
      id: 'existing-team-review',
      label: 'Review existing team signals',
      audience: 'existing_team',
      steps: [
        step('Refresh Command Center', 'review', scanComplete || hasActivePolicy),
        step('Open Review Room', 'review', !hasUnresolvedReview, hasUnresolvedReview),
        step('Run calibration', 'calibration', hasCalibration, !hasCalibration),
        step('Apply policy to next case', 'act', false, hasActivePolicy && !hasUnresolvedReview),
      ],
    },
    {
      id: 'small-subreddit-start',
      label: 'Start with sparse data',
      audience: 'small_subreddit',
      steps: [
        step('Load demo reset', 'scan', scanComplete && !isSmallSubreddit, !scanComplete),
        step('Create starter policy', 'agree', hasActivePolicy, scanComplete && !hasActivePolicy),
        step('Practice scenarios', 'calibration', hasCalibration, hasActivePolicy && !hasCalibration),
        step('Collect receipts', 'act', false, hasActivePolicy),
      ],
    },
  ];
}

function step(
  label: string,
  target: OnboardingPath['steps'][number]['target'],
  complete: boolean,
  current = false
): OnboardingPath['steps'][number] {
  return {
    label,
    target,
    status: complete ? 'complete' : current ? 'current' : 'pending',
  };
}
