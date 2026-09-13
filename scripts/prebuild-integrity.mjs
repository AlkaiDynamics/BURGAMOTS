import { spawnSync } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function runNpm(args, env = process.env) {
  return spawnSync(npmCommand, args, { stdio: 'inherit', env });
}

const invalidFixture = runNpm(['run', 'audit:harness-invalid']);
if (invalidFixture.error) {
  console.error(`[prebuild-integrity] could not execute invalid-fixture self-test: ${invalidFixture.error.message}`);
  process.exit(1);
}
if (invalidFixture.status === 0) {
  console.error('[prebuild-integrity] ERROR: intentionally invalid fixture was accepted.');
  process.exit(1);
}
console.log(`[prebuild-integrity] PASS: invalid fixture produced nonzero exit ${invalidFixture.status}.`);

const injectedFailure = runNpm(
  ['run', 'verify'],
  { ...process.env, BURGAMOTS_VERIFY_SELFTEST_FAIL: '1' },
);
if (injectedFailure.error) {
  console.error(`[prebuild-integrity] could not execute verify self-test: ${injectedFailure.error.message}`);
  process.exit(1);
}
if (injectedFailure.status === 0) {
  console.error('[prebuild-integrity] ERROR: verify swallowed the injected failure.');
  process.exit(1);
}
console.log(`[prebuild-integrity] PASS: verify propagated injected failure with exit ${injectedFailure.status}.`);

const verification = runNpm(
  ['run', 'verify'],
  { ...process.env, BURGAMOTS_VERIFY_SKIP_BUILD: '1' },
);
if (verification.error) {
  console.error(`[prebuild-integrity] could not execute npm run verify: ${verification.error.message}`);
  process.exit(1);
}
if (verification.status !== 0) {
  console.error(`[prebuild-integrity] integrity verification failed with exit ${verification.status}`);
  process.exit(verification.status ?? 1);
}

console.log('[prebuild-integrity] integrity verification passed; proceeding to Vite build.');
