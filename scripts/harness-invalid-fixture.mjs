import { readFileSync } from 'node:fs';

const fixture = JSON.parse(readFileSync('tests/fixtures/harness-invalid.json', 'utf8'));
const required = ['id', 'hypothesisId', 'datasetManifestId', 'evaluationBoundaryId', 'analysisConfigId', 'runMetadataId'];
const missing = required.filter((key) => !(key in fixture));

if (missing.length === 0) {
  console.error('Harness self-test fixture unexpectedly passed structural sanity checks.');
  process.exit(0);
}

console.error(`Intentional invalid fixture rejected: missing ${missing.join(', ')}`);
process.exit(1);
