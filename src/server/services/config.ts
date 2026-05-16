import type { AppConfig, DemoModeState } from '../../shared/schema';
import { readJson, redisKeys, writeJson } from './redis';

export async function getAppConfig(
  subreddit: string
): Promise<AppConfig | undefined> {
  return readJson<AppConfig>(redisKeys.config(subreddit));
}

export async function setAppConfig(config: AppConfig): Promise<void> {
  await writeJson(redisKeys.config(config.subreddit), config);
}

export async function getDemoModeState(
  subreddit: string
): Promise<DemoModeState | undefined> {
  return readJson<DemoModeState>(redisKeys.demo(subreddit));
}

export async function getDemoModeFlag(subreddit: string): Promise<boolean> {
  return (await getDemoModeState(subreddit))?.enabled ?? false;
}

export async function setDemoModeFlag(
  subreddit: string,
  enabled: boolean,
  updatedBy?: string
): Promise<void> {
  const state: DemoModeState = {
    enabled,
    updatedAt: new Date().toISOString(),
  };

  if (updatedBy !== undefined) {
    state.updatedBy = updatedBy;
  }

  await writeJson(redisKeys.demo(subreddit), state);
}
