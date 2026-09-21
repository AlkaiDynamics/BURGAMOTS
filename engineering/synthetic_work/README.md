# Synthetic M1 work-law engineering branch

Status: **speculative / isolated / unmerged**

Purpose: prove the forcing interface and external-work accounting with an
analytic fake time-dependent potential before any immutable BURGAMOTS
ephemeris potential is allowed into the timestepper.

The first harness uses

```text
Phi_syn(t,x) = rate * t * Y(x)
```

with a smooth arbitrary spatial shape and the frozen Firedrake mesh/spaces/dxq.
Because the fake potential is independent of the vertical coordinate, the
external-potential energy is `integral H*Phi_syn dxq`. The harness verifies the
exact midpoint bilinear decomposition and its external-work term.

Firewall:
- no ephemerides;
- no solar observations;
- no response-dependent tuning;
- no physical BURGAMOTS forcing import;
- no merge into the certification spine.

Next engineering step after this algebraic harness is to couple the same
potential interface to the speculative discrete-gradient stepper while keeping
M0 and synthetic-M1 state/numerical setup identical.
