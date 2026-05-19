import type {
  RuntimeVerificationItem,
  RuntimeVerificationMatrix,
  RuntimeVerificationStatus,
  RuntimeVerificationSummary,
} from '../../shared/schema';

export type RuntimeVerificationContext = RuntimeVerificationMatrix['context'];

export function buildRuntimeVerificationMatrix(
  context: RuntimeVerificationContext = {},
  generatedAt = new Date().toISOString()
): RuntimeVerificationMatrix {
  const items = buildRuntimeVerificationItems();
  return {
    generatedAt,
    context: stripUndefinedContext(context),
    items,
    summary: summarizeRuntimeVerification(items),
    criticalBlockers: items
      .filter((item) =>
        ['entrypoint', 'target_context', 'moderation_execution'].includes(
          item.category
        )
      )
      .filter((item) =>
        ['type_only', 'unverified', 'blocked', 'disabled'].includes(item.status)
      )
      .map((item) => `${item.capability}: ${item.nextAction}`),
  };
}

export function summarizeRuntimeVerification(
  items: RuntimeVerificationItem[]
): RuntimeVerificationSummary {
  const count = (status: RuntimeVerificationStatus) =>
    items.filter((item) => item.status === status).length;

  return {
    total: items.length,
    runtimeVerified: count('runtime_verified'),
    localVerified: count('local_verified'),
    staticVerified: count('static_verified'),
    typeOnly: count('type_only'),
    unverified: count('unverified'),
    disabled: count('disabled'),
    blocked: count('blocked'),
  };
}

