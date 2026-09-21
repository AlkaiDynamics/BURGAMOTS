# BURGAMOTS_NUMERICAL_REALIZATION_SPEC_v1

## Status

BURGAMOTS_FORCING_LEDGER_v1: LOCKED

BURGAMOTS_TACH_SWMHD_v1: FROZEN

BURGAMOTS_BASESTATE_PROTOCOL_v1: FROZEN

BURGAMOTS_NUMERICAL_REALIZATION_SPEC_v1: FROZEN — semidiscrete architecture / primary substrate

NEXT IMPLEMENTATION GATE: M0 FIREDRAKE CRUCIBLE

M1 FORCING RUNS: NOT AUTHORIZED UNTIL M0 PASSES

PINN / learned discretization: NOT AUTHORIZED

SUN comparison: NOT AUTHORIZED

This document freezes the spatial semidiscretization architecture, Hamiltonian bracket, finite-element sequence, temporal conservation class, and M0 acceptance gates. It does not execute M0 or M1.

## 1. Numerical state and magnetic-flux representation

The physical state remains

\[
\{\mathbf u,\mathbf B,h\}.
\]

The preferred numerical state is

\[
\boxed{
\mathcal X_h
=
\{\mathbf u_h,H_h,A_h\},
}
\]

with

\[
H_h=H_0+h_h>0.
\]

Define the depth-weighted magnetic flux

\[
\boxed{
\mathbf m_h
\equiv
H_h\mathbf B_h.
}
\]

On the oriented sphere define the 90-degree tangent rotation

\[
\mathcal R\mathbf v
=
\hat{\mathbf n}\times\mathbf v
\]

and the rotated surface gradient

\[
\mathcal C_h A_h
\equiv
\nabla_h^\perp A_h
=
\mathcal R\nabla_h A_h.
\]

The magnetic flux is represented by

\[
\boxed{
\mathbf m_h
=
\mathcal C_h A_h.
}
\tag{N1}
\]

The physical magnetic field is derived, not independently evolved:

\[
\boxed{
\mathbf B_h
=
\frac{\mathbf m_h}{H_h}.
}
\tag{N2}
\]

No projection of \(\mathbf B_h\) into an independent H(div) space is part of v1. The topological variable is \(\mathbf m_h\).

## 2. Topological statement on the sphere

The relevant cohomological fact is

\[
\boxed{
H^1_{\mathrm{dR}}(S^2)=0.
}
\]

This is the first de Rham cohomology group. It must not be confused with the nonzero Sobolev space \(H^1(S^2)\).

Consequently, every smooth divergence-free tangent one-flux on \(S^2\) is globally representable by a scalar flux potential, up to an additive constant.

The discrete sequence is

\[
\boxed{
V_h^0
\xrightarrow{\;\mathcal C_h\;}
V_h^1
\xrightarrow{\;\mathcal D_h\;}
V_h^2,
}
\]

where

\[
\mathcal D_h=\nabla_h\cdot
\]

and

\[
\boxed{
\mathcal D_h\mathcal C_h\equiv0.
}
\tag{N3}
\]

Because \(H^1_{\mathrm{dR}}(S^2)=0\), the required global relation at the flux space is

\[
\boxed{
\ker\mathcal D_h
=
\operatorname{range}\mathcal C_h
}
\]

for the chosen compatible complex, modulo floating arithmetic and linear-solver tolerance.

On the closed sphere, the divergence image is the mean-zero subspace of \(V_h^2\); the constant mass mode is the expected top-degree cohomology and is not an error.

Therefore

\[
\boxed{
\nabla_h\cdot(H_h\mathbf B_h)
=
\nabla_h\cdot\mathbf m_h
=
\nabla_h\cdot\mathcal C_h A_h
\equiv0.
}
\]

The magnetic compatibility condition is built into the representation.

## 3. Primary mesh and compatible finite-element spaces

The primary mesh class is a closed curved icosahedral triangulation of the sphere with no latitude-longitude coordinate poles.

The primary minimal exact-sequence family is frozen as

