import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'verify'], {
  stdio: 'inherit',
  env: { ...process.env, BURGAMOTS_VERIFY_SKIP_BUILD: '1' },
});

if (result.error) {
  console.error(`[prebuild-integrity] could not execute npm run verify: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`[prebuild-integrity] integrity verification failed with exit ${result.status}`);
  process.exit(result.status ?? 1);
}

console.log('[prebuild-integrity] integrity verification passed; proceeding to Vite build.');
