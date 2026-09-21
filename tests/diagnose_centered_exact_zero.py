"""Centered exact-zero consistency check for BASE-KKT-0.

Authorized scope:
- exact-reproduction hydro state only;
- centered SD1 path only;
- no threshold changes, no physics changes, no production changes;
- stop after locating any nonzero supposedly-zero term.

Important distinction tested here:
- exact FE reproduction is asserted coefficient-wise for H_h, u_h, A_h;
- assembled/quadrature evaluation error is reported separately.
"""

from math import sqrt

from firedrake import (
    CellNormal,
    Constant,
    Function,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    TestFunction,
    TrialFunction,
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


H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5


def strict_solver_params():
    return {"ksp_rtol": 1.0e-14, "ksp_atol": 1.0e-15}


def l2_norm_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_norm_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def coeff_max_abs(function):
    data = function.dat.data_ro.reshape(-1)
    if data.size == 0:
        return 0.0
    return max(abs(float(v)) for v in data)


def coeff_max_deviation(function, exact_value):
    data = function.dat.data_ro.reshape(-1)
    if data.size == 0:
        return 0.0
    return max(abs(float(v) - exact_value) for v in data)


def dual_norm(cofunction, norm_type=PETSc.NormType.NORM_2):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def record_preassembly_assert(name, l2_value, coeff_value):
    print(f"CENTERED ZERO PREASSEMBLY {name} L2            = {l2_value:.17e}")
    print(f"CENTERED ZERO PREASSEMBLY {name} coeff max     = {coeff_value:.17e}")
    try:
        assert l2_value == 0.0 and coeff_value == 0.0
        print(f"CENTERED ZERO PREASSEMBLY {name} ASSERT         = PASS")
        return True
    except AssertionError:
        print(f"CENTERED ZERO PREASSEMBLY {name} ASSERT         = FAIL")
        return False


def test_centered_exact_zero_consistency():
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

    # Exact FE reproduction at the coefficient/DOF level.
    u_h = Function(V1, name="zero_check_u")
    H_h = Function(V2, name="zero_check_H")
    A_h = Function(V0, name="zero_check_A")
    u_h.assign(0.0)
    H_h.assign(H0_VALUE)
    A_h.assign(0.0)

    H_coeff_error = coeff_max_deviation(H_h, H0_VALUE)
    u_coeff_max = coeff_max_abs(u_h)
    A_coeff_max = coeff_max_abs(A_h)
    assert H_coeff_error == 0.0, f"H_h coefficients do not exactly reproduce H0: {H_coeff_error}"
    assert u_coeff_max == 0.0, f"u_h coefficients are not exact zero: {u_coeff_max}"
    assert A_coeff_max == 0.0, f"A_h coefficients are not exact zero: {A_coeff_max}"

    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    # D1 on exact zero velocity.
    U_h = Function(V1, name="zero_check_U")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    # Magnetic map and D3 on exact zero A.
    m_h = Function(V1, name="zero_check_m")
    m_h.interpolate(cross(n, grad(A_h)))

    M_h = Function(V0, name="zero_check_M")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    # Centered D2 only.  Algebraically the RHS is zero for this exact FE state.
    K_ctr = Function(V2, name="zero_check_K_centered")
    K_trial = TrialFunction(V2)
    K_ctr_rhs = (
        0.5 * inner(u_h, u_h)
        - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
        + gstar * (H_h - H0)
    )
    solve(
        phi * K_trial * dxq == phi * K_ctr_rhs * dxq,
        K_ctr,
        solver_parameters=strict_solver_params(),
    )

    # Distinguish exact coefficient reproduction from quadrature/UFL evaluation.
    H_assembled_error = l2_norm_scalar(H_h - H0, dxq)
    u_assembled_norm = l2_norm_vector(u_h, dxq)
    A_assembled_norm = l2_norm_scalar(A_h, dxq)

    U_norm = l2_norm_vector(U_h, dxq)
    K_norm = l2_norm_scalar(K_ctr, dxq)
    M_norm = l2_norm_scalar(M_h, dxq)
    U_max = coeff_max_abs(U_h)
    K_max = coeff_max_abs(K_ctr)
    M_max = coeff_max_abs(M_h)

    print("BASE-KKT-0 CENTERED EXACT-ZERO CONSISTENCY CHECK ONLY")
    print(f"CENTERED ZERO FE H coefficient deviation          = {H_coeff_error:.17e}")
    print(f"CENTERED ZERO FE u coefficient max                = {u_coeff_max:.17e}")
    print(f"CENTERED ZERO FE A coefficient max                = {A_coeff_max:.17e}")
    print("CENTERED ZERO FE REPRESENTATION ASSERT             = PASS")
    print(f"CENTERED ZERO assembled ||H_h-H0|| L2             = {H_assembled_error:.17e}")
    print(f"CENTERED ZERO assembled ||u_h|| L2                = {u_assembled_norm:.17e}")
    print(f"CENTERED ZERO assembled ||A_h|| L2                = {A_assembled_norm:.17e}")

    U_zero = record_preassembly_assert("U_h", U_norm, U_max)
    K_zero = record_preassembly_assert("K_tilde_h", K_norm, K_max)
    M_zero = record_preassembly_assert("M_h", M_norm, M_max)

    # Weak PV may be nonzero from Coriolis, but it multiplies U_h in SD1.
    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    q_h = Function(V0, name="zero_check_q")
    q_trial = TrialFunction(V0)
    solve(
        H_h * q_trial * gamma * dxq
        == (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
        solver_parameters=strict_solver_params(),
    )

    adv_form = -q_h * inner(w, rot(U_h))
    depth_form = div(w) * K_ctr
    mag_form = (M_h / H_h) * inner(grad(A_h), w)

    r_adv = assemble(adv_form * dxq)
    r_depth = assemble(depth_form * dxq)
    r_mag = assemble(mag_form * dxq)
    r_total_direct = assemble((adv_form + depth_form + mag_form) * dxq)

    with r_adv.dat.vec_ro as va, r_depth.dat.vec_ro as vd, r_mag.dat.vec_ro as vm:
        vsum = va.copy()
        vsum.axpy(1.0, vd)
        vsum.axpy(1.0, vm)
        separate_sum_l2 = vsum.norm(PETSc.NormType.NORM_2)
        separate_sum_inf = vsum.norm(PETSc.NormType.NORM_INFINITY)
        vsum.destroy()

    adv_l2 = dual_norm(r_adv)
    adv_inf = dual_norm(r_adv, PETSc.NormType.NORM_INFINITY)
    depth_l2 = dual_norm(r_depth)
    depth_inf = dual_norm(r_depth, PETSc.NormType.NORM_INFINITY)
    mag_l2 = dual_norm(r_mag)
    mag_inf = dual_norm(r_mag, PETSc.NormType.NORM_INFINITY)
    total_l2 = dual_norm(r_total_direct)
    total_inf = dual_norm(r_total_direct, PETSc.NormType.NORM_INFINITY)

    print(f"CENTERED ZERO r_adv L2                           = {adv_l2:.17e}")
    print(f"CENTERED ZERO r_adv coeff max                    = {adv_inf:.17e}")
    print(f"CENTERED ZERO r_depth L2                         = {depth_l2:.17e}")
    print(f"CENTERED ZERO r_depth coeff max                  = {depth_inf:.17e}")
    print(f"CENTERED ZERO r_mag L2                           = {mag_l2:.17e}")
    print(f"CENTERED ZERO r_mag coeff max                    = {mag_inf:.17e}")
    print(f"CENTERED ZERO r_total direct L2                  = {total_l2:.17e}")
    print(f"CENTERED ZERO r_total direct coeff max           = {total_inf:.17e}")
    print(f"CENTERED ZERO separate-vector sum L2             = {separate_sum_l2:.17e}")
    print(f"CENTERED ZERO separate-vector sum coeff max      = {separate_sum_inf:.17e}")

    if not U_zero:
        locus = "D1_U_H_NOT_EXACT_ZERO_BEFORE_SD1"
    elif not K_zero:
        locus = "CENTERED_D2_K_TILDE_NOT_EXACT_ZERO_BEFORE_SD1"
    elif not M_zero:
        locus = "D3_M_H_NOT_EXACT_ZERO_BEFORE_SD1"
    elif adv_l2 != 0.0 or adv_inf != 0.0:
        locus = "ADVECTIVE_ASSEMBLY_NONZERO"
    elif depth_l2 != 0.0 or depth_inf != 0.0:
        locus = "CENTERED_DEPTH_ASSEMBLY_NONZERO"
    elif mag_l2 != 0.0 or mag_inf != 0.0:
        locus = "MAGNETIC_ASSEMBLY_NONZERO"
    elif total_l2 != 0.0 or total_inf != 0.0:
        locus = "TOTAL_ASSEMBLY_NONZERO_DESPITE_ZERO_COMPONENTS"
    else:
        locus = "ALL_CENTERED_SD1_RESIDUAL_VECTORS_EXACT_ZERO"

    print(f"CENTERED ZERO LOCUS                              = {locus}")
    print("CENTERED EXACT-ZERO CONSISTENCY EVIDENCE: COMPLETE")
    print("NO UN-CENTERED DEBUGGING PERFORMED")
    print("NO PRODUCTION IMPLEMENTATION MODIFIED")
    print("STOP")


if __name__ == "__main__":
    test_centered_exact_zero_consistency()
