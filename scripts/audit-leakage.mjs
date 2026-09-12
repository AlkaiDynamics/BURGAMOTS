import { readFileSync } from 'node:fs';
import { validateBoundaryIntegrity } from '../evidence/boundary.js';
const state = JSON.parse(readFileSync('evidence/system-state.json','utf8'));
if (state.historicalLeakageStatus !== 'UNRESOLVED') throw new Error('Historical leakage must remain UNRESOLVED.');
const fixtureBoundary = {
  schemaVersion:'1.0.0', id:'audit-boundary-fixture', constructionRule:'test-only',
  trainingIds:['train-a'], evaluationIds:['eval-a'], controlIds:[], groupedUnits:[], temporalPolicy:null,
  seed:1, boundaryHash:null, createdBeforeAnalysis:true, immutableAfterResult:true, leakageChecks:[], historicalLeakageStatus:'UNRESOLVED'
};
const checked = validateBoundaryIntegrity(fixtureBoundary);
if (!checked.valid) throw new Error(checked.errors.join('; '));
if (checked.historicalLeakageStatus !== 'UNRESOLVED') throw new Error('Successor boundary controls cannot clear historical leakage.');
console.log('audit:leakage PASS — successor boundary invariants validate; historical leakage remains UNRESOLVED.');