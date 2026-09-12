# BURGAMOTS Evidence-Integrity Implementation Plan

## Frozen inputs

- Base: `main@8a9029b69b107d4230c9f053b4c8ef545a99e90e`
- Successor: `refactor/evidence-integrity`
- Audit: `audit/2026-09-12/`
- Reasoning: `REFRACTOR_REASONING.md`
- Protected solar source: `components/SolarSystemViz.tsx` at frozen blob `e56d956cf927c56b24543259ccee9475ab41d6b6`

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

## Protected product constraint — solar visualization

`SolarSystemViz.tsx` and all planetary alignment/orbital-position logic are protected product functionality. Preserve the existing model, planetary data, date/year controls, Three.js rendering, animation, helical/orbital visualization, solar visual effects, and user-visible alignment behavior.

Do **not** replace, simplify, remove, or materially alter:

- `PLANETS_DATA` or its orbital elements.
- `solveKepler`, `getPlanetPositionHeliocentric`, or `getSunBarycentricOffset`.
- The barycentric visual exaggeration or nonlinear display transformations.
- The date/year controls or timeline interaction.
- The Three.js scene, helical tunnel, orbital trails, shaders, glow, corona, magnetic-field effect, plasma-field effect, or animation merely because some effects are illustrative.
- The existing cycle-driven visual behavior.

Only narrowly scoped labels, disclosures, status metadata, or tests may be changed in this integrity phase to distinguish astronomical/educational visualization from empirical solar forecasting or physical-torque validation. Any proposed change to orbital calculations, planetary data, rendering behavior, or visual output requires explicit user authorization.

The synthetic periodic visual driver may remain for novelty and visual behavior. It must be described as synthetic/illustrative rather than measured physical torque and must be blocked from empirical result/evidence manifests.

The protected exact frozen source is stored at `protected/solar-visualization-frozen-8a9029b6.tsx`. Preservation status is documented in `SOLAR_VISUALIZATION_BACKUP_REPORT.md` and guarded by `tests/solar-visualization-preservation.test.mjs`.

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

The protected solar visualization is a parallel product feature, not an empirical-result source:

```text
protected solar visualization
  → modeled/illustrative display only
  ├─ planetary alignment/date exploration
  ├─ preserved visual effects
  └─ explicit semantic disclosure

scientific evidence pipeline
  → separate contracts/provenance/boundaries/results
```

No real dataset, statistical method, physical torque model, DeepXDE runtime, or scientific result is selected in this phase.

## Change plan

1. **Contracts** — Add language-neutral JSON Schemas for hypothesis, dataset, transformation, boundary, leakage check, analysis config, run metadata, result and claim status; add fail-closed runtime validation.
2. **Claim policy** — Centralize `BLOCKED`, `ILLUSTRATIVE`, `EXPLORATORY`, `NEGATIVE_NULL_FAVORING`, `EVALUATED`, `VALIDATED`, `UNRESOLVED`; prohibit unsupported promotion; isolate original-purpose and public-heliophysics IDs.
3. **Provenance/boundary/executor** — Validate hashes/reference chains and boundary invariants; create executor interface only. Historical leakage remains unresolved.
4. **Protected solar visualization** — Preserve `SolarSystemViz.tsx` behavior and source-level orbital/rendering machinery. Add only non-destructive semantic disclosure around the existing synthetic cycle/forecast language. Do not rebuild or replace the component. The synthetic cycle driver may continue to drive the same visual effects, but it cannot feed empirical result manifests or be presented as measured physical torque.
5. **UI** — Replace active hardcoded validation/performance presentation outside the protected visualization with manifest-derived blocked/illustrative evidence panels. Historical result components may be removed from active scientific-claim paths while their source remains preserved. Any change involving `SolarSystemViz.tsx` is constrained by the protected-product section above.
6. **Verification harness** — Use Node’s built-in test runner and repository scripts; add contract/policy/provenance/boundary/fixture/claim tests, `reproduce`, fail-closed `verify`, and solar-visualization preservation regression tests. No scientific dependency is added.
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
- Replace, simplify, remove, or materially alter the protected solar visualization, orbital calculations, planetary data, helical tunnel, date controls, animation, or visual output without explicit user authorization.
