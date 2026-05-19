import { spawnSync } from 'node:child_process';

const result = spawnSync(
  'npm',
  ['test', '--', 'src/server/services/syntheticEval.test.ts'],
  {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  }
);

process.exit(result.status ?? 1);
