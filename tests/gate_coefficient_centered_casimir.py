"""Binary coefficient-centered Casimir amendment gate.

Runs exactly two scientific checks:
1. kkt0_hydro_reference under the unchanged BASE-KKT-0 < 1e-12 gate.
2. the existing nontrivial Stage-2 semidiscrete Hamiltonian certification
   under the unchanged Stage-2 criterion.

The candidate gravitational representation uses a coefficient-space DG1
anomaly eta_h = H_h - H0_h consistently in:
- centered discrete Hamiltonian;
- D2 gravity derivative;
- exact discrete-gradient gravity term helper.

No physical state, continuum equation, FE space, mesh, quadrature, magnetic
map/prior, or acceptance threshold is changed.
"""

import numpy as np
from math import sqrt

from firedrake import (
    CellNormal,
    Constant,
    Function,
    FunctionSpace,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    TestFunction,
    TestFunctions,
    TrialFunction,
    TrialFunctions,
    assemble,
    cross,
    div,
    dx,
    grad,
    inner,
    solve,
)
from gusto.core.function_spaces import Spaces

from numerics.coefficient_centering import (
    coefficient_anomaly,
    exact_background_field,
    centered_gravity_d2,
    centered_gravity_energy_density,
    centered_gravity_discrete_gradient,
)


H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5

BASE_GATE = 1.0e-12
GAUGE_TOL = 1.0e-12
STAGE2_ABS_TOL = 1.0e-12
STAGE2_REL_TOL = 5.0e-14


def strict_solver_params():
    return {"ksp_rtol": 1.0e-14, "ksp_atol": 1.0e-15}


def matfree_real_solver_params():
    return {
        "mat_type": "matfree",
        "ksp_type": "fgmres",
        "ksp_rtol": 1.0e-14,
        "ksp_atol": 1.0e-15,
        "pc_type": "fieldsplit",
        "pc_fieldsplit_type": "schur",
        "pc_fieldsplit_schur_fact_type": "full",
        "pc_fieldsplit_0_fields": "0",
        "pc_fieldsplit_1_fields": "1",
        "fieldsplit_0": {
            "ksp_type": "preonly",
            "pc_type": "python",
            "pc_python_type": "firedrake.AssembledPC",
            "assembled": {
                "ksp_type": "gmres",
                "ksp_rtol": 1.0e-14,
                "ksp_atol": 1.0e-15,
                "pc_type": "jacobi",
            },
        },
        "fieldsplit_1": {
            "ksp_type": "gmres",
            "ksp_rtol": 1.0e-14,
            "ksp_atol": 1.0e-15,
            "pc_type": "none",
        },
    }


def l2_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def build():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")
    return mesh, V0, V1, V2, dxq


def solve_zero_mean_adot(mesh, V0, dxq, rhs_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    mixed = Function(WA, name=f"{name}_lambda")
    adot_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)
    solve(
        (gamma * adot_trial + lambda_trial * gamma + mu * adot_trial) * dxq
        == gamma * rhs_expr * dxq,
        mixed,
        solver_parameters=matfree_real_solver_params(),
    )
    adot_h, _ = mixed.subfunctions
    return adot_h


