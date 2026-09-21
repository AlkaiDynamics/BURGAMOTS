# Non-solar BASE-floor calibration — run 1

Status:

```text
EXECUTION:                     SUCCESS
NON-SOLAR / FORCING-BLIND:     YES
ALL SD1 TERM FAMILIES NONZERO: YES
DISCRETELY STATIONARY:         NO
USABLE AS NUMERICAL FLOOR:     NO
ACCEPTANCE RULE CHANGED:       NO
```

Workflow: `manufactured-base-floor-calibration`

Run: `35660936743`

Commit: `c2dfaf045b0c0200fc13c19b818260cb0e326874`

## Purpose

This lane was intended to measure

[
S_{\rm base}=\sum_j\|r_j\|,
\qquad
R_{\rm base}
=
\frac{\|\sum_j r_j\|}{S_{\rm base}}
]

on a non-solar balanced state containing nonzero velocity, magnetic potential,
and thickness anomaly before any observational (Omega_0) record enters.

The manufactured continuum target used fixed synthetic amplitudes

[
U_{\rm amp}=10,
\qquad
B_{\rm amp}=8,
]

and obtained its thickness anomaly analytically from the already-frozen
meridional balance relation B1. No BURGAMOTS forcing or solar (Omega_0) was
consumed.

## Observed compatible-operator decomposition

Coefficient-centered A1 path:

| contribution | dual norm |
|---|---:|
| advection / metric | (3.40141922172934699\times10^2) |
| Coriolis | (2.46694199662195277\times10^{-3}) |
| depth | (1.26355993818093623\times10^2) |
| magnetic | (2.16065127715182996\times10^2) |
| total | (1.04574110754813248\times10^1) |

Thus

[
S_{\rm base}
=
6.82565510648207919\times10^2,
]

[
R_{\rm base}
=
1.53207434485670060\times10^{-2},
]

and

[
\|\dot u_h\|_{L^2}
=
8.92200773970223793.
]

The previous uncentered representative produced essentially the same result,
confirming that this large residual is unrelated to the hydro constant-mode
problem corrected by A1.

## Interpretation

This projected continuum equilibrium is **not a sufficiently stationary
discrete BASE-P state**. Its residual is many orders of magnitude above an
arithmetic cancellation floor. Therefore

[
\boxed{
R_{\rm base}\approx1.53\times10^{-2}
\text{ is NOT a numerical tolerance estimate.}
}
]

No BASE acceptance rule may be frozen from this run.

The result instead establishes an engineering requirement: numerical-floor
calibration must be performed on a state that has first been balanced by the
actual discrete stationary BASE operator, not merely by projecting a continuum
balance formula onto the FE spaces.

## Additional diagnostics

The run reported:

- (H_{\min}=9.98788585336435176\times10^2>0);
- gauge integral (6.58673116049612872\times10^{-12});
- DIVB L2 (2.52151683996980086\times10^{-10}).

These absolute values are recorded as diagnostics only. No new gauge or DIVB
threshold is inferred from this run because the manufactured fields have large
physical coefficient scales and the state did not satisfy the primary
stationarity requirement.

## Next unit for this lane

The next meaningful Lane B unit is not another tolerance probe. It is a generic
non-solar **discrete stationary balance solve** using the actual BASE-P
operator, after which the termwise cancellation floor can be measured once on
the admitted state.

That implementation can also become the solver infrastructure later needed by
BASE-PHYS. No solar data or BURGAMOTS response is required to build it.
