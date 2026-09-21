# BURGAMOTS_SOLAR_RESPONSE_SPEC_v1

## Status

BURGAMOTS_FORCING_LEDGER_v1: LOCKED

BURGAMOTS_TACH_SWMHD_v1: FROZEN — equation / forcing-contract level

NEXT UNIT: BURGAMOTS_TACH_EXPERIMENT_PROTOCOL_v1

PINN / solver selection: NOT AUTHORIZED YET

SUN comparison: NOT AUTHORIZED YET

This specification defines the smallest tachocline response model permitted to consume the immutable BURGAMOTS forcing ledger. It does not modify the forcing object and does not execute an empirical experiment.

## 1. Scientific firewall

The upstream forcing object is immutable:

\[
\mathcal F=\mathcal F[\mathbf R_i^I,\mathbf V_i^I,\mu_i],\qquad \mu_i=GM_i.
\]

No solar state, fitted response parameter, learned coefficient, spectral feature, SUN quantity, or solver parameter may alter it:

\[
\boxed{\frac{\partial\mathcal F}{\partial(\mathbf u,\mathbf B,h,\Theta)}=0.}
\]

The equivalent gauge-fixed differential potential is

\[
\boxed{
\Phi_{\rm B}^{I}(\mathbf x,t)
=
\sum_i\mu_i
\left[
-\frac1{|\mathbf R_i-\mathbf x|}
+\frac1{R_i}
+\frac{\mathbf R_i\cdot\mathbf x}{R_i^3}
\right].
}
\]

It obeys

\[
-\nabla\Phi_{\rm B}^{I}=\mathbf f_{\rm ext}^{\rm mono},
\qquad
\Phi_{\rm B}^{I}(0,t)=0,
\qquad
\nabla\Phi_{\rm B}^{I}(0,t)=0.
\]

Tensor invariants, eigensystems, multipoles, and time derivatives from the forcing ledger remain read-only diagnostics or ablation coordinates. They do not replace the spatial field in the primary causal arm.

## 2. Rotating-frame adapter

The forcing ledger remains Sun-relative and inertial. The response model is posed in a prescribed solar rotating frame.

Define

\[
\boxed{\mathsf Q(t)\in SO(3)}
\]

with

\[
\mathbf x_S=\mathsf Q(t)\mathbf x_I,
\qquad
\mathbf R_i^S=\mathsf Q(t)\mathbf R_i^I.
\]

The scalar potential transforms by pullback:

\[
\boxed{
\Phi_{\rm B}^{S}(\mathbf x_S,t)
=
\Phi_{\rm B}^{I}\!\left(\mathsf Q^{\mathsf T}(t)\mathbf x_S,t\right).
}
\]

Hence

\[
\boxed{\mathbf f_{\rm B}^{S}=\mathsf Q(t)\mathbf f_{\rm B}^{I}.}
\]

The frame map contains no learnable quantity:

\[
\boxed{\frac{\partial\mathsf Q}{\partial\Theta}=0.}
\]

For v1 the rotating coordinate system is Carrington-like: z is the solar rotation axis and longitude rotates at the prescribed Carrington sidereal rate. The implementation protocol must freeze the pole orientation, reference phase/epoch, and conversion to the same dynamical time scale used by the ephemeris. Observer-dependent apparent-longitude corrections are excluded from this dynamical frame map.

Required checks:

\[
\boxed{\mathsf Q^{\mathsf T}\mathsf Q=\mathbf I,\qquad \det\mathsf Q=1.}
\]

Transforming the potential and then differentiating must agree with transforming the inertial gradient/vector field to the declared numerical tolerance.

## 3. v1 tachocline geometry

v1 uses constant externally supplied geometry:

\[
r_t=\text{constant},\qquad H_0=\text{constant}.
\]

These are observational geometry, not forcing or trainable parameters.

Define

\[
\boxed{r_b=r_t-\frac{H_0}{2}},
\]

\[
\boxed{H(\theta,\phi,t)=H_0+h(\theta,\phi,t)>0},
\]

and the moving upper interface

\[
\boxed{r_s(\theta,\phi,t)=r_b+H(\theta,\phi,t).}
\]

Latitude-dependent geometry is an allowed later extension but is not part of v1 because it requires its own balanced background state.

All geometric and energy identities below are at the same asymptotic shallow-shell order as the SWMHD model unless a later implementation consistently retains higher-order spherical-Jacobian terms.

## 4. Dynamic state

\[
\boxed{\mathcal S_{\rm tach}=\{\mathbf u,\mathbf B,h\}.}
\]

Here \(\mathbf u\) is tangential layer velocity, \(\mathbf B\) is tangential magnetic field, and \(h\) is layer-thickness/interface perturbation.

Differential rotation is contained in \(u_\phi\). No independent density perturbation, pressure perturbation, radial velocity, or fourth gravitational state variable is required in this baseline.

## 5. Hydrostatic reduction

The earlier provisional shell-average-then-project adapter is superseded.

Use outward coordinate \(\zeta\) from the fixed lower interface. Hydrostatic balance is

