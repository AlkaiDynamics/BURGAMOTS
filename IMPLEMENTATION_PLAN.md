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
| Existing tests | none |
| Existing type/lint check | `npm run lint` → `tsc --noEmit` |
| Deployment | Vercel commit integration; preservation commit status succeeded |
| `vercel.json` | absent |
| API/server layer | absent from inspected tree |
| Runtime env reads | none found for `import.meta.env` or `process.env` |
| README-only env reference | `GEMINI_API_KEY`; no runtime reader found |

`index.html` contains a stale browser import map whose versions differ from `package.json`; Vite/package-lock remain the build dependency source.

## Scientific blockers

`UD-001` target/unit/estimand; `UD-002` authoritative data; `UD-003` primary null/control family; `UD-004` evaluation/confirmatory policy. The real scientific experiment remains blocked while any is unresolved.

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
4. **Synthetic visualization** — Rename the current sine-wave “Torque Index” to an explicitly dimensionless illustrative harmonic/cycle value; preserve only visual use; remove PINN/training/validation implications from year selection.
5. **UI** — Replace active hardcoded validation/performance presentation with manifest-derived blocked/illustrative evidence panels. Remove `ValidationCharts`, `FlareCorrelationChart`, `SolarCycleChart`, and `FullPaper` from active imports/rendering; retain their historical source files in the repository and frozen baseline.
6. **Verification harness** — Use Node’s built-in test runner and repository scripts; add contract/policy/provenance/boundary/fixture/claim tests, `reproduce`, and fail-closed `verify`. No scientific dependency is added.
7. **Documentation/review** — Rewrite active README/metadata to describe only implemented behavior; create `IMPLEMENTATION_REVIEW.md` and `IMPLEMENTATION_REPORT.md` after verification.

## Vercel compatibility

Keep the application a static Vite build. Add no API route, secret, environment variable, domain/project setting, framework preset, or Vercel dashboard requirement. Existing Vercel integration remains untouched.

## Stop conditions

Stop before any action that would choose `UD-001`–`UD-004`, acquire empirical data, define physical torque, add DeepXDE/Python scientific packages, change Vercel project/dashboard settings, or invent scientific thresholds/results/provenance.