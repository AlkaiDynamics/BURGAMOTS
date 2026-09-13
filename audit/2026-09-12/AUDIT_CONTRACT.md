# BURGAMOTS Audit Contract

## Freeze record

- **Repository:** `AlkaiDynamics/BURGAMOTS`
- **Branch:** `main`
- **Commit:** `8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- **Audit date:** 2026-09-12
- **Audit mode:** evidence-gated adversarial audit; repository is read-only for this audit.
- **Product edits permitted:** none.

## Governing purpose

### Original purpose supplied by the project owner

BURGAMOTS was originally intended as a **falsification/validation instrument for zodiacal and astronomical relational efficacy**: determine whether a zodiacal/relational representation contains genuine out-of-sample predictive information rather than presuming that it does.

The exact secret expansion of the BURGAMOTS acronym is **not reconstructed in this audit**. It is not inferred from the public expansion in the repository.

### Repository-stated current purpose

At the audited commit, `metadata.json`, `Hero.tsx`, `README.md`, and `FullPaper.tsx` instead present BURGAMOTS as a deterministic heliospheric/atmospheric prediction framework based on planetary gravitational/barycentric forcing and PINNs.

**Audit consequence:** the original purpose is used as the governing audit target because it was supplied by the owner, while the repository's failure to preserve that purpose as an operational specification is itself audited as a purpose/provenance defect.

## Phenomenon intended to be falsified

Whether a prespecified zodiacal or independently derived relational representation provides incremental, reproducible predictive information on unseen data beyond ordinary astronomical state, temporal/seasonal structure, and appropriate negative controls.

## Null hypothesis

Conceptual null for the original purpose:

> Conditional on ordinary astronomical/time/seasonal information and a fair model-complexity budget, the tested zodiacal/relational representation provides **no reproducible incremental out-of-sample predictive information**.

The repository does **not** specify an executable null for this original purpose. No numerical rejection threshold is supplied here because the audit contract does not invent one.

## Alternative hypothesis

A prespecified zodiacal/relational representation provides reproducible incremental predictive information on unseen data beyond strong baselines and adversarial control representations.

## Unit of analysis

**Unresolved from the repository.** The unit depends on the target selected for the original falsification experiment, and the audited artifact does not operationalize that experiment.

This is a severity-gate item, not an invitation for the auditor to choose a unit on the project's behalf.

## Intended population/domain

**Partially recoverable.** The owner-supplied purpose is astronomical/zodiacal relational efficacy, but the repository operationalizes solar and atmospheric claims instead. The population/sampling frame for the original-purpose experiment is not specified.

## Expected direction of evidence

For the original purpose, evidence favoring the alternative would require prespecified improvement relative to strong ordinary-astronomy/time baselines and negative-control encodings on data not used to select the representation. The exact estimand and threshold are unresolved in the repository.

## Minimum evidence that would count as falsification

The repository provides no valid minimum criterion for the original purpose. Conceptually, a specific operationalized claim would be falsified by failure to obtain the prespecified incremental out-of-sample signal under an adequately discriminating design, but the numerical stopping/rejection rule must be specified by the experiment rather than invented during audit.

## Explicitly out of scope

- Editing or repairing BURGAMOTS.
- Designing the successor architecture or remediation roadmap.
- Proving or disproving astrology, heliophysics, or planetary synchronization independently of the repository artifact.
- Verifying every external literature citation as a new literature review.
- Assuming inaccessible/private scientific code or data do or do not exist elsewhere.
- Treating a successful frontend build as scientific reproduction.
- Reconstructing the secret acronym expansion without direct evidence.

## Acceptable audit evidence

1. Files and commit metadata at the frozen repository commit.
2. Executable outputs reproducibly obtainable from that commit.
3. Immutable or traceable project inputs/results when present.
4. Owner-supplied original-purpose statement, explicitly separated from repository evidence.
5. External scientific sources only when needed to interpret a stated method; they do not substitute for project-specific data/results.

## Runtime and reproduction cutoff

```text
Repository: AlkaiDynamics/BURGAMOTS
Branch: main
Commit: 8a9029b69b107d4230c9f053b4c8ef545a99e90e
Audit date: 2026-09-12
Runtime: Node v22.16.0; npm 10.9.2; Python 3.13.5
Operating system: Debian GNU/Linux 13 (trixie), Linux 6.18.44 x86_64
Local clone command: git clone --depth 1 https://github.com/AlkaiDynamics/BURGAMOTS.git /tmp/burgamots-audit-clone
Observed local clone status: unavailable in audit container; DNS resolution for github.com failed.
Repository inspection path: authenticated GitHub connector pinned to commit SHA.
Observed remote build status: Vercel commit status reported success.
GitHub Actions runs for commit: none returned.
Local npm install/lint/build execution: not performed because repository bytes could not be cloned into the local execution environment.
Scientific reproduction status: not achieved; scientific engine/data claimed by documentation are not present in the audited tree.
```

## Severity definitions

- **Critical:** invalidates the falsification purpose or makes the claimed result uninterpretable.
- **Major:** materially weakens validity but may not invalidate every possible result.
- **Minor:** clarity, maintainability, or reproducibility issue without direct validity impact.
- **Unresolved:** plausible concern not decidable from available repository evidence.

## Confidence definitions

- **High:** directly demonstrated by repository code, text, tree, or observed output.
- **Medium:** strong inference from the available structure.
- **Low:** plausible but not decidable from repository evidence.

## Stop condition

The audit ends after evidence-backed findings, adversarial self-review, reproducibility record, and the Established / Not established / Unresolved stop-line verdict. No remediation plan follows.