\[
\boxed{
0=-\frac1{\rho_0}\partial_\zeta p-g_*-\partial_\zeta\Phi_{\rm B}^{S}.
}
\]

With fixed pressure at the upper interface,

\[
\boxed{
\frac{p(\zeta)}{\rho_0}
=
g_*(H-\zeta)
+
\Phi_{\rm B}^{S}(\theta,\phi,H,t)
-
\Phi_{\rm B}^{S}(\theta,\phi,\zeta,t).
}
\]

Taking the horizontal surface gradient and including the direct conservative body acceleration gives

\[
-\frac1{\rho_0}\nabla_\Sigma p
-\nabla_\Sigma\Phi_{\rm B}^{S}(\zeta)
=
-g_*\nabla_\Sigma H
-\nabla_\Sigma
\Phi_{\rm B}^{S}(r_s\hat{\mathbf n},t).
\]

Therefore the frozen SW adapter is

\[
\boxed{
\mathcal P_{\rm SW}[\Phi_{\rm B};H]
=
-\nabla_\Sigma
\left[
\Phi_{\rm B}^{S}(r_s\hat{\mathbf n},t)
\right].
}
\tag{F}
\]

and

\[
\boxed{\frac{\partial\mathcal P_{\rm SW}}{\partial\Theta}=0.}
\]

### Radial component

Let

\[
f_\perp=\hat{\mathbf n}\cdot\mathbf f_{\rm B}^{S}.
\]

The chain rule gives

\[
\boxed{
\mathbf f_{\rm B}^{SW}
=
\mathsf P_\Sigma\mathbf f_{\rm B}^{S}(\mathbf x_s,t)
+
f_\perp(\mathbf x_s,t)\nabla_\Sigma r_s.
}
\]

Thus radial gravitational forcing enters the horizontal shallow-water dynamics through the hydrostatic/free-surface geopotential. It is not inserted as an independent horizontal force.

For small h,

\[
\mathbf f_{\rm B}^{SW}
\approx
\mathbf f_{\parallel,0}
+
f_{\perp,0}\nabla_\Sigma h
+
h\nabla_\Sigma f_{\perp,0},
\]

so

\[
-g_*\nabla_\Sigma h+\mathbf f_{\rm B}^{SW}
\approx
-(g_*-f_{\perp,0})\nabla_\Sigma h
+
\mathbf f_{\parallel,0}
+
h\nabla_\Sigma f_{\perp,0}.
\]

The shorthand \(g_{\rm eff}=g_*-f_\perp\) is interpretive only, never fitted.

## 6. Frozen SWMHD equations

Let \(D_t=\partial_t+\nabla_{\mathbf u}\).

### R1 — thickness

\[
\boxed{
\partial_t H+\nabla_\Sigma\cdot(H\mathbf u)=0.
}
\tag{R1}
\]

### R2 — momentum

\[
\boxed{
D_t\mathbf u
+
2\,\mathsf P_\Sigma(\boldsymbol\Omega_{\rm ref}\times\mathbf u)
=
-g_*\nabla_\Sigma h
+
\frac1{\mu_0\rho_0}\nabla_{\mathbf B}\mathbf B
-
\nabla_\Sigma\Phi_{\rm B}^{S}(\mathbf x_s,t).
}
\tag{R2}
\]

### R3 — induction

\[
\boxed{
D_t\mathbf B=\nabla_{\mathbf B}\mathbf u.
}
\tag{R3}
\]

### R4 — magnetic compatibility

\[
\boxed{
\nabla_\Sigma\cdot(H\mathbf B)=0.
}
\tag{R4}
\]

The system closes on exactly \(\{\mathbf u,\mathbf B,h\}\).

## 7. Causal experiment contract

Null arm:

\[
\boxed{M_0:\ \Phi_{\rm B}=0.}
\]

Forced arm:

\[
\boxed{M_1:\ \Phi_{\rm B}=\Phi_{\rm B}^{\rm immutable\ ephemeris}.}
\]

Everything else is shared:

\[
\boxed{
\mathcal S_0,\;
r_t,\;
H_0,\;
g_*,\;
\rho_0,\;
\Omega_{\rm ref},\;
\text{boundary conditions},\;
\text{numerics},\;
\text{resolution},\;
\text{time-step policy}.
}
\]

The sole intervention is absence versus presence of the immutable BURGAMOTS potential.

Any negative control must transform the whole physically admissible forcing object. Independent component scrambling that destroys vector/potential consistency is prohibited.

## 8. Continuum invariants and implementation gates

### Frame

\[
\mathsf Q^{\mathsf T}\mathsf Q=\mathbf I,\qquad \det\mathsf Q=1.
\]

### Forcing identity

\[
-\nabla\Phi_{\rm B}=\mathbf f_{\rm ext}^{\rm mono}
\]

must be recovered numerically to declared tolerance.

### Positive layer depth

\[
\boxed{H>0.}
\]

### Mass conservation

\[
\boxed{\frac{d}{dt}\int_{S^2}H\,dA=0.}
\]

