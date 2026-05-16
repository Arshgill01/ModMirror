import { redis } from '@devvit/web/server';
import type { RulePolicy } from '../../shared/schema';
import {
  parseJson,
  readJson,
  redisKeys,
  serializeJson,
  writeJson,
} from './redis';

export async function getPolicyByRule(
  subreddit: string,
  ruleId: string
): Promise<RulePolicy | undefined> {
  return readJson<RulePolicy>(redisKeys.policy(subreddit, ruleId));
}

export async function setPolicyByRule(policy: RulePolicy): Promise<void> {
  const policyJson = serializeJson(policy);

  await Promise.all([
    writeJson(redisKeys.policy(policy.subreddit, policy.ruleId), policy),
    redis.hSet(redisKeys.policies(policy.subreddit), {
      [policy.ruleId]: policyJson,
    }),
  ]);
}

export async function listPolicies(subreddit: string): Promise<RulePolicy[]> {
  const policyMap = await redis.hGetAll(redisKeys.policies(subreddit));

  return Object.values(policyMap)
    .map((value) => parseJson<RulePolicy>(value))
    .filter((policy): policy is RulePolicy => policy !== undefined);
}
