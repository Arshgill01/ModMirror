import type {
  RuntimeCapabilityHealthEvent,
  RuntimeCapabilityHealthEventInput,
  RuntimeCapabilityMatrix,
  RuntimeCapabilityMatrixEntry,
  RuntimeCapabilityMatrixSummary,
  RuntimeCapabilityState,
} from '../../shared/schema';
import { readJson, redisKeys, writeJson } from './redis';

const MAX_HEALTH_EVENTS = 50;
const FIXED_DEMO_SUBREDDIT = 'ExampleLearning';

export async function getRuntimeCapabilityMatrix(
  subreddit: string,
  generatedAt = new Date().toISOString()
): Promise<RuntimeCapabilityMatrix> {
  const healthEvents = await listRuntimeHealthEvents(subreddit);
  return buildRuntimeCapabilityMatrix({
    subreddit,
    generatedAt,
    healthEvents,
  });
}

export function buildRuntimeCapabilityMatrix(options: {
  subreddit: string;
  generatedAt: string;
  healthEvents?: RuntimeCapabilityHealthEvent[];
}): RuntimeCapabilityMatrix {
  const healthEvents = [...(options.healthEvents ?? [])].sort(compareObservedAt);
  const entries = applyHealthEvents(baseCapabilityEntries(), healthEvents);
  return {
    generatedAt: options.generatedAt,
    subreddit: options.subreddit,
    entries,
    healthEvents,
    summary: summarizeRuntimeCapabilities(entries),
    warnings: buildMatrixWarnings(entries),
  };
}

export async function recordRuntimeHealthEvent(
  input: RuntimeCapabilityHealthEventInput,
  dependencies: {
    now?: () => string;
    id?: () => string;
    readEvents?: (subreddit: string) => Promise<RuntimeCapabilityHealthEvent[]>;
    writeEvents?: (
      subreddit: string,
      events: RuntimeCapabilityHealthEvent[]
    ) => Promise<void>;
  } = {}
): Promise<RuntimeCapabilityHealthEvent> {
  const event = createRuntimeHealthEvent(input, dependencies);
  const readEvents = dependencies.readEvents ?? listRuntimeHealthEvents;
  const writeEvents = dependencies.writeEvents ?? saveRuntimeHealthEvents;
  const events = await readEvents(input.subreddit);
  await writeEvents(input.subreddit, [event, ...events].slice(0, MAX_HEALTH_EVENTS));
  return event;
}

export async function listRuntimeHealthEvents(
  subreddit: string
): Promise<RuntimeCapabilityHealthEvent[]> {
  return (
    (await readJson<RuntimeCapabilityHealthEvent[]>(
      redisKeys.runtimeHealthEvents(subreddit)
    )) ?? []
  );
}

export async function saveRuntimeHealthEvents(
  subreddit: string,
  events: RuntimeCapabilityHealthEvent[]
): Promise<void> {
  await writeJson(redisKeys.runtimeHealthEvents(subreddit), events);
}

export function summarizeRuntimeCapabilities(
  entries: RuntimeCapabilityMatrixEntry[]
): RuntimeCapabilityMatrixSummary {
  const count = (state: RuntimeCapabilityState) =>
    entries.filter((entry) => entry.state === state).length;
  return {
    total: entries.length,
    verifiedRuntime: count('verified_runtime'),
    verifiedStatic: count('verified_static'),
    typeOnly: count('type_only'),
    demoOnly: count('demo_only'),
    disabled: count('disabled'),
    unsupported: count('unsupported'),
    failedRuntime: count('failed_runtime'),
    deferred: count('deferred'),
  };
}

function createRuntimeHealthEvent(
  input: RuntimeCapabilityHealthEventInput,
  dependencies: {
    now?: () => string;
    id?: () => string;
  }
): RuntimeCapabilityHealthEvent {
  const observedAt = input.observedAt ?? dependencies.now?.() ?? new Date().toISOString();
  const id =
    dependencies.id?.() ??
    `runtime-health-${input.capabilityId}-${Date.parse(observedAt) || Date.now()}`;
  const event: RuntimeCapabilityHealthEvent = {
    id,
    subreddit: input.subreddit,
    capabilityId: input.capabilityId,
    status: input.status,
    observedAt,
    source: input.source,
    message: input.message,
  };
  if (input.diagnosticRoute !== undefined) {
    event.diagnosticRoute = input.diagnosticRoute;
  }
  if (input.errorCode !== undefined) {
    event.errorCode = input.errorCode;
  }
  if (input.errorMessage !== undefined) {
    event.errorMessage = input.errorMessage;
  }
  return event;
}

