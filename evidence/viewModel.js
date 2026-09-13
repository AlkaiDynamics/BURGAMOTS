import { validateContract } from './validator.js';
import { EvidenceState } from './claimPolicy.js';
import { loadResultManifest } from './resultLoader.js';

const labelFor = (state) => {
  switch (state) {
    case EvidenceState.NEGATIVE_NULL_FAVORING: return 'Status: NEGATIVE / NULL-FAVORING';
    case EvidenceState.ILLUSTRATIVE: return 'Status: ILLUSTRATIVE';
    case EvidenceState.EXPLORATORY: return 'Status: EXPLORATORY';
    case EvidenceState.EVALUATED: return 'Status: EVALUATED';
    case EvidenceState.VALIDATED: return 'Status: VALIDATED';
    case EvidenceState.UNRESOLVED: return 'Status: UNRESOLVED';
    default: return 'Status: BLOCKED';
  }
};

const summaryFor = (state) => {
  switch (state) {
    case EvidenceState.NEGATIVE_NULL_FAVORING:
      return 'The registered analysis did not support the specified alternative under its stated conditions.';
    case EvidenceState.ILLUSTRATIVE:
      return 'This material is illustrative or synthetic and is not an empirical result.';
    case EvidenceState.EXPLORATORY:
      return 'This is an exploratory result and does not establish confirmation, causality, or validation.';
    case EvidenceState.EVALUATED:
      return 'This result was evaluated under its recorded evidence contract; validation is not implied.';
    case EvidenceState.VALIDATED:
      return 'This claim is validated only for the explicitly recorded intended use and review evidence.';
    case EvidenceState.UNRESOLVED:
      return 'The available evidence does not resolve this claim.';
    default:
      return 'No inspectable empirical result is available for this hypothesis.';
  }
};

export function createEvidenceViewModel({ hypothesisSchema, resultSchema, hypothesis, result, registry }) {
  const hypothesisCheck = validateContract(hypothesisSchema, hypothesis);
  if (!hypothesisCheck.valid) {
    throw new Error(`Hypothesis contract invalid: ${hypothesisCheck.errors.join('; ')}`);
  }

  const resultCheck = validateContract(resultSchema, result);
  if (!resultCheck.valid) {
    throw new Error(`Result manifest invalid: ${resultCheck.errors.join('; ')}`);
  }

  if (result.hypothesisId !== hypothesis.id) {
    throw new Error(`Hypothesis isolation violation: result ${result.resultId} belongs to ${result.hypothesisId}, not ${hypothesis.id}.`);
  }

  const loaded = registry === undefined
    ? loadResultManifest(result, { schema: resultSchema })
    : loadResultManifest(result, { registry, schema: resultSchema });

  if (!loaded.ok) {
    throw new Error(`Result manifest rejected: ${loaded.errors.join('; ')}`);
  }

  const claimStatus = loaded.claimStatus;

  return Object.freeze({
    id: result.resultId,
    hypothesisId: hypothesis.id,
    title: hypothesis.title,
    state: claimStatus.state,
    statusLabel: labelFor(claimStatus.state),
    summary: summaryFor(claimStatus.state),
    source: `Hypothesis contract: ${hypothesis.id}`,
    method: result.method ?? null,
    provenanceSummary: result.datasetManifestId ? `Dataset manifest: ${result.datasetManifestId}` : 'No empirical dataset is attached.',
    limitations: [...(result.limitations ?? [])],
    unresolvedFields: [...(hypothesis.unresolvedFields ?? [])],
    estimate: result.estimate ?? null,
    uncertainty: result.uncertainty ?? null,
    pValue: result.pValue ?? null,
    sample: result.sample ?? { n: null, independentN: null },
    allowedPhrases: [...claimStatus.allowedPhrases],
    forbiddenPhrases: [...claimStatus.forbiddenPhrases],
  });
}
