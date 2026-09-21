# BURGAMOTS BASE-P IMPLEMENTATION GATE

## Status

This document operationalizes the already-frozen BASE-P contract in
`BURGAMOTS_NUMERICS_v1.md`. It does not modify that contract.

The implementation is intentionally split into three evidence gates.

### BASE-TARGET-0 — deterministic projection machinery

Purpose: verify P-u, P-H, and P-A, together with the zero-mean flux-potential
gauge, compatible DIVB, target mass preservation, positive depth, and shallow
admissibility.

Input: a deliberately manufactured, explicitly non-solar axisymmetric state.

This gate proves only that the deterministic finite-element target machinery is
implemented correctly. It does **not** certify the physical solar base state.

### BASE-KKT-0 — constrained stationary minimization

Purpose: implement the actual BASE-P problem

[
\mathcal S_{{\rm base},h}
=
\arg\min_{\mathcal S_h}
\mathfrak D_h(\mathcal S_h,\widehat{\mathcal S}_h)
]

subject to the frozen constraints:

- (R_h^{M_0}(\mathcal S_h)=0);
- target mass preservation;
- zero-mean (A_h) gauge;
- (H_h>0).

The KKT/nonlinear solve must use no M1 information. A missing stationary
minimizer is a BASE failure. Multiple minimizers surviving the frozen
uniqueness tolerance are also a BASE failure.

### BASE-PHYS — physical preregistered ensemble

This gate remains blocked until the repository contains both:

1. the externally supplied/frozen observational (Omega_0(\theta)) record;
2. the finite preregistered toroidal magnetic family (mathfrak B_0).

Those inputs may not be invented by the numerical implementation and may not
be selected using BURGAMOTS outcomes.

## Stop line

Passing BASE-TARGET-0 does not authorize M1 and does not constitute BASE-P.
The next numerical implementation after BASE-TARGET-0 is BASE-KKT-0.
