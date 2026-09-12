import { spawnSync } from 'node:child_process';

if (process.env.BURGAMOTS_VERIFY_SELFTEST_FAIL === '1') {
  console.error('[verify] intentional self-test failure injected.');
  process.exit(17);
}

const commands = [
  ['npm', ['run', 'typecheck']],
  ['npm', ['test']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'audit:fixtures']],
  ['npm', ['run', 'audit:provenance']],
  ['npm', ['run', 'audit:leakage']],
  ['npm', ['run', 'audit:claims']],
  ['npm', ['run', 'reproduce']],
];

for (const [command, args] of commands) {
  const label = [command, ...args].join(' ');
  console.log(`\n[verify] ${label}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) {
    console.error(`[verify] could not execute ${label}: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[verify] FAILED: ${label} exited ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log('\n[verify] PASS — all required integrity commands succeeded.');
