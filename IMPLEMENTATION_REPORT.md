# BURGAMOTS Evidence-Integrity Refactor — Implementation Report

## Baseline and branch

- Repository: `AlkaiDynamics/BURGAMOTS`
- Base branch: `main`
- Base commit: `8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Refactor branch: `refactor/evidence-integrity`
- Draft PR: `#2` — `Evidence-integrity refactor`
- Final runtime implementation commit: `bdb3a64e50df71930cce3d8a67a0fc6d72523235`
- Completion review/report commits are documentation-only successors and do not alter the runtime implementation identified above.
- Rollback target: `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Main was not merged or modified by this report.

## Files created

### Preserved audit and reasoning

- `audit/2026-09-12/AUDIT_CONTRACT.md`
- `audit/2026-09-12/AUDIT_REPORT.md`
- `audit/2026-09-12/BASELINE.json`
- `audit/2026-09-12/CLAIM_REGISTER.md`
- `audit/2026-09-12/DATAFLOW.md`
- `audit/2026-09-12/DEFECT_LEDGER.json.gz`
- `audit/2026-09-12/FINDINGS.md.gz`
- `audit/2026-09-12/README_AUDIT.md`
- `audit/2026-09-12/REPRODUCTION_LOG.md`
- `REFRACTOR_REASONING.md`
- `IMPLEMENTATION_PLAN.md`
- `SOLAR_VISUALIZATION_BACKUP_REPORT.md`
- `IMPLEMENTATION_REVIEW.md`
- `IMPLEMENTATION_REPORT.md`

### Evidence contracts

- `contracts/hypothesis.schema.json`
- `contracts/dataset.schema.json`
- `contracts/transformation.schema.json`
- `contracts/evaluation-boundary.schema.json`
- `contracts/leakage-check.schema.json`
- `contracts/analysis-config.schema.json`
- `contracts/run-metadata.schema.json`
- `contracts/analysis-result.schema.json`
- `contracts/claim-status.schema.json`

### Evidence runtime

- `evidence/validator.js`
- `evidence/claimPolicy.js`
- `evidence/provenance.js`
- `evidence/boundary.js`
- `evidence/resultLoader.js`
- `evidence/viewModel.js`
- `evidence/viewModel.d.ts`
- `evidence/system-state.json`
- `evidence/hypotheses/original-purpose.json`
- `evidence/hypotheses/public-heliophysics.json`
- `evidence/results/original-purpose-blocked.json`
- `evidence/results/public-heliophysics-blocked.json`
- `evidence/datasets/cited-sources.json`

### Active UI and protected source

- `components/EvidencePanel.tsx`
- `protected/solar-visualization-frozen-8a9029b6.tsx`

### Verification and CI

- `.github/workflows/integrity.yml`
- `scripts/audit-claims.mjs`
- `scripts/audit-env.mjs`
- `scripts/audit-fixtures.mjs`
- `scripts/audit-leakage.mjs`
- `scripts/audit-provenance.mjs`
- `scripts/audit-solar-backup.mjs`
- `scripts/harness-invalid-fixture.mjs`
- `scripts/prebuild-integrity.mjs`
- `scripts/reproduce.mjs`
- `scripts/verify.mjs`
- `tests/all-contracts.test.mjs`
- `tests/claim-policy.test.mjs`
- `tests/contracts.test.mjs`
- `tests/fixtures/harness-invalid.json`
- `tests/provenance-boundary.test.mjs`
- `tests/result-loader.test.mjs`
- `tests/solar-visualization-preservation.test.mjs`
- `tests/ui-integrity.test.mjs`
- `tests/view-model.test.mjs`

## Files modified

- `App.tsx` — replaced the historical validation/paper/model claim surface with evidence-view-model-driven blocked-state presentation.
- `README.md` — replaced historical implementation/performance claims with actual successor behavior and explicit scientific blockers.
- `metadata.json` — changed description from deterministic heliospheric predictor to evidence-bounded research interface.
- `index.html` — removed stale browser import map and updated page title; npm/Vite now solely determine bundled dependency versions.
- `package.json` — added test, audit, reproduction, prebuild-integrity, and verification scripts; no dependency packages were added.
- `tsconfig.json` — scoped TypeScript checking to the active successor runtime so frozen/dormant historical source can remain byte-preserved without being treated as current product code.

## Files removed from the active runtime

No historical source file was deleted from the repository. The active `App.tsx` import/render graph no longer includes:

- `SolarSystemViz`
- `SolarCycleChart`
- `FlareCorrelationChart`
- `ValidationCharts` / `GrangerChart`
- `FullPaper`
- `PINNDiagram`
- `SystemArchDiagram`
- `PipelineDiagram`
- historical `Hero`, `Navigation`, and `Timeline` presentation paths

These sources remain available as history/provenance where present. The frozen solar visualization is additionally preserved byte-for-byte under `protected/`.

## Change-to-finding traceability

### C1 — Purpose and hypothesis separation

Artifacts: hypothesis schema; original-purpose and public-heliophysics hypothesis records; blocked result records; `REFRACTOR_REASONING.md`.

Addresses active integrity consequences of:
- `E-001`
- `D-001`
- `D-003`
- `D-004`
- `D-007`
- `P-003`

Effect: the audited original purpose is explicit but blocked; the later heliophysics proposal is separate; unresolved scientific fields are not guessed.

### C2 — Runtime contracts and claim-state gate

Artifacts: JSON Schemas, `validator.js`, `claimPolicy.js`, `resultLoader.js`.

Addresses active integrity consequences of:
- `E-002`, `E-003`, `E-006`
- `S-001`, `S-002`, `S-005`, `S-006`
- `I-008`
- `U-001`, `U-002`, `U-003`, `U-005`, `U-007`, `U-009`
- `P-003`, `P-005`

Effect: result-like output must pass a runtime schema and centralized evidence-state gate; fixtures cannot become empirical; validation cannot self-authorize; blocked values remain null.

### C3 — Provenance and content binding

Artifacts: `provenance.js`, dataset/transformation schemas, dataset-manifest hash binding in `analysis-result.schema.json` and `resultLoader.js`.

Addresses active integrity consequences of:
- `P-001`, `P-002`, `P-003`, `P-004`
- `E-002`
- successor-control portion of `L-001`

Effect: cited sources are distinct from acquired inputs; acquired successor data require hashes; transformation chains are checkable; empirical results are bound to the registered dataset-manifest SHA-256 and fail if it changes.

### C4 — Evaluation-boundary controls

Artifacts: evaluation-boundary/leakage schemas, `boundary.js`, boundary tests, system-state record.

Addresses successor-control portions of:
- `D-004`
- `L-001`
- `L-002`

Effect: accepted successor boundary objects prevent exact identifier overlap and grouped-unit partition crossover, require pre-analysis declaration, and become immutable once results exist. Historical leakage remains `UNRESOLVED`.

Not claimed resolved: `L-003`; real temporal, near-duplicate, and target-derived leakage checks remain dependent on UD-001/UD-002/UD-004.

### C5 — Active UI claim isolation

Artifacts: rewritten `App.tsx`, `EvidencePanel.tsx`, `viewModel.js`, UI/claim/fixture audits.

Addresses active presentation consequences of:
- `E-003`, `E-004`, `E-005`
- `D-002`, `D-005`, `D-006`
- `S-001`, `S-002`, `S-005`, `S-006`
- `U-001` through `U-009`
- `I-001`, `I-002`, `I-006`

Effect: historical empirical-looking arrays/paper/model labels are outside the active claim path; active UI shows blocked hypotheses, unresolved fields, proposed architecture, and explicit limitations through derived view models.

### C6 — Synthetic visualization / solar archive boundary

Artifacts: protected frozen source, preservation tests, solar hash audit/report; active App does not mount the historical visualization.

Addresses active integrity consequences of:
- `I-003`, `I-004`, `I-005`, `I-006`, `I-007`
- `U-004`, `U-006`

Effect: exact historical visualization source is preserved for possible AYLI/product reuse without granting it scientific-evidence authority. The active BURGAMOTS claim path does not expose the historical synthetic cycle driver as physical measurement or validation.

### C7 — Documentation and dependency/environment integrity

Artifacts: `README.md`, `metadata.json`, `index.html`, environment audit.

Addresses active integrity consequences of:
- `E-006`
- `I-009`, `I-010`
- `P-005`
- `U-001`, `U-007`, `U-008`

Effect: stale DeepXDE/data/notebook/GEMINI setup claims are no longer current documentation; stale browser dependency import map was removed; active client has no environment-variable access.

### C8 — Fail-closed verification harness

Artifacts: package scripts, `prebuild-integrity.mjs`, `verify.mjs`, tests/audits, Vercel execution.

Addresses:
- `I-008`
- reproducibility/control aspects of `P-001`–`P-003`
- verification aspects across the integrity refactor

Effect: intentionally invalid input must fail; injected verifier failure must propagate; only after typecheck, tests, audits, reproduction and protected-source checks pass may the Vite build proceed.

## Findings not scientifically resolved by this refactor

The refactor suppresses unsupported active claims and supplies future-safe contracts, but it does not pretend to solve scientific questions that require an experiment.

- `S-003` multiple-comparison policy: schema field exists; final policy remains undefined.
- `S-004` stationarity/autocorrelation/effective-N/surrogate strategy: not selected.
- `S-007` stochastic run/split sensitivity: not applicable until a real model/evaluation exists.
- `D-003`, `D-004`, `D-005`, `D-007`: active overclaims are removed/blocked, but the real null, sampling unit, event census, evaluation policy, and thresholds remain scientific decisions.
- `L-002`: successor metadata can record freezes/boundaries, but no historical timestamped freeze is retroactively created.
- `L-003`: actual historical leakage/post-hoc tuning remains unresolved.
- `I-001`–`I-004`: absent scientific components are now described honestly; they were not manufactured merely to make audit findings disappear.

## Tests added

The executed suite contains 61 passing tests covering:

- Contract valid/missing/wrong-type behavior.
- Blocked hypothesis preservation.
- Cross-hypothesis isolation.
- Evidence-state transitions and forbidden promotions.
- Fixture isolation.
- Inferential metadata requirements.
- Review requirement for validation.
- Negative/null-favoring rendering.
- SHA-256 byte checks and provenance chains.
- Dataset-manifest result hash binding.
- Boundary record/group overlap and immutability.
- Historical leakage remaining unresolved.
- Result-loader fail-closed behavior.
- Frozen solar-source preservation and evidence decoupling.
- Active UI manifest/view-model routing and null preservation.

## Verification commands and results

Execution surface: Vercel preview build from Git-linked branch. No Vercel project setting was changed.

Verified runtime implementation: `bdb3a64e50df71930cce3d8a67a0fc6d72523235`.

| Command / equivalent | Executed result |
|---|---|
| Dependency installation | Vercel `Installing dependencies... up to date`; success. This report does not falsely label that step as literal `npm ci`. |
| `npm run audit:harness-invalid` | Intentional invalid fixture rejected; exit `1` as required. |
| injected `BURGAMOTS_VERIFY_SELFTEST_FAIL=1 npm run verify` | Intentional failure propagated; exit `17` as required. |
| `npm run typecheck` | PASS (`tsc --noEmit`). |
| `npm test` | PASS — `61` tests, `61` pass, `0` fail. |
| `npm run audit:fixtures` | PASS. |
| `npm run audit:provenance` | PASS. |
| `npm run audit:leakage` | PASS; historical leakage explicitly remains `UNRESOLVED`. |
| `npm run audit:claims` | PASS. |
| `npm run audit:env` | PASS; no active client environment access. |
| `npm run audit:solar-backup` | PASS; Git blob `e56d956cf927c56b24543259ccee9475ab41d6b6`; SHA-256 `4d0efb7144d437f66625bdaadd357b8e8e76c605e9870164f15eff81ee820180`. |
| `npm run reproduce` | PASS; both scientific hypothesis records remain `BLOCKED`; historical leakage remains `UNRESOLVED`; no science executed. |
| `npm run verify` equivalent in prebuild mode | PASS; all integrity commands completed before build. |
| `npm run build` | PASS — Vite transformed 1481 modules and produced the static bundle. |

The GitHub Actions workflow exists, but hosted jobs were observed queued/zero-step during this session. This report does **not** claim a GitHub Actions green run. Vercel build logs are the tool-confirmed execution record.

## Intermediate failures and deviations

These are retained because hiding them would undermine the purpose of the refactor.

1. An early attempt to route the browser UI through `resultLoader.js` imported `node:fs`; Vercel correctly failed the build. The loader was changed to require runtime schema injection, preserving validation without a Node filesystem dependency in the client bundle.
2. Once the integrity prebuild was activated, TypeScript failed on dormant/frozen historical files. The fix was **not** to rewrite the protected history; `tsconfig.json` was scoped to the active successor runtime, while separate audits enforce that dormant files cannot re-enter the active claim path.
3. The adversarial review exposed that empirical results were initially bound only to dataset ID, not dataset-manifest content. A RED test demonstrated the gap; result manifests now require a matching dataset-manifest SHA-256 for empirical states.
4. The solar visualization preservation policy changed during implementation. The exact frozen source is now preserved for possible AYLI reuse, while active BURGAMOTS is free to omit it. The evidence pipeline is tested to remain independent from that archive.
5. GitHub-hosted Actions jobs did not supply a reliable execution surface. Rather than treating queued/zero-step jobs as success, the static Vercel build was made fail-closed: it runs harness self-tests and the integrity suite before Vite is allowed to build.

## New dependencies

**None.**

The refactor uses Node built-ins, existing TypeScript/Vite tooling, and the existing React/lucide packages. DeepXDE, Python scientific packages, experiment trackers, and new data libraries were deliberately not added.

## Scientific claims currently permitted

The active application may state that:

- BURGAMOTS has a frozen audited historical baseline.
- The original-purpose and public-heliophysics hypotheses are separate and currently `BLOCKED`.
- No inspectable empirical result is currently available for those blocked records.
- Historical leakage remains `UNRESOLVED`.
- Evidence contracts, claim-state controls, provenance checks, successor boundary invariants, result hash binding, view-model routing, and verification controls are implemented and tested within their stated scope.
- The protected solar visualization file is an exact archived copy of the frozen source.
- Proposed scientific architecture is proposed and not currently implemented.

## Scientific claims currently prohibited

The active application must not present as established any claim of:

- Scientific validation of BURGAMOTS.
- Causality from the historical association/Granger-style material.
- Historical blind-test validity.
- Historical extreme-significance/confidence/accuracy values.
- Physical torque measurement from the historical synthetic cycle driver.
- Prospective predictive superiority.
- Active DeepXDE/PINN scientific execution.
- JPL/N-body fidelity for the historical visualizer.
- Economic or operational utility resulting from unestablished forecasts.
- Historical leakage cleanliness.

## Deployment verification

- Platform/project: Vercel project `burgamots` (`prj_krrfZ1yf3RT2x436gWdiN5OMu05H`).
- Deployment type verified: Git-branch preview; not a production/main deployment.
- Runtime implementation commit `bdb3a64e50df71930cce3d8a67a0fc6d72523235` received Vercel status `success` after the full fail-closed prebuild verification and Vite build.
- No new environment variable, secret, API route, `vercel.json`, domain, DNS, project ID, framework preset, or dashboard setting was required.
- Main/production was not merged by this implementation agent.
- Rollback target remains the untouched frozen base `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`.

## Established by this refactor

- The frozen audited baseline is preserved separately from successor behavior.
- Original-purpose and public-heliophysics hypotheses have isolated blocked records.
- Runtime JSON-schema validation and centralized claim-state enforcement exist.
- Fixtures cannot enter empirical states through the supported result path.
- Missing evidence remains null/blocked rather than being fabricated as zero or a metric.
- Empirical results require registered provenance, boundary/config/run references, and a matching dataset-manifest SHA-256.
- Successor boundary validation rejects exact partition overlap and grouped-unit crossover and preserves post-result immutability.
- Historical leakage is explicitly retained as `UNRESOLVED`.
- Negative/null-favoring results can be represented without positive reframing.
- Active React scientific presentation is derived from evidence view models rather than historical hardcoded result components.
- Historical validation/paper/model components are outside the active claim path.
- The frozen solar visualization source is preserved exactly and is decoupled from scientific evidence state.
- Active client source has no environment-variable access.
- The fail-closed harness rejects an invalid fixture and propagates an injected failure.
- The executed verification run passed 61/61 tests, all integrity audits, blocked-state reproduction, and the production Vite build on the verified preview implementation commit.

## Not established

- The BURGAMOTS original scientific hypothesis has not been tested by this refactor.
- The public heliophysics proposal has not been tested by this refactor.
- Scientific validation is not established.
- Causality is not established.
- Historical significance, confidence, accuracy, or blind-test performance is not established.
- Physical torque measurement is not established.
- Prospective predictive superiority is not established.
- DeepXDE/PINN scientific execution is not established.
- JPL/N-body scientific fidelity is not established for the archived visualizer.
- Economic or operational utility is not established.
- A real empirical dataset, model, statistical method, or confirmatory result was not created.
- A successful build/deployment does not establish scientific validity.

## Unresolved / blocked

- `UD-001`: original-purpose target/outcome, unit of analysis, independent unit, population/sampling frame, and estimand.
- `UD-002`: authoritative empirical data.
- `UD-003`: primary null/control family.
- `UD-004`: evaluation and confirmatory policy.
- Historical leakage in the frozen baseline remains `UNRESOLVED`.
- Historical post-hoc tuning/optional stopping/target leakage cannot be determined from the frozen artifact.
- Real-experiment temporal ordering, near-duplicate detection, target-derived preprocessing leakage, dependence handling, multiplicity policy, stopping rule, and sensitivity strategy remain blocked until the scientific contract and data are approved.
- No source or dataset not actually acquired and hashed is treated as empirical evidence.
- GitHub-hosted Actions execution remained unavailable/queued during the verified session; no GitHub Actions success is claimed.
- Production/main deployment and merge remain unperformed and require explicit user authorization.
