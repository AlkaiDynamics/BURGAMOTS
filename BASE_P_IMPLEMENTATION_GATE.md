# BURGAMOTS BASE-P IMPLEMENTATION GATE

## Status

This document operationalizes the frozen BASE-P contract in
`BURGAMOTS_NUMERICS_v1.md` as amended by
`BURGAMOTS_NUMERICS_AMENDMENT_A1.md`.

Current gate state:

[
\boxed{\texttt{BASE-TARGET-0: PASSED}}
]

[
\boxed{\texttt{BASE-KKT-0: PASSED}}
]

[
\boxed{\texttt{BASE-PHYS: BLOCKED}}
]

The BASE-KKT-0 criterion remains

[
\boxed{R_h^{M_0}<10^{-12}}.
]

No threshold relaxation occurred.

## BASE-TARGET-0 — deterministic projection machinery

Purpose: verify P-u, P-H, and P-A, zero-mean flux-potential gauge, compatible
DIVB, target mass preservation, positive depth, and shallow admissibility.

For deterministic targets already exactly contained in their destination FE
space, Amendment A1 realizes the projector identity (P_hv=v) directly at the
coefficient level instead of through a redundant approximate mass solve.

This gate proves finite-element target machinery only; it does not certify a
physical solar base state.

## BASE-KKT-0 — manufactured constrained stationary gate

The manufactured non-solar family is:

- `kkt0_hydro_reference`;
- `kkt0_mass_high`;
- `kkt0_mass_low`.

Under A1, the normal pinned workflow `firedrake-base-p-gate`, run
`35660880185`, passed all three members.

Observed maximum stationary rates:

[
R_h^{M_0}
=
0
quad\text{for }\texttt{kkt0_hydro_reference},
]

[
R_h^{M_0}
=
9.10485566560014774\times10^{-14}
quad\text{for each mass-offset witness}.
]

Mass error, gauge error, and DIVB were zero for all three reported members.

Thus:

[
\boxed{\texttt{BASE-KKT-0: PASSED}.}
]

## BASE-PHYS — physical preregistered ensemble

This gate remains fail-closed until the repository contains both:

1. the authoritative externally supplied/frozen observational
   (Omega_0(\theta)) record;
2. the finite preregistered toroidal magnetic family (mathfrak B_0).

Those records must be frozen independently of BURGAMOTS response outcomes.

No physical solar BASE-P state is certified until both records exist and the
actual discrete stationary projection is executed for the preregistered family.

## Parallel engineering boundary

Passing BASE-KKT-0 permits isolated engineering of generic numerical machinery
that cannot contaminate scientific choices, including:

- the exact-discrete-gradient timestepper;
- NUM-POS rejection/retry;
- an analytic synthetic forcing/work-law harness;
- paired-run infrastructure;
- non-solar BASE numerical-floor calibration.

Those branches may not consume real BURGAMOTS forcing or solar response
outcomes before the relevant scientific gates are frozen.

## Stop / advance line

Hydro debugging is closed. No further hydro forensic branch is part of the
certification plan.

The certification spine advances to:

[
\boxed{
\text{BASE numerical rule freeze}
+
\text{physical input record freeze}
\rightarrow
\text{BASE-PHYS}
}
]

while timestepper and synthetic-forcing engineering continue in parallel.
