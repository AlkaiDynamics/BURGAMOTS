# Solar Visualization Backup Report

Solar model file: `components/SolarSystemViz.tsx`
Frozen-base path: `components/SolarSystemViz.tsx`
Frozen commit: `8a9029b69b107d4230c9f053b4c8ef545a99e90e`
Frozen Git blob SHA-1: `e56d956cf927c56b24543259ccee9475ab41d6b6`
Frozen file size: `71298` bytes
Protected backup path: `protected/solar-visualization-frozen-8a9029b6.tsx`

## Source provenance

The protected backup points to the exact Git blob from the frozen commit. No source was reconstructed from the audit narrative.

`SolarSystemViz.tsx` has no direct local-module imports. Its direct code dependencies are package imports (`react`, `three`, Three.js examples modules, `lucide-react`) plus external runtime texture/font URLs embedded in the source. Therefore no additional local visualization source file is required for an exact source-code backup of this component.

## Archived functions

- `solveKepler`
- `getPlanetPositionHeliocentric`
- `getSunBarycentricOffset`
- `calculateTorqueIndex` as the historical synthetic visual driver
- Procedural planet/cloud/moon/nebula/caustic texture generators
- Three.js animation loop and shader-driven solar visual effects

## Archived data and controls

- `PLANETS_DATA` orbital elements, masses, colors, sizes, rotation periods, and tilts
- `TIME_STEPS`
- `PINN_EVENTS`
- `MIN_YEAR`, `MAX_YEAR`, `ORBIT_SCALE`, `TRAIL_STEPS`
- Barycentric visual `EXAGGERATION = 200.0`
- Date/year navigation, time-step selection, year range slider, Z-scale, orbit opacity, per-planet visibility, and OrbitControls navigation

## Archived rendering

- Three.js scene and WebGL renderer
- Time-axis/helical orbital trails
- Sun spine and barycentric visual displacement
- Planet meshes, orbital rings, asteroid belt, Earth/Moon behavior, Saturn rings
- Procedural textures and external Earth textures
- Solar surface shader, glow sprite, corona, magnetic-field effect, and global plasma field
- Background nebula/starfield

## Restoration history

An unauthorized replacement of `SolarSystemViz.tsx` was introduced during the evidence-integrity refactor and materially simplified the implementation. The successor branch was subsequently restored to the exact frozen Git blob before this archive policy was finalized. The protected backup remains the authoritative preserved source.

## Current BURGAMOTS policy

The protected source is retained for possible AYLI/product reuse. **BURGAMOTS is no longer required to keep this visualization mounted in its active paper/app.** The active application may retain or remove `SolarSystemViz.tsx` as appropriate for evidence integrity, provided that:

- `protected/solar-visualization-frozen-8a9029b6.tsx` remains byte-identical to the frozen source.
- The scientific evidence pipeline does not depend on the archived visualization.
- The synthetic cycle driver is not treated as measured physical torque or scientific evidence.
- Removing the visualization from active BURGAMOTS does not delete or rewrite the protected archive.

The archive itself must not be simplified, reconstructed, or semantically rewritten. A future AYLI migration should use this exact protected source.

## Test coverage

`tests/solar-visualization-preservation.test.mjs` verifies:

- The protected backup remains the exact frozen Git blob.
- The archived orbital/alignment implementation remains intact.
- The scientific evidence pipeline does not depend on `SolarSystemViz` or its synthetic cycle driver.
- Archive preservation does not force the visualization to remain mounted in BURGAMOTS.

## SHA-256 verification status

Exact byte identity is established by reusing the frozen Git blob object directly. A separate SHA-256 of the file contents is **not yet recorded** because the current execution environment cannot materialize the connector-fetched Git blob into the local runtime and the GitHub Actions runner has not executed repository jobs. This is a verification-tooling limitation, not a source-availability limitation.

The repository must not invent a SHA-256 value. When an execution path becomes available, the hash audit should compute SHA-256 for the frozen source and protected archive and confirm equality.

## Preservation conclusion

The original solar-system visualization source is safely archived from the frozen commit without reconstruction. That preservation no longer constrains the active BURGAMOTS UI; it constrains only the integrity of the archived source and prevents the scientific evidence pipeline from depending on the historical visualization.
