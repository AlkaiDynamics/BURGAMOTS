"""BASE-KKT-0 Casimir-centering diagnostic only.

This file is intentionally separate from the frozen uncentered implementations.
It compares the existing Hamiltonian representative against

    H_tilde = H - gstar*H0*M_h + 0.5*gstar*H0**2*A_h,

where M_h = integral H_h dxq and A_h = integral 1 dxq use the same frozen
canonical degree-12 quadrature as every other discrete functional.

No production/certification file is modified by this diagnostic.
"""

from math import sqrt

import numpy as np
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
from petsc4py import PETSc


STATIONARY_RATE_TOL = 1.0e-12
GAUGE_TOL = 1.0e-12
STAGE2_ABS_TOL = 1.0e-12
STAGE2_REL_TOL = 5.0e-14
H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5


def require(condition, message):
    if not condition:
        raise AssertionError(message)


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


def l2_norm_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_norm_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def dual_norm(cofunction, norm_type=PETSc.NormType.NORM_2):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def solve_zero_mean_scalar_projection(mesh, V0, dxq, rhs_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    mixed = Function(WA, name=f"{name}_lambda")
    scalar_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)
    solve(
        (gamma * scalar_trial + lambda_trial * gamma + mu * scalar_trial) * dxq
        == gamma * rhs_expr * dxq,
        mixed,
        solver_parameters=matfree_real_solver_params(),
    )
    scalar_h, _ = mixed.subfunctions
    return scalar_h


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


def solve_v1_rate(V1, dxq, rhs_form, name):
    du_h = Function(V1, name=name)
    du_trial = TrialFunction(V1)
    w = TestFunction(V1)
    solve(
        inner(w, du_trial) * dxq == rhs_form * dxq,
        du_h,
        solver_parameters=strict_solver_params(),
    )
    return du_h


def hamiltonian_uncentered(H_h, u_h, m_h, kappa, gstar, dxq):
    return float(
        assemble(
            (
                0.5 * H_h * inner(u_h, u_h)
                + inner(m_h, m_h) / (2.0 * kappa * H_h)
                + 0.5 * gstar * H_h**2
            )
            * dxq
        )
    )


def hamiltonian_centered(H_h, u_h, m_h, kappa, gstar_value, H0_value, dxq):
    H_unc = hamiltonian_uncentered(H_h, u_h, m_h, kappa, Constant(gstar_value), dxq)
    mass = float(assemble(H_h * dxq))
    area = float(assemble(Constant(1.0) * dxq))
    return H_unc - gstar_value * H0_value * mass + 0.5 * gstar_value * H0_value**2 * area


def build_frozen_mesh_spaces():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")
    return mesh, V0, V1, V2, dxq


