import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContract } from '../evidence/validator.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const fixtures = {
  'transformation.schema.json': { schemaVersion:'1.0.0', id:'t1', step:'normalize-time', codeVersion:'commit:test', parameters:{ timezone:'UTC' }, inputHash:null, outputHash:null },
  'dataset.schema.json': { schemaVersion:'1.0.0', datasetId:'d1', source:'fixture', sourceUrl:null, acquired:false, retrievedAt:null, version:null, license:null, rawFiles:[], transformations:[], exclusions:[] },
  'leakage-check.schema.json': { schemaVersion:'1.0.0', id:'l1', type:'duplicate-id', status:'UNRESOLVED', details:'fixture', evidenceRefs:[] },
  'evaluation-boundary.schema.json': { schemaVersion:'1.0.0', id:'b1', constructionRule:'fixture', trainingIds:['a'], evaluationIds:['b'], controlIds:[], groupedUnits:[], temporalPolicy:null, seed:1, boundaryHash:null, createdBeforeAnalysis:true, immutableAfterResult:true, leakageChecks:[], historicalLeakageStatus:'UNRESOLVED' },
  'analysis-config.schema.json': { schemaVersion:'1.0.0', id:'a1', hypothesisId:'burgamots-original-purpose', estimand:null, outcome:null, unit:null, independentUnit:null, primaryComparison:null, nullControl:null, estimator:null, test:null, uncertaintyMethod:null, dependenceHandling:null, multiplicityPolicy:null, stoppingRule:null, exclusionPolicy:null, sensitivityPlan:[], analysisStatus:'BLOCKED' },
  'run-metadata.schema.json': { schemaVersion:'1.0.0', id:'r1', analysisConfigId:'a1', datasetManifestId:null, evaluationBoundaryId:null, repositoryCommit:'commit:test', environment:{ runtime:'fixture' }, seed:null, backend:'none', determinismPolicy:'blocked-no-execution', startedAt:null, completedAt:null },
  'analysis-result.schema.json': { schemaVersion:'1.0.0', resultId:'res1', hypothesisId:'burgamots-original-purpose', status:'BLOCKED', fixture:false, datasetManifestId:null, datasetManifestHash:null, evaluationBoundaryId:null, analysisConfigId:null, runMetadataId:null, method:null, seed:null, sample:{ n:null, independentN:null }, estimate:null, uncertainty:null, pValue:null, multiplicity:null, limitations:['blocked'], evidenceRefs:[], reviewEvidenceRefs:[] },
  'claim-status.schema.json': { schemaVersion:'1.0.0', claimId:'c1', state:'BLOCKED', rationale:'blocked', evidenceRefs:[], limitations:['blocked'], allowedPhrases:['No empirical result available'], forbiddenPhrases:['validated'] },
};

for (const [schemaName, fixture] of Object.entries(fixtures)) {
  test(`${schemaName} accepts its valid blocked/fixture-safe object`, () => {
    const schema = readJson(`contracts/${schemaName}`);
    const result = validateContract(schema, fixture);
    assert.equal(result.valid, true, result.errors.join('\n'));
  });

  test(`${schemaName} rejects a missing stable identifier`, () => {
    const schema = readJson(`contracts/${schemaName}`);
    const broken = { ...fixture };
    const idKey = 'datasetId' in broken ? 'datasetId' : 'resultId' in broken ? 'resultId' : 'claimId' in broken ? 'claimId' : 'id';
    delete broken[idKey];
    const result = validateContract(schema, broken);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes(idKey)), result.errors.join('\n'));
  });

  test(`${schemaName} rejects wrong schemaVersion type with stable error text`, () => {
    const schema = readJson(`contracts/${schemaName}`);
    const result = validateContract(schema, { ...fixture, schemaVersion: 1 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((error) => error.includes('schemaVersion') && error.includes('string')), result.errors.join('\n'));
  });
}
