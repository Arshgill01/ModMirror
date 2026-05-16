import { DEMO_SUBREDDIT_NAME } from '../../shared/constants';
import type {
  EnforcementAction,
  MirrorScanSources,
  NormalizedModAction,
  NormalizedRemovalReason,
  NormalizedRule,
} from '../../shared/schema';

export const DEMO_DATA_LABEL =
  'Demo data - not real subreddit moderation history.';

const BASE_TIME = Date.UTC(2026, 4, 16, 12, 0, 0);

export const DEMO_SCAN_RULES: NormalizedRule[] = [
  {
    ruleKey: 'be-civil-1',
    ruleName: 'Be civil',
    description: 'No insults, harassment, threats, or personal attacks.',
    violationReason: 'Keep disagreement respectful and focused on the topic.',
    priority: 1,
    kind: 'all',
    source: 'demo',
  },
  {
    ruleKey: 'low-effort-questions-2',
    ruleName: 'Low-effort questions',
    description:
      'Questions need context, prior research, relevant code, and a clear learning goal.',
    violationReason:
      'Posts that ask others to do the work without details may be removed.',
    priority: 2,
    kind: 'link',
    source: 'demo',
  },
  {
    ruleKey: 'self-promotion-3',
    ruleName: 'Self-promotion',
    description:
      'No drive-by promotional links, referral posts, or repeated project ads.',
    violationReason: 'Promotional content belongs in the weekly showcase thread.',
    priority: 3,
    kind: 'all',
    source: 'demo',
  },
];

export const DEMO_REMOVAL_REASONS: NormalizedRemovalReason[] = [
  {
    id: 'demo-rr-civility',
    title: 'Rule 1: Be civil',
    message: 'Please keep feedback respectful and avoid personal attacks.',
    source: 'demo',
  },
  {
    id: 'demo-rr-low-effort',
    title: 'Rule 2: Low-effort question',
    message:
      'Please add context, code, prior research, and what you already tried.',
    source: 'demo',
  },
  {
    id: 'demo-rr-self-promo',
    title: 'Rule 3: Self-promotion',
    message: 'Promotional links should go in the weekly showcase thread.',
    source: 'demo',
  },
];

export function getDemoMirrorScanSources(): MirrorScanSources {
  return {
    subreddit: DEMO_SUBREDDIT_NAME,
    source: 'demo',
    rules: DEMO_SCAN_RULES,
    removalReasons: DEMO_REMOVAL_REASONS,
    actions: DEMO_MOD_ACTIONS,
    warnings: [DEMO_DATA_LABEL],
  };
}

export const DEMO_MOD_ACTIONS: NormalizedModAction[] = [
  ...makeRule2WarningActions(),
  ...makeRule2RemovalOnlyActions(),
  ...makeRule2EscalationActions(),
  ...makeRule3RemovalActions(),
  ...makeRule1Actions(),
  ...makeUnmatchedActions(),
];

function makeRule2WarningActions(): NormalizedModAction[] {
  return Array.from({ length: 12 }, (_, index) =>
    demoAction({
      id: `demo-r2-warning-${index + 1}`,
      dayOffset: index,
      rawActionType: 'remove',
      normalizedAction: 'warn',
      moderator: `demo_mod_${(index % 3) + 1}`,
      targetAuthor: `learner_${index + 1}`,
      removalReasonId: 'demo-rr-low-effort',
      removalReasonTitle: 'Rule 2: Low-effort question',
      detailsText:
        'First-time Rule 2 low-effort question. Removed with a warning asking for context, code, and prior research.',
    })
  );
}

function makeRule2RemovalOnlyActions(): NormalizedModAction[] {
  return Array.from({ length: 5 }, (_, index) =>
    demoAction({
      id: `demo-r2-remove-only-${index + 1}`,
      dayOffset: 14 + index,
      rawActionType: 'remove',
      normalizedAction: 'remove',
      moderator: `demo_mod_${(index % 2) + 4}`,
      targetAuthor: `learner_${index + 20}`,
      detailsText:
        'Low effort homework-style question with no code and no context. Removed without a user-facing warning.',
    })
  );
}