def hydro_comparison():
    mesh, V0, V1, V2, dxq = build_frozen_mesh_spaces()
    n = CellNormal(mesh)
    gstar = Constant(GSTAR_VALUE)
    H0 = Constant(H0_VALUE)
    kappa = Constant(KAPPA_VALUE)

    def rot(v):
        return cross(n, v)

    u_target = Function(V1, name="hydro_u_target")
    A_target = Function(V0, name="hydro_A_target")

    w = TestFunction(V1)
    u_trial = TrialFunction(V1)
    u_h = Function(V1, name="hydro_u_h")
    solve(
        H0 * inner(w, u_trial) * dxq == H0 * inner(w, u_target) * dxq,
        u_h,
        solver_parameters=strict_solver_params(),
    )

    phi = TestFunction(V2)
    H_trial = TrialFunction(V2)
    H_target = Constant(H0_VALUE)
    H_h = Function(V2, name="hydro_H_h")
    solve(
        phi * H_trial * dxq == phi * H_target * dxq,
        H_h,
        solver_parameters=strict_solver_params(),
    )

    A_h = solve_zero_mean_scalar_projection(mesh, V0, dxq, Constant(0.0), "hydro_A_h")
    m_h = Function(V1, name="hydro_m_h")
    m_h.interpolate(cross(n, grad(A_h)))
    m_target = Function(V1, name="hydro_m_target")
    m_target.interpolate(cross(n, grad(A_target)))

    U_h = Function(V1, name="hydro_U_h")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    K_unc = Function(V2, name="hydro_K_uncentered")
    K_ctr = Function(V2, name="hydro_K_centered")
    K_trial = TrialFunction(V2)
    K_common = 0.5 * inner(u_h, u_h) - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * H_h) * dxq,
        K_unc,
        solver_parameters=strict_solver_params(),
    )
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * (H_h - H0)) * dxq,
        K_ctr,
        solver_parameters=strict_solver_params(),
    )

    gamma = TestFunction(V0)
    M_h = Function(V0, name="hydro_M_h")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    q_h = Function(V0, name="hydro_q_h")
    q_trial = TrialFunction(V0)
    solve(
        H_h * q_trial * gamma * dxq
        == (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
    )

    pressure_unc_form = div(w) * K_unc
    pressure_ctr_form = div(w) * K_ctr
    sd1_unc = (
        -q_h * inner(w, rot(U_h))
        + pressure_unc_form
        + (M_h / H_h) * inner(grad(A_h), w)
    )
    sd1_ctr = (
        -q_h * inner(w, rot(U_h))
        + pressure_ctr_form
        + (M_h / H_h) * inner(grad(A_h), w)
    )

    raw_pressure_unc = assemble(pressure_unc_form * dxq)
    raw_pressure_ctr = assemble(pressure_ctr_form * dxq)
    raw_sd1_unc = assemble(sd1_unc * dxq)
    raw_sd1_ctr = assemble(sd1_ctr * dxq)

    du_unc = solve_v1_rate(V1, dxq, sd1_unc, "hydro_du_uncentered")
    du_ctr = solve_v1_rate(V1, dxq, sd1_ctr, "hydro_du_centered")

    dH_h = Function(V2, name="hydro_dH")
    dH_trial = TrialFunction(V2)
    solve(
        phi * dH_trial * dxq == -phi * div(U_h) * dxq,
        dH_h,
        solver_parameters=strict_solver_params(),
    )
    dA_h = solve_zero_mean_adot(
        mesh, V0, dxq, -inner(U_h / H_h, grad(A_h)), "hydro_dA"
    )

    K_ctr_error = l2_norm_scalar(K_ctr, dxq)
    H_departure = l2_norm_scalar(H_h - H0, dxq)
    du_unc_norm = l2_norm_vector(du_unc, dxq)
    du_ctr_norm = l2_norm_vector(du_ctr, dxq)
    dH_norm = l2_norm_scalar(dH_h, dxq)
    dA_norm = l2_norm_scalar(dA_h, dxq)

    target_mass = float(assemble(H_target * dxq))
    projected_mass = float(assemble(H_h * dxq))
    mass_error = abs(projected_mass - target_mass)
    gauge = abs(float(assemble(A_h * dxq)))
    H_min = float(H_h.dat.data_ro.min())
    divb = l2_norm_scalar(div(m_h), dxq)
    base_d = float(
        assemble(
            (
                0.5 * H0 * inner(u_h - u_target, u_h - u_target)
                + inner(m_h - m_target, m_h - m_target) / (2.0 * kappa * H0)
                + 0.5 * gstar * (H_h - H_target) ** 2
            )
            * dxq
        )
    )

    mass_functional = float(assemble(H_h * dxq))
    area_functional = float(assemble(Constant(1.0) * dxq))
    H_unc_value = hamiltonian_uncentered(H_h, u_h, m_h, kappa, gstar, dxq)
    H_ctr_value = hamiltonian_centered(
        H_h, u_h, m_h, kappa, GSTAR_VALUE, H0_VALUE, dxq
    )

    print("CASIMIR HYDRO retained uncentered raw gstar-depth L2 = "
          f"{dual_norm(raw_pressure_unc):.17e}")
    print("CASIMIR HYDRO retained uncentered raw SD1 L2         = "
          f"{dual_norm(raw_sd1_unc):.17e}")
    print("CASIMIR HYDRO retained uncentered du_dt L2            = "
          f"{du_unc_norm:.17e}")
    print("CASIMIR HYDRO centered ||K_tilde-K_exact|| L2         = "
          f"{K_ctr_error:.17e}")
    print("CASIMIR HYDRO centered K_exact                        = "
          f"{0.0:.17e}")
    print("CASIMIR HYDRO observed ||H_h-H0|| L2                  = "
          f"{H_departure:.17e}")
    print("CASIMIR HYDRO centered raw gstar-depth L2             = "
          f"{dual_norm(raw_pressure_ctr):.17e}")
    print("CASIMIR HYDRO centered raw SD1 L2                     = "
          f"{dual_norm(raw_sd1_ctr):.17e}")
    print("CASIMIR HYDRO centered du_dt L2                       = "
          f"{du_ctr_norm:.17e}")
    print("CASIMIR HYDRO centered dH_dt L2                       = "
          f"{dH_norm:.17e}")
    print("CASIMIR HYDRO centered dA_dt L2                       = "
          f"{dA_norm:.17e}")
    print("CASIMIR HYDRO mass abs error                          = "
          f"{mass_error:.17e}")
    print("CASIMIR HYDRO gauge integral                          = "
          f"{gauge:.17e}")
    print("CASIMIR HYDRO DIVB L2                                 = "
          f"{divb:.17e}")
    print("CASIMIR HYDRO H minimum                               = "
          f"{H_min:.17e}")
    print("CASIMIR HYDRO BASE-D                                  = "
          f"{base_d:.17e}")
    print("CASIMIR HYDRO quadrature mass functional M_h          = "
          f"{mass_functional:.17e}")
    print("CASIMIR HYDRO quadrature area functional A_h          = "
          f"{area_functional:.17e}")
    print("CASIMIR HYDRO uncentered Hamiltonian                  = "
          f"{H_unc_value:.17e}")
    print("CASIMIR HYDRO centered Hamiltonian                    = "
          f"{H_ctr_value:.17e}")
    print("CASIMIR HYDRO frozen gate                             = "
          f"R_h^M0 < {STATIONARY_RATE_TOL:.1e}")
    print("CASIMIR HYDRO centered gate observation               = "
          f"{'CLEARS' if max(du_ctr_norm, dH_norm, dA_norm) < STATIONARY_RATE_TOL else 'DOES_NOT_CLEAR'}")


def stage2_centered_comparison_and_delta():
    mesh, V0, V1, V2, dxq = build_frozen_mesh_spaces()
    n = CellNormal(mesh)
    gstar = Constant(GSTAR_VALUE)
    H0 = Constant(H0_VALUE)
    kappa = Constant(KAPPA_VALUE)

    def rot(v):
        return cross(n, v)

    u_h = Function(V1, name="stage2_u")
    H_h = Function(V2, name="stage2_H")
    A_h = Function(V0, name="stage2_A")
    u_h.dat.data[:] = np.sin(np.arange(u_h.dat.data.size, dtype=float))
    H_h.dat.data[:] = H0_VALUE + 10.0 * np.cos(np.arange(H_h.dat.data.size, dtype=float))
    A_h.dat.data[:] = np.sin(np.arange(A_h.dat.data.size, dtype=float))
    require(float(np.min(H_h.dat.data_ro)) > 0.0, "Stage-2 diagnostic state lost positivity")

    m_h = Function(V1, name="stage2_m")
    m_h.interpolate(cross(n, grad(A_h)))

    gamma = TestFunction(V0)
    q_h = Function(V0, name="stage2_q")
    q_trial = TrialFunction(V0)
    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    solve(
        H_h * q_trial * gamma * dxq
        == (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
    )

    w = TestFunction(V1)
    U_h = Function(V1, name="stage2_U")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    phi = TestFunction(V2)
    K_trial = TrialFunction(V2)
    K_common = 0.5 * inner(u_h, u_h) - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
    K_unc = Function(V2, name="stage2_K_unc")
    K_ctr = Function(V2, name="stage2_K_ctr")
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * H_h) * dxq,
        K_unc,
        solver_parameters=strict_solver_params(),
    )
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * (H_h - H0)) * dxq,
        K_ctr,
        solver_parameters=strict_solver_params(),
    )

    M_h = Function(V0, name="stage2_M")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    sd1_unc = (
        -q_h * inner(w, rot(U_h))
        + div(w) * K_unc
        + (M_h / H_h) * inner(grad(A_h), w)
    )
    sd1_ctr = (
        -q_h * inner(w, rot(U_h))
        + div(w) * K_ctr
        + (M_h / H_h) * inner(grad(A_h), w)
    )
    du_unc = solve_v1_rate(V1, dxq, sd1_unc, "stage2_du_unc")
    du_ctr = solve_v1_rate(V1, dxq, sd1_ctr, "stage2_du_ctr")

    dH_h = Function(V2, name="stage2_dH")
    dH_trial = TrialFunction(V2)
    solve(
        phi * dH_trial * dxq == -phi * div(U_h) * dxq,
        dH_h,
        solver_parameters=strict_solver_params(),
    )
    dA_h = solve_zero_mean_adot(
        mesh, V0, dxq, -inner(U_h / H_h, grad(A_h)), "stage2_dA"
    )
    gauge_rate = abs(float(assemble(dA_h * dxq)))
    require(gauge_rate < GAUGE_TOL, f"centered Stage-2 gauge {gauge_rate} >= {GAUGE_TOL}")

    kinetic_unc = float(assemble(inner(U_h, du_unc) * dxq))
    thick_unc = float(assemble(K_unc * dH_h * dxq))
    magnetic_unc = float(assemble(M_h * dA_h * dxq))
    rate_unc = kinetic_unc + thick_unc + magnetic_unc
    scale_unc = abs(kinetic_unc) + abs(thick_unc) + abs(magnetic_unc)
    rel_unc = abs(rate_unc) / scale_unc

    kinetic_ctr = float(assemble(inner(U_h, du_ctr) * dxq))
    thick_ctr = float(assemble(K_ctr * dH_h * dxq))
    magnetic_ctr = float(assemble(M_h * dA_h * dxq))
    rate_ctr = kinetic_ctr + thick_ctr + magnetic_ctr
    scale_ctr = abs(kinetic_ctr) + abs(thick_ctr) + abs(magnetic_ctr)
    rel_ctr = abs(rate_ctr) / scale_ctr

    require(
        abs(rate_unc) < STAGE2_ABS_TOL or rel_unc < STAGE2_REL_TOL,
        "retained uncentered Stage-2 certification unexpectedly failed",
    )
    require(
        abs(rate_ctr) < STAGE2_ABS_TOL or rel_ctr < STAGE2_REL_TOL,
        "centered Stage-2 certification failed",
    )

    mass_rate = float(assemble(dH_h * dxq))
    print(f"CASIMIR STAGE2 retained uncentered dH/dt              = {abs(rate_unc):.17e}")
    print(f"CASIMIR STAGE2 retained uncentered relative            = {rel_unc:.17e}")
    print(f"CASIMIR STAGE2 centered dH_tilde/dt                    = {abs(rate_ctr):.17e}")
    print(f"CASIMIR STAGE2 centered relative                       = {rel_ctr:.17e}")
    print(f"CASIMIR STAGE2 centered gauge integral                 = {gauge_rate:.17e}")
    print(f"CASIMIR STAGE2 mass rate integral                      = {mass_rate:.17e}")
    print("CASIMIR STAGE2 centered acceptance                     = PASSED")

    # Finite-difference mass-conserving delta check.  The SD2 direction is
    # mass-conserving under the same dxq; no analytic sphere area is introduced.
    eps = 1.0e-6
    H_plus = Function(V2, name="stage2_H_plus")
    H_plus.dat.data[:] = H_h.dat.data_ro + eps * dH_h.dat.data_ro

    area = float(assemble(Constant(1.0) * dxq))
    mass_minus = float(assemble(H_h * dxq))
    mass_plus_pre = float(assemble(H_plus * dxq))
    correction = (mass_plus_pre - mass_minus) / area
    H_plus.dat.data[:] -= correction
    mass_plus = float(assemble(H_plus * dxq))
    mass_delta = mass_plus - mass_minus
    require(float(np.min(H_plus.dat.data_ro)) > 0.0, "delta check lost positivity")

    H_unc_minus = hamiltonian_uncentered(H_h, u_h, m_h, kappa, gstar, dxq)
    H_unc_plus = hamiltonian_uncentered(H_plus, u_h, m_h, kappa, gstar, dxq)
    H_ctr_minus = hamiltonian_centered(
        H_h, u_h, m_h, kappa, GSTAR_VALUE, H0_VALUE, dxq
    )
    H_ctr_plus = hamiltonian_centered(
        H_plus, u_h, m_h, kappa, GSTAR_VALUE, H0_VALUE, dxq
    )
    delta_unc = H_unc_plus - H_unc_minus
    delta_ctr = H_ctr_plus - H_ctr_minus
    delta_gap = delta_ctr - delta_unc
    expected_gap = -GSTAR_VALUE * H0_VALUE * mass_delta
    arithmetic_residual = delta_gap - expected_gap

    # Also evaluate the deltas directly as one quadrature form to reduce
    # subtraction of large total Hamiltonians.
    e_minus = (
        0.5 * H_h * inner(u_h, u_h)
        + inner(m_h, m_h) / (2.0 * kappa * H_h)
        + 0.5 * gstar * H_h**2
    )
    e_plus = (
        0.5 * H_plus * inner(u_h, u_h)
        + inner(m_h, m_h) / (2.0 * kappa * H_plus)
        + 0.5 * gstar * H_plus**2
    )
    delta_unc_direct = float(assemble((e_plus - e_minus) * dxq))
    delta_ctr_direct = float(
        assemble(
            (
                e_plus
                - e_minus
                - Constant(GSTAR_VALUE * H0_VALUE) * (H_plus - H_h)
            )
            * dxq
        )
    )
    direct_gap = delta_ctr_direct - delta_unc_direct
    direct_expected_gap = -GSTAR_VALUE * H0_VALUE * float(
        assemble((H_plus - H_h) * dxq)
    )
    direct_residual = direct_gap - direct_expected_gap

    print(f"CASIMIR DELTA quadrature area A_h                    = {area:.17e}")
    print(f"CASIMIR DELTA mass minus M_h                         = {mass_minus:.17e}")
    print(f"CASIMIR DELTA mass plus M_h                          = {mass_plus:.17e}")
    print(f"CASIMIR DELTA mass difference                        = {mass_delta:.17e}")
    print(f"CASIMIR DELTA uncentered delta                       = {delta_unc:.17e}")
    print(f"CASIMIR DELTA centered delta                         = {delta_ctr:.17e}")
    print(f"CASIMIR DELTA measured gap                           = {delta_gap:.17e}")
    print(f"CASIMIR DELTA expected -gH0*DeltaM                   = {expected_gap:.17e}")
    print(f"CASIMIR DELTA full-value arithmetic residual         = {arithmetic_residual:.17e}")
    print(f"CASIMIR DELTA direct-form uncentered delta           = {delta_unc_direct:.17e}")
    print(f"CASIMIR DELTA direct-form centered delta             = {delta_ctr_direct:.17e}")
    print(f"CASIMIR DELTA direct-form measured gap               = {direct_gap:.17e}")
    print(f"CASIMIR DELTA direct-form expected gap               = {direct_expected_gap:.17e}")
    print(f"CASIMIR DELTA direct-form arithmetic residual        = {direct_residual:.17e}")


def test_casimir_centering_diagnostic():
    print("BASE-KKT-0 CASIMIR-CENTERING DIAGNOSTIC ONLY")
    print("BASE-KKT-0 frozen gate remains R_h^M0 < 1e-12")
    hydro_comparison()
    stage2_centered_comparison_and_delta()
    print("BASE-KKT-0 CASIMIR-CENTERING COMPARATIVE EVIDENCE: COMPLETE")
    print("NO NUMERICAL-CONTRACT AMENDMENT MADE")
    print("BASE-PHYS: NOT ADVANCED")


if __name__ == "__main__":
    test_casimir_centering_diagnostic()
