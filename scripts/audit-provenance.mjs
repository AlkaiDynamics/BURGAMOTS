import { readFileSync } from 'node:fs';
import { validateContract } from '../evidence/validator.js';
import { validateDatasetManifest } from '../evidence/provenance.js';

const readJson = (path) => JSON.parse(readFileSync(path,'utf8'));
const hypothesisSchema = readJson('contracts/hypothesis.schema.json');
for (const path of ['evidence/hypotheses/original-purpose.json','evidence/hypotheses/public-heliophysics.json']) {
  const result = validateContract(hypothesisSchema, readJson(path));
  if (!result.valid) throw new Error(`${path}: ${result.errors.join('; ')}`);
}
const citationOnly = readJson('evidence/datasets/cited-sources.json');
const provenance = validateDatasetManifest(citationOnly);
if (!provenance.valid) throw new Error(provenance.errors.join('; '));
if (provenance.empiricalReady) throw new Error('Citation-only manifest must not be empirical-ready.');
console.log('audit:provenance PASS — contracts validate and cited sources remain explicitly unacquired.');