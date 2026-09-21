# BURGAMOTS_NUMERICS_v1

## Status

\[
\boxed{\texttt{BURGAMOTS\_NUMERICS\_v1: FROZEN}}
\]

This is the authoritative numerical contract for the unforced BURGAMOTS tachocline SWMHD realization. It supersedes the earlier draft in \`BURGAMOTS_NUMERICAL_REALIZATION_SPEC_v1.md\`.

**Amendment A1 is adopted and authoritative:** \`BURGAMOTS_NUMERICS_AMENDMENT_A1.md\`. A1 changes only the gravitational Hamiltonian representative to coefficient-space Casimir centering; all frozen physics, spaces, mesh, quadrature, forcing semantics, and pre-existing acceptance thresholds remain unchanged.

Upstream objects remain unchanged:

- \`BURGAMOTS_FORCING_LEDGER_v1\`: LOCKED.
- \`BURGAMOTS_TACH_SWMHD_v1\`: FROZEN.
- \`BURGAMOTS_BASESTATE_PROTOCOL_v1\`: FROZEN.

No M1 forcing run, response-dependent tuning, PINN training, or SUN comparison is authorized before the M0 crucible passes.

## 1. Pinned computational substrate

Primary implementation substrate:

\[
\boxed{
\text{Firedrake compatible FE}
+
\text{Gusto compatible spaces}
+
\text{custom BURGAMOTS SWMHD forms}
}
\]

Pinned v1 environment:

- Firedrake Docker image: \`firedrakeproject/firedrake:2026.4.1\`
- Image digest: \`sha256:798066ee679c94cb379021a0a65099b218702f819d3b0c41f703de16f039e98c\`
- Gusto source commit: \`669f6372cd334ed47c9c7b38f26e591732273f75\`

Any later environment change creates a new numerical implementation version; it does not silently replace v1.

## 2. Mesh and geometry

Use a closed generalized icosahedral sphere:

\[
\boxed{
S^2_{\rm ico},
\qquad
p_{\rm geom}=3.
}
\]

The mesh topology and coordinate degree are identical between all M0/M1/control arms and all base-state members at a given refinement.

No response-dependent remeshing is permitted.

## 3. Compatible de Rham complex

The primary exact-sequence spaces are frozen as

\[
\boxed{
V_h^0
=
CG_2\oplus B_3
\;\xrightarrow{\nabla_h^\perp}\;
V_h^1
=
BDFM_2
\;\xrightarrow{\nabla_h\cdot}\;
V_h^2
=
DG_1.
}
\tag{DR}
\]

Assignments:

\[
A_h\in V_h^0,
\qquad
\mathbf u_h,\mathbf m_h,\mathbf F_h\in V_h^1,
\qquad
H_h\in V_h^2.
\]

The Gusto construction is

\`\`\`python
spaces = Spaces(mesh)
spaces.build_compatible_spaces(
    family="BDFM",
    horizontal_degree=1,
)

V0 = spaces.H1
V1 = spaces.HDiv
V2 = spaces.L2
\`\`\`

The physical state remains \(\{\mathbf u,\mathbf B,\eta\}\); the numerical state is

\[
\boxed{
\mathcal X_h=\{\mathbf u_h,H_h,A_h\}.
}
\]

Define

\[
\boxed{
\mathbf m_h=H_h\mathbf B_h=\nabla_h^\perp A_h,
\qquad
\mathbf B_h=\mathbf m_h/H_h.
}
\]

The compatible differential operator is the de Rham map from \(V_h^0\) into \(V_h^1\). An arbitrary L2 projection of an extrinsic cross-product expression into BDFM is forbidden.

For the pinned Firedrake/Gusto v1 stack, VERIFY-0 establishes the concrete commuting realization:

```python
m_h = Function(V1)
m_h.interpolate(cross(CellNormal(mesh), grad(A_h)))
```

The symbolic `CellNormal(mesh)` is required. Gusto's `domain.perp` helper is not the v1 magnetic-flux map because it first interpolates the cell normal into a DG vector field; VERIFY-0 measured a nonzero divergence for that reconstructed path. The direct symbolic-cell-normal map is therefore the frozen implementation of \(\nabla_h^\perp\) for v1.

The topology must satisfy

\[
\boxed{
\nabla_h\cdot\nabla_h^\perp\equiv0,
}
\]

hence

\[
\boxed{
\nabla_h\cdot(H_h\mathbf B_h)
=
\nabla_h\cdot\mathbf m_h
\equiv0.
}
\tag{DIVB}
\]

## 4. Flux-potential gauge

The additive scalar gauge is fixed by

\[
\boxed{
\int_{S^2}A_h\,dx_q=0.
}
\]

The implementation may use a quotient space or a real-valued Lagrange multiplier. The gauge variable is algebraic and is not a physical evolved state.

## 5. Universal quadrature contract

Every integral participating in the numerical identities uses the same frozen measure:

\`\`\`python
dxq = dx(
    domain=mesh,
    degree=12,
    scheme="canonical",
)
\`\`\`

Thus the same \`dxq\` is used for:

- the discrete Hamiltonian;
- D1–D3 Riesz maps;
- weak PV;
- SD1–SD3;
- BASE-D and BASE-P;
- mass;
- gauge;
- energy;
- invariant diagnostics used for acceptance.

No compiler-selected quadrature is permitted in those forms.

Degree 16 canonical quadrature is a verification arm, not a tuning knob. A degree-16 re-evaluation must agree with the converged degree-12 result within the preregistered M0 convergence tolerances. Failure is a QUAD gate failure; degree 12 is not silently retuned after response inspection.

## 6. Hamiltonian

Let

\[
\kappa=\mu_0\rho_0.
\]

Amendment A1 uses the Casimir-equivalent coefficient-centered representative. Let
\(H_{0,h}\in V_h^2=DG_1\) be the exactly represented constant background field and define the derived, non-prognostic anomaly
\[
\boxed{
\eta_h:=H_h-H_{0,h}
}
\]
by coefficient-space subtraction in \(DG_1\).

The adopted discrete unforced Hamiltonian is

\[
\boxed{
\widetilde{\mathscr H}_{0,h}
=
\int_{S^2}
\left[
\frac12H_h|\mathbf u_h|^2
+
\frac{|\mathbf m_h|^2}{2\kappa H_h}
+
\frac12g_*\eta_h^2
\right]dx_q.
}
\tag{H-A1}
\]

This differs from the former uncentered representative only by the mass Casimir and a constant on the same discrete mass functional. The continuum dynamics are unchanged. All derivatives, residuals, and conservation diagnostics are derived from this same coefficient-centered discrete functional; mixed centered/uncentered energy-derivative representations are prohibited.

## 7. Riesz derivatives D1–D3

Define \(\mathbf U_h\in V_h^1\), \(K_h\in V_h^2\), and \(M_h\in V_h^0\) by:

\[
\boxed{
\langle\mathbf w_h,\mathbf U_h\rangle_q
=
\int H_h\mathbf u_h\cdot\mathbf w_h\,dx_q.
}
\tag{D1}
\]

\[
\boxed{
\langle\phi_h,K_h\rangle_q
=
\int
\left[
\frac12|\mathbf u_h|^2
-
\frac{|\mathbf m_h|^2}{2\kappa H_h^2}
+
g_*\eta_h
\right]
\phi_h\,dx_q.
}
\tag{D2-A1}
\]

Here \(\eta_h\) is the coefficient-space DG1 anomaly defined in (H-A1); the gravitational derivative is \(K_{g,h}=g_*\eta_h\).

Because
\(|\nabla_h^\perp A_h|^2=|\nabla_hA_h|^2\),
the strong magnetic derivative is

\[
\boxed{
\frac{\delta\mathscr H_0}{\delta A}
=
-\nabla_\Sigma\cdot
\left(
\frac{\nabla_\Sigma A}{\kappa H}
\right).
}
\]

Its authoritative discrete weak representative is

\[
\boxed{
\langle\gamma_h,M_h\rangle_q
=
\int
\frac{\nabla_h\gamma_h\cdot\nabla_h A_h}
{\kappa H_h}
\,dx_q.
}
\tag{D3}
\]

No inconsistent independently coded strong magnetic derivative is permitted.

## 8. Weak potential vorticity

Let \(f_C=2\boldsymbol\Omega_{\rm frame}\cdot\hat{\mathbf n}\).

Define \(q_h\in V_h^0\) weakly by

\[
\boxed{
\int H_h q_h\gamma_h\,dx_q
=
-
\int
\mathbf u_h\cdot\nabla_h^\perp\gamma_h\,dx_q
+
\int f_C\gamma_h\,dx_q.
}
\tag{PV}
\]

PV is diagnostic, not a prognostic variable.

## 9. Compatible skew-Hamiltonian bracket

For discrete functionals \(F,G\), use the accepted compatible antisymmetric bracket

\[
\boxed{
\begin{aligned}
\{F,G\}_h
={}&
-\int q_h
F_{\mathbf u}\cdot
\mathcal R G_{\mathbf u}\,dx_q
\\
&+
\int
(\nabla_h\cdot F_{\mathbf u})G_H\,dx_q
-
\int
(\nabla_h\cdot G_{\mathbf u})F_H\,dx_q
\\
&+
\int
\frac{G_A}{H_h}
\nabla_hA_h\cdot F_{\mathbf u}\,dx_q
-
\int
\frac{F_A}{H_h}
\nabla_hA_h\cdot G_{\mathbf u}\,dx_q.
\end{aligned}
}
\tag{PB}
\]

It satisfies

\[
\{F,G\}_h=-\{G,F\}_h.
\]

Therefore

\[
\{\mathscr H_{0,h},\mathscr H_{0,h}\}_h=0.
\]

The frozen terminology is

\[
\boxed{
\text{compatible almost-Poisson / skew-Hamiltonian semidiscretization}.
}
\]

No discrete Jacobi identity is claimed unless separately proved.

## 10. Semidiscrete weak equations

For test fields
\(\mathbf w_h\in V_h^1\),
\(\phi_h\in V_h^2\),
\(\gamma_h\in V_h^0\):

\[
\boxed{
\begin{aligned}
\langle\mathbf w_h,\dot{\mathbf u}_h\rangle_q
={}&
-\int q_h\,
\mathbf w_h\cdot\mathcal R\mathbf U_h\,dx_q
+
\int
(\nabla_h\cdot\mathbf w_h)K_h\,dx_q
\\
&+
\int
\frac{M_h}{H_h}
\nabla_hA_h\cdot\mathbf w_h\,dx_q.
\end{aligned}
}
\tag{SD1}
\]

\[
\boxed{
\langle\phi_h,\dot H_h\rangle_q
=
-
\int
\phi_h\nabla_h\cdot\mathbf U_h\,dx_q.
}
\tag{SD2}
\]

\[
\boxed{
\langle\gamma_h,\dot A_h\rangle_q
=
-
\int
\gamma_h
\frac{\mathbf U_h}{H_h}\cdot\nabla_h A_h
\,dx_q,
}
\tag{SD3}
\]

with the frozen zero-mean gauge imposed algebraically.

The resulting semidiscrete energy cancellation is an identity of the bracket, not a post-run diagnostic.

## 11. Exact discrete-gradient time contract

For a timestep from superscript \(-\) to \(+\), define midpoint quantities with bars.

The exact kinetic discrete-gradient pair includes

\[
\boxed{
\overline{\frac{\delta\mathscr H}{\delta\mathbf u}}
=
\bar H\,\bar{\mathbf u}
}
\]

and

\[
\boxed{
\bar K_{\rm kin}
=
\frac14
\left(
|\mathbf u^+|^2
+
|\mathbf u^-|^2
\right).
}
\]

For magnetic energy,

\[
\boxed{
\bar{\mathbf G}_m
=
\frac1{4\kappa}
\left(
\frac1{H^+}
+
\frac1{H^-}
\right)
(\mathbf m^++\mathbf m^-)
}
\]

and

\[
\boxed{
\bar K_{\rm mag}
=
-
\frac{
|\mathbf m^+|^2
+
|\mathbf m^-|^2
}{
4\kappa H^+H^-
}.
}
\]

These satisfy exactly

\[
\boxed{
\Delta
\left(
\frac{|\mathbf m|^2}{2\kappa H}
\right)
=
\bar{\mathbf G}_m\cdot\Delta\mathbf m
+
\bar K_{\rm mag}\Delta H.
}
\]

For Amendment A1, form
\[
\eta_h^\pm=H_h^\pm-H_{0,h}
\]
by coefficient-space subtraction and use the exact quadratic gravitational discrete gradient
\[
\boxed{
\bar K_{\rm grav}
=
\frac{g_*}{2}
\left(
\eta_h^+ + \eta_h^-
\right).
}
\]
The centered gravitational energy and its discrete derivative must use the same derived \(\eta_h\) representation.

The production timestep is a symmetric midpoint-skew exact-discrete-gradient method. A plain RK, IMEX, or unmodified implicit-midpoint method is not a v1 production integrator.

For an exactly solved nonlinear step,

\[
\boxed{
\mathscr H_{0,h}^{n+1}
=
\mathscr H_{0,h}^{n}.
}
\tag{ENERGY}
\]

Practical residual is limited by nonlinear/linear solve tolerance and floating arithmetic, which must be recorded.

## 12. Positive-thickness timestep gate

Energy preservation does not imply positive depth.

Every accepted step must satisfy

\[
\boxed{
\operatorname{NUMPOS}(H_h^{n+1})
\iff
H_h^{n+1}(K,v)>0
}
\tag{NUM-POS}
\]

for every cell \(K\) and every local DG1 vertex \(v\).

Because \(H_h\in DG_1\) is affine on each reference triangle, this checks the cellwise polynomial minimum in the frozen reference-element representation.

If NUM-POS fails:

\[
\boxed{
\Delta t\rightarrow\Delta t/2
}
\]

and the step is retried from the previously accepted state.

Forbidden responses to a positivity failure:

- clipping;
- flooring;
- mass renormalization;
- changing the Hamiltonian;
- changing the base state;
- accepting a nonpositive Newton iterate.

The nonlinear globalization must remain within the \(H_h>0\) domain.

## 13. Deterministic canonical projection targets

Let
\(\widehat{\mathcal S}_h
=
\{\widehat{\mathbf u}_h,\widehat H_h,\widehat A_h\}\)
be the deterministic FE target for BASE-P.

Velocity target:

\[
\boxed{
\int
H_0
(\widehat{\mathbf u}_h-\mathbf u_{\rm base})
\cdot\mathbf w_h\,dx_q
=0
\quad
\forall\mathbf w_h\in V_h^1.
}
\tag{P-u}
\]

Thickness target:

\[
\boxed{
\int
(\widehat H_h-H_{\rm base})
\phi_h\,dx_q
=0
\quad
\forall\phi_h\in V_h^2.
}
\tag{P-H}
\]

For deterministic verification targets already exactly contained in the destination FE space, the projector identity \(P_hv=v\) is realized directly at the coefficient level rather than through a redundant approximate mass solve. This is an implementation of the same canonical projector, not a new projection definition.

For an axisymmetric toroidal base field, first define the continuum magnetic flux potential by

\[
\boxed{
\frac{dA_{\rm base}}{d\theta}
=
r_tH_{\rm base}(\theta)
B_{\phi0}(\theta),
}
\]

with

\[
\int A_{\rm base}\,dA=0.
\]

Then define \(\widehat A_h\) on the zero-mean \(V_h^0\) subspace by

\[
\boxed{
\int
\frac{
\nabla_h^\perp
(\widehat A_h-A_{\rm base})
\cdot
\nabla_h^\perp\gamma_h
}{
\kappa H_0
}
\,dx_q
=0
}
\tag{P-A}
\]

for all zero-mean \(\gamma_h\in V_h^0\), together with
\(\int\widehat A_h\,dx_q=0\).

## 14. Deterministic balanced base projection

The discrete physical base state is

\[
\boxed{
\mathcal S_{{\rm base},h}^{(k)}
=
\arg\min_{\mathcal S_h}
\mathfrak D_h
(
\mathcal S_h,
\widehat{\mathcal S}_h^{(k)}
)
}
\tag{BASE-P}
\]

subject to

\[
\boxed{
R_h^{M_0}(\mathcal S_h)=0,
}
\]

\[
\boxed{
\int H_h\,dx_q
=
\int\widehat H_h\,dx_q,
}
\]

\[
\boxed{
\int A_h\,dx_q=0,
}
\]

and

\[
\boxed{
H_h>0.
}
\]

The metric is

\[
\boxed{
\mathfrak D_h
=
\int_{S^2}
\left[
\frac12H_0
|\mathbf u_h-\widehat{\mathbf u}_h|^2
+
\frac{
|\mathbf m_h-\widehat{\mathbf m}_h|^2
}{
2\kappa H_0
}
+
\frac12g_*
(H_h-\widehat H_h)^2
\right]dx_q.
}
\tag{BASE-D}
\]

No free metric weights exist.

If no admissible stationary minimizer exists, the mesh/resolution fails BASE.

If more than one minimizer survives the frozen arithmetic/nonlinear uniqueness tolerance, the mesh/resolution fails BASE.

No information from M1 may enter BASE-P.

## 15. First executable gate: VERIFY-0 — PASSED

Pinned execution evidence:

- GitHub Actions workflow: `firedrake-verify-0`
- Successful run id: `35639766851`
- Repository commit tested: `6136c600e73c1fd43ecd61802ae37d4e76f45f4a`
- Firedrake: `2026.4.1`
- Firedrake image digest: `sha256:798066ee679c94cb379021a0a65099b218702f819d3b0c41f703de16f039e98c`
- Gusto source commit: `669f6372cd334ed47c9c7b38f26e591732273f75`
- V0: `<<CG2 on a triangle> + <B3 on a triangle>>`
- V1: `<BDFM2 on a triangle>`
- V2: `<DG1 on a triangle>`
- geometry degree: `3`
- quadrature: canonical degree `12`
- DIVB max residual: `3.25192608313473709e-15`
- DIVB L2 norm: `2.93321495868915036e-13`
- zero-state velocity residual: `3.17136683541494545e-15`
- zero-state thickness residual: `0`
- zero-state magnetic norm: `0`

All required VERIFY-0 tolerances were below the frozen `1e-12` gate.

### Rejected implementation paths

VERIFY-0 also falsified two tempting but incorrect realizations without changing the numerical contract:

1. `domain.perp(grad(A_h))` followed by interpolation produced DIVB max residual `3.34691215876413992e-04` and L2 norm `3.35258603525875262e-02`; this path is prohibited.
2. Direct UFL `curl(A_h)` is an intrinsic 2-vector and cannot be interpolated into the embedded-sphere BDFM space whose physical value shape is 3; this path is not the v1 realization.

The accepted map is the direct interpolation of `cross(CellNormal(mesh), grad(A_h))`.

## 15.1 VERIFY-0 contract

Before BASE-P or the production timestepper is implemented, the installed Firedrake/Gusto stack must demonstrate that it realizes the frozen complex.

The first executable must:

1. construct the degree-3 curved icosahedral mesh;
2. call the pinned Gusto BDFM space builder with horizontal degree 1;
3. verify the resulting spaces correspond to
   \(CG_2\oplus B_3\), \(BDFM_2\), \(DG_1\);
4. use the compatible \(V_h^0\rightarrow V_h^1\) differential without an arbitrary L2 projection;
5. verify \(\nabla_h\cdot\nabla_h^\perp A_h=0\) for nontrivial \(A_h\) to the frozen assembly tolerance;
6. verify the zero state residual;
7. verify constant mass/energy evaluation using \`dxq\`;
8. print the pinned Firedrake/Gusto revisions and element descriptions.

No M1 code belongs in VERIFY-0.

## 16. M0 crucible order

After VERIFY-0 succeeds:

1. encode D1–D3 using \`dxq\`;
2. encode PV;
3. encode SD1–SD3;
4. prove semidiscrete skew-energy cancellation numerically/manufactured algebraically;
5. implement BASE-P;
6. implement the exact-discrete-gradient timestep;
7. add NUM-POS rejection/retry;
8. run the physical M0 base-state ensemble;
9. run refinement, QUAD, MASS, DIVB, ENERGY, BASE, and CONV gates.

Only after all M0 gates pass may the frozen BURGAMOTS potential be introduced into M1.

## 17. Stop line

\[
\boxed{
\texttt{BURGAMOTS\_NUMERICS\_v1: FROZEN}
}
\]

The immediate software operation is

\[
\boxed{
\text{provision pinned Firedrake/Gusto}
\rightarrow
\text{VERIFY-0}
\rightarrow
D1\text{--}D3,\ PV,\ SD1\text{--}SD3
\rightarrow
\text{M0 crucible}.
}
\]

No numerical choice may be changed in response to BURGAMOTS outcomes.
