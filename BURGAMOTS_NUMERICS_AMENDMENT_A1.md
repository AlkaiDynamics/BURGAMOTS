# BURGAMOTS_NUMERICS_v1 — Amendment A1

## Status

[
\boxed{\texttt{A1: ADOPTED — COEFFICIENT-SPACE CASIMIR CENTERING}}
]

Adoption evidence:

- binary amendment workflow: `coefficient-centered-amendment-gate`;
- successful run: `35660436424`;
- tested commit: `b9ef759751a3cb4d3edf61882314fc414b9db6c4`;
- pinned Firedrake/Gusto environment unchanged;
- BASE-KKT-0 threshold unchanged at (R_h^{M_0}<10^{-12});
- Stage-2 acceptance criteria unchanged.

## 1. Scope

This amendment changes only the numerical representative of the gravitational
Casimir-equivalent contribution. It does **not** change:

- the continuum SWMHD equations;
- the physical state ({u_h,H_h,A_h});
- (H_0), (g_*), magnetic physics, or the magnetic prior;
- mesh, geometry, compatible FE spaces, or quadrature;
- the forcing firewall or M0/M1 semantics;
- any frozen acceptance threshold.

## 2. Derived coefficient-space anomaly

Let (H_{0,h}in DG_1) be the exactly represented constant background field:

[
H_{0,h}\equiv H_0
]

coefficient-wise. Define the non-prognostic derived field

[
\boxed{\eta_h := H_h-H_{0,h}}
]

by coefficient-space subtraction in the same (DG_1) space.

No UFL evaluation of `H_h - H0` is used to construct this derived FE field.

## 3. Centered Hamiltonian representative

The adopted discrete representative is

[
\boxed{
\widetilde{\mathscr H}_{0,h}
=
\int
\left[
\frac12H_h|u_h|^2
+
\frac{|m_h|^2}{2\kappa H_h}
+
\frac12g_*\eta_h^2
\right]dx_q .
}
]

It differs from the previous uncentered Hamiltonian only by the mass Casimir
and a constant when evaluated on the same discrete mass functional, so the
continuum dynamics are unchanged.

The gravitational D2 contribution is

[
\boxed{K_{g,h}=g_*\eta_h.}
]

For the exact discrete-gradient timestepper,

[
\eta_h^{\pm}=H_h^{\pm}-H_{0,h}
]

coefficient-wise and

[
\boxed{
\bar K_g
=
\frac{g_*}{2}
(\eta_h^+ + \eta_h^-).
}
]

The energy and derivative representations must not be mixed.

## 4. Exact reproduction of in-space verification targets

For deterministic verification targets already exactly contained in their
destination FE space, the canonical projector identity

[
P_hv=v
\quad\forall v\in V_h
]

is realized directly at the coefficient level instead of by a redundant
iterative mass solve. This is an implementation of the existing projection
definition, not a new projection operator.

## 5. Gate evidence

For `kkt0_hydro_reference`:

[
\eta_h=0,quad K_h=0,quad
\|\dot u_h\|=\|\dot H_h\|=\|\dot A_h\|=0,
]

hence

[
\boxed{R_h^{M_0}=0<10^{-12}.}
]

For the existing nontrivial Stage-2 state:

[
|d\widetilde{\mathscr H}_{0,h}/dt|
=
2.86293655449298967\times10^{-10},
]

with component scale

[
S_2=1.15088063303053919\times10^7
]

and relative cancellation

[
\boxed{
R_2=2.48760511935473687\times10^{-17}
<
5\times10^{-14}.
}
]

Therefore both predeclared pass conditions were met.

## 6. Superseded diagnostic interpretation

The earlier uncentered hydro residual is retained as diagnostic evidence of
constant-mode amplification in the pinned floating-point realization. It is
not the adopted gravitational representative after A1.

No further hydro forensic branch is authorized by this amendment.

## 7. Next certification spine

Hydro BASE-KKT-0 debugging is closed. The next scientific certification work is
the non-solar BASE cancellation-floor calibration and then BASE-PHYS once its
external (Omega_0(\theta)) and finite magnetic-family records are frozen.

Parallel timestepper and synthetic-work-law engineering remain isolated until
their own gates are satisfied.
