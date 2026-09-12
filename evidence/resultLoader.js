import { readFileSync } from 'node:fs';
import { validateContract } from './validator.js';
import { deriveClaimStatus, EvidenceState } from './claimPolicy.js';

const resultSchema = JSON.parse(readFileSync(new URL('../contracts/analysis-result.schema.json', import.meta.url), 'utf8'));

const DEFAULT_REFERENCE_REGISTRY = Object.freeze({
  hypotheses: new Set(['burgamots-original-purpose', 'public-heliophysics-proposal']),
  datasets: new Map([['historical-cited-sources-unacquired', { empiricalReady: false }]]),
  boundaries: new Map(),
  analysisConfigs: new Map(),
  runs: new Map(),
  reviews: new Set(),
});

const EMPIRICAL_STATES = new Set([
  EvidenceState.EXPLORATORY,
  EvidenceState.NEGATIVE_NULL_FAVORING,
  EvidenceState.EVALUATED,
  EvidenceState.VALIDATED,
]);

const checkReference = (errors, registry, kind, id) => {
  if (!id) {
    errors.push(`${kind}: required for empirical result`);
    return;
  }
  const collection = registry[kind];
  const known = collection instanceof Map ? collection.has(id) : collection instanceof Set ? collection.has(id) : false;
  if (!known) errors.push(`unknown reference: ${kind}:${id}`);
};

export function createReferenceRegistry(overrides = {}) {
  return {
    hypotheses: overrides.hypotheses ?? new Set(DEFAULT_REFERENCE_REGISTRY.hypotheses),
    datasets: overrides.datasets ?? new Map(DEFAULT_REFERENCE_REGISTRY.datasets),
    boundaries: overrides.boundaries ?? new Map(DEFAULT_REFERENCE_REGISTRY.boundaries),
    analysisConfigs: overrides.analysisConfigs ?? new Map(DEFAULT_REFERENCE_REGISTRY.analysisConfigs),
    runs: overrides.runs ?? new Map(DEFAULT_REFERENCE_REGISTRY.runs),
    reviews: overrides.reviews ?? new Set(DEFAULT_REFERENCE_REGISTRY.reviews),
  };
}

export function loadResultManifest(record, { registry = createReferenceRegistry() } = {}) {
  const schemaCheck = validateContract(resultSchema, record);
  const errors = [...schemaCheck.errors];

  if (!registry.hypotheses.has(record?.hypothesisId)) errors.push(`unknown reference: hypotheses:${record?.hypothesisId ?? 'null'}`);

  for (const ref of Array.isArray(record?.evidenceRefs) ? record.evidenceRefs : []) {
    if (ref.startsWith('hypothesis:')) {
      const referencedHypothesis = ref.slice('hypothesis:'.length);
      if (referencedHypothesis !== record?.hypothesisId) {
        errors.push(`hypothesis isolation violation: result for ${record?.hypothesisId} references evidence for ${referencedHypothesis}`);
      }
    }
  }

  if (record?.fixture === true && EMPIRICAL_STATES.has(record?.status)) {
    errors.push('fixture isolation violation: fixture or illustrative data cannot be marked empirical');
  }

  if (record?.status === EvidenceState.VALIDATED && !(record?.reviewEvidenceRefs?.length > 0)) {
    errors.push('review evidence required: executor/component cannot self-assign VALIDATED');
  }

  if (EMPIRICAL_STATES.has(record?.status)) {
    checkReference(errors, registry, 'datasets', record?.datasetManifestId);
    checkReference(errors, registry, 'boundaries', record?.evaluationBoundaryId);
    checkReference(errors, registry, 'analysisConfigs', record?.analysisConfigId);
    checkReference(errors, registry, 'runs', record?.runMetadataId);

    const dataset = registry.datasets.get(record?.datasetManifestId);
    if (dataset && dataset.empiricalReady !== true) errors.push(`dataset provenance incomplete: ${record.datasetManifestId} is not empirical-ready`);
  }

  if (record?.status === EvidenceState.VALIDATED) {
    for (const ref of record.reviewEvidenceRefs ?? []) {
      if (!registry.reviews.has(ref)) errors.push(`unknown reference: reviews:${ref}`);
    }
  }

  const claimStatus = deriveClaimStatus(record);
  if (record?.status !== EvidenceState.BLOCKED && claimStatus.state === EvidenceState.BLOCKED) {
    errors.push(`claim gate blocked requested state ${record?.status}: ${claimStatus.rationale}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    result: record,
    claimStatus,
  };
}
