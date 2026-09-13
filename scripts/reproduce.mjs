import { readFileSync } from 'node:fs';
import { loadResultManifest } from '../evidence/resultLoader.js';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const resultSchema = readJson('contracts/analysis-result.schema.json');
const records = [
  readJson('evidence/results/original-purpose-blocked.json'),
  readJson('evidence/results/public-heliophysics-blocked.json'),
];

const seenHypotheses = new Set();
for (const record of records) {
  const loaded = loadResultManifest(record, { schema: resultSchema });
  if (!loaded.ok) throw new Error(`${record.resultId}: ${loaded.errors.join('; ')}`);
  if (loaded.claimStatus.state !== 'BLOCKED') throw new Error(`${record.resultId}: expected BLOCKED, got ${loaded.claimStatus.state}`);
  if (loaded.result.estimate !== null || loaded.result.pValue !== null || loaded.result.uncertainty !== null) {
    throw new Error(`${record.resultId}: blocked reproduction must not invent scientific values.`);
  }
  if (seenHypotheses.has(record.hypothesisId)) throw new Error(`Duplicate hypothesis result in reproduction: ${record.hypothesisId}`);
  seenHypotheses.add(record.hypothesisId);
}

if (!seenHypotheses.has('burgamots-original-purpose') || !seenHypotheses.has('public-heliophysics-proposal')) {
  throw new Error('Reproduction must preserve both blocked hypothesis states independently.');
}

console.log('Integrity reproduction PASS.');
console.log('Original-purpose scientific evaluation: BLOCKED pending UD-001, UD-002, UD-003, and UD-004.');
console.log('Public heliophysics proposal: BLOCKED pending an approved scientific contract and physical-mechanism specification.');
console.log('Historical leakage: UNRESOLVED; successor controls do not clear the frozen pipeline.');
console.log('This command reproduces evidence-integrity state only; it does not execute a BURGAMOTS scientific experiment.');
