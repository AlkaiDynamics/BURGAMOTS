# BURGAMOTS_BASESTATE_PROTOCOL_v1

## Status

BURGAMOTS_FORCING_LEDGER_v1: LOCKED

BURGAMOTS_TACH_SWMHD_v1: FROZEN

BURGAMOTS_BASESTATE_PROTOCOL_v1: FROZEN

NEXT UNIT: BURGAMOTS_NUMERICAL_REALIZATION_SPEC_v1

PINN / solver selection: NOT AUTHORIZED YET

SUN comparison: NOT AUTHORIZED YET

This protocol freezes the admissible initial/base-state family and the causal experiment semantics for the already-frozen BURGAMOTS tachocline SWMHD response model. It does not modify the forcing ledger or the SWMHD equations.

## 1. Coordinate and notation conventions

The polar angle \(\theta\) is colatitude:

\[
\theta=0 \text{ at the north pole},\qquad
\theta=\pi/2 \text{ at the equator},\qquad
\theta=\pi \text{ at the south pole}.
\]

The physical base state is denoted

\[
\boxed{
\mathcal S_{\rm base}
=
\{
\mathbf u_{\rm base},
\mathbf B_{\rm base},
\eta_{\rm base}
\}.
}
\]

The null and forced trajectories are denoted separately:

\[
\boxed{
\mathcal S^{(0)}(t)=\text{null trajectory},
\qquad
\mathcal S^{(1)}(t)=\text{forced trajectory}.
}
\]

This notation is frozen to prevent the subscript \(0\) from meaning both physical base state and null experiment.

## 2. Exact numerical verification state

The implementation must contain a deliberately non-solar verification equilibrium:

\[
\boxed{
\mathcal S_{\rm verify}
=
\{\mathbf 0,\mathbf 0,0\},
\qquad
H=H_0,
\qquad
\Phi_{\rm BURG}=0.
}
\]

Any evolution from this state in the ideal closed system is numerical error.

This state is a code/invariant verification object only. It is not a physical solar model and may not be interpreted as one.

## 3. Physical base-state family

For each preregistered base-state member \(k\),

\[
\boxed{
\mathcal S_{\rm base}^{(k)}
=
\left\{
U_0(\theta)\hat{\boldsymbol\phi},
\;
B_{\phi0}^{(k)}(\theta)\hat{\boldsymbol\phi},
\;
\eta_{\rm base}^{(k)}(\theta)
\right\}.
}
\]

The zonal flow is determined from an externally supplied/frozen angular-velocity profile:

\[
\boxed{
U_0(\theta)
=
r_t\sin\theta\,
[
\Omega_0(\theta)-\Omega_{\rm frame}
].
}
\]

Here

\[
\boxed{
\Omega_0(\theta)
=
\text{externally observed/frozen}.
}
\]

The toroidal magnetic profile belongs to a finite preregistered family:

\[
\boxed{
\mathfrak B_0
=
\left\{
B_{\phi0}^{(1)}(\theta),
\dots,
B_{\phi0}^{(N)}(\theta)
\right\}.
}
\]

Each member is an externally specified prior base state. No member may be selected after examining BURGAMOTS outcomes.

The deep tachocline toroidal magnetic state is therefore treated as a bounded physical uncertainty in the solar system being forced, not as a trainable BURGAMOTS parameter.

## 4. Meridional base-state equilibrium — B1

For

\[
\mathbf u_{\rm base}
=
U_0(\theta)\hat{\boldsymbol\phi},
\qquad
\mathbf B_{\rm base}
=
B_{\phi0}(\theta)\hat{\boldsymbol\phi},
\]

define

\[
v_A^2(\theta)
=
\frac{B_{\phi0}^2(\theta)}
{\mu_0\rho_0}.
\]

The frozen meridional equilibrium is

\[
\boxed{
g_*
\frac{d\eta_{\rm base}}{d\theta}
=
\left(
U_0^2-v_A^2
\right)
\cot\theta
+
2\Omega_{\rm frame}r_tU_0\cos\theta.
}
\tag{B1}
\]

The signs and factors are fixed for \(\theta\) defined as colatitude.

The layer-thickness perturbation is derived from B1. It is not an independently fitted state variable.

Fix its additive gauge by

\[
\boxed{
\int_{S^2}
\eta_{\rm base}\,dA
=
0.
}
\]

For each member \(k\), \(\eta_{\rm base}^{(k)}\) is obtained from the corresponding \(B_{\phi0}^{(k)}\) and the same frozen \(\Omega_0(\theta)\).

## 5. Pole regularity and shallow-water admissibility

Smooth axisymmetric toroidal vector fields require

\[
\boxed{
B_{\phi0}(\theta)
=
O(\sin\theta)
\quad
\text{as }
\theta\rightarrow0,\pi.
}
\]

Likewise,

\[
U_0(\theta)=O(\sin\theta),
\]

