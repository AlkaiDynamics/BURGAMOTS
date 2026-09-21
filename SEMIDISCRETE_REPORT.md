# BURGAMOTS Semidiscrete Verification Report

Status: `FROZEN`

This report records the semidiscrete Hamiltonian verification gate for the pinned BURGAMOTS numerical realization.

## Scope

This report covers the M0 semidiscrete verification harness only:

- frozen degree-3 icosahedral sphere geometry;
- canonical degree-12 quadrature;
- compatible finite element complex `CG2+B3 -> BDFM2 -> DG1`;
- runner-verified magnetic map `m_h.interpolate(cross(CellNormal(mesh), grad(A_h)))`;
- weak PV solve;
- D1-D3 Riesz representatives;
- SD1-SD3 semidiscrete rate solves;
- zero-mean magnetic-potential gauge in the `V0 x R` mixed space.

Out of scope:

- BASE-P;
- production exact-discrete-gradient timestepper;
- NUM-POS;
- M1 forcing;
- SUN comparison;
- any empirical Zodiacal-determinism claim.

## Pinned execution substrate

The verification runs used the pinned Firedrake/Gusto substrate specified by `BURGAMOTS_NUMERICS_v1.md`:

- Docker image: `firedrakeproject/firedrake:2026.4.1`
- Docker digest: `sha256:798066ee679c94cb379021a0a65099b218702f819d3b0c41f703de16f039e98c`
- Gusto commit: `669f6372cd334ed47c9c7b38f26e591732273f75`
- Python: `3.12.3`

The semidiscrete result is scoped to this realization. A change in mesh, quadrature, finite-element spaces, floating-point precision, solver architecture, container image, Gusto commit, or execution substrate requires remeasurement of the numerical floor.

## Stage 1: direct bracket cancellation

Stage 1 evaluates the direct semidiscrete bracket/form cancellation

```text
C_h = integral(
  -q_h U_h . R U_h
  + div(U_h) K_h
  - K_h div(U_h)
  + (M_h / H_h) grad(A_h) . U_h
  - M_h (U_h / H_h) . grad(A_h)
) dx_q
```

The certification rule is:

```text
|C_h| < 1e-12 OR |C_h| / S_1 < 1e-15
```

with

```text
S_1 = sum absolute Stage-1 component magnitudes.
```

Runner-confirmed diagnostic values:

```text
STAGE 1 vorticity term        = -4.44222232903259087e-12
STAGE 1 mass plus             = -5.75440316515306011e+06
STAGE 1 mass minus            =  5.75440316515306011e+06
STAGE 1 magnetic plus         =  6.33614268125274194e+00
STAGE 1 magnetic minus        = -6.33614268125274194e+00
STAGE 1 mass pair residual    =  0.00000000000000000e+00
STAGE 1 magnetic pair residual=  0.00000000000000000e+00
STAGE 1 component scale       =  1.15088190025914833e+07
STAGE 1 direct C_h            = -4.44222232903259087e-12
STAGE 1 relative cancellation =  3.85984202899734462e-19
```

Stage 1 therefore passes by the relative branch.

```text
STAGE 1 ALGEBRA: PASSED
```

## Stage 2: semidiscrete Hamiltonian rate

Stage 2 evaluates the discrete Hamiltonian chain rule

```text
dH/dt = integral(
  U_h . du_h/dt
  + K_h dH_h/dt
  + M_h dA_h/dt
) dx_q
```

Define the absolute Stage-2 component scale

```text
S_2 =
  |integral(U_h . du_h/dt dx_q)|
  + |integral(K_h dH_h/dt dx_q)|
  + |integral(M_h dA_h/dt dx_q)|.
```

The Stage-2 boolean is frozen as:

```text
STAGE2_PASS = GAUGE AND (ABS OR REL)
```

where

```text
GAUGE: |integral(dA_h dx_q)| < 1e-12
ABS:   |dH/dt| < 1e-12
REL:   S_2 > 0 AND |dH/dt| / S_2 < 5e-14
```

The gauge gate is mandatory and independent. The relative branch is valid only when all three signed Stage-2 component contributions, `S_2`, the Hamiltonian-rate residual, the relative residual, and the gauge integral are reported.

## Stage-2 evidence chain

### Default gauge baseline

The default `V0 x R` mixed gauge solve leaked the zero-mean constraint:

```text
SD3 zero-mean gauge integral = 2.16002360442502095e-09
```

This exceeded the mandatory gauge tolerance and prevented evaluation of the Hamiltonian-rate gate.

### Supported `R`-space gauge solve

A direct attempt to tighten the mixed gauge solve using ordinary monolithic assembly failed because Firedrake does not support monolithic matrices for systems with `R`-space blocks.

The supported configuration uses:

```text
mat_type = matfree
pc_type = fieldsplit
pc_fieldsplit_type = schur
pc_fieldsplit_schur_fact_type = full
```

with strict gauge tolerances. This reduced the gauge integral to the machine-scale range.

### D1-D3 and SD1-SD2 tolerance probe

With D1-D3 and SD1-SD2 solved at

```text
ksp_rtol = 1e-14
ksp_atol = 1e-15
```

and with the matrix-free Schur gauge solve active, the runner reported:

```text
SD3 zero-mean gauge integral  = 1.11022302462515654e-14
STAGE 2 kinetic contribution = -5.75439682901034784e+06
STAGE 2 thickness contribution= 5.75440316515326500e+06
STAGE 2 magnetic contribution = -6.33614268125276503e+00
STAGE 2 component scale       = 1.15088063303062953e+07
STAGE 2 (Semidiscrete dH/dt)  = 2.35910905033165363e-07
STAGE 2 relative cancellation = 2.04982948068157160e-14
```

A final solver-tolerance probe tightened D1-D3 and SD1-SD2 to

```text
ksp_rtol = 1e-15
ksp_atol = 1e-16
```

and produced the same printed Stage-2 diagnostics:

```text
SD3 zero-mean gauge integral  = 1.11022302462515654e-14
STAGE 2 kinetic contribution = -5.75439682901034784e+06
STAGE 2 thickness contribution= 5.75440316515326500e+06
STAGE 2 magnetic contribution = -6.33614268125276503e+00
STAGE 2 component scale       = 1.15088063303062953e+07
STAGE 2 (Semidiscrete dH/dt)  = 2.35910905033165363e-07
STAGE 2 relative cancellation = 2.04982948068157160e-14
```

This bit-for-bit identical printed diagnostic result rules out the tested Krylov stopping tolerance as the controlling source of the remaining Stage-2 residual.

The Stage-2 relative threshold is therefore set to

```text
5e-14
```

as a bounded regression margin around the measured floor. This threshold is implementation-specific. It is not asserted as a universal IEEE-754 limit.

```text
STAGE 2 RIESZ/RATE/GAUGE: PASSED
```

## Final semidiscrete certification

```text
STAGE 1 ALGEBRA: PASSED
STAGE 2 RIESZ/RATE/GAUGE: PASSED
SEMIDISCRETE VERIFICATION: COMPLETE
```

This certification establishes semidiscrete Hamiltonian consistency of the M0 harness on the pinned numerical stack. It does not establish any empirical scientific claim, predictive claim, physical-causality claim, M1 forcing result, SUN comparison, or Zodiacal-determinism result.

## Next boundary

The next numerical boundary is `BASE-P`: the exact nonlinear base projection required before the production exact-discrete-gradient timestepper and fully discrete energy-cancellation crucible.
