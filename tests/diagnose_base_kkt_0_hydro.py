"""Focused BASE-KKT-0 diagnostic probe for the failed hydro reference member.

This probe does not alter the frozen acceptance criterion in verify_base_p.py.
It localizes the observed kkt0_hydro_reference momentum-rate residual by
separating raw weak residual assembly from Riesz recovery and by running one
single direct mass-matrix solve.
"""

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
from petsc4py import PETSc


STATIONARY_RATE_TOL = 1.0e-12


def l2_norm_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_norm_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def dual_vec_norm(cofunction, norm_type=PETSc.NormType.NORM_2):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def strict_solver_params(rtol=1.0e-14, atol=1.0e-15):
    return {"ksp_rtol": rtol, "ksp_atol": atol}


def matfree_real_solver_params(rtol=1.0e-14, atol=1.0e-15):
    return {
        "mat_type": "matfree",
        "ksp_type": "fgmres",
        "ksp_rtol": rtol,
        "ksp_atol": atol,
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
                "ksp_rtol": rtol,
                "ksp_atol": atol,
                "pc_type": "jacobi",
            },
        },
        "fieldsplit_1": {
            "ksp_type": "gmres",
            "ksp_rtol": rtol,
            "ksp_atol": atol,
            "pc_type": "none",
        },
    }


def solve_zero_mean_scalar_projection(mesh, V0, dxq, source_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    scalar_lambda = Function(WA, name=f"{name}_lambda")
    scalar_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)
    solve(
        (gamma * scalar_trial + lambda_trial * gamma + mu * scalar_trial) * dxq
        == gamma * source_expr * dxq,
        scalar_lambda,
        solver_parameters=matfree_real_solver_params(),
    )
    scalar_h, _ = scalar_lambda.subfunctions
    return scalar_h


def solve_zero_mean_adot(mesh, V0, dxq, rhs_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    adot_lambda = Function(WA, name=f"{name}_lambda")
    adot_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)
    solve(
        (gamma * adot_trial + lambda_trial * gamma + mu * adot_trial) * dxq
        == gamma * rhs_expr * dxq,
        adot_lambda,
        solver_parameters=matfree_real_solver_params(),
    )
    adot_h, _ = adot_lambda.subfunctions
    return adot_h


def solve_v1_rate(V1, dxq, rhs_form, name, params):
    du_h = Function(V1, name=name)
    du_trial = TrialFunction(V1)
    w = TestFunction(V1)
    solve(inner(w, du_trial) * dxq == rhs_form * dxq, du_h, solver_parameters=params)
    return du_h