which follows from the frozen definition of \(U_0\) provided \(\Omega_0\) remains finite.

Every base-state member must also satisfy

\[
\boxed{
H_0+\eta_{\rm base}>0,
\qquad
\frac{\|\eta_{\rm base}\|_\infty}{r_t}\ll1.
}
\]

The inherited shallow-shell requirement \(H_0/r_t\ll1\) from BURGAMOTS_TACH_SWMHD_v1 remains in force.

A base-state member that violates pole regularity, positive depth, shallow-shell admissibility, or B1 is inadmissible before any causal experiment begins.

## 6. Background gravity and centrifugal convention

The response equations are written in a frame rotating at \(\Omega_{\rm frame}\). The time-independent solar gravity, centrifugal potential, and other fixed background hydrostatic contributions are absorbed into the reference geometry and effective/reduced gravity:

\[
\boxed{
\Phi_{\rm grav,\odot}
+
\Phi_{\rm centrifugal}
+
\Phi_{\rm background}
\longrightarrow
\text{fixed reference hydrostatic geometry and }g_*.
}
\]

Therefore the perturbation momentum equation contains the Coriolis term

\[
2\boldsymbol\Omega_{\rm frame}\times\mathbf u
\]

but does not separately append the centrifugal acceleration

\[
-\boldsymbol\Omega_{\rm frame}
\times
(
\boldsymbol\Omega_{\rm frame}\times\mathbf r
).
\]

That time-independent contribution is already part of the selected background/effective geopotential.

The BURGAMOTS potential is reserved for the external time-dependent differential planetary potential only:

\[
\boxed{
\Phi_{\rm BURG}
=
\text{external differential planetary potential only}.
}
\]

Solar gravity and centrifugal background terms may not be relabeled as BURGAMOTS forcing.

## 7. Hydrodynamic reference experiment

The special member

\[
\boxed{
B_{\phi0}=0
}
\]

is called the

\[
\boxed{
\text{hydrodynamic reference experiment}.
}
\]

Under ideal induction, an exactly zero magnetic field remains zero. Therefore this experiment tests

\[
\boxed{
\mathcal F_{\rm BURG}
\longrightarrow
\text{tachocline flow/interface response}
}
\]

with no magnetic mediation.

It is not the primary MHD test and cannot test magnetic amplification.

The finite nonzero preregistered family \(\mathfrak B_0\) constitutes the MHD base-state ensemble.

## 8. Frozen causal arms

For every preregistered base-state member \(k\),

\[
\boxed{
M_0^{(k)}:
\qquad
\Phi_{\rm BURG}=0
}
\]

versus

\[
\boxed{
M_1^{(k)}:
\qquad
\Phi_{\rm BURG}
=
\Phi_{\rm BURG}^{S}(\mathbf x,t).
}
\]

The following are identical between the two arms:

\[
\boxed{
\mathcal S_{\rm base}^{(k)},
\;
r_t,
\;
H_0,
\;
g_*,
\;
\rho_0,
\;
\Omega_{\rm frame},
\;
[t_0,t_1],
\;
\text{discretization},
\;
\text{precision},
\;
\text{time-step policy}.
}
\]

Therefore

\[
\boxed{
M_1^{(k)}-M_0^{(k)}
=
\text{presence of the immutable BURGAMOTS potential only}.
}
\]

The experiment window \([t_0,t_1]\) must be preregistered independently of inspected solar-response outcomes. Event-selected windows are prohibited.

## 9. Physically admissible negative and attribution controls

A coherent whole-field epoch displacement is an admissible negative control:

\[
\boxed{
M_{2,\Delta_k}:
\quad
\Phi_{\rm B,\Delta_k}^{S}(\mathbf x,t)
=
\Phi_{\rm B}^{S}(\mathbf x,t+\Delta_k).
}
\]

The shift schedule \(\{\Delta_k\}\) must be fixed before inspecting response outcomes.

The shift acts on the whole forcing object and therefore preserves its internal potential/vector consistency.

Independent componentwise phase scrambling or componentwise time shifting that destroys a physically admissible gravitational field is prohibited.

Source removal,

\[
\boxed{
\Phi_{\rm B}^{(-i)}
=
\Phi_{\rm B}-\Phi_i,
}
\]

is permitted only as an attribution experiment. It is not a null control and may not be interpreted as one.

## 10. Response variables and trajectory separation

Define trajectory differences

\[
\boxed{
\delta\mathbf u
=
\mathbf u^{(1)}-\mathbf u^{(0)},
\qquad
\delta\mathbf B
=
\mathbf B^{(1)}-\mathbf B^{(0)},
\qquad
\delta\eta
=
\eta^{(1)}-\eta^{(0)}.
}
\]

The positive response norm is

\[
\boxed{
\mathcal D(t)
=
\int_{S^2}
\left[
\frac12H_0|\delta\mathbf u|^2
+
\frac{H_0}{2\mu_0\rho_0}
|\delta\mathbf B|^2
+
\frac12g_*(\delta\eta)^2
\right]
dA.
}
\]