function applyHealthEvents(
  entries: RuntimeCapabilityMatrixEntry[],
  events: RuntimeCapabilityHealthEvent[]
): RuntimeCapabilityMatrixEntry[] {
  return entries.map((entry) => {
    const lastHealthEvent = latestEventForCapability(events, entry.id);
    if (lastHealthEvent === undefined) {
      return entry;
    }

    const updated: RuntimeCapabilityMatrixEntry = {
      ...entry,
      lastHealthEvent,
      evidence: [
        ...entry.evidence,
        `${lastHealthEvent.source} ${lastHealthEvent.status}: ${lastHealthEvent.message}`,
      ],
    };
    if (!entry.canUpdateFromHealthEvents) {
      return updated;
    }
    if (lastHealthEvent.status === 'passed') {
      return {
        ...updated,
        state: 'verified_runtime',
        evidenceKind: 'runtime',
        summary: `${entry.label} passed its latest runtime health check.`,
      };
    }
    if (lastHealthEvent.status === 'failed') {
      return {
        ...updated,
        state: 'failed_runtime',
        evidenceKind: 'failed',
        summary: `${entry.label} failed its latest runtime health check.`,
        nextAction:
          lastHealthEvent.errorMessage ??
          lastHealthEvent.message ??
          entry.nextAction,
      };
    }
    return updated;
  });
}

function latestEventForCapability(
  events: RuntimeCapabilityHealthEvent[],
  capabilityId: string
): RuntimeCapabilityHealthEvent | undefined {
  return events
    .filter((event) => event.capabilityId === capabilityId)
    .sort(compareObservedAt)
    .at(-1);
}

function compareObservedAt(
  left: RuntimeCapabilityHealthEvent,
  right: RuntimeCapabilityHealthEvent
): number {
  return left.observedAt.localeCompare(right.observedAt);
}

function buildMatrixWarnings(entries: RuntimeCapabilityMatrixEntry[]): string[] {
  const warnings = [
    'Runtime capability states are evidence labels, not permission to run destructive actions.',
  ];
  if (entries.some((entry) => entry.state === 'failed_runtime')) {
    warnings.push('At least one runtime capability has a recorded failure.');
  }
  if (entries.some((entry) => entry.state === 'type_only')) {
    warnings.push('Some capabilities are type-only and need playtest proof.');
  }
  return warnings;
}

