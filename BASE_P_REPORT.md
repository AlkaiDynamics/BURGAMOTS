# BURGAMOTS BASE-P status report

## Scope boundary

Authorized phase:

```math
\boxed{\texttt{BASE-P ONLY}}
```

No production timestepper work, `M1`, BURGAMOTS forcing ingestion, observational comparison, SUN analysis, merge, or deployment is included in this report.

## Frozen contracts preserved

This report preserves the existing frozen contracts:

- `BURGAMOTS_FORCING_LEDGER_v1`: locked.
- `BURGAMOTS_TACH_SWMHD_v1`: frozen.
- `BURGAMOTS_BASESTATE_PROTOCOL_v1`: frozen.
- `BURGAMOTS_NUMERICS_v1`: frozen.
- Semidiscrete gate: runner-confirmed pass on run `35645988857`.

## Implemented gate: BASE-KKT-0

`tests/verify_base_p.py` implements the next BASE-P implementation gate after `BASE-TARGET-0`.

It verifies the constrained stationary projection mechanics using a deliberately manufactured, non-solar stationary KKT family. The gate enforces:

```math
R_h^{M_0}(\mathcal S_h)=0,
```

```math
\int H_h\,dx_q=\int \widehat H_h\,dx_q,
```

```math
\int A_h\,dx_q=0,
```

```math
H_h>0,
```

and the frozen `BASE-D` metric.

The manufactured family contains three deterministic stationary members:

```text
kkt0_hydro_reference
kkt0_mass_high
kkt0_mass_low
```

These members are implementation witnesses for the constrained KKT machinery only. They are not physical solar magnetic-prior members.

## Physical BASE-PHYS status

`BASE-PHYS` remains fail-closed / blocked.

The repository does not yet contain both required frozen physical inputs:

1. the externally supplied/frozen observational `Omega_0(theta)` record;
2. the finite preregistered toroidal magnetic-prior family `mathfrak B_0`.

Those inputs may not be invented by the numerical implementation and may not be selected using BURGAMOTS outcomes.

Therefore no physical representatives

```math
\mathcal S_{{\rm base},h}^{(k)}
```

for the solar magnetic-prior ensemble are certified by this report.

## Acceptance meaning

A passing `BASE-KKT-0` run means only that the frozen constrained stationary projection machinery is implemented and executable on the pinned Firedrake/Gusto stack.

It does not authorize:

- `M1`;
- ephemeris forcing;
- observational comparison;
- SUN comparison;
- production timestepper work;
- merge;
- deployment.

## Stop condition

Stop after `BASE-KKT-0` evidence is produced and `BASE-PHYS` is explicitly reported as blocked unless and until the frozen physical base-state inputs are added independently.
