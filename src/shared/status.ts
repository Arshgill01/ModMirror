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
    state: 'placeholder',
    description: 'Dashboard surface is ready for scan output.',
    next: 'Wave 2 will implement live scan.',
  },
  {
    name: 'Policy Agreement',
    state: 'placeholder',
    description: 'Policy ladder entry point is reserved for the next policy flow wave.',
    next: 'Wave 3 will add create and edit policy workflows.',
  },
  {
    name: 'Apply Policy',
    state: 'placeholder',
    description: 'Menu/action flow remains out of scope for this dashboard shell.',
    next: 'Wave 4 will connect post and comment context.',
  },
  {
    name: 'Override Audit',
    state: 'placeholder',
    description: 'Audit view is present without pretending override data exists.',
    next: 'Wave 5 will record and display aggregate override events.',
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
