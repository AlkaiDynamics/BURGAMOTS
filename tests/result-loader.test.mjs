import test from 'node:test';
import assert from 'node:assert/strict';
import { loadResultManifest } from '../evidence/resultLoader.js';

test('blocked result preserves null scientific values', () => {
  const loaded = loadResultManifest({
    schemaVersion: '1.0.0', resultId: 'blocked-1', hypothesisId: 'burgamots-original-purpose', status: 'BLOCKED',
    fixture: false, datasetManifestId: null, evaluationBoundaryId: null, analysisConfigId: null, runMetadataId: null,
    method: null, seed: null, sample: { n: null, independentN: null }, estimate: null, uncertainty: null,
    pValue: null, multiplicity: null, limitations: ['Scientific execution remains blocked.'], evidenceRefs: [], reviewEvidenceRefs: []
  });
  assert.equal(loaded.ok, true);
  assert.equal(loaded.result.estimate, null);
  assert.equal(loaded.result.pValue, null);
  assert.equal(loaded.claimStatus.state, 'BLOCKED');
});

test('fixture cannot be marked empirical/evaluated', () => {
  const loaded = loadResultManifest({
    schemaVersion: '1.0.0', resultId: 'fixture-1', hypothesisId: 'burgamots-original-purpose', status: 'EVALUATED',
    fixture: true, datasetManifestId: 'fixture-data', evaluationBoundaryId: 'boundary-1', analysisConfigId: 'config-1', runMetadataId: 'run-1',
    method: 'fixture', seed: 1, sample: { n: 10, independentN: 10 }, estimate: 1, uncertainty: null,
    pValue: null, multiplicity: null, limitations: [], evidenceRefs: ['fixture'], reviewEvidenceRefs: []
  });
  assert.equal(loaded.ok, false);
  assert.ok(loaded.errors.some((error) => /fixture/i.test(error)));
});

test('result cannot attach evidence to a different hypothesis', () => {
  const loaded = loadResultManifest({
    schemaVersion: '1.0.0', resultId: 'cross-1', hypothesisId: 'public-heliophysics-proposal', status: 'EVALUATED',
    fixture: false, datasetManifestId: 'dataset-original-only', evaluationBoundaryId: 'boundary-1', analysisConfigId: 'config-original', runMetadataId: 'run-1',
    method: 'test', seed: 1, sample: { n: 10, independentN: 10 }, estimate: 1, uncertainty: null,
    pValue: null, multiplicity: null, limitations: [], evidenceRefs: ['hypothesis:burgamots-original-purpose'], reviewEvidenceRefs: []
  });
  assert.equal(loaded.ok, false);
  assert.ok(loaded.errors.some((error) => /hypothesis/i.test(error)));
});

test('evaluated result with unknown evidence references fails closed', () => {
  const loaded = loadResultManifest({
    schemaVersion: '1.0.0', resultId: 'unknown-refs', hypothesisId: 'burgamots-original-purpose', status: 'EVALUATED',
    fixture: false, datasetManifestId: 'missing-dataset', evaluationBoundaryId: 'missing-boundary', analysisConfigId: 'missing-analysis', runMetadataId: 'missing-run',
    method: 'test', seed: 1, sample: { n: 10, independentN: 10 }, estimate: 1, uncertainty: null,
    pValue: null, multiplicity: null, limitations: [], evidenceRefs: ['hypothesis:burgamots-original-purpose'], reviewEvidenceRefs: []
  });
  assert.equal(loaded.ok, false);
  assert.ok(loaded.errors.some((error) => /unknown reference/i.test(error)));
});

test('scientific executor cannot self-assign validation without review evidence', () => {
  const loaded = loadResultManifest({
    schemaVersion: '1.0.0', resultId: 'validated-without-review', hypothesisId: 'public-heliophysics-proposal', status: 'VALIDATED',
    fixture: false, datasetManifestId: 'd', evaluationBoundaryId: 'b', analysisConfigId: 'a', runMetadataId: 'r',
    method: 'executor', seed: 1, sample: { n: 10, independentN: 10 }, estimate: 1, uncertainty: null,
    pValue: null, multiplicity: null, limitations: [], evidenceRefs: ['hypothesis:public-heliophysics-proposal'], reviewEvidenceRefs: []
  });
  assert.equal(loaded.ok, false);
  assert.ok(loaded.errors.some((error) => /review/i.test(error)));
});