\[
\boxed{
\mathrm{CG}_2
\xrightarrow{\;\nabla_h^\perp\;}
\mathrm{BDM}_1
\xrightarrow{\;\nabla_h\cdot\;}
\mathrm{DG}_0.
}
\tag{N4}
\]

Assignments:

\[
\boxed{
A_h\in V_h^0=\mathrm{CG}_2,
}
\]

\[
\boxed{
\mathbf u_h,\mathbf m_h,\mathbf F_h\in
V_h^1=\mathrm{BDM}_1,
}
\]

\[
\boxed{
H_h\in V_h^2=\mathrm{DG}_0.
}
\]

Here \(\mathbf F_h\) denotes the discrete mass flux / Hamiltonian momentum derivative defined below.

This is the lowest-order BDM compatible complex corresponding to L2 degree zero. h-refinement, not outcome-dependent p-selection, is the primary v1 convergence axis.

The geometric embedding order must be at least quadratic and must be identical for every member of a refinement comparison. Its exact fixed value is an implementation-runtime constant recorded in the run manifest, not selected from response outcomes.

No adaptive remeshing based on BURGAMOTS response magnitude is permitted in v1.

## 4. Flux-potential gauge

The physical magnetic state is invariant under

\[
A_h\mapsto A_h+c(t).
\]

Freeze the gauge

\[
\boxed{
\int_{S^2}A_h\,dA=0.
}
\tag{N5}
\]

Because material advection does not in general preserve the plain area mean of \(A_h\), this gauge is enforced algebraically rather than assumed.

The Firedrake realization must use either:

1. the quotient \(V_h^0/\mathbb R\); or
2. an \(R\)-space Lagrange multiplier \(\lambda_A(t)\).

For the second form,

\[
(\alpha_h,\partial_t A_h)
+
\left(
\alpha_h,
\frac{\mathbf F_h}{H_h}\cdot\nabla_hA_h
\right)
+
\lambda_A(\alpha_h,1)
=0,
\]

together with

\[
(\mu,\;A_h)=0
\quad
\forall\mu\in\mathbb R.
\]

The multiplier is algebraic and does not add a physical evolved state variable.

## 5. Frozen discrete Hamiltonian

Let

\[
\kappa\equiv\mu_0\rho_0.
\]

The unforced ideal semidiscrete Hamiltonian is

\[
\boxed{
\mathscr H_{0,h}
=
\int_{S^2}
\left[
\frac12H_h|\mathbf u_h|^2
+
\frac{|\mathbf m_h|^2}{2\kappa H_h}
+
\frac12g_*H_h^2
\right]dA.
}
\tag{N6}
\]

This is evaluated from the same discrete fields used by the residual.

No separately sampled magnetic energy, mass field, or velocity reconstruction may be used for the conservation audit.

## 6. Discrete functional derivatives

For any discrete functional \(F_h\), define its L2-Riesz representatives

\[
F_{\mathbf u}\in V_h^1,\qquad
F_H\in V_h^2,\qquad
F_A\in V_h^0
\]

by

\[
(\mathbf v_h,F_{\mathbf u})
=
D_{\mathbf u}F_h[\mathbf v_h],
\]

\[
(\psi_h,F_H)
=
D_HF_h[\psi_h],
\]

\[
(\alpha_h,F_A)
=
D_AF_h[\alpha_h].
\]

For the frozen Hamiltonian, define

\[
\boxed{
\mathbf F_h
\equiv
(\mathscr H_{0,h})_{\mathbf u}.
}
\]

It is the H(div)-conforming Riesz projection of \(H_h\mathbf u_h\):

\[
\boxed{
(\mathbf v_h,\mathbf F_h)
=
(\mathbf v_h,H_h\mathbf u_h)
\quad
\forall\mathbf v_h\in V_h^1.
}
\tag{N7}
\]

Define

\[
\boxed{
K_h
\equiv
(\mathscr H_{0,h})_H
}
\]

by

\[
\boxed{
(\psi_h,K_h)
=
\left(
\psi_h,
\frac12|\mathbf u_h|^2
-
\frac{|\mathbf m_h|^2}{2\kappa H_h^2}
+
g_*H_h
\right)
\quad
\forall\psi_h\in V_h^2.
}
\tag{N8}
\]

Define

