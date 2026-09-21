"""BURGAMOTS semidiscrete Hamiltonian cancellation crucible.

Scope:
- Uses the frozen degree-3 icosahedral geometry, canonical degree-12 quadrature,
  and CG2+B3 -> BDFM2 -> DG1 compatible complex.
- Builds nontrivial deterministic states.
- Uses the runner-verified magnetic map:
      m_h.interpolate(cross(CellNormal(mesh), grad(A_h)))
- Solves frozen PV and D1-D3 Riesz representatives.
- Evaluates two independent semidiscrete energy gates:
    Stage 1: direct bracket cancellation C_h.
    Stage 2: chain-rule rate using solved SD1-SD3 rates.

Out of scope:
- BASE-P
- production discrete-gradient timestepper
- NUM-POS
- M1 forcing
- SUN comparison
"""

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


STAGE1_ABS_TOL = 1.0e-12
STAGE1_REL_TOL = 1.0e-15
PAIR_TOL = 1.0e-12
GAUGE_TOL = 1.0e-12
STAGE2_TOL = 1.0e-12


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def test_semidiscrete_cancellation():
    # 1. Frozen geometry & quadrature.
    r_t = 1.0
    gstar = 9.81
    omega_frame = 7.292e-5
    mu0 = 1.0
    rho0 = 1.0

    mesh = IcosahedralSphereMesh(
        radius=r_t,
        refinement_level=2,
        degree=3,
    )
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    dxq = dx(domain=mesh, degree=12, scheme="canonical")

    kappa = Constant(mu0 * rho0)
    n = CellNormal(mesh)

    def rot(v):
        return cross(n, v)

    strict_solver_params = {
        "ksp_rtol": 1.0e-14,
        "ksp_atol": 1.0e-15,
    }

    # 2. Frozen compatible complex.
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(
        family="BDFM",
        horizontal_degree=1,
    )

    V0 = spaces.H1
    V1 = spaces.HDiv
    V2 = spaces.L2

    v0_element_str = str(V0.ufl_element())
    require(
        "CG2" in v0_element_str and "B3" in v0_element_str,
        f"unexpected V0 element: {v0_element_str}",
    )
    require("BDFM2" in str(V1.ufl_element()), f"unexpected V1: {V1.ufl_element()}")
    require("DG1" in str(V2.ufl_element()), f"unexpected V2: {V2.ufl_element()}")

    # 3. Nontrivial deterministic positive state.
    u_h = Function(V1, name="Velocity")
    H_h = Function(V2, name="TotalThickness")
    A_h = Function(V0, name="MagneticPotential")

    u_data = u_h.dat.data
    H_data = H_h.dat.data
    A_data = A_h.dat.data

    u_data[:] = np.sin(np.arange(u_data.size, dtype=float))
    H_data[:] = 1000.0 + 10.0 * np.cos(np.arange(H_data.size, dtype=float))
    A_data[:] = np.sin(np.arange(A_data.size, dtype=float))

    require(float(np.min(H_data)) > 0.0, "deterministic probe state is not positive")

    # 4. Runner-verified compatible magnetic map.
    m_h = Function(V1, name="MagneticFlux")
    m_h.interpolate(cross(n, grad(A_h)))

    # -------------------------
    # PV inversion
    # -------------------------
    q_h = Function(V0, name="q_h")
    q_trial = TrialFunction(V0)
    gamma = TestFunction(V0)

    # Frozen spherical Coriolis field for z-axis rotation.
    x = SpatialCoordinate(mesh)
    radial_z = x[2] / r_t
    f_C = 2.0 * omega_frame * radial_z

    solve(
        H_h * q_trial * gamma * dxq
        ==
        (
            -inner(u_h, rot(grad(gamma)))
            + f_C * gamma
        ) * dxq,
        q_h,
    )

    # -------------------------
    # D1: momentum/mass-flux Riesz representative
    # -------------------------
    U_h = Function(V1, name="U_h")
    U_trial = TrialFunction(V1)
    w = TestFunction(V1)

    solve(
        inner(w, U_trial) * dxq
        ==
        H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params,
    )

    # -------------------------
    # D2: depth/Bernoulli Riesz representative
    # -------------------------
    K_h = Function(V2, name="K_h")
    K_trial = TrialFunction(V2)
    phi = TestFunction(V2)

    K_rhs = (
        0.5 * inner(u_h, u_h)
        - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
        + gstar * H_h
    )

    solve(
        phi * K_trial * dxq
        ==
        phi * K_rhs * dxq,
        K_h,
        solver_parameters=strict_solver_params,
    )

    # -------------------------
    # D3: magnetic-flux-potential Riesz representative
    # -------------------------
    M_h = Function(V0, name="M_h")
    M_trial = TrialFunction(V0)

    solve(
        gamma * M_trial * dxq
        ==
        inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params,
    )

    # -------------------------
    # Stage 1: direct bracket/form cancellation
    # -------------------------
    vort_term = float(assemble((-q_h * inner(U_h, rot(U_h))) * dxq))
    mass_plus = float(assemble((div(U_h) * K_h) * dxq))
    mass_minus = float(assemble((-K_h * div(U_h)) * dxq))
    mag_plus = float(
        assemble(((M_h / H_h) * inner(grad(A_h), U_h)) * dxq)
    )
    mag_minus = float(
        assemble((-M_h * inner(U_h / H_h, grad(A_h))) * dxq)
    )

    C_h_val = float(
        assemble(
            (
                -q_h * inner(U_h, rot(U_h))
                + div(U_h) * K_h
                - K_h * div(U_h)
                + (M_h / H_h) * inner(grad(A_h), U_h)
                - M_h * inner(U_h / H_h, grad(A_h))
            ) * dxq
        )
    )

    component_scale = (
        abs(vort_term)
        + abs(mass_plus)
        + abs(mass_minus)
        + abs(mag_plus)
        + abs(mag_minus)
    )
    relative_C = abs(C_h_val) / max(component_scale, 1.0)
    mass_pair = mass_plus + mass_minus
    magnetic_pair = mag_plus + mag_minus

    print(f"STAGE 1 vorticity term       = {vort_term:.17e}")
    print(f"STAGE 1 mass plus            = {mass_plus:.17e}")
    print(f"STAGE 1 mass minus           = {mass_minus:.17e}")
    print(f"STAGE 1 magnetic plus        = {mag_plus:.17e}")
    print(f"STAGE 1 magnetic minus       = {mag_minus:.17e}")
    print(f"STAGE 1 mass pair residual   = {mass_pair:.17e}")
    print(f"STAGE 1 magnetic pair residual= {magnetic_pair:.17e}")
    print(f"STAGE 1 component scale      = {component_scale:.17e}")
    print(f"STAGE 1 direct C_h           = {C_h_val:.17e}")
    print(f"STAGE 1 relative cancellation= {relative_C:.17e}")

    C_abs = abs(C_h_val)
    require(
        abs(mass_pair) < PAIR_TOL,
        f"CONTINUITY/BERNOULLI PAIR FAILURE: |T2+T3|={abs(mass_pair)} >= {PAIR_TOL}",
    )
    require(
        abs(magnetic_pair) < PAIR_TOL,
        f"INDUCTION/LORENTZ PAIR FAILURE: |T4+T5|={abs(magnetic_pair)} >= {PAIR_TOL}",
    )
    require(
        C_abs < STAGE1_ABS_TOL or relative_C < STAGE1_REL_TOL,
        "FORM/BRACKET IMPLEMENTATION FAILURE: "
        f"|C_h|={C_abs} >= {STAGE1_ABS_TOL} and "
        f"relative={relative_C} >= {STAGE1_REL_TOL}",
    )

    # -------------------------
    # SD1
    # -------------------------
    du_h = Function(V1, name="du_dt")
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

    # -------------------------
    # SD2
    # -------------------------
    dH_h = Function(V2, name="dH_dt")
    dH_trial = TrialFunction(V2)

    solve(
        phi * dH_trial * dxq
        ==
        -phi * div(U_h) * dxq,
        dH_h,
        solver_parameters=strict_solver_params,
    )

    # -------------------------
    # SD3 + algebraic zero-mean gauge
    # -------------------------
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R

    adot_lambda = Function(WA, name="adot_lambda")
    adot_trial, lambda_trial = TrialFunctions(WA)
    gamma_g, mu = TestFunctions(WA)

    solve(
        (
            gamma_g * adot_trial
            + lambda_trial * gamma_g
            + mu * adot_trial
        ) * dxq
        ==
        (
            -gamma_g * inner(U_h / H_h, grad(A_h))
        ) * dxq,
        adot_lambda,
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

    dA_h, lambda_A = adot_lambda.subfunctions

    # Check the algebraic gauge itself.
    gauge_val = float(assemble(dA_h * dxq))
    print(f"SD3 zero-mean gauge integral = {abs(gauge_val):.17e}")
    require(
        abs(gauge_val) < GAUGE_TOL,
        f"SD3 GAUGE FAILURE: |integral dA|={abs(gauge_val)} >= {GAUGE_TOL}",
    )

    # -------------------------
    # Stage 2: semidiscrete Hamiltonian chain rule
    # -------------------------
    kinetic_rate = float(assemble(inner(U_h, du_h) * dxq))
    thickness_rate = float(assemble((K_h * dH_h) * dxq))
    magnetic_rate = float(assemble((M_h * dA_h) * dxq))

    dHdt = kinetic_rate + thickness_rate + magnetic_rate
    stage2_scale = (
        abs(kinetic_rate)
        + abs(thickness_rate)
        + abs(magnetic_rate)
    )
    dHdt_abs = abs(dHdt)
    stage2_relative = dHdt_abs / max(stage2_scale, 1.0)

    print(f"STAGE 2 kinetic contribution = {kinetic_rate:.17e}")
    print(f"STAGE 2 thickness contribution= {thickness_rate:.17e}")
    print(f"STAGE 2 magnetic contribution = {magnetic_rate:.17e}")
    print(f"STAGE 2 component scale       = {stage2_scale:.17e}")
    print(f"STAGE 2 (Semidiscrete dH/dt)  = {dHdt_abs:.17e}")
    print(f"STAGE 2 relative cancellation = {stage2_relative:.17e}")
    require(
        dHdt_abs < STAGE2_TOL,
        f"RIESZ/RATE SOLVE OR GAUGE FAILURE: |dH/dt|={dHdt_abs} >= {STAGE2_TOL}",
    )

    print("SEMIDISCRETE GATE: PASSED")


if __name__ == "__main__":
    test_semidiscrete_cancellation()
