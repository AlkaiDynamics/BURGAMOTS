"""BURGAMOTS BASE-KKT-0 constrained stationary projection gate.

Scope:
- Implements the next BASE-P implementation gate after BASE-TARGET-0.
- Uses only the frozen Firedrake/Gusto de Rham complex, dxq, gauge,
  mass, positivity, BASE-D metric, and unforced M0 semidiscrete residual.
- Uses a deliberately manufactured, non-solar stationary KKT-0 family.

Out of scope:
- Physical BASE-PHYS certification for the solar preregistered ensemble.
- M1 forcing, ephemeris ingestion, observations, SUN comparison.
- Production timestepper work.

The repository-level physical BASE-PHYS gate remains blocked until the
externally supplied/frozen Omega_0(theta) record and finite toroidal
magnetic-prior family mathfrak B_0 exist in the repository.
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

from numerics.coefficient_centering import (
    coefficient_anomaly,
    exact_background_field,
    centered_gravity_d2,
)


ABS_TOL = 1.0e-12
REL_TOL = 5.0e-14
STATIONARY_RATE_TOL = 1.0e-12
BASE_D_TOL = 1.0e-12

# Manufactured stationary members for KKT mechanics only.
# These are not the physical preregistered solar magnetic-prior family.
BASE_KKT_0_FAMILY = (
    ("kkt0_hydro_reference", 1000.0),
    ("kkt0_mass_high", 1000.125),
    ("kkt0_mass_low", 999.875),
)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def l2_norm_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_norm_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


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


def solve_zero_mean_scalar_projection(mesh, V0, dxq, source_expr, name):
    """Project source_expr into V0 with the frozen algebraic zero-mean gauge."""
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R

    scalar_lambda = Function(WA, name=f"{name}_lambda")
    scalar_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)

    solve(
        (gamma * scalar_trial + lambda_trial * gamma + mu * scalar_trial) * dxq
        ==
        gamma * source_expr * dxq,
        scalar_lambda,
        solver_parameters=matfree_real_solver_params(),
    )
    scalar_h, _ = scalar_lambda.subfunctions
    return scalar_h


def solve_zero_mean_adot(mesh, V0, dxq, rhs_expr, name):
    """Solve the SD3/gauge mass system with zero-mean constraint."""
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R

    adot_lambda = Function(WA, name=f"{name}_lambda")
    adot_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)

    solve(
        (gamma * adot_trial + lambda_trial * gamma + mu * adot_trial) * dxq
        ==
        gamma * rhs_expr * dxq,
        adot_lambda,
        solver_parameters=matfree_real_solver_params(),
    )
    adot_h, _ = adot_lambda.subfunctions
    return adot_h


def verify_member(member_name, H_target_value, mesh, V0, V1, V2, dxq):
    r_t = 1.0
    H0_value = 1000.0
    gstar_value = 9.81
    omega_frame_value = 7.292e-5
    kappa_value = 1.0

    H0 = Constant(H0_value)
    gstar = Constant(gstar_value)
    kappa = Constant(kappa_value)

    n = CellNormal(mesh)

    def rot(v):
        return cross(n, v)

    strict_solver_params = {
        "ksp_rtol": 1.0e-14,
        "ksp_atol": 1.0e-15,
    }

    # Deterministic stationary target for KKT-0 mechanics:
    # u_target = 0, A_target = 0, H_target = constant positive depth.
    # This is not a solar magnetic-prior member.
    u_target = Function(V1, name=f"{member_name}_u_target")
    A_target = Function(V0, name=f"{member_name}_A_target")

    # BASE-P representative/minimizer equals the deterministic target because
    # the target is already an admissible stationary point of the unforced
    # semidiscrete equations. Under Amendment A1, targets already exactly in
    # their destination FE spaces realize P_h v = v directly at coefficient
    # level rather than through redundant approximate mass solves.
    u_h = Function(V1, name=f"{member_name}_u_h")
    u_h.assign(0.0)
    w = TestFunction(V1)

    H_h = Function(V2, name=f"{member_name}_H_h")
    H_h.assign(H_target_value)
    phi = TestFunction(V2)
    H_target = Constant(H_target_value)

    A_h = Function(V0, name=f"{member_name}_A_h")
    A_h.assign(0.0)

    H0_h = exact_background_field(V2, H0_value, name=f"{member_name}_H0_h")
    eta_h = coefficient_anomaly(H_h, H0_h, name=f"{member_name}_eta_h")

    # Compatible magnetic flux map.
    m_h = Function(V1, name=f"{member_name}_m_h")
    m_h.interpolate(cross(n, grad(A_h)))
    m_target = Function(V1, name=f"{member_name}_m_target")
    m_target.interpolate(cross(n, grad(A_target)))

    # Riesz derivatives D1-D3.
    U_h = Function(V1, name=f"{member_name}_U_h")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq
        ==
        H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params,
    )

    K_h = Function(V2, name=f"{member_name}_K_h")
    K_trial = TrialFunction(V2)
    K_rhs = (
        0.5 * inner(u_h, u_h)
        - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
        + centered_gravity_d2(eta_h, gstar_value)
    )
    solve(
        phi * K_trial * dxq
        ==
        phi * K_rhs * dxq,
        K_h,
        solver_parameters=strict_solver_params,
    )

    M_h = Function(V0, name=f"{member_name}_M_h")
    M_trial = TrialFunction(V0)
    gamma = TestFunction(V0)
    solve(
        gamma * M_trial * dxq
        ==
        inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params,
    )

    # Weak PV, frozen spherical Coriolis field.
    q_h = Function(V0, name=f"{member_name}_q_h")
    q_trial = TrialFunction(V0)
    x = SpatialCoordinate(mesh)
    f_C = 2.0 * omega_frame_value * (x[2] / r_t)
    solve(
        H_h * q_trial * gamma * dxq
        ==
        (-inner(u_h, rot(grad(gamma))) + f_C * gamma) * dxq,
        q_h,
    )

    # Unforced semidiscrete residual R_h^{M0}; all three rates must vanish.
    du_h = Function(V1, name=f"{member_name}_du_dt")
    du_trial = TrialFunction(V1)
    sd1_rhs = (
        -q_h * inner(w, rot(U_h))
        + div(w) * K_h
        + (M_h / H_h) * inner(grad(A_h), w)
    )
    solve(
        inner(w, du_trial) * dxq
        ==
        sd1_rhs * dxq,
        du_h,
        solver_parameters=strict_solver_params,
    )

    dH_h = Function(V2, name=f"{member_name}_dH_dt")
    dH_trial = TrialFunction(V2)
    solve(
        phi * dH_trial * dxq
        ==
        -phi * div(U_h) * dxq,
        dH_h,
        solver_parameters=strict_solver_params,
    )

    dA_h = solve_zero_mean_adot(
        mesh,
        V0,
        dxq,
        -inner(U_h / H_h, grad(A_h)),
        f"{member_name}_dA_dt",
    )

    du_norm = l2_norm_vector(du_h, dxq)
    dH_norm = l2_norm_scalar(dH_h, dxq)
    dA_norm = l2_norm_scalar(dA_h, dxq)
    stationary_residual = max(du_norm, dH_norm, dA_norm)

    # Constraints and BASE-D metric.
    target_mass = float(assemble(H_target * dxq))
    projected_mass = float(assemble(H_h * dxq))
    mass_error = abs(projected_mass - target_mass)
    mass_relative = mass_error / max(abs(target_mass), 1.0)

    gauge = float(assemble(A_h * dxq))
    H_min = float(H_h.dat.data_ro.min())

    div_residual = l2_norm_scalar(div(m_h), dxq)

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

    print(f"BASE-KKT-0 member {member_name} H target            = {H_target_value:.17e}")
    print(f"BASE-KKT-0 member {member_name} du_dt L2            = {du_norm:.17e}")
    print(f"BASE-KKT-0 member {member_name} dH_dt L2            = {dH_norm:.17e}")
    print(f"BASE-KKT-0 member {member_name} dA_dt L2            = {dA_norm:.17e}")
    print(f"BASE-KKT-0 member {member_name} R_M0 max rate       = {stationary_residual:.17e}")
    print(f"BASE-KKT-0 member {member_name} target mass         = {target_mass:.17e}")
    print(f"BASE-KKT-0 member {member_name} projected mass      = {projected_mass:.17e}")
    print(f"BASE-KKT-0 member {member_name} mass abs error      = {mass_error:.17e}")
    print(f"BASE-KKT-0 member {member_name} mass rel error      = {mass_relative:.17e}")
    print(f"BASE-KKT-0 member {member_name} gauge integral      = {abs(gauge):.17e}")
    print(f"BASE-KKT-0 member {member_name} H minimum           = {H_min:.17e}")
    print(f"BASE-KKT-0 member {member_name} DIVB L2             = {div_residual:.17e}")
    print(f"BASE-KKT-0 member {member_name} BASE-D metric       = {base_d:.17e}")

    require(
        stationary_residual < STATIONARY_RATE_TOL,
        f"{member_name} R_h^M0 residual {stationary_residual} >= {STATIONARY_RATE_TOL}",
    )
    require(
        mass_error < ABS_TOL or mass_relative < REL_TOL,
        f"{member_name} mass mismatch abs={mass_error}, rel={mass_relative}",
    )
    require(abs(gauge) < ABS_TOL, f"{member_name} A gauge {abs(gauge)} >= {ABS_TOL}")
    require(H_min > 0.0, f"{member_name} nonpositive depth: {H_min}")
    require(div_residual < ABS_TOL, f"{member_name} DIVB L2 {div_residual} >= {ABS_TOL}")
    require(base_d < BASE_D_TOL, f"{member_name} BASE-D metric {base_d} >= {BASE_D_TOL}")


def test_base_kkt_0():
    mesh = IcosahedralSphereMesh(
        radius=1.0,
        refinement_level=2,
        degree=3,
    )
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(
        family="BDFM",
        horizontal_degree=1,
    )

    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")

    for member_name, H_target_value in BASE_KKT_0_FAMILY:
        verify_member(member_name, H_target_value, mesh, V0, V1, V2, dxq)

    print("BASE-KKT-0: PASSED")
    print("BASE-PHYS: BLOCKED_MISSING_FROZEN_OMEGA0_AND_BPHI0_FAMILY")


if __name__ == "__main__":
    test_base_kkt_0()
