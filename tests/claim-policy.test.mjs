import test from 'node:test';
import assert from 'node:assert/strict';
import { canTransition, deriveClaimStatus, EvidenceState } from '../evidence/claimPolicy.js';

test('forbids unsupported evidence-state promotions', () => {
  assert.equal(canTransition(EvidenceState.BLOCKED, EvidenceState.VALIDATED), false);
  assert.equal(canTransition(EvidenceState.ILLUSTRATIVE, EvidenceState.VALIDATED), false);
  assert.equal(canTransition(EvidenceState.EXPLORATORY, EvidenceState.VALIDATED), false);
  assert.equal(canTransition(EvidenceState.EVALUATED, EvidenceState.VALIDATED), true);
});

test('evaluated status requires the complete evidence chain', () => {
  const result = {
    resultId: 'result-test', hypothesisId: 'h-original', status: 'EVALUATED',
    datasetManifestId: null, evaluationBoundaryId: null, analysisConfigId: null,
    runMetadataId: null, reviewEvidenceRefs: [], evidenceRefs: [], limitations: []
  };
  const status = deriveClaimStatus(result);
  assert.equal(status.state, EvidenceState.BLOCKED);
  assert.match(status.rationale, /evidence chain/i);
});

test('negative/null-favoring result remains negative rather than success', () => {
  const result = {
    resultId: 'negative-test', hypothesisId: 'h-original', status: 'NEGATIVE_NULL_FAVORING',
    limitations: ['Registered analysis favored the null under its stated conditions.'], evidenceRefs: []
  };
  const status = deriveClaimStatus(result);
  assert.equal(status.state, EvidenceState.NEGATIVE_NULL_FAVORING);
  assert.equal(status.allowedPhrases.includes('Validated'), false);
});