\[
\boxed{
\chi_h
\equiv
(\mathscr H_{0,h})_A
}
\]

weakly by

\[
\boxed{
(\alpha_h,\chi_h)
=
\left(
\mathcal C_h\alpha_h,
\frac{\mathbf m_h}{\kappa H_h}
\right)
\quad
\forall\alpha_h\in V_h^0.
}
\tag{N9}
\]

### Important correction to the strong-form shorthand

The magnetic flux derivative is the adjoint of the rotated gradient:

\[
\frac{\delta\mathscr H_0}{\delta A}
=
\mathcal C^*
\left(
\frac{\mathbf m}{\kappa H}
\right).
\]

With the orientation convention
\(\mathcal C=\hat{\mathbf n}\times\nabla\),

\[
\mathcal C^*\mathbf v
=
\nabla_\Sigma\cdot
(\hat{\mathbf n}\times\mathbf v),
\]

equivalently the signed scalar surface curl.

It is not the ordinary expression

\[
-\nabla_\Sigma\cdot
\left(
\frac{\nabla_\Sigma^\perp A}{\kappa H}
\right).
\]

The weak identity (N9) is authoritative and is the form to encode in UFL.

## 7. Diagnostic discrete potential vorticity

Let

\[
f_C
=
2\boldsymbol\Omega_{\rm frame}\cdot\hat{\mathbf n}.
\]

Define \(q_h\in V_h^0\) by

\[
\boxed{
(\gamma_h,H_hq_h)
=
-(\mathcal C_h\gamma_h,\mathbf u_h)
+
(\gamma_h,f_C)
\quad
\forall\gamma_h\in V_h^0.
}
\tag{N10}
\]

This is a diagnostic field, not an additional prognostic variable.

## 8. Frozen antisymmetric Hamiltonian bracket

For discrete functionals \(F_h,G_h\), freeze

\[
\boxed{
\begin{aligned}
\{F_h,G_h\}_h
={}&
-\left(
q_h,\;
F_{\mathbf u}\cdot
\mathcal R G_{\mathbf u}
\right)
\\
&+
\left(
\mathcal D_hF_{\mathbf u},
G_H
\right)
-
\left(
\mathcal D_hG_{\mathbf u},
F_H
\right)
\\
&+
\left(
\frac{G_A}{H_h}\nabla_hA_h,\;
F_{\mathbf u}
\right)
-
\left(
\frac{F_A}{H_h}\nabla_hA_h,\;
G_{\mathbf u}
\right).
\end{aligned}
}
\tag{N11}
\]

This bracket is algebraically antisymmetric:

\[
\boxed{
\{F_h,G_h\}_h
=
-\{G_h,F_h\}_h.
}
\]

Therefore

\[
\boxed{
\{\mathscr H_{0,h},\mathscr H_{0,h}\}_h=0.
}
\]

Energy conservation requires only this antisymmetry.

This v1 specification does not claim that the fully discrete finite-element bracket satisfies the Jacobi identity. Until Jacobi is proved, the rigorous name is an antisymmetric Hamiltonian / almost-Poisson semidiscretization rather than an asserted discrete Poisson algebra.

No scientific result may rely on an unproved Jacobi claim.

## 9. Semidiscrete weak equations

The evolution is defined by

\[
\frac{dF_h}{dt}
=
\{F_h,\mathscr H_{0,h}\}_h.
\]

Using arbitrary test fields
\(\mathbf v_h\in V_h^1\),
\(\psi_h\in V_h^2\),
and
\(\alpha_h\in V_h^0\),
the semidiscrete equations are:

### Velocity

\[
\boxed{
\begin{aligned}
(\mathbf v_h,\partial_t\mathbf u_h)
={}&
-\left(
q_h,\;
\mathbf v_h\cdot\mathcal R\mathbf F_h
\right)
+
(\mathcal D_h\mathbf v_h,K_h)
\\
&+
\left(
\frac{\chi_h}{H_h}\nabla_hA_h,\;
\mathbf v_h
\right).
\end{aligned}
}
\tag{N12}
\]

### Thickness

\[
\boxed{
(\psi_h,\partial_tH_h)
=
-
(\psi_h,\mathcal D_h\mathbf F_h).
}
\tag{N13}
\]