function buildRuntimeVerificationItems(): RuntimeVerificationItem[] {
  return [
    {
      id: 'subreddit-dashboard-entrypoint',
      category: 'entrypoint',
      capability: 'Subreddit dashboard launcher',
      status: 'runtime_verified',
      evidence: [
        'RESEARCH.md records Safari playtest proof for the moderator dashboard launcher and expanded WebView on v0.0.1.65.',
        'W13 Zen runtime pass reached playtest v0.0.1.71 and opened the subreddit menu confirmation form.',
        'devvit.json keeps the subreddit menu entry moderator-only.',
      ],
      proofCommand: 'npm run dev',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep this route in the W13 regression checklist after integration merges.',
    },
    {
      id: 'post-comment-apply-policy-entrypoints',
      category: 'entrypoint',
      capability: 'Post/comment Apply Policy menu entrypoints',
      status: 'runtime_verified',
      evidence: [
        'devvit.json exposes moderator-only post/comment Apply ModMirror Policy menu items.',
        'src/routes/menu.ts resolves MenuItemRequest.targetId and returns a form.',
        'Post target capture was playtest-verified on v0.0.1.83.',
        'Comment target capture was playtest-verified on v0.0.1.84.',
      ],
      diagnosticRoute: '/internal/menu/apply-policy-post',
      proofCommand: 'npm run dev',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep both post and comment menu target capture in the runtime regression checklist.',
    },
    {
      id: 'target-context-fetch',
      category: 'target_context',
      capability: 'Target context capture for posts and comments',
      status: 'runtime_verified',
      evidence: [
        'src/server/services/targetContext.ts uses installed Reddit SDK typings for post/comment fetches.',
        'src/server/services/targetContext.test.ts covers post, comment, unknown, and permission failure shapes with mocks.',
        'Playtest verified resolved post target t3_1texjev and comment target t1_ommzgtz with author/permalink fields.',
      ],
      proofCommand: 'npm test -- src/server/services/targetContext.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep resolved author/permalink fields in regression screenshots after integration.',
    },
    {
      id: 'redis-smoke',
      category: 'data_persistence',
      capability: 'Redis read/write smoke',
      status: 'runtime_verified',
      evidence: [
        'POST /api/smoke/redis writes and reads modmirror:{subreddit}:smoke:redis-data-layer.',
        'Redis helper compiles and local mocked persistence tests pass.',
        'Post-W34 playtest settings state reports Redis smoke write/read matched.',
      ],
      diagnosticRoute: '/api/smoke/redis',
      proofCommand: 'curl -X POST <playtest-webview-origin>/api/smoke/redis',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep the Redis smoke route in the runtime regression checklist.',
    },
    {
      id: 'reddit-read-smoke',
      category: 'data_persistence',
      capability: 'Read-only Reddit API smoke',
      status: 'runtime_verified',
      evidence: [
        'POST /api/smoke/reddit reads current subreddit, current user, rules, removal reasons, and recent moderation log entries.',
        'Post-W34 playtest settings state reports the Reddit read-only smoke route completed.',
      ],
      diagnosticRoute: '/api/smoke/reddit',
      proofCommand: 'curl -X POST <playtest-webview-origin>/api/smoke/reddit',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep read-only Reddit smoke in the runtime regression checklist.',
    },
    {
      id: 'scan-history-persistence',
      category: 'data_persistence',
      capability: 'Full scan history persistence',
      status: 'runtime_verified',
      evidence: [
        'src/server/services/scans.test.ts stores full scan records and metadata indexes with mocked Redis.',
        'W05 added /api/scans, /api/scans/:id, and /api/scans/compare.',
        'Post-W34 playtest verified live quick scan persistence and stored-scan replay.',
      ],
      diagnosticRoute: '/api/scans',
      proofCommand: 'npm test -- src/server/services/scans.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep live scan list/detail/replay in the runtime regression checklist.',
    },
    {
      id: 'policy-agreement-lifecycle',
      category: 'policy_workflow',
      capability: 'Policy proposal, review, and adoption lifecycle',
      status: 'runtime_verified',
      evidence: [
        'src/server/services/policies.test.ts covers draft/propose/review/adopt behavior.',
        'W08 routes and Agree UI are build verified.',
        'Post-W34 playtest verified Redis-backed propose/review writes and adoption blocking at 1/2 approvals.',
      ],
      proofCommand: 'npm test -- src/server/services/policies.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Verify reviewed adoption with multiple distinct moderators when a second moderator account is available.',
    },
    {
      id: 'apply-policy-log-only-receipts',
      category: 'moderation_execution',
      capability: 'Log-only Apply Policy confirmation and receipts',
      status: 'runtime_verified',
      evidence: [
        'src/server/services/applyPolicy.test.ts covers preview/confirm/override behavior.',
        'src/server/services/receipts.test.ts covers receipt storage/listing with mocked Redis.',
        'W12 Act UI renders the receipt ledger from /api/receipts.',
        'Post-W34 playtest verified log-only and unverified-disabled receipts persisted in Devvit Redis.',
      ],
      diagnosticRoute: '/api/receipts',
      proofCommand:
        'npm test -- src/server/services/applyPolicy.test.ts src/server/services/receipts.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep log-only receipt creation and ledger reload in the runtime regression checklist.',
    },
    {
      id: 'real-remove-approve-ignore',
      category: 'moderation_execution',
      capability: 'Real Reddit remove/approve/ignore-reports execution',
      status: 'disabled',
      evidence: [
        'src/server/services/moderationExecution.ts requires explicit confirmation, live mode, runtime proof, and receipts.',
        'No safe runtime proof has been recorded for remove, approve, or ignoreReports.',
      ],
      proofCommand: 'npm test -- src/server/services/moderationExecution.test.ts',
      safeToRunInPlaytest: false,
      destructive: true,
      nextAction:
        'Only test on controlled throwaway content after W13 checklist confirms target context and receipt creation.',
    },
    {
      id: 'case-packets-v2',
      category: 'evidence',
      capability: 'Receipt-backed Case Packets',
      status: 'runtime_verified',
      evidence: [
        'src/server/services/casePacket.test.ts covers receipt-backed packets and policy-changed-since-action.',
        'Post-W34 playtest verified receipt-backed Case Packet generation and Evidence Board creation from a Case Packet.',
      ],
      diagnosticRoute: '/api/case-packet',
      proofCommand: 'npm test -- src/server/services/casePacket.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Keep receipt-backed Case Packet generation in the runtime regression checklist.',
    },
    {
      id: 'team-delivery',
      category: 'delivery',
      capability: 'Team delivery and scheduler',
      status: 'disabled',
      evidence: [
        'W11 keeps Mod Discussion delivery preview-first and scheduler unavailable until runtime proof.',
        'Product routes do not inject a live delivery adapter.',
      ],
      diagnosticRoute: '/api/delivery/capabilities',
      proofCommand: 'npm test -- src/server/services/teamDelivery.test.ts',
      safeToRunInPlaytest: false,
      destructive: false,
      nextAction:
        'Verify internal-only Mod Discussion destination and scheduler registration before enabling any real delivery.',
    },
    {
      id: 'ai-advisory',
      category: 'ai',
      capability: 'External AI advisory',
      status: 'disabled',
      evidence: [
        'W10 keeps AI advisory disabled by default with no provider key path and no HTTP permission enabled.',
      ],
      diagnosticRoute: '/api/ai/capabilities',
      proofCommand: 'npm test -- src/server/services/aiAdvisory.test.ts',
      safeToRunInPlaytest: false,
      destructive: false,
      nextAction:
        'Do not enable until provider configuration, secret retrieval, HTTP fetch, latency, and privacy requirements are proven.',
    },
    {
      id: 'non-mod-access',
      category: 'access_control',
      capability: 'Non-moderator access blocking',
      status: 'local_verified',
      evidence: [
        'Menu items are configured with forUserType=moderator.',
        'src/server/services/moderatorAccess.ts requires a signed-in current user and a non-empty getModPermissionsForSubreddit result before protected API routes continue in live subreddit context.',
        'src/server/services/moderatorAccess.test.ts covers no-user, unavailable permission API, empty permission, and permission failure denials.',
        'src/routes/apiAccess.test.ts covers protected current-user permission diagnostics.',
        'Devvit WebView Settings diagnostic returned current moderator permission "all" on r/modmirror_dev.',
        'Exact non-mod account behavior in Devvit runtime is not proven.',
      ],
      diagnosticRoute: '/api/access/diagnostics',
      proofCommand:
        'npm test -- src/server/services/moderatorAccess.test.ts src/routes/apiAccess.test.ts',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Test with a non-moderator account to promote this from local guard proof to runtime proof; verify lower-permission moderator role strings before stronger gates.',
    },
    {
      id: 'desktop-expanded-webview',
      category: 'ui_runtime',
      capability: 'Desktop expanded WebView operational IA',
      status: 'runtime_verified',
      evidence: [
        'W13 Zen runtime pass on playtest v0.0.1.71 opened the expanded Reddit modal and showed Act, Scan, Agree, Review, Prove, and Settings.',
        'The host Mobile viewport control was visible and the Act workspace rendered inside the Reddit WebView.',
      ],
      proofCommand:
        'npm run dev',
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Repeat after integration and capture screenshots from the integrated branch.',
    },
    {
      id: 'mobile-app-webview',
      category: 'ui_runtime',
      capability: 'Reddit mobile app WebView layout',
      status: 'unverified',
      evidence: [
        'W12 captured static 390px Playwright proof.',
        'W13 verified the desktop WebView host Mobile viewport control, not the native Reddit mobile app.',
      ],
      safeToRunInPlaytest: true,
      destructive: false,
      nextAction:
        'Open playtest in the native Reddit mobile app or device mirror and record layout/interaction proof.',
    },
  ];
}

function stripUndefinedContext(
  context: RuntimeVerificationContext
): RuntimeVerificationContext {
  const result: RuntimeVerificationContext = {};
  for (const key of Object.keys(context) as Array<keyof RuntimeVerificationContext>) {
    const value = context[key];
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}
