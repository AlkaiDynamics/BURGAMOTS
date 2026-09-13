import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const path = 'protected/solar-visualization-frozen-8a9029b6.tsx';
const bytes = readFileSync(path);
const expectedGitBlobSha = 'e56d956cf927c56b24543259ccee9475ab41d6b6';
const gitHeader = Buffer.from(`blob ${bytes.length}\0`);
const gitBlobSha = createHash('sha1').update(Buffer.concat([gitHeader, bytes])).digest('hex');
const sha256 = createHash('sha256').update(bytes).digest('hex');

if (gitBlobSha !== expectedGitBlobSha) {
  console.error(`Protected solar archive mismatch: expected Git blob ${expectedGitBlobSha}, got ${gitBlobSha}`);
  process.exit(1);
}

console.log(`audit:solar-backup PASS — exact frozen Git blob ${gitBlobSha}`);
console.log(`audit:solar-backup SHA-256 ${sha256}`);