def test_base_kkt_0_hydro_diagnostic_probe():
    member_name = "kkt0_hydro_reference"
    r_t = 1.0
    H0_value = 1000.0
    H_target_value = 1000.0
    gstar_value = 9.81
    omega_frame_value = 7.292e-5
    kappa_value = 1.0

    mesh = IcosahedralSphereMesh(radius=r_t, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")

    H0 = Constant(H0_value)
    H_target = Constant(H_target_value)
    gstar = Constant(gstar_value)
    kappa = Constant(kappa_value)
    n = CellNormal(mesh)

    def rot(v):
        return cross(n, v)

    print("BASE-KKT-0 HYDRO DIAG operator binding status = FORMULA_MATCH_ONLY_NOT_SHARED_CALL")
    print("BASE-KKT-0 HYDRO DIAG certified SD1 form    = -q_h*<w,RU_h> + div(w)*K_h + (M_h/H_h)*<grad(A_h),w>")
    print("BASE-KKT-0 HYDRO DIAG BASE-P SD1 form       = -q_h*<w,RU_h> + div(w)*K_h + (M_h/H_h)*<grad(A_h),w>")
    print("BASE-KKT-0 HYDRO DIAG binding verdict      = separate reimplementation; not a shared helper call")

    params_14 = strict_solver_params(1.0e-14, 1.0e-15)

    u_target = Function(V1, name="u_target")
    A_target = Function(V0, name="A_target")

    u_h = Function(V1, name="u_h")
    u_trial = TrialFunction(V1)
    w = TestFunction(V1)
    solve(H0 * inner(w, u_trial) * dxq == H0 * inner(w, u_target) * dxq, u_h, solver_parameters=params_14)

    H_h = Function(V2, name="H_h")
    H_trial = TrialFunction(V2)
    phi = TestFunction(V2)
    solve(phi * H_trial * dxq == phi * H_target * dxq, H_h, solver_parameters=params_14)

    A_h = solve_zero_mean_scalar_projection(mesh, V0, dxq, Constant(0.0), "A_h")

    m_h = Function(V1, name="m_h")
    m_h.interpolate(cross(n, grad(A_h)))
    m_target = Function(V1, name="m_target")
    m_target.interpolate(cross(n, grad(A_target)))

    U_h = Function(V1, name="U_h")
    U_trial = TrialFunction(V1)
    solve(inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq, U_h, solver_parameters=params_14)

    K_h = Function(V2, name="K_h")
    K_trial = TrialFunction(V2)
    K_rhs = 0.5 * inner(u_h, u_h) - inner(m_h, m_h) / (2.0 * kappa * H_h**2) + gstar * H_h
    solve(phi * K_trial * dxq == phi * K_rhs * dxq, K_h, solver_parameters=params_14)

    M_h = Function(V0, name="M_h")
    M_trial = TrialFunction(V0)
    gamma = TestFunction(V0)
    solve(gamma * M_trial * dxq == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq, M_h, solver_parameters=params_14)

    x = SpatialCoordinate(mesh)
    f_C = 2.0 * omega_frame_value * (x[2] / r_t)

    q_rel = Function(V0, name="q_rel")
    q_cor = Function(V0, name="q_cor")
    q_trial = TrialFunction(V0)
    solve(H_h * q_trial * gamma * dxq == -inner(u_h, rot(grad(gamma))) * dxq, q_rel, solver_parameters=params_14)
    solve(H_h * q_trial * gamma * dxq == f_C * gamma * dxq, q_cor, solver_parameters=params_14)

    adv_metric_form = -q_rel * inner(w, rot(U_h))
    coriolis_form = -q_cor * inner(w, rot(U_h))
    pressure_depth_form = div(w) * K_h
    magnetic_form = (M_h / H_h) * inner(grad(A_h), w)
    sd1_rhs = adv_metric_form + coriolis_form + pressure_depth_form + magnetic_form

    raw = assemble(sd1_rhs * dxq)
    raw_adv = assemble(adv_metric_form * dxq)
    raw_cor = assemble(coriolis_form * dxq)
    raw_pressure = assemble(pressure_depth_form * dxq)
    raw_mag = assemble(magnetic_form * dxq)

    raw_norm = dual_vec_norm(raw)
    raw_norm_inf = dual_vec_norm(raw, PETSc.NormType.NORM_INFINITY)
    adv_norm = dual_vec_norm(raw_adv)
    cor_norm = dual_vec_norm(raw_cor)
    pressure_norm = dual_vec_norm(raw_pressure)
    mag_norm = dual_vec_norm(raw_mag)
    s_mom = adv_norm + cor_norm + pressure_norm + mag_norm
    r_mom = raw_norm / s_mom if s_mom > 0.0 else 0.0

    print(f"BASE-KKT-0 HYDRO DIAG raw r_u dual L2           = {raw_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG raw r_u dual Linf         = {raw_norm_inf:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG adv/metric raw norm       = {adv_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG coriolis raw norm         = {cor_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG gstar-depth raw norm      = {pressure_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG magnetic raw norm         = {mag_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG S_mom                    = {s_mom:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG R_mom                    = {r_mom:.17e}")

    for tol in (1.0e-12, 1.0e-14, 1.0e-15):
        du_probe = solve_v1_rate(V1, dxq, sd1_rhs, f"du_dt_krylov_{tol:.0e}", strict_solver_params(tol, tol * 0.1))
        du_norm = l2_norm_vector(du_probe, dxq)
        print(f"BASE-KKT-0 HYDRO DIAG krylov rtol {tol:.0e} du_dt L2 = {du_norm:.17e}")

    try:
        du_direct = solve_v1_rate(
            V1,
            dxq,
            sd1_rhs,
            "du_dt_direct",
            {"ksp_type": "preonly", "pc_type": "lu"},
        )
        direct_norm = l2_norm_vector(du_direct, dxq)
        print(f"BASE-KKT-0 HYDRO DIAG direct LU du_dt L2       = {direct_norm:.17e}")
    except Exception as exc:
        print(f"BASE-KKT-0 HYDRO DIAG direct LU unavailable    = {type(exc).__name__}: {exc}")

    dH_h = Function(V2, name="dH_dt")
    dH_trial = TrialFunction(V2)
    solve(phi * dH_trial * dxq == -phi * div(U_h) * dxq, dH_h, solver_parameters=params_14)
    dA_h = solve_zero_mean_adot(mesh, V0, dxq, -inner(U_h / H_h, grad(A_h)), "dA_dt")

    target_mass = float(assemble(H_target * dxq))
    projected_mass = float(assemble(H_h * dxq))
    mass_error = abs(projected_mass - target_mass)
    mass_relative = mass_error / max(abs(target_mass), 1.0)
    gauge = float(assemble(A_h * dxq))
    H_min = float(H_h.dat.data_ro.min())
    div_residual = l2_norm_scalar(div(m_h), dxq)
    dH_norm = l2_norm_scalar(dH_h, dxq)
    dA_norm = l2_norm_scalar(dA_h, dxq)
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

    print(f"BASE-KKT-0 HYDRO DIAG dH_dt L2                 = {dH_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG dA_dt L2                 = {dA_norm:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG mass abs error           = {mass_error:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG mass rel error           = {mass_relative:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG gauge integral           = {abs(gauge):.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG H minimum                = {H_min:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG DIVB L2                  = {div_residual:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG BASE-D metric            = {base_d:.17e}")
    print(f"BASE-KKT-0 HYDRO DIAG frozen gate remains       = R_h^M0 < {STATIONARY_RATE_TOL:.1e}")
    print("BASE-KKT-0 HYDRO DIAGNOSTIC PROBE: COMPLETE")
    print("BASE-PHYS: BLOCKED_MISSING_FROZEN_OMEGA0_AND_BPHI0_FAMILY")


if __name__ == "__main__":
    test_base_kkt_0_hydro_diagnostic_probe()