function baseCapabilityEntries(): RuntimeCapabilityMatrixEntry[] {
  return [
    {
      id: 'reddit-api-smoke',
      domain: 'reddit_api',
      label: 'Reddit API reads',
      state: 'type_only',
      evidenceKind: 'type',
      summary:
        'Rules, removal reasons, current user, and mod log reads compile but still need route-level playtest proof.',
      evidence: [
        'POST /api/smoke/reddit exercises read-only Reddit SDK calls.',
        'W13 did not complete the Reddit smoke route in Devvit runtime.',
      ],
      diagnosticRoute: '/api/smoke/reddit',
      proofCommand: 'curl -X POST <playtest-origin>/api/smoke/reddit',
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction: 'Run the Reddit smoke route in playtest and record the result.',
    },
    {
      id: 'redis-smoke',
      domain: 'redis',
      label: 'Redis read/write',
      state: 'type_only',
      evidenceKind: 'type',
      summary:
        'Redis helpers and mocked persistence tests pass; Devvit Redis smoke is not yet recorded.',
      evidence: [
        'POST /api/smoke/redis writes and reads a namespaced smoke key.',
        'W13 left Redis runtime proof open.',
      ],
      diagnosticRoute: '/api/smoke/redis',
      proofCommand: 'curl -X POST <playtest-origin>/api/smoke/redis',
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction: 'Run the Redis smoke route in playtest and verify readBack.',
    },
    {
      id: 'menu-entrypoints',
      domain: 'menus',
      label: 'Menu entrypoints',
      state: 'verified_runtime',
      evidenceKind: 'runtime',
      summary:
        'Subreddit launcher plus post/comment Apply Policy menu target capture are runtime-proven in playtest.',
      evidence: [
        'Subreddit dashboard launcher opened in W13 playtest.',
        'Post target capture was playtest-verified on v0.0.1.83.',
        'Comment target capture was playtest-verified on v0.0.1.84.',
      ],
      diagnosticRoute: '/internal/menu/apply-policy-post',
      proofCommand: 'npm run dev',
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction: 'Keep post/comment menu target capture in the runtime regression checklist.',
    },
    {
      id: 'execution-operations',
      domain: 'execution_operations',
      label: 'Remove/approve/ignore reports',
      state: 'disabled',
      evidenceKind: 'disabled',
      summary:
        'Live moderation operations are disabled until target context, receipts, and safe Reddit action proof exist.',
      evidence: [
        'moderationExecution.ts gates live calls behind explicit confirmation, runtime proof, and receipts.',
      ],
      proofCommand: 'npm test -- src/server/services/moderationExecution.test.ts',
      destructive: true,
      safeToTest: false,
      canUpdateFromHealthEvents: false,
      nextAction:
        'Only test controlled throwaway content after log-only receipts are runtime-proven.',
    },
    {
      id: 'comment-delivery',
      domain: 'comments',
      label: 'Public comment delivery',
      state: 'disabled',
      evidenceKind: 'disabled',
      summary:
        'Public comments are not used for enforcement messaging in this build.',
      evidence: [
        'No runtime proof exists for comment delivery before/after removal, sticky behavior, or identity.',
      ],
      destructive: false,
      safeToTest: false,
      canUpdateFromHealthEvents: false,
      nextAction: 'Keep disabled until delivery ordering and identity are proven.',
    },
    {
      id: 'native-mod-notes',
      domain: 'mod_notes',
      label: 'Native Mod Notes',
      state: 'disabled',
      evidenceKind: 'disabled',
      summary:
        'Native Mod Notes remain disabled; log-only note previews are the safe path.',
      evidence: [
        'modNotes.ts requires nativeModNotesRuntimeVerified before native delivery.',
      ],
      proofCommand: 'npm test -- src/server/services/modNotes.test.ts',
      destructive: false,
      safeToTest: false,
      canUpdateFromHealthEvents: false,
      nextAction:
        'Runtime-verify addModNote permissions and visibility before enabling.',
    },
    {
      id: 'modmail-delivery',
      domain: 'modmail',
      label: 'Modmail/mod discussion delivery',
      state: 'type_only',
      evidenceKind: 'type',
      summary:
        'Manual markdown is available; internal team delivery remains type-only/unverified.',
      evidence: [
        'teamDelivery.ts stores manual/skipped receipts by default.',
        'No live mod discussion adapter is injected in product routes.',
      ],
      diagnosticRoute: '/api/delivery/capabilities',
      proofCommand: 'npm test -- src/server/services/teamDelivery.test.ts',
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction:
        'Prove internal-only destination behavior before enabling any send path.',
    },
    {
      id: 'ai-advisory',
      domain: 'ai',
      label: 'AI advisory',
      state: 'disabled',
      evidenceKind: 'disabled',
      summary:
        'AI advisory remains disabled unless a provider is explicitly configured and runtime-verified.',
      evidence: [
        'AI output cannot decide or execute moderation actions.',
        'No provider key or external fetch runtime proof is committed.',
      ],
      diagnosticRoute: '/api/ai/capabilities',
      proofCommand: 'npm test -- src/server/services/aiAdvisory.test.ts',
      destructive: false,
      safeToTest: false,
      canUpdateFromHealthEvents: false,
      nextAction:
        'Do not enable until secrets, HTTP permission, latency, and privacy are proven.',
    },
    {
      id: 'scheduler',
      domain: 'scheduler',
      label: 'Scheduler',
      state: 'deferred',
      evidenceKind: 'disabled',
      summary:
        'Scheduled delivery/cleanup is deferred because no scheduler task is registered in this app shape.',
      evidence: [
        'Digest and team delivery scheduler states remain unverified or unavailable.',
      ],
      proofCommand: 'npm test -- src/server/services/digest.test.ts',
      destructive: false,
      safeToTest: false,
      canUpdateFromHealthEvents: false,
      nextAction:
        'Register and playtest a scheduler task before claiming scheduled behavior.',
    },
    {
      id: 'retention-cleanup',
      domain: 'retention_cleanup',
      label: 'Retention cleanup',
      state: 'verified_static',
      evidenceKind: 'static',
      summary:
        'Retention cleanup is unit-tested with dry-run controls, but Redis runtime cleanup proof is still open.',
      evidence: [
        'privacyRetention.test.ts covers defaults, inventory, dry-run deletion, and expired cleanup.',
      ],
      diagnosticRoute: '/api/privacy/delete',
      proofCommand: 'npm test -- src/server/services/privacyRetention.test.ts',
      destructive: true,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction:
        'Run dry-run cleanup in playtest before deleting any persisted operational records.',
    },
    {
      id: 'moderator-access-guard',
      domain: 'access_control',
      label: 'Server-side moderator access guard',
      state: 'verified_static',
      evidenceKind: 'static',
      summary:
        'Protected API routes require a signed-in user with non-empty subreddit moderator permissions when Devvit supplies live subreddit context.',
      evidence: [
        'moderatorAccess.ts checks reddit.getCurrentUser().getModPermissionsForSubreddit before protected API routes continue.',
        'moderatorAccess.test.ts covers missing user, unavailable permission API, empty permissions, permission failures, and local no-context fallback.',
        'apiAccess.test.ts covers the protected current-user permission diagnostic route.',
        'Devvit WebView Settings diagnostic returned current moderator permission "all" on r/modmirror_dev.',
      ],
      diagnosticRoute: '/api/access/diagnostics',
      proofCommand:
        'npm test -- src/server/services/moderatorAccess.test.ts src/routes/apiAccess.test.ts',
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: true,
      nextAction:
        'Verify with a true non-moderator account before claiming runtime access blocking; verify lower-permission moderator role strings before stronger gates.',
    },
    {
      id: 'demo-fallbacks',
      domain: 'demo_fallbacks',
      label: 'Demo fallback data',
      state: 'demo_only',
      evidenceKind: 'demo',
      summary:
        'Demo data is intentional and labeled; it is not live subreddit proof.',
      evidence: [
        `Demo fixtures use r/${FIXED_DEMO_SUBREDDIT} and deterministic seeded drift.`,
      ],
      destructive: false,
      safeToTest: true,
      canUpdateFromHealthEvents: false,
      nextAction: 'Keep demo labels visible anywhere fallback data is rendered.',
    },
  ];
}