def build_operators(mesh, V0, V1, V2, dxq, u_h, H_h, A_h, tag):
    n = CellNormal(mesh)
    kappa = Constant(KAPPA_VALUE)

    def rot(v):
        return cross(n, v)

    H0_h = exact_background_field(V2, H0_VALUE, name=f"{tag}_H0_h")
    eta_h = coefficient_anomaly(H_h, H0_h, name=f"{tag}_eta_h")

    m_h = Function(V1, name=f"{tag}_m_h")
    m_h.interpolate(cross(n, grad(A_h)))

    w = TestFunction(V1)
    gamma = TestFunction(V0)
    phi = TestFunction(V2)

    U_h = Function(V1, name=f"{tag}_U_h")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    K_h = Function(V2, name=f"{tag}_K_h")
    K_trial = TrialFunction(V2)
    K_rhs = (
        0.5 * inner(u_h, u_h)
        - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
        + centered_gravity_d2(eta_h, GSTAR_VALUE)
    )
    solve(
        phi * K_trial * dxq == phi * K_rhs * dxq,
        K_h,
        solver_parameters=strict_solver_params(),
    )

    M_h = Function(V0, name=f"{tag}_M_h")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    q_h = Function(V0, name=f"{tag}_q_h")
    q_trial = TrialFunction(V0)
    solve(
        H_h * q_trial * gamma * dxq
        == (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
    )

    sd1 = (
        -q_h * inner(w, rot(U_h))
        + div(w) * K_h
        + (M_h / H_h) * inner(grad(A_h), w)
    )

    return {
        "n": n,
        "rot": rot,
        "H0_h": H0_h,
        "eta_h": eta_h,
        "m_h": m_h,
        "U_h": U_h,
        "K_h": K_h,
        "M_h": M_h,
        "q_h": q_h,
        "w": w,
        "phi": phi,
        "gamma": gamma,
        "sd1": sd1,
    }


def solve_rates(mesh, V0, V1, V2, dxq, H_h, A_h, ops, tag):
    du_h = Function(V1, name=f"{tag}_du")
    du_trial = TrialFunction(V1)
    solve(
        inner(ops["w"], du_trial) * dxq == ops["sd1"] * dxq,
        du_h,
        solver_parameters=strict_solver_params(),
    )

    dH_h = Function(V2, name=f"{tag}_dH")
    dH_trial = TrialFunction(V2)
    solve(
        ops["phi"] * dH_trial * dxq
        == -ops["phi"] * div(ops["U_h"]) * dxq,
        dH_h,
        solver_parameters=strict_solver_params(),
    )

    dA_h = solve_zero_mean_adot(
        mesh,
        V0,
        dxq,
        -inner(ops["U_h"] / H_h, grad(A_h)),
        f"{tag}_dA",
    )
    return du_h, dH_h, dA_h


def centered_hamiltonian(H_h, u_h, ops, dxq):
    kappa = Constant(KAPPA_VALUE)
    return float(
        assemble(
            (
                0.5 * H_h * inner(u_h, u_h)
                + inner(ops["m_h"], ops["m_h"]) / (2.0 * kappa * H_h)
                + centered_gravity_energy_density(ops["eta_h"], GSTAR_VALUE)
            )
            * dxq
        )
    )


def hydro_gate():
    mesh, V0, V1, V2, dxq = build()
    u_h = Function(V1, name="hydro_u")
    H_h = Function(V2, name="hydro_H")
    A_h = Function(V0, name="hydro_A")
    u_h.assign(0.0)
    H_h.assign(H0_VALUE)
    A_h.assign(0.0)

    ops = build_operators(mesh, V0, V1, V2, dxq, u_h, H_h, A_h, "hydro")
    du_h, dH_h, dA_h = solve_rates(
        mesh, V0, V1, V2, dxq, H_h, A_h, ops, "hydro"
    )

    eta_coeff_max = float(np.max(np.abs(ops["eta_h"].dat.data_ro)))
    K_coeff_max = float(np.max(np.abs(ops["K_h"].dat.data_ro)))
    du_norm = l2_vector(du_h, dxq)
    dH_norm = l2_scalar(dH_h, dxq)
    dA_norm = l2_scalar(dA_h, dxq)
    R = max(du_norm, dH_norm, dA_norm)
    energy = centered_hamiltonian(H_h, u_h, ops, dxq)

    print("COEFF-CENTER HYDRO eta coeff max              = "
          f"{eta_coeff_max:.17e}")
    print("COEFF-CENTER HYDRO K coeff max                = "
          f"{K_coeff_max:.17e}")
    print("COEFF-CENTER HYDRO ||du_dt|| L2               = "
          f"{du_norm:.17e}")
    print("COEFF-CENTER HYDRO ||dH_dt|| L2               = "
          f"{dH_norm:.17e}")
    print("COEFF-CENTER HYDRO ||dA_dt|| L2               = "
          f"{dA_norm:.17e}")
    print("COEFF-CENTER HYDRO centered Hamiltonian        = "
          f"{energy:.17e}")
    print("COEFF-CENTER HYDRO R_h^M0                     = "
          f"{R:.17e}")
    print("COEFF-CENTER HYDRO frozen gate                 = "
          f"{BASE_GATE:.17e}")

    assert eta_coeff_max == 0.0, "hydro eta_h is not coefficient-exact zero"
    assert R < BASE_GATE, f"hydro R_h^M0 {R} >= {BASE_GATE}"
    print("COEFF-CENTER HYDRO GATE                        = PASSED")


def stage2_gate():
    mesh, V0, V1, V2, dxq = build()

    u_h = Function(V1, name="stage2_u")
    H_h = Function(V2, name="stage2_H")
    A_h = Function(V0, name="stage2_A")
    u_h.dat.data[:] = np.sin(np.arange(u_h.dat.data.size, dtype=float))
    H_h.dat.data[:] = H0_VALUE + 10.0 * np.cos(np.arange(H_h.dat.data.size, dtype=float))
    A_h.dat.data[:] = np.sin(np.arange(A_h.dat.data.size, dtype=float))

    assert float(np.min(H_h.dat.data_ro)) > 0.0

    ops = build_operators(mesh, V0, V1, V2, dxq, u_h, H_h, A_h, "stage2")
    du_h, dH_h, dA_h = solve_rates(
        mesh, V0, V1, V2, dxq, H_h, A_h, ops, "stage2"
    )

    gauge = abs(float(assemble(dA_h * dxq)))
    assert gauge < GAUGE_TOL

    kinetic = float(assemble(inner(ops["U_h"], du_h) * dxq))
    thickness = float(assemble(ops["K_h"] * dH_h * dxq))
    magnetic = float(assemble(ops["M_h"] * dA_h * dxq))
    rate = kinetic + thickness + magnetic
    scale = abs(kinetic) + abs(thickness) + abs(magnetic)
    assert scale > 0.0
    relative = abs(rate) / scale

    # Exercise the exact discrete-gradient gravity helper on two derived eta fields
    # without changing the Stage-2 state.
    H_plus = Function(V2, name="stage2_H_plus_for_dg")
    H_plus.assign(H_h)
    H_plus.dat.data[:] += 1.0e-8 * dH_h.dat.data_ro
    eta_plus = coefficient_anomaly(H_plus, ops["H0_h"], name="stage2_eta_plus")
    Kbar_g = centered_gravity_discrete_gradient(
        ops["eta_h"], eta_plus, GSTAR_VALUE
    )
    dg_gravity_norm = l2_scalar(Kbar_g, dxq)

    energy = centered_hamiltonian(H_h, u_h, ops, dxq)

    print("COEFF-CENTER STAGE2 kinetic contribution       = "
          f"{kinetic:.17e}")
    print("COEFF-CENTER STAGE2 thickness contribution     = "
          f"{thickness:.17e}")
    print("COEFF-CENTER STAGE2 magnetic contribution      = "
          f"{magnetic:.17e}")
    print("COEFF-CENTER STAGE2 scale                      = "
          f"{scale:.17e}")
    print("COEFF-CENTER STAGE2 |dHtilde/dt|              = "
          f"{abs(rate):.17e}")
    print("COEFF-CENTER STAGE2 relative cancellation      = "
          f"{relative:.17e}")
    print("COEFF-CENTER STAGE2 gauge                      = "
          f"{gauge:.17e}")
    print("COEFF-CENTER STAGE2 centered Hamiltonian        = "
          f"{energy:.17e}")
    print("COEFF-CENTER STAGE2 DG gravity probe L2         = "
          f"{dg_gravity_norm:.17e}")

    assert abs(rate) < STAGE2_ABS_TOL or relative < STAGE2_REL_TOL, (
        f"Stage-2 candidate failed: abs={abs(rate)}, rel={relative}"
    )
    print("COEFF-CENTER STAGE2 GATE                       = PASSED")


def test_coefficient_centered_amendment_gate():
    print("COEFFICIENT-CENTERED NUMERICAL AMENDMENT GATE")
    print("BASE-KKT-0 gate unchanged: R_h^M0 < 1e-12")
    hydro_gate()
    stage2_gate()
    print("COEFFICIENT-CENTERED AMENDMENT GATE: PASSED")
    print("FORMAL AMENDMENT ELIGIBLE: YES")


if __name__ == "__main__":
    test_coefficient_centered_amendment_gate()