### Magnetic flux potential

On the mean-zero gauge space,

\[
\boxed{
(\alpha_h,\partial_tA_h)
=
-
\left(
\alpha_h,
\frac{\mathbf F_h}{H_h}
\cdot\nabla_hA_h
\right)
}
\tag{N14}
\]

with the gauge constraint (N5), or equivalently the Lagrange-multiplier form in Section 4.

### Topological magnetic constraint

\[
\boxed{
\mathcal D_h\mathbf m_h
=
\mathcal D_h\mathcal C_hA_h
\equiv0.
}
\tag{N15}
\]

No divergence cleaning field is added.

## 10. Recovery of the frozen continuum magnetic force

The Hamiltonian depth derivative (N8) contributes the magnetic-pressure gradient through its
\(-|\mathbf m|^2/(2\kappa H^2)\) term.

The flux-potential term in (N12) contributes the complementary current/tension term.

Together, in the continuum limit, they recover

\[
\frac1{\kappa}
(\mathbf B\cdot\nabla_\Sigma)\mathbf B
\]

rather than adding a spurious independent magnetic-pressure force.

This cancellation is a required manufactured-solution/unit test of the UFL implementation.

## 11. Mass conservation

Equation (N13) and the closed sphere give

\[
\boxed{
\frac{d}{dt}
\int_{S^2}H_h\,dA
=
0.
}
\]

At the semidiscrete level this follows from the compatible divergence operator and the absence of a boundary.

The fully discrete time method must preserve this linear invariant to nonlinear-solver tolerance.

## 12. M1 forcing extension — defined but not yet authorized to run

The BURGAMOTS potential is retained as a scalar Hamiltonian contribution:

\[
\boxed{
U_{{\rm B},h}(t)
=
\int_{S^2}
\int_0^{H_h}
\Phi_{\rm B}^{S}(\theta,\phi,\zeta,t)
\,d\zeta\,dA.
}
\tag{N16}
\]

The forced Hamiltonian is

\[
\boxed{
\mathscr H_{{\rm B},h}
=
\mathscr H_{0,h}
+
U_{{\rm B},h}.
}
\tag{N17}
\]

The planetary force is never independently sampled as an acceleration vector in the primary implementation.

Its discrete force is generated by varying the same discrete potential functional.

Because

\[
\frac{\delta U_{{\rm B},h}}{\delta H_h}
=
\Phi_{\rm B}^{S}(\mathbf x_s,t)
\]

in the adopted hydrostatic reduction, the mass/depth part of the same bracket produces the surface geopotential gradient required by the frozen continuum response spec.

The forced semidiscrete energy law is

\[
\boxed{
\frac{d\mathscr H_{{\rm B},h}}{dt}
=
\frac{\partial U_{{\rm B},h}}{\partial t}.
}
\tag{N18}
\]

M1 execution remains blocked until every M0 crucible gate in Section 16 passes.

## 13. Firedrake/Gusto UFL mapping contract

Primary runtime target:

- Firedrake stable release family: 2026.4.x or a later patch explicitly pinned in the run manifest.
- Gusto compatible-space construction may be used for the de Rham complex and sphere infrastructure.
- Custom SWMHD weak forms are required; Gusto is not assumed to contain BURGAMOTS_TACH_SWMHD_v1.

Reference UFL mapping:

