# BURGAMOTS Evidence-Integrity Implementation Review

Base: `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`
Branch: `refactor/evidence-integrity`
Review scope: successor evidence-integrity controls only. This review does not evaluate or validate the BURGAMOTS scientific hypothesis.

## Adversarial checks

### 1. Can a developer put real-looking numbers in fixture JSON and obtain an `EVALUATED` badge?

**Result: No through the supported evidence path.**

Evidence:
- `evidence/resultLoader.js` rejects `fixture: true` in empirical states.
- `evidence/claimPolicy.js` independently collapses fixture requests for empirical states to `BLOCKED`.
- `tests/result-loader.test.mjs` includes `fixture cannot be marked empirical/evaluated`.
- `tests/claim-policy.test.mjs` includes `fixture cannot enter an empirical evidence state`.

Residual risk: a future developer could deliberately delete or bypass the controls, as with any source-controlled safeguard; the current verification suite is designed to detect the supported-path bypasses tested here.

### 2. Can a component hardcode `validated`, `significant`, or `causal` and bypass policy?

**Result: No through the active scientific presentation path.**

Evidence:
- `App.tsx` derives both active hypothesis presentations with `createEvidenceViewModel`.
- `components/EvidencePanel.tsx` accepts the derived view model rather than a requested evidence state.
- `scripts/audit-claims.mjs` scans active presentation/current documentation for historical unsupported claim strings.
- `tests/ui-integrity.test.mjs` verifies that the active application routes scientific presentation through the view model and does not import historical validation components.
- `tests/claim-policy.test.mjs` verifies unsupported state promotions and self-validation rejection.

The review does not claim that arbitrary malicious source edits are impossible; it establishes that the implemented active path has no supported component API for self-authorizing a stronger evidence state.

### 3. Can missing provenance reach an evaluated state?

**Result: No.**

Evidence:
- Empirical result states require dataset, evaluation-boundary, analysis-config, and run-metadata references.
- The referenced dataset must be registered as empirical-ready.
- Empirical results must carry a valid dataset-manifest SHA-256 matching the registry fingerprint.
- `tests/result-loader.test.mjs` verifies unknown references fail closed and a changed dataset-manifest hash invalidates the result.
- `scripts/audit-provenance.mjs` verifies cited-but-unacquired sources remain non-empirical.

### 4. Can the same record appear in training and evaluation?

**Result: No for successor boundary objects accepted by the implemented validator.**

Evidence:
- `evidence/boundary.js` rejects identifier overlap across training, evaluation, and control partitions.
- It also rejects grouped units spanning partitions.
- `tests/provenance-boundary.test.mjs` contains positive failure tests for both conditions.

Limit: no real empirical boundary is constructed in this refactor because UD-001 and UD-004 remain unresolved.

### 5. Can a year slider imply model execution?

**Result: No in the active BURGAMOTS application.**

Evidence:
- `App.tsx` does not import `SolarSystemViz`, `Timeline`, or historical model-status components.
- `scripts/audit-fixtures.mjs` fails if the historical visualization/validation components re-enter the active scientific claim path.

### 6. Can the synthetic cycle index be mistaken for physical torque?

**Result: No in the active evidence path.**

Evidence:
- The historical cycle driver exists only in the protected/dormant visualization source.
- The successor no longer contains the dormant legacy solar visualization source or its synthetic claim-bearing driver; the immutable audit remains the historical record.
- The active application does not mount the historical visualization.

### 7. Can a negative result be displayed honestly?

**Result: Yes.**

Evidence:
- `NEGATIVE_NULL_FAVORING` is a first-class evidence state.
- `evidence/claimPolicy.js` preserves it rather than converting it to success.
- `evidence/viewModel.js` renders the label `Status: NEGATIVE / NULL-FAVORING` and states that the specified alternative was not supported under the recorded conditions.
- `tests/claim-policy.test.mjs` and `tests/view-model.test.mjs` verify this behavior.

### 8. Can the system remain blocked without filling nulls?

**Result: Yes.**

Evidence:
- Both current result manifests are `BLOCKED` and retain `null` dataset, manifest-hash, boundary, analysis, run, method, estimate, uncertainty, and p-value fields where evidence is absent.
- `EvidencePanel` renders no empirical statistic when estimate/p-value are null.
- `tests/result-loader.test.mjs` and `tests/view-model.test.mjs` verify null preservation.
- `npm run reproduce` confirms both hypothesis states remain blocked without invented values.

### 9. Can the scientific executor self-assign validation?

**Result: No through the result loader.**

