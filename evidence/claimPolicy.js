export const EvidenceState = Object.freeze({
  BLOCKED: 'BLOCKED',
  ILLUSTRATIVE: 'ILLUSTRATIVE',
  EXPLORATORY: 'EXPLORATORY',
  NEGATIVE_NULL_FAVORING: 'NEGATIVE_NULL_FAVORING',
  EVALUATED: 'EVALUATED',
  VALIDATED: 'VALIDATED',
  UNRESOLVED: 'UNRESOLVED',
});

const transitions = Object.freeze({
  BLOCKED: new Set(['BLOCKED', 'ILLUSTRATIVE', 'EXPLORATORY', 'UNRESOLVED']),
  ILLUSTRATIVE: new Set(['ILLUSTRATIVE', 'BLOCKED', 'UNRESOLVED']),
  EXPLORATORY: new Set(['EXPLORATORY', 'EVALUATED', 'NEGATIVE_NULL_FAVORING', 'BLOCKED', 'UNRESOLVED']),
  NEGATIVE_NULL_FAVORING: new Set(['NEGATIVE_NULL_FAVORING', 'BLOCKED', 'UNRESOLVED']),
  EVALUATED: new Set(['EVALUATED', 'VALIDATED', 'NEGATIVE_NULL_FAVORING', 'BLOCKED', 'UNRESOLVED']),
  VALIDATED: new Set(['VALIDATED', 'BLOCKED', 'UNRESOLVED']),
  UNRESOLVED: new Set(['UNRESOLVED', 'BLOCKED']),
});

export function canTransition(from, to) {
  return Boolean(transitions[from]?.has(to));
}

const policy = Object.freeze({
  BLOCKED: {
    allowed: ['No inspectable empirical result is available', 'Scientific evaluation is blocked'],
    forbidden: ['validated', 'significant', 'causal', 'blind test'],
  },
  ILLUSTRATIVE: {
    allowed: ['Illustrative simulation', 'Synthetic example'],
    forbidden: ['observed', 'measured', 'validated', 'empirical prediction'],
  },
  EXPLORATORY: {
    allowed: ['Exploratory association', 'Exploratory estimate'],
    forbidden: ['confirmed', 'causal', 'validated'],
  },
  NEGATIVE_NULL_FAVORING: {
    allowed: ['Negative / null-favoring result', 'The registered analysis did not support the specified alternative under its stated conditions.'],
    forbidden: ['Validated', 'confirmed', 'causal'],
  },
  EVALUATED: {
    allowed: ['Held-out evaluation result', 'Evaluated under the recorded analysis contract'],
    forbidden: ['validated', 'causal'],
  },
  VALIDATED: {
    allowed: ['Validated for the explicitly defined use'],
    forbidden: [],
  },
  UNRESOLVED: {
    allowed: ['Unresolved from available evidence'],
    forbidden: ['validated', 'confirmed', 'causal'],
  },
});

const evidenceChainComplete = (result) => Boolean(
  result?.datasetManifestId &&
  result?.evaluationBoundaryId &&
  result?.analysisConfigId &&
  result?.runMetadataId
);

const hasInferentialOutput = (result) =>
  result?.pValue !== null && result?.pValue !== undefined ||
  result?.uncertainty !== null && result?.uncertainty !== undefined ||
  result?.multiplicity !== null && result?.multiplicity !== undefined;

export function deriveClaimStatus(result) {
  const requested = result?.status ?? EvidenceState.BLOCKED;
  let state = requested;
  let rationale = 'Evidence state follows the validated result manifest.';

  if (!Object.values(EvidenceState).includes(requested)) {
    state = EvidenceState.BLOCKED;
    rationale = `Unknown evidence state ${String(requested)}; fail closed.`;
  } else if (result?.fixture === true && [EvidenceState.EXPLORATORY, EvidenceState.EVALUATED, EvidenceState.VALIDATED, EvidenceState.NEGATIVE_NULL_FAVORING].includes(requested)) {
    state = EvidenceState.BLOCKED;
    rationale = 'Fixture data cannot enter an empirical evidence state.';
  } else if (hasInferentialOutput(result) && !result?.analysisConfigId) {
    state = EvidenceState.BLOCKED;
    rationale = 'Inferential output requires analysis metadata; p-values, uncertainty, and multiplicity fields cannot stand alone.';
  } else if ([EvidenceState.EVALUATED, EvidenceState.VALIDATED].includes(requested) && !evidenceChainComplete(result)) {
    state = EvidenceState.BLOCKED;
    rationale = 'Requested empirical state is missing the complete evidence chain: dataset, evaluation boundary, analysis configuration, and run metadata are required.';
  } else if (requested === EvidenceState.VALIDATED && !(result?.reviewEvidenceRefs?.length > 0)) {
    state = EvidenceState.BLOCKED;
    rationale = 'Validation requires explicit review evidence and cannot be self-assigned by an executor or component.';
  } else if (requested === EvidenceState.NEGATIVE_NULL_FAVORING) {
    rationale = 'The recorded result favors the null or does not support the specified alternative; the negative state is preserved without positive reframing.';
  } else if (requested === EvidenceState.BLOCKED) {
    rationale = 'No inspectable empirical result is available for the defined hypothesis.';
  }

  const copy = policy[state] ?? policy.BLOCKED;
  return {
    schemaVersion: '1.0.0',
    claimId: result?.resultId ?? result?.claimId ?? 'unidentified-claim',
    state,
    rationale,
    evidenceRefs: Array.isArray(result?.evidenceRefs) ? [...result.evidenceRefs] : [],
    limitations: Array.isArray(result?.limitations) ? [...result.limitations] : [],
    allowedPhrases: [...copy.allowed],
    forbiddenPhrases: [...copy.forbidden],
  };
}

export function phraseAllowed(claimStatus, phrase) {
  const normalized = String(phrase).toLowerCase();
  return !claimStatus.forbiddenPhrases.some((forbidden) => normalized.includes(forbidden.toLowerCase()));
}
