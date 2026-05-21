import { API_ROUTES } from '../../shared/constants';
import {
  classifyClientError,
  formatClientNotice,
} from '../../shared/clientResilience';
import type {
  ApiResponse,
  DemoOrchestrationManifest,
  MirrorScan,
  MirrorScanDepth,
  MirrorScanRecord,
} from '../../shared/schema';
import type { ScanMode } from './store';

export const API_TIMEOUT_MS = 12_000;

type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

type FetchOptions = {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
};

export async function fetchApi<T>(
  url: string,
  init?: RequestInit,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, init, options);
  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    throw new Error(`API response was not JSON for ${url}: ${String(error)}`);
  }
  if (!payload.ok) {
    throw new Error(`API error (${payload.error.code}): ${payload.error.message}`);
  }
  if (!response.ok) {
    throw new Error(`API request returned ${response.status} for ${url}.`);
  }
  return payload.data;
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  options?: FetchOptions
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = options?.timeoutMs ?? API_TIMEOUT_MS;
  const timeout = globalThis.setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  const fetchImpl = options?.fetchImpl ?? fetch;
  try {
    return await fetchImpl(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms.`);
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export function normalizeClientError(error: unknown, fallback: string) {
  return formatClientNotice(classifyClientError(error, fallback));
}

export type ScanActionResult = {
  scan: MirrorScan;
  record: MirrorScanRecord | undefined;
};

export async function runScanAction(input: {
  mode: ScanMode;
  depth: MirrorScanDepth;
  loadScanRecord: (scan: MirrorScan) => Promise<MirrorScanRecord>;
  createDemoFallback: () => MirrorScan;
  fetcher?: typeof fetchApi;
}): Promise<ScanActionResult> {
  const fetcher = input.fetcher ?? fetchApi;
  try {
    const scan = await fetcher<MirrorScan>(API_ROUTES.scan, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: input.mode, depth: input.depth }),
    });
    const record = await input.loadScanRecord(scan).catch(() => undefined);
    return { scan, record };
  } catch (error) {
    if (input.mode === 'demo') {
      return {
        scan: input.createDemoFallback(),
        record: undefined,
      };
    }
    throw error;
  }
}

export async function resetDemoAction(
  fetcher: typeof fetchApi = fetchApi
): Promise<DemoOrchestrationManifest> {
  return fetcher<DemoOrchestrationManifest>(API_ROUTES.demoReset, {
    method: 'POST',
  });
}
