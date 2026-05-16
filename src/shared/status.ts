export const APP_NAME = 'ModMirror';
export const APP_TAGLINE = 'Find enforcement drift before your users do.';
export const APP_SUMMARY =
  'ModMirror helps mod teams detect enforcement drift, align rule policies, and apply consistent moderation workflows.';

export type FeatureStatus = {
  name: string;
  state: 'placeholder' | 'ready-for-integration';
  description: string;
  next: string;
};

export const WAVE_1_FEATURE_STATUSES: FeatureStatus[] = [
  {
    name: 'Mirror Scan',
    state: 'ready-for-integration',
    description: 'Live and demo scan surfaces render confidence-scored drift candidates.',
    next: 'Demo scan can feed the policy agreement flow.',
  },
  {
    name: 'Policy Agreement',
    state: 'ready-for-integration',
    description: 'Teams can create, edit, and list policy ladders from drift or manually.',
    next: 'Policies persist in Redis by subreddit and local rule key.',
  },
  {
    name: 'Apply Policy',
    state: 'ready-for-integration',
    description: 'The dashboard simulator previews and confirms log-only recommendations.',
    next: 'Post/comment Apply Policy UX remains a later runtime verification item.',
  },
  {
    name: 'Override Audit',
    state: 'ready-for-integration',
    description: 'Deviations require override reasons and are summarized without per-mod breakdowns.',
    next: 'Use aggregate override patterns to refine policy in the next polish wave.',
  },
];

export type HealthResponse = {
  ok: boolean;
  app: {
    name: typeof APP_NAME;
    slug: string | null;
    version: string | null;
  };
  environment: {
    runtime: 'devvit-web';
    playtestStatus: 'not-runtime-verified';
  };
  subreddit: {
    id: string | null;
    name: string | null;
  };
  user: {
    username: string | null;
  };
  demoMode: {
    enabled: boolean;
    source: 'placeholder';
  };
  redis: {
    smokeStatus: 'not_checked';
    detail: string;
  };
};
