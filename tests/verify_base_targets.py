"""BURGAMOTS BASE-TARGET-0 deterministic projection gate.

This is a prerequisite for BASE-P, not the physical solar BASE-P solve.

It verifies the frozen deterministic target maps P-u, P-H, and P-A on the
pinned Firedrake/Gusto realization using a deliberately manufactured,
non-solar axisymmetric state. It also checks the zero-mean A gauge,
positive depth, target mass preservation, pole-regular smooth toroidal
fields, and compatible DIVB.

No M1 information, observational solar fit, or preregistered physical
Omega_0 / B_phi0 family enters this gate.
"""

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
    sqrt,
)
from gusto.core.function_spaces import Spaces
from petsc4py import PETSc
from ufl import as_vector


ABS_TOL = 1.0e-12
REL_TOL = 5.0e-14


def vec_norm(cofunction, norm_type=PETSc.NormType.NORM_INFINITY):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def test_base_target_0():
    # Frozen geometry / spaces / quadrature.
    r_t = 1.0
    H0_value = 1000.0
    gstar_value = 9.81
    omega_frame_value = 7.292e-5
    kappa_value = 1.0

    mesh = IcosahedralSphereMesh(
        radius=r_t,
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

    H0 = Constant(H0_value)
    gstar = Constant(gstar_value)
    kappa = Constant(kappa_value)

    # Manufactured, explicitly non-solar axisymmetric state.
    # Solid differential rotation gives U_phi = r sin(theta) * delta_omega.
    # A smooth toroidal magnetic profile B_phi = b_amp sin(theta) satisfies
    # the required O(sin(theta)) pole regularity exactly.
    delta_omega = 2.0e-5
    b_amp = 2.0e-2

    x = SpatialCoordinate(mesh)
    X, Y, Z = x[0], x[1], x[2]
    c = Z / r_t
    s2 = 1.0 - c * c

    u_base = delta_omega * as_vector((-Y, X, 0.0))
    B_base = (b_amp / r_t) * as_vector((-Y, X, 0.0))

    eta_coeff = (
        r_t * r_t
        * (delta_omega * delta_omega + 2.0 * omega_frame_value * delta_omega)
        - b_amp * b_amp / kappa_value
    ) / (2.0 * gstar_value)

    eta_base = eta_coeff * (s2 - 2.0 / 3.0)
    H_base = H0 + eta_base

    # Exact continuum flux potential for dA/dtheta = r H B_phi.
    # The expression is odd in cos(theta), so its sphere mean is exactly zero.
    A_base = (
        r_t
        * b_amp
        * (
            -H0_value * c
            + eta_coeff * (c**3 / 3.0 - c / 3.0)
        )
    )

    strict_solver_params = {
        "ksp_rtol": 1.0e-14,
        "ksp_atol": 1.0e-15,
    }

    # P-u.
    u_hat = Function(V1, name="u_hat")
    u_trial = TrialFunction(V1)
    w = TestFunction(V1)
    solve(
        H0 * inner(w, u_trial) * dxq
        ==
        H0 * inner(w, u_base) * dxq,
        u_hat,
        solver_parameters=strict_solver_params,
    )

    # P-H.
    H_hat = Function(V2, name="H_hat")
    H_trial = TrialFunction(V2)
    phi = TestFunction(V2)
    solve(
        phi * H_trial * dxq
        ==
        phi * H_base * dxq,
        H_hat,
        solver_parameters=strict_solver_params,
    )

    # P-A with the frozen zero-mean gauge.
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    A_lambda = Function(WA, name="A_hat_lambda")
    A_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)

    solve(
        (
            inner(grad(gamma), grad(A_trial)) / (kappa * H0)
            + lambda_trial * gamma
            + mu * A_trial
        ) * dxq
        ==
        inner(grad(gamma), grad(A_base)) / (kappa * H0) * dxq,
        A_lambda,
        solver_parameters={
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
        },
    )
    A_hat, _ = A_lambda.subfunctions

    # Compatible magnetic flux map.
    m_hat = Function(V1, name="m_hat")
    m_hat.interpolate(cross(CellNormal(mesh), grad(A_hat)))

    # Projection residuals.
    u_residual = assemble(H0 * inner(w, u_hat - u_base) * dxq)
    H_residual = assemble(phi * (H_hat - H_base) * dxq)
    A_residual = assemble(
        inner(grad(TestFunction(V0)), grad(A_hat - A_base))
        / (kappa * H0)
        * dxq
    )

    u_res = vec_norm(u_residual)
    H_res = vec_norm(H_residual)
    A_res = vec_norm(A_residual)

    gauge = float(assemble(A_hat * dxq))
    target_mass = float(assemble(H_base * dxq))
    projected_mass = float(assemble(H_hat * dxq))
    mass_error = abs(projected_mass - target_mass)
    mass_scale = max(abs(target_mass), 1.0)
    mass_relative = mass_error / mass_scale

    phi_div = TestFunction(V2)
    div_residual = assemble(phi_div * div(m_hat) * dxq)
    div_max = vec_norm(div_residual)
    div_l2 = float(sqrt(assemble(div(m_hat) ** 2 * dxq)))

    H_min = float(H_hat.dat.data_ro.min())
    eta_sup = float(max(abs(eta_coeff / 3.0), abs(2.0 * eta_coeff / 3.0)))
    shallow_ratio = eta_sup / r_t

    print(f"BASE-TARGET-0 P-u residual      = {u_res:.17e}")
    print(f"BASE-TARGET-0 P-H residual      = {H_res:.17e}")
    print(f"BASE-TARGET-0 P-A residual      = {A_res:.17e}")
    print(f"BASE-TARGET-0 gauge integral    = {abs(gauge):.17e}")
    print(f"BASE-TARGET-0 target mass       = {target_mass:.17e}")
    print(f"BASE-TARGET-0 projected mass    = {projected_mass:.17e}")
    print(f"BASE-TARGET-0 mass abs error    = {mass_error:.17e}")
    print(f"BASE-TARGET-0 mass rel error    = {mass_relative:.17e}")
    print(f"BASE-TARGET-0 DIVB max residual = {div_max:.17e}")
    print(f"BASE-TARGET-0 DIVB L2 norm      = {div_l2:.17e}")
    print(f"BASE-TARGET-0 H minimum         = {H_min:.17e}")
    print(f"BASE-TARGET-0 eta/r_t sup       = {shallow_ratio:.17e}")

    require(u_res < ABS_TOL, f"P-u residual {u_res} >= {ABS_TOL}")
    require(H_res < ABS_TOL, f"P-H residual {H_res} >= {ABS_TOL}")
    require(A_res < ABS_TOL, f"P-A residual {A_res} >= {ABS_TOL}")
    require(abs(gauge) < ABS_TOL, f"A gauge {abs(gauge)} >= {ABS_TOL}")
    require(
        mass_error < ABS_TOL or mass_relative < REL_TOL,
        f"target mass mismatch abs={mass_error}, rel={mass_relative}",
    )
    require(div_max < ABS_TOL, f"DIVB max residual {div_max} >= {ABS_TOL}")
    require(div_l2 < ABS_TOL, f"DIVB L2 norm {div_l2} >= {ABS_TOL}")
    require(H_min > 0.0, f"manufactured target projection is nonpositive: {H_min}")
    require(
        shallow_ratio < 1.0e-3,
        f"manufactured eta/r_t ratio {shallow_ratio} is not shallow",
    )

    print("BASE-TARGET-0: PASSED")


if __name__ == "__main__":
    test_base_target_0()