### Magnetic compatibility

If \(\nabla_\Sigma\cdot(H\mathbf B)=0\) initially, the ideal discrete scheme must preserve this weighted constraint to its declared invariant tolerance.

This spec freezes the invariant requirement, not a branded discretization. Constrained transport, compatible finite-volume, discrete-exterior-calculus, mimetic finite-difference, or another method may later be compared against the same requirement.

### Energy

Define total SW energy per reference density:

\[
\boxed{
E
=
\int_{S^2}
\left[
\frac12H|\mathbf u|^2
+
\frac{H|\mathbf B|^2}{2\mu_0\rho_0}
+
\frac12g_*H^2
+
\int_0^H
\Phi_{\rm B}^{S}(\theta,\phi,\zeta,t)\,d\zeta
\right]dA.
}
\]

For the closed ideal continuum model,

\[
\boxed{
\frac{dE}{dt}
=
\int_{S^2}
\int_0^H
\frac{\partial\Phi_{\rm B}^{S}}{\partial t}
\,d\zeta\,dA.
}
\tag{E}
\]

Hence \(M_0\) has \(dE/dt=0\), and a static imposed external potential in the rotating frame also conserves the combined fluid + magnetic + external-potential energy.

This continuum identity is exact within the adopted SWMHD model. A discrete implementation may claim machine-precision conservation only if its discrete formulation guarantees it. Otherwise acceptance requires a predeclared residual tolerance and convergence under time-step/resolution refinement.

## 9. Prohibited contamination

The response adapter and primary equations contain no learned forcing amplitude, fitted spatial weighting, frequency filter, cycle period, synthetic torque quantity, J2/J3 substitution for the primary field, SUN operator, componentwise phase manipulation, or response parameter capable of rewriting the forcing.

\[
\boxed{
\frac{\partial\Phi_{\rm B}}{\partial\Theta}
=
\frac{\partial\mathsf Q}{\partial\Theta}
=
\frac{\partial\mathcal P_{\rm SW}}{\partial\Theta}
=
0.
}
\]

## 10. Frozen map

\[
\boxed{
\begin{aligned}
\{\mathbf R_i^I,\mathbf V_i^I,\mu_i\}
&\longrightarrow
\Phi_{\rm B}^{I}(\mathbf x,t)
\\
&\xrightarrow{\mathsf Q(t)}
\Phi_{\rm B}^{S}(\mathbf x,t)
\\
&\xrightarrow{\text{hydrostatic SW reduction}}
-\nabla_\Sigma\Phi_{\rm B}^{S}(\mathbf x_s,t)
\\
&\longrightarrow
\{\mathbf u,\mathbf B,h\}.
\end{aligned}
}
\]

## 11. Frozen versus deferred

Frozen now:

1. Immutable forcing potential/field.
2. Deterministic inertial-to-solar-rotating map.
3. Constant externally supplied v1 shell geometry.
4. Core state \(\{\mathbf u,\mathbf B,h\}\).
5. Potential-based hydrostatic SW coupling.
6. Rotating ideal SWMHD equations R1–R4.
7. M0-versus-M1 intervention structure.
8. Continuum mass, magnetic-compatibility, and energy identities.
9. No fourth evolved state variable.
10. No trainable upstream forcing freedom.

Deferred to BURGAMOTS_TACH_EXPERIMENT_PROTOCOL_v1:

- numerical values of the observational v1 geometry record;
- equilibrium/base profiles;
- perturbation ensemble;
- initial-condition construction;
- grid/resolution;
- spatial discretization;
- time integrator;
- divergence-control implementation;
- discrete invariant tolerances;
- time-step/CFL policy;
- any physical dissipation/resistivity;
- simulation duration;
- negative-control schedule;
- held-out observations;
- statistical comparison metric;
- solver/PINN architecture.

## 12. Next legitimate unit

BURGAMOTS_TACH_SWMHD_v1: FROZEN

→ NEXT: BURGAMOTS_TACH_EXPERIMENT_PROTOCOL_v1

→ ONLY THEN: solver / PINN donor comparison

→ SUN comparison remains later and separate.

## Literature constraints

- Gilman, P. A. (2000), Magnetohydrodynamic "shallow water" equations for the solar tachocline, Astrophysical Journal 544, L79–L82, DOI 10.1086/317291.
- Miesch, M. S. & Gilman, P. A. (2004), Thin-Shell Magnetohydrodynamic Equations for the Solar Tachocline, Solar Physics 220, 287–305, DOI 10.1023/B:SOLA.0000031382.93981.2c.
- Strugarek et al. (2023), Dynamics of the Tachocline, Space Science Reviews 219, 87, DOI 10.1007/s11214-023-01027-0.
- JPL Solar System Dynamics, Horizons System Manual: DE440/441 calculations are effectively aligned with ICRF and geometric state vectors can be requested without aberration corrections.
- SOHO / SunSPICE conventions: Carrington heliographic coordinates use the solar rotation axis and prescribed sidereal rotation.
