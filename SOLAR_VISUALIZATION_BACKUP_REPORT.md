# Solar Visualization Backup Report

Solar model file: `components/SolarSystemViz.tsx`
Frozen-base path: `components/SolarSystemViz.tsx`
Successor path: `components/SolarSystemViz.tsx`
Frozen commit: `8a9029b69b107d4230c9f053b4c8ef545a99e90e`
Frozen Git blob SHA-1: `e56d956cf927c56b24543259ccee9475ab41d6b6`
Frozen file size: `71298` bytes
Protected backup path: `protected/solar-visualization-frozen-8a9029b6.tsx`

## Source provenance

The protected backup and restored successor component point to the exact Git blob from the frozen commit. No source was reconstructed from the audit narrative.

`SolarSystemViz.tsx` has no direct local-module imports. Its direct code dependencies are package imports (`react`, `three`, Three.js examples modules, `lucide-react`) plus external runtime texture/font URLs embedded in the source. Therefore no additional local visualization source file is required for an exact source-code backup of this component.

## Preserved functions

- `solveKepler`
- `getPlanetPositionHeliocentric`
- `getSunBarycentricOffset`
- `calculateTorqueIndex` (protected as the existing visual driver; evidence use remains separately prohibited)
- Procedural planet/cloud/moon/nebula/caustic texture generators
- Three.js animation loop and shader-driven solar visual effects

## Preserved data

- `PLANETS_DATA` orbital elements, masses, colors, sizes, rotation periods, and tilts
- `TIME_STEPS`
- `PINN_EVENTS` historical visual markers (future semantic relabeling may be proposed separately; no behavior/data change is authorized here)
- `MIN_YEAR`, `MAX_YEAR`, `ORBIT_SCALE`, `TRAIL_STEPS`
- Barycentric visual `EXAGGERATION = 200.0`

## Preserved controls

- Date/year navigation
- CTRL/meta + scroll time navigation
- Time-step selection
- Year range slider
- Z-scale control
- Orbit opacity control
- Per-planet orbit visibility controls
- OrbitControls camera navigation

## Preserved rendering

- Three.js scene and WebGL renderer
- Time-axis/helical orbital trails
- Sun spine and barycentric visual displacement
- Planet meshes, orbital rings, asteroid belt, Earth/Moon behavior, Saturn rings
- Procedural textures and external Earth textures
- Solar surface shader, glow sprite, corona, magnetic-field effect, and global plasma field
- Background nebula/starfield

## Changed behavior

An unauthorized replacement of `SolarSystemViz.tsx` was introduced on the successor branch during the evidence-integrity refactor. That replacement simplified the orbital/rendering implementation and therefore violated the product-preservation boundary.

This report accompanies restoration of the active component to the exact frozen Git blob. The unauthorized rewrite is not retained as the active implementation.

## Unintended differences after restoration

None are authorized. The restored active file and protected backup use the same frozen Git blob SHA-1.

## Test coverage

`tests/solar-visualization-preservation.test.mjs` verifies:

- The protected backup remains the exact frozen Git blob.
- `SolarSystemViz` remains mounted in `App.tsx`.
- Planetary data/orbital elements remain present.
- Kepler position calculation and barycentric visual-offset logic remain present.
- Date/year controls remain present.
- Three.js WebGL and OrbitControls paths remain present.
- Helical/orbital trail rendering remains present.
- Solar shader/glow/corona/magnetic/plasma visual paths remain present.
- The implementation is not replaced by a placeholder or drastically reduced substitute.

## SHA-256 verification status

Exact byte identity is established now by reusing the frozen Git blob object directly. A separate SHA-256 of the file contents is **not yet recorded in this report** because the current execution environment cannot materialize the connector-fetched Git blob into the local runtime and the GitHub Actions runner is presently not executing jobs. This is a verification-tooling limitation, not a source-availability limitation.

The repository must not claim a SHA-256 value until it is actually computed from the exact restored bytes. A follow-up hash audit should populate SHA-256 for both `components/SolarSystemViz.tsx` and `protected/solar-visualization-frozen-8a9029b6.tsx`; they must be identical.

## Hard preservation constraint

`SolarSystemViz.tsx` and all planetary alignment/orbital-position logic are protected product functionality. Preserve the existing model, planetary data, date/year controls, Three.js rendering, animation, helical/orbital visualization, solar visual effects, and user-visible alignment behavior. Do not replace, simplify, remove, or materially alter them. Only narrowly scoped labels, disclosures, status metadata, or tests may be proposed to distinguish visualization from empirical forecasting. Any proposed change to orbital calculations, planetary data, rendering behavior, or visual output requires explicit user authorization.

The synthetic periodic visual driver may remain for novelty/visual behavior. It must not be treated as measured physical torque or as evidence of forecast validity.
