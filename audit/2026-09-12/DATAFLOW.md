# BURGAMOTS Dataflow Reconstruction

## 1. Dataflow claimed by documentation

```text
JPL Horizons ephemerides ─┐
SDO / SILSO / F10.7 ──────┼→ ingestion → cleaning → temporal alignment → feature construction
ERA5 / OISST ────────────┘                                      │
                                                                  ▼
                                           DeepXDE PINN / MHD / Navier–Stokes
                                                                  │
                                     ┌────────────────────────────┴────────────────────┐
                                     ▼                                                 ▼
                                solar forecasts                                 atmospheric forecasts
                                     │                                                 │
                                     └────────→ statistical validation / claims ───────┘
```

This flow is depicted or described in `README.md`, `FullPaper.tsx`, `App.tsx`, and `components/Diagrams.tsx`.

## 2. Dataflow actually inspectable at the audited commit

```text
Hardcoded J2000-like orbital constants
        │
        ├→ simplified two-dimensional Kepler propagation
        │       └→ mass-weighted approximate solar offset × 200 visual exaggeration
        │
        └→ year
             └→ two sine waves: 11.07 y and 19.86 y
                    └→ normalized “Torque Index” in [0,1]
                           ├→ shader flare threshold / glow / corona / magnetic-field visuals
                           └→ displayed torque/resonance state

Hardcoded chart arrays/text
        ├→ Carrington “observed/predicted” chart
        ├→ Dust Bowl “observed/predicted” chart
        ├→ RMSE comparison bars
        ├→ forecast-skill curve
        ├→ Granger F-statistic bars
        ├→ SC25 comparison values
        └→ validation summary values / impact claims

Static year selection
        └→ labels such as “DeepXDE predictive mode active” / “High-Fidelity Training”
```

## 3. Boundary-by-boundary audit

| Boundary | Observed transfer | Deterministic? | Documented as scientific transform? | Evaluation leakage assessable? |
|---|---|---:|---:|---:|
| JPL/SDO/ERA5 → ingestion | No executable transfer located | N/A | Claimed, not implemented | No |
| Ingestion → preprocessing | No executable pipeline located | N/A | Diagram/text only | No |
| Preprocessing → feature construction | No scientific pipeline located | N/A | Claimed, not inspectable | No |
| Feature construction → split | No split code located | N/A | Not specified for original purpose | **No** |
| Split → model | No scientific model/training code located | N/A | DeepXDE claimed, absent | **No** |
| Model → result artifact | No model artifact/result files located | N/A | Claimed outputs appear as literals | **No** |
| Result artifact → UI claim | Hardcoded values/text → Recharts/HTML | Yes | Partially | Yes: direct source literals |
| Year → “Torque Index” | Two sine functions | Yes | Function exists, but differs from claimed physical torque | N/A |
| “Torque Index” → Sun visuals | Shader uniforms | Yes | Implemented as visualization | N/A |

## 4. Scientific evaluation boundary

No executable training/evaluation split, prospective freeze, held-out dataset, run manifest, or result-generation path was found in the audited tree. Therefore:

- **Leakage occurrence is not demonstrated.**
- **Leakage control is also not demonstrated.**
- Claims such as “blind test,” “hindcast accuracy,” and long-horizon skill cannot be tied to an inspectable evaluation boundary.

The correct audit conclusion is **boundary absent / leakage status unresolved**, not “leakage definitely occurred.”

## 5. Visualization transform caveat

`SolarSystemViz.tsx` explicitly applies visual transformations, including a factor-200 barycentric offset and a nonlinear orbital-radius transform. Such transforms are acceptable for visualization by themselves. They become validity-relevant only where visual clustering or apparent physical behavior is treated as evidence without a separately computed, prespecified statistic.
