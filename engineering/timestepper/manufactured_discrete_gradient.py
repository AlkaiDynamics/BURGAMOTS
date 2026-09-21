"""Speculative exact-discrete-gradient timestepper kernel.

ENGINEERING BRANCH ONLY.
- Frozen Firedrake/Gusto spaces and dxq are reused.
- No BURGAMOTS forcing is consumed.
- No production/certification file is modified.
- This module validates the exact discrete-gradient chain rule and NUM-POS
  mechanics on manufactured FE states before a nonlinear coupled stepper is
  wired to SD1-SD3.

It implements the frozen v1 pointwise discrete-gradient pieces:
  Ubar      = Hbar * ubar
  K_kin     = 1/4 (|u+|^2 + |u-|^2)
  G_m       = 1/(4*kappa) (1/H+ + 1/H-) (m+ + m-)
  K_mag     = -( |m+|^2 + |m-|^2 ) / (4*kappa*H+*H-)
  K_gravity = g*/2 (H+ + H-)
"""

from math import sqrt

import numpy as np
from firedrake import (
    CellNormal,
    Constant,
    Function,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    assemble,
    cross,
    dx,
    grad,
    inner,
)
from gusto.core.function_spaces import Spaces


GSTAR = 9.81
KAPPA = 1.0


def build_frozen_space():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    return mesh, spaces.H1, spaces.HDiv, spaces.L2, dx(
        domain=mesh, degree=12, scheme="canonical"
    )


def num_pos(H_h):
    """Frozen DG1 positivity gate: every cell-local nodal value must be > 0."""
    element = str(H_h.function_space().ufl_element())
    if "DG1" not in element:
        raise ValueError(f"NUM-POS requires frozen DG1 thickness space, got {element}")
    minimum = float(np.min(H_h.dat.data_ro))
    return minimum > 0.0, minimum


def retry_dt_after_num_pos(dt, H_candidate):
    accepted, minimum = num_pos(H_candidate)
    return {
        "accepted": accepted,
        "minimum": minimum,
        "dt_next": dt if accepted else 0.5 * dt,
    }


def hamiltonian_density(H, u, m):
    return (
        0.5 * H * inner(u, u)
        + inner(m, m) / (2.0 * Constant(KAPPA) * H)
        + 0.5 * Constant(GSTAR) * H**2
    )


def manufactured_pair():
    mesh, V0, V1, V2, dxq = build_frozen_space()
    n = CellNormal(mesh)

    u_minus = Function(V1, name="u_minus")
    u_plus = Function(V1, name="u_plus")
    H_minus = Function(V2, name="H_minus")
    H_plus = Function(V2, name="H_plus")
    A_minus = Function(V0, name="A_minus")
    A_plus = Function(V0, name="A_plus")

    iu = np.arange(u_minus.dat.data.size, dtype=float)
    iH = np.arange(H_minus.dat.data.size, dtype=float)
    iA = np.arange(A_minus.dat.data.size, dtype=float)

    u_minus.dat.data[:] = 0.02 * np.sin(iu)
    u_plus.dat.data[:] = 0.02 * np.sin(iu + 0.17)

    H_minus.dat.data[:] = 1000.0 + 0.5 * np.cos(iH)
    H_plus.dat.data[:] = 1000.0 + 0.5 * np.cos(iH + 0.11)

    A_minus.dat.data[:] = 1.0e-3 * np.sin(iA)
    A_plus.dat.data[:] = 1.0e-3 * np.sin(iA + 0.13)

    ok_minus, min_minus = num_pos(H_minus)
    ok_plus, min_plus = num_pos(H_plus)
    if not ok_minus or not ok_plus:
        raise AssertionError(
            f"manufactured positive state failed NUM-POS: {min_minus}, {min_plus}"
        )

    m_minus = Function(V1, name="m_minus")
    m_plus = Function(V1, name="m_plus")
    m_minus.interpolate(cross(n, grad(A_minus)))
    m_plus.interpolate(cross(n, grad(A_plus)))

    return (
        mesh,
        dxq,
        u_minus,
        u_plus,
        H_minus,
        H_plus,
        m_minus,
        m_plus,
    )


def discrete_gradient_chain_rule():
    (
        mesh,
        dxq,
        u_minus,
        u_plus,
        H_minus,
        H_plus,
        m_minus,
        m_plus,
    ) = manufactured_pair()

    Hbar = 0.5 * (H_plus + H_minus)
    ubar = 0.5 * (u_plus + u_minus)

    dU = u_plus - u_minus
    dH = H_plus - H_minus
    dm = m_plus - m_minus

    Ubar = Hbar * ubar
    K_kin = 0.25 * (inner(u_plus, u_plus) + inner(u_minus, u_minus))
    G_m = (
        Constant(1.0 / (4.0 * KAPPA))
        * (1.0 / H_plus + 1.0 / H_minus)
        * (m_plus + m_minus)
    )
    K_mag = -(
        inner(m_plus, m_plus) + inner(m_minus, m_minus)
    ) / (Constant(4.0 * KAPPA) * H_plus * H_minus)
    K_gravity = 0.5 * Constant(GSTAR) * (H_plus + H_minus)

    energy_minus = float(assemble(hamiltonian_density(H_minus, u_minus, m_minus) * dxq))
    energy_plus = float(assemble(hamiltonian_density(H_plus, u_plus, m_plus) * dxq))
    delta_energy = energy_plus - energy_minus

    kinetic_work = float(assemble((inner(Ubar, dU) + K_kin * dH) * dxq))
    magnetic_work = float(assemble((inner(G_m, dm) + K_mag * dH) * dxq))
    gravity_work = float(assemble((K_gravity * dH) * dxq))
    dg_sum = kinetic_work + magnetic_work + gravity_work
    residual = delta_energy - dg_sum

    print("DG KERNEL manufactured pair: NUM-POS = PASS")
    print(f"DG KERNEL H- min                         = {float(np.min(H_minus.dat.data_ro)):.17e}")
    print(f"DG KERNEL H+ min                         = {float(np.min(H_plus.dat.data_ro)):.17e}")
    print(f"DG KERNEL delta Hamiltonian              = {delta_energy:.17e}")
    print(f"DG KERNEL kinetic discrete work          = {kinetic_work:.17e}")
    print(f"DG KERNEL magnetic discrete work         = {magnetic_work:.17e}")
    print(f"DG KERNEL gravity discrete work          = {gravity_work:.17e}")
    print(f"DG KERNEL chain-rule sum                 = {dg_sum:.17e}")
    print(f"DG KERNEL chain-rule arithmetic residual = {residual:.17e}")

    # Explicit NUM-POS retry policy exercise without mutating the accepted state.
    H_bad = Function(H_plus.function_space(), name="H_bad")
    H_bad.assign(H_plus)
    H_bad.dat.data[0] = -1.0e-6
    retry = retry_dt_after_num_pos(2.0, H_bad)
    if retry["accepted"] or retry["dt_next"] != 1.0:
        raise AssertionError(f"NUM-POS retry policy failed: {retry}")
    print(f"DG KERNEL synthetic NUM-POS failure min  = {retry['minimum']:.17e}")
    print(f"DG KERNEL rejected dt ->                  = {retry['dt_next']:.17e}")
    print("DG KERNEL STATUS                          = ENGINEERING_ONLY_UNMERGED")


if __name__ == "__main__":
    discrete_gradient_chain_rule()
