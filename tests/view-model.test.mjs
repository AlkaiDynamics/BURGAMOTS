import test from 'node:test';
import assert from 'node:assert/strict';
import { createEvidenceViewModel } from '../evidence/viewModel.js';

const hypothesisSchema = {
  type:'object', required:['schemaVersion','id','title','status','unresolvedFields'],
  properties:{ schemaVersion:{type:'string'}, id:{type:'string'}, title:{type:'string'}, status:{type:'string'}, unresolvedFields:{type:'array'} }
};
const resultSchema = {
  type:'object', required:['schemaVersion','resultId','hypothesisId','status','estimate','pValue','limitations','evidenceRefs','reviewEvidenceRefs'],
  properties:{ schemaVersion:{type:'string'}, resultId:{type:'string'}, hypothesisId:{type:'string'}, status:{type:'string'}, estimate:{type:['number','null']}, pValue:{type:['number','null']}, limitations:{type:'array'}, evidenceRefs:{type:'array'}, reviewEvidenceRefs:{type:'array'} }
};
const hypothesis = { schemaVersion:'1.0.0', id:'h1', title:'Blocked hypothesis', status:'BLOCKED', unresolvedFields:['targetOutcome'] };

test('blocked view model preserves missing scientific values as null, never zero', () => {
  const view = createEvidenceViewModel({
    hypothesisSchema, resultSchema, hypothesis,
    result:{ schemaVersion:'1.0.0', resultId:'r1', hypothesisId:'h1', status:'BLOCKED', estimate:null, pValue:null, limitations:['blocked'], evidenceRefs:[], reviewEvidenceRefs:[] }
  });
  assert.equal(view.state, 'BLOCKED');
  assert.equal(view.statusLabel, 'Status: BLOCKED');
  assert.match(view.summary, /No inspectable empirical result is available/);
  assert.equal(view.estimate, null);
  assert.equal(view.pValue, null);
});

test('hypothesis mismatch is rejected before presentation', () => {
  assert.throws(() => createEvidenceViewModel({
    hypothesisSchema, resultSchema, hypothesis,
    result:{ schemaVersion:'1.0.0', resultId:'r2', hypothesisId:'other', status:'BLOCKED', estimate:null, pValue:null, limitations:[], evidenceRefs:[], reviewEvidenceRefs:[] }
  }), /hypothesis/i);
});

test('negative/null-favoring view remains visibly negative', () => {
  const view = createEvidenceViewModel({
    hypothesisSchema, resultSchema, hypothesis,
    result:{ schemaVersion:'1.0.0', resultId:'r3', hypothesisId:'h1', status:'NEGATIVE_NULL_FAVORING', estimate:null, pValue:null, limitations:['alternative not supported'], evidenceRefs:[], reviewEvidenceRefs:[] }
  });
  assert.equal(view.state, 'NEGATIVE_NULL_FAVORING');
  assert.equal(view.statusLabel, 'Status: NEGATIVE / NULL-FAVORING');
  assert.match(view.summary, /did not support/i);
});
