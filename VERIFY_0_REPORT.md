# VERIFY_0_REPORT

## Status

```text
VERIFY-0: PASSED
M0 physical crucible: NOT YET RUN
M1: NOT AUTHORIZED
```

## Verified environment

- Repository: `AlkaiDynamics/BURGAMOTS`
- Branch: `refactor/evidence-integrity`
- Tested commit: `e6d6b2beeeac4c2e66b90534cf15d5cb9eb877b3`
- GitHub Actions run: `35640175433`
- Firedrake: `2026.4.1`
- Firedrake image digest: `sha256:798066ee679c94cb379021a0a65099b218702f819d3b0c41f703de16f039e98c`
- Gusto commit: `669f6372cd334ed47c9c7b38f26e591732273f75`

## Verified finite-element contract

```text
V0 = <<CG2 on a triangle> + <B3 on a triangle>>
V1 = <BDFM2 on a triangle>
V2 = <DG1 on a triangle>
geometry degree = 3
quadrature = canonical degree 12
```

The passing compatible magnetic-flux map is:

```python
m_h = Function(V1)
m_h.interpolate(cross(CellNormal(mesh), grad(A_h)))
```

No L2 projection or mass-matrix solve is used.

## Passing invariants

```text
DIVB max residual      = 3.25192608313473709e-15
DIVB L2 norm           = 2.93321495868915036e-13
zero velocity residual = 3.17136683541494545e-15
zero thickness residual= 0
zero magnetic norm     = 0
```

Frozen acceptance tolerance:

```text
1e-12
```

All VERIFY-0 gates passed.

## Rejected implementation paths

### Gusto domain.perp reconstruction

```python
m_h.interpolate(domain.perp(grad(A_h)))
```

failed the frozen DIVB gate:

```text
DIVB max residual = 3.34691215876413992e-04
DIVB L2 norm      = 3.35258603525875262e-02
```

Reason: `domain.perp` uses a separately interpolated normal field and is not the commuting v1 de Rham map.

### Direct UFL curl

```python
m_h.interpolate(curl(A_h))
```

was rejected because the scalar UFL curl is represented as an intrinsic 2-vector, while BDFM on the embedded sphere has a 3-component physical value shape.

## Interpretation

VERIFY-0 certifies the numerical substrate only:

```text
CG2+B3 -> BDFM2 -> DG1
degree-3 sphere geometry
fixed canonical quadrature degree 12
symbolic CellNormal-compatible magnetic flux map
DIVB below frozen tolerance
zero verification state below frozen tolerance
```

It does not establish:

- the physical base-state projection;
- D1-D3;
- weak PV;
- SD1-SD3;
- the exact discrete-gradient timestep;
- NUM-POS;
- long-window M0 invariants;
- convergence;
- any M1 result;
- any scientific hypothesis.

## Next gate

```text
D1-D3 + PV + SD1-SD3
then semidiscrete energy-cancellation verification
then BASE-P
then exact discrete-gradient + NUM-POS
then physical M0 crucible
```
