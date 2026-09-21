# BURGAMOTS Evidence-Integrity Implementation Plan

## Frozen inputs

- Base: `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Successor: `refactor/evidence-integrity`
- Audit: `audit/2026-09-12/`
- Reasoning: `REFRACTOR_REASONING.md`

## Discovery inventory

| Field | Confirmed value |
|---|---|
| Package manager | npm (`package-lock.json`) |
| Primary language | TypeScript / TSX |
| UI framework | React 18.2 |
| Build system | Vite 5.1 |
| Visualization | Three.js 0.160; Recharts 2.12 |
| Build | `npm run build` → `vite build` |
| Development | `npm run dev` → `vite` |
| Existing tests | none at frozen base |
| Existing type/lint check | `npm run lint` → `tsc --noEmit` |
| Deployment | Vercel commit integration; preservation commit status succeeded |
| `vercel.json` | absent |
| API/server layer | absent from inspected tree |
| Runtime env reads | none found for `import.meta.env` or `process.env` |
| README-only env reference | `GEMINI_API_KEY`; no runtime reader found |

`index.html` contains a stale browser import map whose versions differ from `package.json`; Vite/package-lock remain the build dependency source.

## Scientific blockers

`UD-001` target/unit/estimand; `UD-002` authoritative data; `UD-003` primary null/control family; `UD-004` evaluation/confirmatory policy. The real scientific experiment remains blocked while any is unresolved.

## Legacy demo purge policy

The user has superseded the earlier in-repository visualization-preservation policy. Obsolete demo-era scientific-looking numbers, validation-style components, synthetic cycle claims, and dormant visualization source are to be removed from the BURGAMOTS successor branch.

The immutable historical audit under `audit/2026-09-12/` remains the only in-repository record of those purged claims. No active source, fixture, current documentation, or scientific result path may depend on them.

The purge is enforced by `npm run audit:legacy-numbers`.

## Selected architecture

```text
frozen audit
  → JSON evidence contracts
  → runtime validator
  → claim-state policy
  → provenance + evaluation-boundary validators
  → scientific-executor interface (validation plumbing only)
  → result-manifest loader
  → derived evidence view model
  → React UI
```

No real dataset, statistical method, physical torque model, DeepXDE runtime, or scientific result is selected in this phase.

## Change plan

1. **Contracts** — Add language-neutral JSON Schemas for hypothesis, dataset, transformation, boundary, leakage check, analysis config, run metadata, result and claim status; add fail-closed runtime validation.
2. **Claim policy** — Centralize `BLOCKED`, `ILLUSTRATIVE`, `EXPLORATORY`, `NEGATIVE_NULL_FAVORING`, `EVALUATED`, `VALIDATED`, `UNRESOLVED`; prohibit unsupported promotion; isolate original-purpose and public-heliophysics IDs.
3. **Provenance/boundary/executor** — Validate hashes/reference chains and boundary invariants; create executor interface only. Historical leakage remains unresolved.
4. **Legacy demo purge** — Remove obsolete demo numeric claims and dormant claim-bearing components from the successor branch while preserving the immutable audit record.
5. **UI conversion** — Remove hardcoded validation/performance presentation from active claim paths. Present the original-purpose hypothesis as `BLOCKED`, the public heliophysics proposal as a separate `BLOCKED` record, absent scientific systems as `PROPOSED — NOT CURRENTLY IMPLEMENTED`, and scientific numbers only through validated result manifests or explicit illustrative fixtures.
6. **Verification harness** — Use Node’s built-in test runner and repository scripts; add contract/policy/provenance/boundary/fixture/claim tests, `reproduce`, fail-closed `verify`, and a repository-wide legacy-number purge audit. No scientific dependency is added.
7. **Documentation/review** — Rewrite active README/metadata only after runtime behavior is stable; create `IMPLEMENTATION_REVIEW.md` and `IMPLEMENTATION_REPORT.md` after verification.

## Vercel compatibility

Keep the application a static Vite build. Add no API route, secret, environment variable, domain/project setting, framework preset, or Vercel dashboard requirement. Existing Vercel integration remains untouched.

## Stop conditions

Stop before any action that would:

- Choose `UD-001`–`UD-004`.
- Acquire empirical data.
- Define or substitute a physical torque model.
- Add DeepXDE/Python scientific packages.
- Change Vercel project/dashboard settings.
- Invent scientific thresholds/results/provenance.
- Reintroduce purged demo-era scientific-looking numbers or synthetic claim terminology outside the immutable audit record.

## Scientific handoff after integrity cleanup

The forcing layer is frozen as `BURGAMOTS_FORCING_LEDGER_v1`. The next scientific unit of work is `BURGAMOTS_SOLAR_RESPONSE_SPEC_v1`, which must define allowed forcing-ledger inputs, solar state variables, governing response physics, and null-versus-forced experiment design before any solver or PINN architecture is selected. The forcing object itself is not to be modified, and SUN comparison remains out of scope at this checkpoint.
