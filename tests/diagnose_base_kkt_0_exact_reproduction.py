"""Final BASE-KKT-0 exact-reproduction diagnostic.

Scope:
- kkt0_hydro_reference only.
- The representable target is installed exactly in the frozen FE spaces:
    H_h == H0, u_h == 0, A_h == 0.
- No production Hamiltonian, operator, quadrature, space, physics, or gate changes.
- Both the frozen uncentered Hamiltonian derivative and the previously diagnostic
  centered representative are evaluated side by side.

This probe has a hard stop: comparative evidence only.
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
H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5


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


def test_base_kkt_0_exact_reproduction_probe():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")

    n = CellNormal(mesh)
    H0 = Constant(H0_VALUE)
    gstar = Constant(GSTAR_VALUE)
    kappa = Constant(KAPPA_VALUE)

    def rot(v):
        return cross(n, v)

    # Exact FE reproduction of a target already in the destination spaces.
    # No redundant Riesz projection is used for u_base, H_base, or A_base.
    u_h = Function(V1, name="exact_u_h")
    H_h = Function(V2, name="exact_H_h")
    A_h = Function(V0, name="exact_A_h")
    u_h.assign(0.0)
    H_h.assign(H0_VALUE)
    A_h.assign(0.0)

    u_target = Function(V1, name="exact_u_target")
    H_target = Function(V2, name="exact_H_target")
    A_target = Function(V0, name="exact_A_target")
    u_target.assign(0.0)
    H_target.assign(H0_VALUE)
    A_target.assign(0.0)

    m_h = Function(V1, name="exact_m_h")
    m_h.interpolate(cross(n, grad(A_h)))
    m_target = Function(V1, name="exact_m_target")
    m_target.interpolate(cross(n, grad(A_target)))

    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    # Frozen D1.
    U_h = Function(V1, name="exact_U_h")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    # Frozen production D2, unchanged.
    K_unc = Function(V2, name="exact_K_uncentered")
    K_trial = TrialFunction(V2)
    K_common = 0.5 * inner(u_h, u_h) - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * H_h) * dxq,
        K_unc,
        solver_parameters=strict_solver_params(),
    )

    # Diagnostic centered representative only; not adopted.
    K_ctr = Function(V2, name="exact_K_centered_diagnostic")
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * (H_h - H0)) * dxq,
        K_ctr,
        solver_parameters=strict_solver_params(),
    )

    # Frozen D3.
    M_h = Function(V0, name="exact_M_h")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    # Frozen weak PV.
    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    q_h = Function(V0, name="exact_q_h")
    q_trial = TrialFunction(V0)
    solve(
        H_h * q_trial * gamma * dxq
        == (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
        solver_parameters=strict_solver_params(),
    )

    # Side-by-side SD1 using unchanged uncentered production K and diagnostic centered K.
    pressure_unc = div(w) * K_unc
    pressure_ctr = div(w) * K_ctr
    sd1_unc = (
        -q_h * inner(w, rot(U_h))
        + pressure_unc
        + (M_h / H_h) * inner(grad(A_h), w)
    )
    sd1_ctr = (
        -q_h * inner(w, rot(U_h))
        + pressure_ctr
        + (M_h / H_h) * inner(grad(A_h), w)
    )

    raw_pressure_unc = assemble(pressure_unc * dxq)
    raw_pressure_ctr = assemble(pressure_ctr * dxq)
    raw_sd1_unc = assemble(sd1_unc * dxq)
    raw_sd1_ctr = assemble(sd1_ctr * dxq)

    du_unc = solve_v1_rate(V1, dxq, sd1_unc, "exact_du_uncentered")
    du_ctr = solve_v1_rate(V1, dxq, sd1_ctr, "exact_du_centered")

    # Frozen SD2/SD3 primitive rates.
    dH_h = Function(V2, name="exact_dH")
    dH_trial = TrialFunction(V2)
    solve(
        phi * dH_trial * dxq == -phi * div(U_h) * dxq,
        dH_h,
        solver_parameters=strict_solver_params(),
    )
    dA_h = solve_zero_mean_adot(
        mesh, V0, dxq, -inner(U_h / H_h, grad(A_h)), "exact_dA"
    )

    K_exact_unc = GSTAR_VALUE * H0_VALUE
    K_exact_ctr = 0.0

    H_error = l2_norm_scalar(H_h - H0, dxq)
    K_unc_error = l2_norm_scalar(K_unc - Constant(K_exact_unc), dxq)
    K_ctr_error = l2_norm_scalar(K_ctr - Constant(K_exact_ctr), dxq)
    raw_unc_norm = dual_norm(raw_sd1_unc)
    raw_ctr_norm = dual_norm(raw_sd1_ctr)
    pressure_unc_norm = dual_norm(raw_pressure_unc)
    pressure_ctr_norm = dual_norm(raw_pressure_ctr)
    du_unc_norm = l2_norm_vector(du_unc, dxq)
    du_ctr_norm = l2_norm_vector(du_ctr, dxq)
    dH_norm = l2_norm_scalar(dH_h, dxq)
    dA_norm = l2_norm_scalar(dA_h, dxq)

    target_mass = float(assemble(H_target * dxq))
    represented_mass = float(assemble(H_h * dxq))
    mass_error = abs(represented_mass - target_mass)
    gauge = abs(float(assemble(A_h * dxq)))
    divb = l2_norm_scalar(div(m_h), dxq)
    H_min = float(H_h.dat.data_ro.min())
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

    production_R = max(du_unc_norm, dH_norm, dA_norm)
    centered_R = max(du_ctr_norm, dH_norm, dA_norm)

    print("BASE-KKT-0 EXACT-REPRODUCTION DIAGNOSTIC ONLY")
    print("BASE-KKT-0 frozen gate remains R_h^M0 < 1e-12")
    print("BASE-KKT-0 production Hamiltonian remains uncentered")
    print("BASE-KKT-0 Casimir centering remains diagnostic-only")
    print(f"EXACT REPRO ||H_h-H0|| L2                         = {H_error:.17e}")
    print(f"EXACT REPRO uncentered K_exact                    = {K_exact_unc:.17e}")
    print(f"EXACT REPRO ||K_unc-K_exact|| L2                  = {K_unc_error:.17e}")
    print(f"EXACT REPRO centered K_exact                      = {K_exact_ctr:.17e}")
    print(f"EXACT REPRO ||K_ctr-K_exact|| L2                  = {K_ctr_error:.17e}")
    print(f"EXACT REPRO uncentered raw gstar-depth dual L2    = {pressure_unc_norm:.17e}")
    print(f"EXACT REPRO uncentered raw momentum dual L2       = {raw_unc_norm:.17e}")
    print(f"EXACT REPRO uncentered ||du_dt|| L2               = {du_unc_norm:.17e}")
    print(f"EXACT REPRO centered raw gstar-depth dual L2      = {pressure_ctr_norm:.17e}")
    print(f"EXACT REPRO centered raw momentum dual L2         = {raw_ctr_norm:.17e}")
    print(f"EXACT REPRO centered ||du_dt|| L2                 = {du_ctr_norm:.17e}")
    print(f"EXACT REPRO ||dH_dt|| L2                          = {dH_norm:.17e}")
    print(f"EXACT REPRO ||dA_dt|| L2                          = {dA_norm:.17e}")
    print(f"EXACT REPRO mass abs error                        = {mass_error:.17e}")
    print(f"EXACT REPRO gauge integral                        = {gauge:.17e}")
    print(f"EXACT REPRO DIVB L2                               = {divb:.17e}")
    print(f"EXACT REPRO H minimum                             = {H_min:.17e}")
    print(f"EXACT REPRO BASE-D                                = {base_d:.17e}")
    print(f"EXACT REPRO production R_h^M0                     = {production_R:.17e}")
    print(f"EXACT REPRO diagnostic centered R_h^M0            = {centered_R:.17e}")
    print(
        "EXACT REPRO DECISION                             = "
        + (
            "PROJECTION_IMPLEMENTATION_REMAINS_DEFECT"
            if production_R < STATIONARY_RATE_TOL
            else "STOP_HYDRO_DEBUGGING_ABSOLUTE_GATE_BELOW_REALIZABLE_FLOOR"
        )
    )
    print("BASE-KKT-0 EXACT-REPRODUCTION COMPARATIVE EVIDENCE: COMPLETE")
    print("NO PRODUCTION IMPLEMENTATION MODIFIED")
    print("NO NUMERICAL-CONTRACT AMENDMENT MADE")
    print("BASE-PHYS: NOT ADVANCED")


if __name__ == "__main__":
    test_base_kkt_0_exact_reproduction_probe()
