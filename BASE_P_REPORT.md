# BURGAMOTS BASE-P status report

## Current status

[
\boxed{\texttt{BASE-KKT-0: PASSED}}
]

[
\boxed{\texttt{BASE-PHYS: BLOCKED — MISSING FROZEN PHYSICAL INPUT RECORDS}}
]

The hydro debugging sequence is closed. Numerical Amendment A1
(`BURGAMOTS_NUMERICS_AMENDMENT_A1.md`) is adopted and authoritative.

## Frozen contracts preserved

The following remain authoritative:

- `BURGAMOTS_FORCING_LEDGER_v1`: locked.
- `BURGAMOTS_TACH_SWMHD_v1`: frozen.
- `BURGAMOTS_BASESTATE_PROTOCOL_v1`: frozen.
- `BURGAMOTS_NUMERICS_v1`: frozen as amended by A1.
- BASE-KKT-0 acceptance: (R_h^{M_0}<10^{-12}), unchanged.
- Stage-2 semidiscrete acceptance criteria: unchanged.

A1 changes only the discrete gravitational Hamiltonian representative to the
coefficient-space Casimir-centered form. It does not change the continuum
equations, physical state, FE complex, mesh, quadrature, magnetic prior,
forcing semantics, or the BASE-KKT-0 threshold.

## A1 adoption evidence

Binary amendment gate:

- workflow: `coefficient-centered-amendment-gate`;
- run: `35660436424`;
- tested commit: `b9ef759751a3cb4d3edf61882314fc414b9db6c4`;
- conclusion: success.

For `kkt0_hydro_reference` under coefficient-space centering:

[
\eta_h=0,qquad K_h=0,
]

and

[
\|\dot u_h\|_{L^2}
=
\|\dot H_h\|_{L^2}
=
\|\dot A_h\|_{L^2}
=
0.
]

Thus

[
\boxed{R_h^{M_0}=0<10^{-12}.}
]

The same binary gate retained the existing Stage-2 criterion and measured

[
R_2=2.48760511935473687\times10^{-17},
]

so the semidiscrete energy certification remained inside its frozen criterion.

## Normal certification reruns after A1

### BASE-KKT-0

Normal workflow:

- workflow: `firedrake-base-p-gate`;
- run: `35660880185`;
- certification head: `3c5949327796c4fa4cdcf4775e5e6fd0f6452c02`;
- conclusion: success.

Observed members:

| Member | (R_h^{M_0}) | Mass error | Gauge | DIVB |
|---|---:|---:|---:|---:|
| `kkt0_hydro_reference` | (0) | (0) | (0) | (0) |
| `kkt0_mass_high` | (9.10485566560014774\times10^{-14}) | (0) | (0) | (0) |
| `kkt0_mass_low` | (9.10485566560014774\times10^{-14}) | (0) | (0) | (0) |

The workflow reported:

`BASE-KKT-0: PASSED`

### Semidiscrete Stage-2

Normal workflow:

- workflow: `firedrake-semidiscrete-gate`;
- run: `35660877982`;
- conclusion: success.

Observed:

[
|d\widetilde{\mathscr H}_{0,h}/dt|
=
2.86293655449298967\times10^{-10},
]

[
S_2=1.15088063303053919\times10^7,
]

[
R_2=2.48760511935473687\times10^{-17}.
]

The workflow reported:

`SEMIDISCRETE GATE: PASSED`

## Meaning of BASE-KKT-0 pass

This pass establishes the deterministic manufactured stationary BASE
implementation gate on the pinned stack under A1. It does not certify the
physical solar base-state ensemble.

The physical gate remains blocked because the repository still lacks both
authoritative frozen inputs:

1. an externally supplied/frozen observational (Omega_0(\theta)) record;
2. a finite preregistered toroidal magnetic-prior family
   (mathfrak B_0).

Neither may be invented by the numerical implementation or selected using
BURGAMOTS response outcomes.

## Parallel engineering state

Parallel engineering is now authorized on isolated branches. This does not
advance BASE-PHYS or expose the implementation to real BURGAMOTS forcing.

- exact-discrete-gradient / NUM-POS engineering: isolated;
- synthetic time-dependent potential / work-law engineering: isolated;
- non-solar BASE cancellation-floor calibration: isolated.

No real M1 ephemeris forcing or solar observations have been consumed by those
engineering branches.

## Current certification spine

[
\boxed{
\text{A1 adopted}
\rightarrow
\text{BASE-KKT-0 passed}
\rightarrow
\text{freeze BASE numerical rule}
\rightarrow
\text{freeze physical base records}
\rightarrow
\text{BASE-PHYS}
}
]

The timestepper and synthetic-work-law lanes proceed in parallel rather than
serially blocking this spine.