function makeRule2EscalationActions(): NormalizedModAction[] {
  return Array.from({ length: 4 }, (_, index) =>
    demoAction({
      id: `demo-r2-temp-ban-${index + 1}`,
      dayOffset: 22 + index,
      rawActionType: 'banuser',
      normalizedAction: 'temporary_ban_suggested',
      moderator: `demo_mod_${(index % 2) + 2}`,
      targetAuthor: `learner_${index + 30}`,
      detailsText:
        'R2 repeated low-effort question pattern. Temporary ban suggested even though this looks like a first captured offense.',
    })
  );
}

function makeRule3RemovalActions(): NormalizedModAction[] {
  return Array.from({ length: 20 }, (_, index) =>
    demoAction({
      id: `demo-r3-remove-${index + 1}`,
      dayOffset: 28 + index,
      rawActionType: 'remove',
      normalizedAction: 'remove',
      moderator: `demo_mod_${(index % 4) + 1}`,
      targetAuthor: `builder_${index + 1}`,
      removalReasonTitle:
        index < 17 ? 'Rule 3: Self-promotion' : 'Self-promotion',
      detailsText:
        'Drive-by self-promotion link removed and redirected to the weekly showcase thread.',
      ...(index < 17 ? { removalReasonId: 'demo-rr-self-promo' } : {}),
    })
  );
}

function makeRule1Actions(): NormalizedModAction[] {
  const actions: EnforcementAction[] = [
    'remove',
    'remove',
    'warn',
    'warn',
    'temporary_ban_suggested',
    'temporary_ban_suggested',
    'permanent_ban_suggested',
    'remove',
    'warn',
    'temporary_ban_suggested',
  ];

  return actions.map((normalizedAction, index) =>
    demoAction({
      id: `demo-r1-civil-${index + 1}`,
      dayOffset: 50 + index,
      rawActionType:
        normalizedAction === 'permanent_ban_suggested' ? 'banuser' : 'remove',
      normalizedAction,
      moderator: `demo_mod_${(index % 3) + 1}`,
      targetAuthor: `heated_user_${index + 1}`,
      removalReasonTitle: 'Rule 1: Be civil',
      detailsText:
        index >= 4
          ? 'Rule 1 severe personal attack and harassment. Escalation was justified by context.'
          : 'Be civil reminder after insults in a discussion thread.',
      ...(index < 7 ? { removalReasonId: 'demo-rr-civility' } : {}),
    })
  );
}

function makeUnmatchedActions(): NormalizedModAction[] {
  return Array.from({ length: 9 }, (_, index) =>
    demoAction({
      id: `demo-noisy-${index + 1}`,
      dayOffset: 64 + index,
      rawActionType: index % 2 === 0 ? 'sticky_post' : 'edit_settings',
      normalizedAction: 'manual_review',
      moderator: `demo_mod_${(index % 2) + 5}`,
      detailsText:
        index % 2 === 0
          ? 'Pinned the weekly beginner help thread.'
          : 'Adjusted automod wording for the weekend event.',
    })
  );
}

function demoAction(input: {
  id: string;
  dayOffset: number;
  rawActionType: string;
  normalizedAction: EnforcementAction;
  moderator: string;
  targetAuthor?: string;
  removalReasonId?: string;
  removalReasonTitle?: string;
  detailsText: string;
}): NormalizedModAction {
  const action: NormalizedModAction = {
    id: input.id,
    subreddit: DEMO_SUBREDDIT_NAME,
    source: 'demo',
    rawActionType: input.rawActionType,
    normalizedAction: input.normalizedAction,
    createdAt: new Date(BASE_TIME - input.dayOffset * 86_400_000).toISOString(),
    moderator: input.moderator,
    targetThingId: `t3_${input.id.replaceAll('-', '_')}`,
    detailsText: input.detailsText,
  };

  if (input.targetAuthor) {
    action.targetAuthor = input.targetAuthor;
  }
  if (input.removalReasonId) {
    action.removalReasonId = input.removalReasonId;
  }
  if (input.removalReasonTitle) {
    action.removalReasonTitle = input.removalReasonTitle;
  }

  return action;
}
