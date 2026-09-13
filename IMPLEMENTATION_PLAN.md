# BURGAMOTS Evidence-Integrity Implementation Plan

## Frozen inputs

- Base: `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Successor: `refactor/evidence-integrity`
- Audit: `audit/2026-09-12/`
- Reasoning: `REFRACTOR_REASONING.md`
- Frozen solar source blob: `e56d956cf927c56b24543259ccee9475ab41d6b6`
- Protected archive: `protected/solar-visualization-frozen-8a9029b6.tsx`

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

## Solar visualization archive policy

The exact frozen `SolarSystemViz.tsx` implementation is preserved at `protected/solar-visualization-frozen-8a9029b6.tsx` using the same Git blob as the audited baseline. It is retained as protected source for possible AYLI/product reuse.

This archive constraint is intentionally separate from the active BURGAMOTS application. BURGAMOTS is **not required** to keep `SolarSystemViz.tsx` mounted or to preserve the historical visualization inside the current paper/app. The active application may retain or remove it according to evidence-integrity needs, provided that:

- The protected archive remains byte-identical to the frozen source.
- The scientific evidence pipeline does not depend on the archived visualization.
- No active claim treats the synthetic cycle driver as measured physical torque or empirical evidence.
- Removal from the active app does not delete or rewrite the protected archive.

Do not replace the protected archive with a reconstructed or simplified version. Any future migration of the visualization into AYLI should use the protected source, not the audit narrative.

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

The archived solar visualization is outside the evidence pipeline:

```text
protected solar archive (AYLI-bound/product preservation)
  └─ no scientific claim authority

scientific evidence pipeline
  → contracts/provenance/boundaries/results
  → derived view model
  → active BURGAMOTS UI
```

No real dataset, statistical method, physical torque model, DeepXDE runtime, or scientific result is selected in this phase.

## Change plan

1. **Contracts** — Add language-neutral JSON Schemas for hypothesis, dataset, transformation, boundary, leakage check, analysis config, run metadata, result and claim status; add fail-closed runtime validation.
2. **Claim policy** — Centralize `BLOCKED`, `ILLUSTRATIVE`, `EXPLORATORY`, `NEGATIVE_NULL_FAVORING`, `EVALUATED`, `VALIDATED`, `UNRESOLVED`; prohibit unsupported promotion; isolate original-purpose and public-heliophysics IDs.
3. **Provenance/boundary/executor** — Validate hashes/reference chains and boundary invariants; create executor interface only. Historical leakage remains unresolved.
4. **Solar archive preservation** — Keep the exact frozen visualization in `protected/`; do not make the scientific evidence pipeline depend on it. Active BURGAMOTS may omit the visualization.
5. **UI conversion** — Remove hardcoded validation/performance presentation from active claim paths. Present the original-purpose hypothesis as `BLOCKED`, the public heliophysics proposal as a separate `BLOCKED` record, absent scientific systems as `PROPOSED — NOT CURRENTLY IMPLEMENTED`, and scientific numbers only through validated result manifests or explicit illustrative fixtures.
6. **Verification harness** — Use Node’s built-in test runner and repository scripts; add contract/policy/provenance/boundary/fixture/claim tests, `reproduce`, fail-closed `verify`, and protected-archive regression tests. No scientific dependency is added.
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
- Delete, rewrite, or reconstruct the protected frozen solar archive.
