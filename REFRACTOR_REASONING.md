# BURGAMOTS Evidence-Integrity Refactor Reasoning Record

## Freeze

- Repository: `AlkaiDynamics/BURGAMOTS`
- Frozen base branch: `main`
- Frozen base commit: `8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Successor branch: `refactor/evidence-integrity`
- Audit cutoff: `2026-09-12`
- This record is created before any active product file is modified.

## 1. Original purpose

The governing audited formulation is:

> Determine whether a prespecified zodiacal or independently derived astronomical-relational representation provides reproducible incremental out-of-sample predictive information beyond ordinary astronomical state, temporal or seasonal structure, and appropriate negative controls.

The audit establishes purpose drift rather than an executable original-purpose experiment (`E-001`, `D-001`, `D-003`, `D-004`). The following remain unresolved and must not be guessed:

- target or outcome;
- unit of analysis;
- independent unit;
- population and sampling frame;
- estimand;
- numerical rejection threshold;
- complete primary comparison/control family;
- evaluation and confirmatory policy.

This formulation therefore remains a blocked scientific contract, not permission to execute an experiment.

## 2. What the frozen repository actually implements

Audit evidence establishes that the frozen artifact is a frontend-oriented React/Vite/TypeScript survey/visualization application using Three.js and Recharts rather than the documented scientific execution stack (`I-001`, `I-002`, `E-006`). It includes:

- simplified orbital propagation and a visually exaggerated barycentric path rather than JPL state-vector/N-body execution (`I-004`, `I-005`);
- validation-style values embedded as source literals or mock arrays rather than emitted by an inspectable scientific run (`E-002`, `E-003`, `I-006`, `I-007`);
- a synthetic periodic visual driver that was historically presented with physical-sounding terminology (`I-003`, `U-006`);
- prose and diagrams describing DeepXDE/PINN, JPL/SDO/ERA5 ingestion, MHD/Navier–Stokes execution, forecasting, and validation that are not present in the audited runtime dependency/tree (`I-001`, `I-002`, `P-005`, `E-006`, `U-007`).

These are implementation-state observations. They do not determine whether the underlying hypotheses are true or false.

## 3. Unsupported active claims

The successor must not preserve the following as established empirical claims unless a future inspectable evidence chain independently earns them:

- “validated” or equivalent validation status (`U-001`);
- historical extreme-significance language (`S-005`, `U-005`);
- historical accuracy language without an inspectable generation path (`U-005`, `E-003`);
- historical blind-test performance language without a frozen held-out boundary (`S-006`, `U-005`);
- Granger “causal flow” or causal interpretation without the required analysis chain (`S-001`, `S-002`, `U-004`);
- historical long-horizon superiority claims (`E-003`, `U-005`);
- prospective forecast performance without a timestamped pre-outcome record (`P-004`, `L-002`);
- repository reproducibility of the claimed DeepXDE/data/notebook stack (`E-006`, `P-005`);
- active DeepXDE/PINN execution (`I-001`, `U-003`, `U-007`);
- physical torque for the synthetic periodic visualization index (`I-003`, `U-004`, `U-006`);
- economic or operational utility attributed to unestablished forecast skill (`U-008`).

## 4. Evidence/design defects versus code defects

### Scientific-design / evidence defects

These cannot be repaired by UI changes alone:

- missing claim→run→configuration→code→data/result lineage (`E-002`, `P-003`);
- missing immutable dataset acquisition/version/hash provenance (`P-001`, `P-002`);
- absent inspectable train/evaluation or prospective boundary (`L-001`, `L-002`, `S-006`);
- unresolved unit, sampling frame, null/control and estimand (`D-003`, `D-004`);
- untraceable uncertainty/significance/multiplicity derivation (`S-003`, `S-005`);
- no timestamped prospective forecast issuance record (`P-004`).

Historical leakage occurrence itself remains unresolved (`L-003`); the defect that is established is the absence of an inspectable boundary from which leakage could be adjudicated.

### Implementation / presentation defects

These can be corrected without inventing science:

- hardcoded empirical-looking validation arrays and summary quantities (`E-003`, `I-006`, `I-007`);
- synthetic periodic index mislabeled as physical torque (`I-003`, `U-006`);
- year-driven UI modes that imply active DeepXDE/training/model execution (`U-003`);
- diagrams and prose presenting proposed/absent systems as operational (`U-007`, `I-001`, `I-002`);
- active validation/significance/causality language without evidence-state gating (`U-001`–`U-009`);
- missing runtime claim-policy and provenance/result validation boundaries.

### Mixed defects

Claims that scientific engines/data exist in the repository are simultaneously documentation/provenance and implementation defects (`E-006`, `P-005`, `I-001`, `I-002`). They require truthful product state plus an architecture that cannot make the same category error again.

## 5. Necessary before any scientific result is displayed

The successor must first establish:

1. runtime-validatable evidence contracts;
2. separate blocked hypothesis records for the original-purpose and public heliophysics propositions;
3. a centralized evidence-state/claim policy that UI components cannot bypass;
4. provenance manifests and hash linkage;
5. an explicit evaluation-boundary contract and invariant checks, without claiming historical leakage is cleared;
6. a scientific-executor interface separate from React presentation;
7. result manifests that are the only source of empirical scientific values;
8. derived UI view models with explicit status, source, method, limitations and provenance;
9. fixture/illustrative isolation and tests;
10. negative/null-favoring and blocked states that do not get reframed as success.

## 6. Explicitly out of scope in this phase

Until the user resolves the scientific blockers, the implementation must not independently choose or add:

- the real target/outcome, unit, independent unit or estimand;
- an authoritative empirical dataset;
- the primary null/control family;
- a confirmatory evaluation policy or rejection threshold;
- a physical torque equation/model;
- DeepXDE or a Python scientific stack;
- a statistical method selected as the project’s real analysis;
- new scientific claims or broader hypotheses.

## 7. What must remain unchanged/blocked until the contract is settled

- No result may be promoted to `EVALUATED` or `VALIDATED` merely because the application builds or a component requests that state.
- No fixture or illustrative visualization may be treated as an observation, measurement, prediction, validation result, or physical mechanism.
- No new evaluation-boundary implementation may retroactively clear historical leakage; `L-003` remains unresolved for the frozen baseline.
- Original-purpose and public-heliophysics evidence must remain isolated by hypothesis ID.
- Missing evidence must render as `BLOCKED`/unresolved with null scientific values rather than plausible substitutes.

## 8. Blocking user decisions

- `UD-001`: original-purpose target, unit, independent unit, population/sampling frame, and estimand.
- `UD-002`: authoritative empirical data.
- `UD-003`: primary null/control family.
- `UD-004`: evaluation and confirmatory policy.

The real scientific baseline remains blocked while any of `UD-001` through `UD-004` is unresolved.
