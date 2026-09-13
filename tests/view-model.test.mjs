import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEvidenceViewModel } from '../evidence/viewModel.js';
import { createReferenceRegistry } from '../evidence/resultLoader.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const hypothesisSchema = readJson('contracts/hypothesis.schema.json');
const resultSchema = readJson('contracts/analysis-result.schema.json');
const hypothesis = readJson('evidence/hypotheses/original-purpose.json');
const blockedResult = readJson('evidence/results/original-purpose-blocked.json');

const completeRegistry = createReferenceRegistry({
  hypotheses: new Set(['burgamots-original-purpose']),
  datasets: new Map([['dataset-1', { empiricalReady: true }]]),
  boundaries: new Map([['boundary-1', { valid: true }]]),
  analysisConfigs: new Map([['analysis-1', { valid: true }]]),
  runs: new Map([['run-1', { valid: true }]]),
  reviews: new Set(),
});

function empiricalResult(overrides = {}) {
  return {
    schemaVersion: '1.0.0',
    resultId: 'empirical-1',
    hypothesisId: 'burgamots-original-purpose',
    status: 'NEGATIVE_NULL_FAVORING',
    fixture: false,
    datasetManifestId: 'dataset-1',
    evaluationBoundaryId: 'boundary-1',
    analysisConfigId: 'analysis-1',
    runMetadataId: 'run-1',
    method: 'registered-test-method',
    seed: 1,
    sample: { n: 20, independentN: 20 },
    estimate: -0.1,
    uncertainty: null,
    pValue: null,
    multiplicity: null,
    limitations: ['alternative not supported'],
    evidenceRefs: ['hypothesis:burgamots-original-purpose'],
    reviewEvidenceRefs: [],
    ...overrides,
  };
}

test('blocked view model preserves missing scientific values as null, never zero', () => {
  const view = createEvidenceViewModel({ hypothesisSchema, resultSchema, hypothesis, result: blockedResult });
  assert.equal(view.state, 'BLOCKED');
  assert.equal(view.statusLabel, 'Status: BLOCKED');
  assert.match(view.summary, /No inspectable empirical result is available/);
  assert.equal(view.estimate, null);
  assert.equal(view.pValue, null);
});

test('hypothesis mismatch is rejected before presentation', () => {
  assert.throws(() => createEvidenceViewModel({
    hypothesisSchema,
    resultSchema,
    hypothesis,
    result: { ...blockedResult, resultId: 'mismatch', hypothesisId: 'public-heliophysics-proposal' },
  }), /hypothesis/i);
});

test('negative/null-favoring view remains visibly negative when its evidence chain is registered', () => {
  const view = createEvidenceViewModel({
    hypothesisSchema,
    resultSchema,
    hypothesis,
    result: empiricalResult(),
    registry: completeRegistry,
  });
  assert.equal(view.state, 'NEGATIVE_NULL_FAVORING');
  assert.equal(view.statusLabel, 'Status: NEGATIVE / NULL-FAVORING');
  assert.match(view.summary, /did not support/i);
});

test('view model rejects empirical presentation with unknown provenance/reference records', () => {
  assert.throws(() => createEvidenceViewModel({
    hypothesisSchema,
    resultSchema,
    hypothesis,
    result: empiricalResult({
      resultId: 'unknown-references',
      datasetManifestId: 'unknown-dataset',
      evaluationBoundaryId: 'unknown-boundary',
      analysisConfigId: 'unknown-analysis',
      runMetadataId: 'unknown-run',
    }),
  }), /unknown reference|provenance/i);
});
