import type { LastScanMetadata } from '../../shared/schema';
import { readJson, redisKeys, writeJson } from './redis';

export async function saveLastScanMetadata(
  metadata: LastScanMetadata
): Promise<void> {
  await Promise.all([
    writeJson(redisKeys.scan(metadata.subreddit, metadata.id), metadata),
    writeJson(redisKeys.scanLast(metadata.subreddit), metadata),
  ]);
}

export async function getLastScanMetadata(
  subreddit: string
): Promise<LastScanMetadata | undefined> {
  return readJson<LastScanMetadata>(redisKeys.scanLast(subreddit));
}
