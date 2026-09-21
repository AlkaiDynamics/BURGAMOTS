"""Synthetic time-dependent potential / work-law engineering harness.

ENGINEERING BRANCH ONLY.
This deliberately uses an analytic fake potential and no ephemeris, observation,
solar-response result, or BURGAMOTS forcing data.

For Phi_syn(t,x) = rate * t * Y(x), independent of vertical coordinate zeta,

    E_ext = integral H * Phi_syn dxq

and the exact midpoint bilinear identity is

    Delta E_ext
      = integral Phi_bar * Delta H dxq
      + integral H_bar * Delta Phi dxq.

The second term is external work.  Because Phi_syn is linear in time,

    Delta Phi = dt * partial_t Phi

exactly, so the harness also verifies the finite-step work identity

    W_ext = dt * integral H_bar * partial_t Phi dxq.

This is plumbing verification only, not M1 scientific execution.
"""

import numpy as np
from firedrake import (
    Constant,
    Function,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    assemble,
    dx,
)
from gusto.core.function_spaces import Spaces


SYNTHETIC_RATE = 2.5e-4


def build_frozen_space():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    return mesh, spaces.L2, dx(domain=mesh, degree=12, scheme="canonical")


def synthetic_shape(mesh):
    x = SpatialCoordinate(mesh)
    # Arbitrary smooth, non-axisymmetric analytic shape; intentionally non-solar.
    return 0.31 * x[0] - 0.23 * x[1] + 0.17 * x[2]


def synthetic_phi(mesh, t):
    return Constant(SYNTHETIC_RATE * t) * synthetic_shape(mesh)


def manufactured_thickness_pair(V2):
    H_minus = Function(V2, name="synthetic_H_minus")
    H_plus = Function(V2, name="synthetic_H_plus")
    i = np.arange(H_minus.dat.data.size, dtype=float)
    H_minus.dat.data[:] = 1000.0 + 0.4 * np.cos(i)
    H_plus.dat.data[:] = 1000.0 + 0.4 * np.cos(i + 0.07)
    if float(np.min(H_minus.dat.data_ro)) <= 0.0:
        raise AssertionError("H_minus is not positive")
    if float(np.min(H_plus.dat.data_ro)) <= 0.0:
        raise AssertionError("H_plus is not positive")
    return H_minus, H_plus


def run_synthetic_work_identity():
    mesh, V2, dxq = build_frozen_space()
    H_minus, H_plus = manufactured_thickness_pair(V2)

    t_minus = 1.25
    dt = 0.2
    t_plus = t_minus + dt

    phi_minus = synthetic_phi(mesh, t_minus)
    phi_plus = synthetic_phi(mesh, t_plus)
    phi_bar = 0.5 * (phi_plus + phi_minus)
    H_bar = 0.5 * (H_plus + H_minus)
    dH = H_plus - H_minus
    dphi = phi_plus - phi_minus
    dphi_dt = Constant(SYNTHETIC_RATE) * synthetic_shape(mesh)

    E_minus = float(assemble(H_minus * phi_minus * dxq))
    E_plus = float(assemble(H_plus * phi_plus * dxq))
    delta_E_ext = E_plus - E_minus

    state_increment = float(assemble(phi_bar * dH * dxq))
    external_work = float(assemble(H_bar * dphi * dxq))
    midpoint_work = float(assemble(Constant(dt) * H_bar * dphi_dt * dxq))

    bilinear_residual = delta_E_ext - (state_increment + external_work)
    time_identity_residual = external_work - midpoint_work

    # Paired-arm plumbing: M0 sees the identical state pair but Phi == 0.
    M0_E_minus = float(assemble(H_minus * Constant(0.0) * dxq))
    M0_E_plus = float(assemble(H_plus * Constant(0.0) * dxq))
    M0_delta = M0_E_plus - M0_E_minus

    print("SYNTHETIC WORK LAW: ENGINEERING_ONLY_UNMERGED")
    print("SYNTHETIC WORK LAW forcing source                  = ANALYTIC_FAKE_PHI_ONLY")
    print(f"SYNTHETIC WORK LAW t-                              = {t_minus:.17e}")
    print(f"SYNTHETIC WORK LAW t+                              = {t_plus:.17e}")
    print(f"SYNTHETIC WORK LAW dt                              = {dt:.17e}")
    print(f"SYNTHETIC WORK LAW E_ext-                          = {E_minus:.17e}")
    print(f"SYNTHETIC WORK LAW E_ext+                          = {E_plus:.17e}")
    print(f"SYNTHETIC WORK LAW Delta E_ext                     = {delta_E_ext:.17e}")
    print(f"SYNTHETIC WORK LAW Phi_bar*DeltaH contribution     = {state_increment:.17e}")
    print(f"SYNTHETIC WORK LAW external work H_bar*DeltaPhi    = {external_work:.17e}")
    print(f"SYNTHETIC WORK LAW bilinear identity residual      = {bilinear_residual:.17e}")
    print(f"SYNTHETIC WORK LAW dt*H_bar*partial_tPhi            = {midpoint_work:.17e}")
    print(f"SYNTHETIC WORK LAW time-work identity residual     = {time_identity_residual:.17e}")
    print(f"SYNTHETIC WORK LAW M0 matched-state ext delta       = {M0_delta:.17e}")
    print("SYNTHETIC WORK LAW real BURGAMOTS forcing consumed  = NO")
    print("SYNTHETIC WORK LAW observations consumed            = NO")


if __name__ == "__main__":
    run_synthetic_work_identity()
