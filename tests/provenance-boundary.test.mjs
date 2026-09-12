import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDatasetManifest } from '../evidence/provenance.js';
import { validateBoundaryIntegrity } from '../evidence/boundary.js';

test('cited but unacquired source is not treated as acquired evidence', () => {
  const manifest = {
    schemaVersion: '1.0.0', datasetId: 'citation-only', source: 'Example source', sourceUrl: 'https://example.invalid',
    acquired: false, retrievedAt: null, version: null, license: null, rawFiles: [], transformations: [], exclusions: []
  };
  const checked = validateDatasetManifest(manifest);
  assert.equal(checked.valid, true);
  assert.equal(checked.empiricalReady, false);
});

test('acquired data without immutable raw hashes fails provenance readiness', () => {
  const manifest = {
    schemaVersion: '1.0.0', datasetId: 'broken-acquisition', source: 'Example source', sourceUrl: null,
    acquired: true, retrievedAt: '2026-09-12T00:00:00Z', version: null, license: null,
    rawFiles: [{ fileId: 'raw-1', path: 'raw.dat', sha256: null }], transformations: [], exclusions: []
  };
  const checked = validateDatasetManifest(manifest);
  assert.equal(checked.empiricalReady, false);
  assert.ok(checked.errors.some((error) => /hash/i.test(error)));
});

test('evaluation boundary rejects an identifier crossing partitions', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-1', constructionRule: 'fixture', trainingIds: ['a','b'], evaluationIds: ['b','c'],
    controlIds: [], groupedUnits: [], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: true, leakageChecks: []
  });
  assert.equal(checked.valid, false);
  assert.ok(checked.errors.some((error) => /cross/i.test(error)));
});

test('historical leakage status cannot be upgraded by successor controls', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-new', constructionRule: 'future-only fixture', trainingIds: ['a'], evaluationIds: ['b'],
    controlIds: [], groupedUnits: [], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: true, leakageChecks: [], historicalLeakageStatus: 'UNRESOLVED'
  });
  assert.equal(checked.historicalLeakageStatus, 'UNRESOLVED');
});