\`\`\`python
mesh = IcosahedralSphereMesh(
    radius=r_t,
    refinement_level=ref_level,
    degree=geometry_degree,
)
mesh.init_cell_orientations(SpatialCoordinate(mesh))

V0 = FunctionSpace(mesh, "CG", 2)
V1 = FunctionSpace(mesh, "BDM", 1)
V2 = FunctionSpace(mesh, "DG", 0)
R  = FunctionSpace(mesh, "R", 0)

W = V1 * V2 * V0 * R
\`\`\`

The \(R\) variable is the flux-potential gauge multiplier only.

On the embedded sphere:

\`\`\`python
x = SpatialCoordinate(mesh)
n = x / sqrt(dot(x, x))

def rot(v):
    return cross(n, v)

def C(A):
    return rot(grad(A))

m = C(A)
B = m / H
\`\`\`

The Hamiltonian density is:

\`\`\`python
ham0_density = (
    0.5 * H * inner(u, u)
    + inner(m, m) / (2 * mu0 * rho0 * H)
    + 0.5 * gstar * H * H
)
H0_form = ham0_density * dx
\`\`\`

The authoritative functional derivatives should be constructed through UFL directional differentiation / mass-matrix Riesz solves, not by manually coding a possibly inconsistent strong magnetic derivative.

Conceptually:

\`\`\`python
dH_du = derivative(H0_form, u, v_test)
dH_dH = derivative(H0_form, H, psi_test)
dH_dA = derivative(H0_form, A, alpha_test)
\`\`\`

The implementation must verify that these assembled directional derivatives agree with (N7)–(N9).

No runnable UFL implementation is considered validated merely because this pseudocode parses.

## 14. Time discretization

Plain explicit or implicit Runge-Kutta is not the v1 production time method.

Plain implicit midpoint is also insufficient because \(\mathscr H_{0,h}\) is nonquadratic through the magnetic term \(1/H_h\).

Freeze the temporal class as an energy-preserving discrete-gradient method.

Let \(z_h\) denote the semidiscrete coefficient vector for
\((\mathbf u_h,H_h,A_h)\).

Define the Average Vector Field discrete gradient

\[
\boxed{
\overline{\nabla}\mathscr H_0
(z^n,z^{n+1})
=
\int_0^1
\nabla\mathscr H_0
\left(
z^n+s(z^{n+1}-z^n)
\right)
\,ds.
}
\tag{N19}
\]

Choose a two-state skew operator
\(\overline{\mathbb J}_h(z^n,z^{n+1})\)
that is algebraically antisymmetric; the primary v1 construction is the semidiscrete bracket operator evaluated at the midpoint state, with all diagnostic Riesz/PV quantities recomputed consistently there.

The step is

\[
\boxed{
\frac{z^{n+1}-z^n}{\Delta t}
=
\overline{\mathbb J}_h
\,
\overline{\nabla}\mathscr H_0.
}
\tag{N20}
\]

Because the AVF gradient satisfies

\[
\mathscr H_0(z^{n+1})
-
\mathscr H_0(z^n)
=
\left\langle
\overline{\nabla}\mathscr H_0,
z^{n+1}-z^n
\right\rangle,
\]

and
\(\overline{\mathbb J}_h^{\,T}
=
-\overline{\mathbb J}_h\),

\[
\boxed{
\mathscr H_0(z^{n+1})
=
\mathscr H_0(z^n)
}
\]

for an exactly solved step.

### AVF integration requirement

The line integral in (N19) must be evaluated exactly for the implemented discrete Hamiltonian, or replaced by another discrete gradient for which the exact discrete chain rule is proved.

An ordinary finite quadrature approximation to the AVF integral does not qualify for an algebraic-energy claim unless its exactness for the present rational Hamiltonian is demonstrated.

The \(1/H_h\) magnetic term therefore requires either:

1. an analytic termwise AVF integral; or
2. a different exact discrete-gradient construction.

That implementation choice is part of the M0 coding gate, not permission to weaken N20.

### Nonlinear solver tolerance

Practical energy error is bounded by the residual of the implicit nonlinear solve and floating arithmetic.

Every run manifest must record the PETSc SNES/KSP configuration and actual convergence tolerances.

A production step that fails the nonlinear tolerance fails the conservation contract.

## 15. Primary computational substrate

Primary:

\[
\boxed{
\text{Firedrake compatible-FE core}
+
\text{custom SWMHD Hamiltonian weak forms}
+
\text{Gusto-compatible de Rham / spherical infrastructure}.
}
\]

Independent spectral verifier:

\[
\boxed{
\text{Dedalus spherical implementation}
}
\]

after the primary M0 crucible is established.

Deferred independent implementation:

\[
\boxed{
\text{custom JAX / discrete-exterior-calculus implementation}.
}
\]

Dedalus is not the primary result engine because its standard sphere examples and timesteppers do not automatically provide this weighted magnetic exact sequence plus the required algebraic Hamiltonian time law.

The custom DEC route is not rejected; it is deferred because it has substantially greater implementation risk and is most valuable as a numerically independent replication.

## 16. M0 crucible — mandatory before any BURGAMOTS forcing run

### M0-A: exact verification equilibrium

Initialize

\[
\mathcal S_{\rm verify}
=
\{\mathbf0,\mathbf0,0\},
\qquad
H_h=H_0,
\qquad
A_h=0,
\qquad
\Phi_{\rm B}=0.
\]

Required:

- the semidiscrete residual is zero to assembly/linear-solver tolerance;
- the time integrator produces no spontaneous velocity, thickness, or magnetic flux;
- mass is constant;
- \(\mathscr H_{0,h}\) is constant;
- \(\mathcal D_h\mathcal C_hA_h=0\) identically.

### M0-B: discrete physical base-state balance

For every preregistered base-state member \(k\), construct a discrete realization of the already-frozen physical base state.

Do not merely interpolate the continuum B1 solution and accept drift.

The initialization must satisfy the discrete stationary residuals

\[
\boxed{
\mathcal R_{\mathbf u,h}
=
\mathcal R_{H,h}
=
\mathcal R_{A,h}
=
0
}
\]

to the preregistered nonlinear-solver tolerance at \(t_0\).

The discrete thickness realization remains constrained by the frozen B1 physics and zero-mean gauge. It may be obtained by a deterministic balanced projection/solve, but it may not be tuned using later M1 outcomes.

For a prescribed toroidal magnetic target, construct \(A_h\) through the compatible flux representation so that \(\mathbf m_h=\mathcal C_hA_h\) is the divergence-free projection of \(H_h\mathbf B_{\rm base}\).

### M0-C: long-window invariant test

For every admitted base state:

- no secular base-state drift beyond preregistered tolerance;
- total mass remains invariant;
- flux-potential gauge remains satisfied;
- magnetic compatibility is topological;
- \(\mathscr H_{0,h}\) remains invariant to the nonlinear-solver/floating tolerance implied by N20.

### M0-D: refinement convergence

Both the scalar response/invariant diagnostics and the actual fields must converge under a predetermined h-refinement ladder.

Required state norms:

\[
\|\mathbf u_h-\mathbf u_{\rm ref}\|_{L^2},
\qquad
\|\mathbf m_h-\mathbf m_{\rm ref}\|_{L^2},
\qquad
\|H_h-H_{\rm ref}\|_{L^2},
\]

plus a compatible H(div)-sensitive norm for the flux/velocity where appropriate.

The exact tolerance and refinement ladder must be preregistered before M1.

### M0-E: rejection rule

If any M0 crucible fails, M1 execution is prohibited.

A failed M0 test may trigger numerical-method repair, but not a change to the forcing ledger, SWMHD equations, base-state family, or causal intervention.

## 17. Firedrake runtime execution status

At the time this specification was frozen, the current ChatGPT execution container did not contain Firedrake.

Therefore no M0 Firedrake solve is claimed by this document.

The first implementation run must occur in a pinned Firedrake environment. Firedrake publishes versioned Docker images and stable releases; the exact image tag and, where available, immutable image digest must be recorded before the crucible is treated as reproducible.

This environment limitation is an execution blocker only. It is not a reason to alter the numerical contract.

## 18. Magnetic-prior notation firewall

The numerical flux potential is \(A_h\).

Any scalar amplitude used to parameterize the preregistered toroidal base-field family must not use the symbol \(A\), to avoid collision with \(A_h\).

Use

\[
B_{\rm amp}
\]

for a toroidal-field amplitude and reserve \(A_h\) exclusively for the magnetic flux potential.

Any amplitude family remains subject to the already-frozen base-state admissibility gates before entering M0.

## 19. Stop line

\[
\boxed{
\texttt{BURGAMOTS\_NUMERICAL\_REALIZATION\_SPEC\_v1:
FROZEN}
}
\]

The next legitimate operation is implementation of the M0 Firedrake crucible exactly against this specification.

No M1 forcing run, solver tuning against BURGAMOTS response, PINN training, or SUN comparison is authorized before M0 passes.