Evidence:
- `VALIDATED` requires explicit review evidence.
- `evidence/resultLoader.js` rejects validation without review evidence and validates review references.
- `evidence/claimPolicy.js` independently blocks a validation request lacking review evidence.
- `tests/result-loader.test.mjs` and `tests/claim-policy.test.mjs` verify the rejection.

### 10. Does an active screenshot still reasonably imply that the frozen historical validation claims are established?

**Result: No based on the active render source and deployed build.**

Evidence:
- Active `App.tsx` visibly labels the scientific state `BLOCKED` and historical leakage `UNRESOLVED`.
- It explicitly separates “What is not established” from software controls established by the successor.
- Historical validation charts, paper, diagrams, and legacy solar visualization have been purged from the successor branch; the active UI remains evidence-derived.
- `scripts/audit:claims` equivalent (`npm run audit:claims`) passed on the executed Vercel build.
- `tests/ui-integrity.test.mjs` verifies the active application contains none of the audited historical validation phrases.

Limit: this refactor uses structural/UI-source assertions rather than pixel-diff browser screenshots. The deployed static route is separately verified through Vercel.

### 11. Can a client bundle expose a server-only environment value?

**Result: No environment access exists in the active client implementation.**

Evidence:
- `scripts/audit-env.mjs` scans the active client/evidence modules and fails on `process.env`, `import.meta.env`, or `VITE_*` environment references.
- `npm run audit:env` passed in the executed Vercel verification run.
- No new environment variable or Vercel dashboard setting was added.

This establishes absence of active client environment reads in the inspected implementation; it does not make a general claim about future code.

### 12. Can the application build on Vercel without changing dashboard settings?

**Result: Yes for the successor preview deployment.**

Evidence:
- The repository remains a static Vite application.
- No `vercel.json`, API route, secret, or new environment variable was required.
- Vercel's Git integration cloned the successor branch and executed the integrity prebuild plus Vite production build successfully.
- No Vercel dashboard/project/domain/DNS setting was changed during this refactor.

### 13. Can a result from one hypothesis alter the status of another?

**Result: No through the implemented result/presentation path.**

Evidence:
- Original-purpose and public-heliophysics records use distinct hypothesis IDs.
- `createEvidenceViewModel` rejects result/hypothesis ID mismatches.
- `resultLoader.js` rejects cross-hypothesis evidence references.
- `tests/contracts.test.mjs`, `tests/result-loader.test.mjs`, and `tests/view-model.test.mjs` verify isolation.

### 14. Can a result survive with a changed dataset hash?

**Result: No.**

Evidence:
- `analysis-result.schema.json` requires `datasetManifestHash` (null only for non-empirical blocked-style records; a SHA-256 for empirical records).
- `resultLoader.js` requires the empirical result hash to match the registered dataset manifest fingerprint.
- `tests/result-loader.test.mjs` includes `result cannot survive a changed dataset-manifest hash`.
- The executed Vercel suite passed this test.

### 15. Can a failed audit command still produce a zero exit status?

**Result: No for the implemented verification harness.**

Evidence:
- The prebuild harness intentionally runs an invalid fixture; it was rejected with exit `1` in Vercel logs.
- The harness intentionally injects a `verify` failure; it propagated exit `17` in Vercel logs.
- `scripts/verify.mjs` exits immediately with the failing child status.
- Vercel proceeds to the production build only after the fail-closed self-tests and integrity suite pass.

## Boundary limits that remain deliberately unresolved

The successor boundary validator establishes exact-ID partition separation, grouped-unit separation, pre-analysis boundary declaration, post-result immutability, and preservation of historical leakage as `UNRESOLVED`.

It does **not** claim that temporal ordering, near-duplicate detection, or target-derived preprocessing leakage has been solved for a real BURGAMOTS experiment. Those checks require an approved target, data model, grouping/sampling semantics, and evaluation policy. UD-001, UD-002, and UD-004 therefore remain blockers. The application does not create a pretend empirical boundary to make these checks appear complete.

## Review conclusion

All 15 required adversarial checks pass for the implemented evidence-integrity scope. The passing review establishes software/evidence-contract controls only. It does not establish scientific validity, historical leakage cleanliness, or support for either BURGAMOTS scientific hypothesis.

## Post-review scientific boundary

The forcing definition is frozen. No further forcing-model modification is authorized in this integrity phase. The next scientific design artifact, when explicitly begun, is `BURGAMOTS_SOLAR_RESPONSE_SPEC_v1`; solver/PINN selection and SUN comparison occur only after that response contract is frozen.