\(\mathcal D(t)\) is explicitly a positive trajectory-separation norm.

It is not the literal difference between the physical total energies of \(M_1\) and \(M_0\). With a nonzero flow or magnetic base state, direct energy subtraction contains cross terms.

Define the integrated response functional

\[
\boxed{
\mathcal J
=
\int_{t_0}^{t_1}
\mathcal D(t)\,dt.
}
\]

\(\mathcal J\) measures causal trajectory separation under the frozen intervention. It is not a solar-cycle score, event score, or activity-matching objective.

## 11. Convergence requirements

Convergence of the scalar response functional is necessary:

\[
\boxed{
\mathcal J_{\Delta x,\Delta t}
\rightarrow
\mathcal J_*.
}
\]

It is not sufficient.

The state fields themselves must converge for both experiment arms:

\[
\boxed{
\mathcal S_{\Delta x,\Delta t}^{(a)}
\rightarrow
\mathcal S_*^{(a)},
\qquad
a\in\{0,1\}.
}
\]

The numerical realization contract must preregister state norms for

\[
\mathbf u,
\qquad
\mathbf B,
\qquad
\eta,
\]

and must demonstrate convergence of those fields under the declared refinement study.

The numerical error tolerances are solver/discretization dependent and are deliberately not selected by this protocol. The requirement for both observable-level and field-level convergence is frozen now.

## 12. Remaining physical uncertainty

After this freeze, the initial state is an explicitly bounded family:

\[
\boxed{
\mathfrak S_{\rm base}
=
\mathfrak S[
\Omega_0(\theta),
\mathfrak B_0
].
}
\]

Of these inputs,

\[
\Omega_0(\theta)
\]

is externally observationally constrained, while

\[
\boxed{
B_{\phi0}(\theta)
}
\]

is the irreducible v1 physical base-state uncertainty.

That uncertainty may not be resolved by selecting whichever profile makes BURGAMOTS look most effective.

Any future narrowing of \(\mathfrak B_0\) must be justified by information independent of the BURGAMOTS response outcome.

## 13. Full causal firewall

The frozen chain is

\[
\boxed{
\underbrace{\text{ephemeris source}}_{\rm source}
\rightarrow
\underbrace{\mathcal F}_{\rm forcing}
\rightarrow
\underbrace{\mathcal P_{\rm SW}}_{\rm fixed\ adapter}
\rightarrow
\underbrace{\mathcal S_{\rm base}}_{\rm independent\ solar\ state}
\rightarrow
\underbrace{M_0/M_1}_{\rm causal\ experiment}.
}
\]

There is no PINN, solver-specific tuning, SUN structure, solar-cycle matching, learned forcing coefficient, or learned initial condition upstream of the causal comparison.

## 14. Frozen versus deferred

Frozen by this protocol:

1. Verification equilibrium.
2. Physical base-state family.
3. Externally frozen differential-rotation profile.
4. Finite preregistered toroidal-field family.
5. B1 meridional equilibrium and derived thickness perturbation.
6. Pole regularity and shallow-water admissibility.
7. Background-gravity/centrifugal convention.
8. Hydrodynamic reference semantics.
9. M0/M1 intervention semantics.
10. Whole-field time-shift negative-control semantics.
11. Source-removal attribution semantics.
12. Positive trajectory-separation norm \(\mathcal D\) and integrated functional \(\mathcal J\).
13. Requirement for both response-functional and state-field convergence.
14. Prohibition on event-selected windows and outcome-selected base states.

Deferred to BURGAMOTS_NUMERICAL_REALIZATION_SPEC_v1:

- concrete numerical representation of the externally supplied \(\Omega_0(\theta)\);
- concrete finite preregistered family \(\mathfrak B_0\);
- numerical values of the v1 observational geometry record;
- grid/topology;
- spatial discretization;
- time integrator;
- invariant-preservation mechanism;
- arithmetic precision;
- CFL/time-step policy;
- discrete divergence tolerance;
- discrete mass/energy tolerances;
- refinement ladder;
- state-space convergence norms and tolerances;
- dissipation/resistivity policy if non-ideal terms are introduced;
- execution backend;
- solver-donor comparison.

No solver or PINN architecture is selected here.

## 15. Stop line

\[
\boxed{
\texttt{BURGAMOTS\_BASESTATE\_PROTOCOL\_v1: FROZEN}
}
\]

The next unresolved object is numerical rather than physical:

\[
\boxed{
\text{NEXT: }\texttt{BURGAMOTS\_NUMERICAL\_REALIZATION\_SPEC\_v1}.
}
\]

The forcing ledger, hydrostatic adapter, SWMHD equations, admissible base-state family, causal intervention, and control semantics must remain fixed while numerical methods are evaluated.

SUN comparison remains later and separate.
