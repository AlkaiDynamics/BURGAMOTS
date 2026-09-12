import test from 'node:test';
import assert from 'node:assert/strict';
import { sha256Bytes, verifySha256, validateDatasetManifest } from '../evidence/provenance.js';
import { validateBoundaryIntegrity } from '../evidence/boundary.js';

test('hashes bytes deterministically and detects changed bytes', () => {
  const hash = sha256Bytes(Buffer.from('abc'));
  assert.equal(hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal(verifySha256(Buffer.from('abc'), hash), true);
  assert.equal(verifySha256(Buffer.from('abd'), hash), false);
});

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

test('broken transformation hash chain fails provenance readiness', () => {
  const manifest = {
    schemaVersion: '1.0.0', datasetId: 'chain-broken', source: 'fixture', sourceUrl: null,
    acquired: true, retrievedAt: '2026-09-12T00:00:00Z', version: 'fixture', license: null,
    rawFiles: [{ fileId: 'raw-1', path: 'raw.dat', sha256: 'a'.repeat(64) }],
    transformations: [
      { schemaVersion:'1.0.0', id:'t1', step:'one', codeVersion:'x', parameters:{}, inputHash:'a'.repeat(64), outputHash:'b'.repeat(64) },
      { schemaVersion:'1.0.0', id:'t2', step:'two', codeVersion:'x', parameters:{}, inputHash:'c'.repeat(64), outputHash:'d'.repeat(64) }
    ], exclusions: []
  };
  const checked = validateDatasetManifest(manifest);
  assert.equal(checked.empiricalReady, false);
  assert.ok(checked.errors.some((error) => /chain/i.test(error)));
});

test('evaluation boundary rejects an identifier crossing partitions', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-1', constructionRule: 'fixture', trainingIds: ['a','b'], evaluationIds: ['b','c'],
    controlIds: [], groupedUnits: [], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: true, leakageChecks: [], historicalLeakageStatus: 'UNRESOLVED'
  });
  assert.equal(checked.valid, false);
  assert.ok(checked.errors.some((error) => /cross/i.test(error)));
});

test('evaluation boundary rejects a grouped unit split across partitions', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-group', constructionRule: 'fixture', trainingIds: ['a'], evaluationIds: ['b'],
    controlIds: [], groupedUnits: [{ groupId:'subject-1', recordIds:['a','b'] }], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: true, leakageChecks: [], historicalLeakageStatus: 'UNRESOLVED'
  });
  assert.equal(checked.valid, false);
  assert.ok(checked.errors.some((error) => /group/i.test(error)));
});

test('historical leakage status cannot be upgraded by successor controls', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-new', constructionRule: 'future-only fixture', trainingIds: ['a'], evaluationIds: ['b'],
    controlIds: [], groupedUnits: [], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: true, leakageChecks: [], historicalLeakageStatus: 'UNRESOLVED'
  });
  assert.equal(checked.historicalLeakageStatus, 'UNRESOLVED');
});

test('a result-bound boundary cannot be mutable', () => {
  const checked = validateBoundaryIntegrity({
    schemaVersion: '1.0.0', id: 'boundary-mutable', constructionRule: 'fixture', trainingIds: ['a'], evaluationIds: ['b'],
    controlIds: [], groupedUnits: [], temporalPolicy: null, seed: 1, boundaryHash: null,
    createdBeforeAnalysis: true, immutableAfterResult: false, leakageChecks: [], historicalLeakageStatus: 'UNRESOLVED'
  }, { resultExists: true });
  assert.equal(checked.valid, false);
  assert.ok(checked.errors.some((error) => /immutable/i.test(error)));
});
