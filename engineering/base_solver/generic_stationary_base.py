"""Reusable discrete stationary BASE-P solver.

Engineering implementation of the frozen BASE-P contract:
    minimize BASE-D over admitted stationary discrete states.

The nonlinear core solves the *actual discrete stationarity equations* together
with the frozen D1-D3 Riesz maps, weak PV, target mass and A-gauge in one
monolithic system.  BASE-D is then used to select among deterministic
converged candidates; it is not converted into a tunable penalty.

State coordinate:
    (u_h, eta_h, A_h),  H_h = H0_h + eta_h
where eta_h is the A1 coefficient-space anomaly coordinate.  H_h remains the
physical thickness output.

This module is forcing-blind and contains no solar records.
"""

from dataclasses import dataclass
from math import sqrt

import numpy as np
from firedrake import (
    CellNormal,
    Constant,
    Function,
    FunctionSpace,
    IcosahedralSphereMesh,
    NonlinearVariationalProblem,
    NonlinearVariationalSolver,
    SpatialCoordinate,
    TestFunctions,
    TrialFunction,
    TrialFunctions,
    as_vector,
    assemble,
    cross,
    div,
    dx,
    grad,
    inner,
)
from gusto.core.function_spaces import Spaces
from petsc4py import PETSc


H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5

# Existing frozen admission checks; not new physical tolerances.
STATIONARY_GATE = 1.0e-12
MASS_ABS_TOL = 1.0e-12
MASS_REL_TOL = 5.0e-14
GAUGE_TOL = 1.0e-12
DIVB_TOL = 1.0e-12

U_AMP = 10.0
B_AMP = 8.0


@dataclass
class BaseCandidate:
    u_h: object
    H_h: object
    A_h: object
    eta_h: object
    base_d: float
    stationary_abs: float
    stationary_scale: float
    stationary_rel: float
    mass_error: float
    gauge: float
    divb: float
    h_min: float
    snes_reason: int
    admitted: bool


def strict_linear():
    return {"ksp_rtol": 1.0e-14, "ksp_atol": 1.0e-15}


def monolithic_solver_parameters():
    # Use the same matrix-free/assembled-PC pattern already exercised by the
    # project's V0 x R gauge solves.  The outer Jacobian remains matrix-free;
    # each physical field gets an assembled local preconditioner and the two
    # Real constraint fields remain explicit scalar blocks.
    params = {
        "mat_type": "matfree",
        "snes_type": "newtonls",
        "snes_rtol": 1.0e-11,
        "snes_atol": 1.0e-12,
        "snes_stol": 1.0e-12,
        "snes_max_it": 50,
        "snes_linesearch_type": "bt",
        "ksp_type": "fgmres",
        "ksp_rtol": 1.0e-10,
        "ksp_atol": 1.0e-12,
        "ksp_max_it": 1000,
        "pc_type": "fieldsplit",
        "pc_fieldsplit_type": "additive",
    }
    for i in range(7):
        params[f"pc_fieldsplit_{i}_fields"] = str(i)
        params[f"fieldsplit_{i}"] = {
            "ksp_type": "preonly",
            "pc_type": "python",
            "pc_python_type": "firedrake.AssembledPC",
            "assembled": {
                "ksp_type": "preonly",
                "pc_type": "lu",
            },
        }
    for i in (7, 8):
        params[f"pc_fieldsplit_{i}_fields"] = str(i)
        params[f"fieldsplit_{i}"] = {
            "ksp_type": "preonly",
            "pc_type": "none",
        }
    return params


def build_frozen_spaces():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0, V1, V2 = spaces.H1, spaces.HDiv, spaces.L2
    R = FunctionSpace(mesh, "R", 0)
    dxq = dx(domain=mesh, degree=12, scheme="canonical")
    return mesh, V0, V1, V2, R, dxq


def l2_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def dual_norm(cofunction):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(PETSc.NormType.NORM_2)


def zero_mean_project_v0(mesh, V0, dxq, source_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    WA = V0 * R
    mixed = Function(WA, name=f"{name}_lambda")
    scalar_trial, lambda_trial = TrialFunctions(WA)
    gamma, mu = TestFunctions(WA)
    from firedrake import solve
    solve(
        (gamma * scalar_trial + lambda_trial * gamma + mu * scalar_trial) * dxq
        == gamma * source_expr * dxq,
        mixed,
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
    scalar_h, _ = mixed.subfunctions
    out = Function(V0, name=name)
    out.assign(scalar_h)
    return out


def manufactured_target(mesh, V0, V1, V2, dxq):
    x = SpatialCoordinate(mesh)
    z = x[2]
    axis = as_vector((0.0, 0.0, 1.0))

    C = U_AMP**2 - B_AMP**2 + 2.0 * OMEGA_FRAME_VALUE * U_AMP
    eta_amp = C / (2.0 * GSTAR_VALUE)
    eta_expr = Constant(eta_amp) * (Constant(1.0 / 3.0) - z**2)

    u_hat = Function(V1, name="target_u")
    eta_hat = Function(V2, name="target_eta")
    u_hat.interpolate(Constant(U_AMP) * cross(axis, x))
    eta_hat.interpolate(eta_expr)

    A_expr = -Constant(B_AMP) * (
        Constant(H0_VALUE + eta_amp / 3.0) * z
        - Constant(eta_amp / 3.0) * z**3
    )
    A_hat = zero_mean_project_v0(mesh, V0, dxq, A_expr, "target_A")

    H0_h = Function(V2, name="H0_h")
    H0_h.assign(H0_VALUE)
    H_hat = Function(V2, name="target_H")
    H_hat.dat.data[:] = H0_h.dat.data_ro + eta_hat.dat.data_ro
    return u_hat, H_hat, eta_hat, A_hat, H0_h


def base_d_metric(u_h, H_h, A_h, u_hat, H_hat, A_hat, n, dxq):
    m_h = cross(n, grad(A_h))
    m_hat = cross(n, grad(A_hat))
    return float(
        assemble(
            (
                0.5 * Constant(H0_VALUE) * inner(u_h - u_hat, u_h - u_hat)
                + inner(m_h - m_hat, m_h - m_hat)
                / (2.0 * Constant(KAPPA_VALUE * H0_VALUE))
                + 0.5 * Constant(GSTAR_VALUE) * (H_h - H_hat) ** 2
            )
            * dxq
        )
    )


def stationary_term_characterization(u_h, H_h, eta_h, A_h, mesh, V0, V1, V2, dxq):
    """Reassemble the admitted state's SD1 terms for characterization only."""
    from firedrake import TestFunction, TrialFunction, solve
    n = CellNormal(mesh)
    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    U_h = Function(V1)
    U_trial = TrialFunction(V1)
    solve(inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq, U_h,
          solver_parameters=strict_linear())

    m_h = Function(V1)
    m_h.interpolate(cross(n, grad(A_h)))

    K_h = Function(V2)
    K_trial = TrialFunction(V2)
    solve(
        phi * K_trial * dxq
        == phi * (
            0.5 * inner(u_h, u_h)
            - inner(m_h, m_h) / (2.0 * Constant(KAPPA_VALUE) * H_h**2)
            + Constant(GSTAR_VALUE) * eta_h
        ) * dxq,
        K_h,
        solver_parameters=strict_linear(),
    )

    M_h = Function(V0)
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h))
        / (Constant(KAPPA_VALUE) * H_h) * dxq,
        M_h,
        solver_parameters=strict_linear(),
    )

    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]

    q_rel = Function(V0)
    q_cor = Function(V0)
    q_trial = TrialFunction(V0)
    solve(H_h * q_trial * gamma * dxq == -inner(u_h, cross(n, grad(gamma))) * dxq,
          q_rel, solver_parameters=strict_linear())
    solve(H_h * q_trial * gamma * dxq == f_C * gamma * dxq,
          q_cor, solver_parameters=strict_linear())

    adv = assemble((-q_rel * inner(w, cross(n, U_h))) * dxq)
    cor = assemble((-q_cor * inner(w, cross(n, U_h))) * dxq)
    depth = assemble((div(w) * K_h) * dxq)
    mag = assemble(((M_h / H_h) * inner(grad(A_h), w)) * dxq)
    total = assemble((
        -q_rel * inner(w, cross(n, U_h))
        -q_cor * inner(w, cross(n, U_h))
        +div(w) * K_h
        +(M_h / H_h) * inner(grad(A_h), w)
    ) * dxq)

    pieces = [dual_norm(adv), dual_norm(cor), dual_norm(depth), dual_norm(mag)]
    scale = sum(pieces)
    total_norm = dual_norm(total)
    return pieces, total_norm, scale, (total_norm / scale if scale > 0 else 0.0)


def solve_discrete_base(target_builder=manufactured_target):
    mesh, V0, V1, V2, R, dxq = build_frozen_spaces()
    u_hat, H_hat, eta_hat, A_hat, H0_h = target_builder(mesh, V0, V1, V2, dxq)
    target_mass = float(assemble(H_hat * dxq))

    # Unknowns: physical coordinates, frozen Riesz/PV auxiliaries, and scalar
    # mass/gauge compatibility multipliers.
    W = V1 * V2 * V0 * V1 * V2 * V0 * V0 * R * R
    z = Function(W, name="base_stationary_unknown")
    (
        u, eta, A, U, K, M, q, mu_mass, mu_gauge
    ) = z.subfunctions

    # Initial state is the deterministic projected target.  Auxiliaries start at
    # zero; Newton constructs the admitted discrete equilibrium.
    u.assign(u_hat)
    eta.assign(eta_hat)
    A.assign(A_hat)

    (
        w_u, phi_eta, gamma_A, w_U, phi_K, gamma_M, gamma_q, nu_mass, nu_gauge
    ) = TestFunctions(W)

    # UFL views of the mixed unknowns are needed in the residual.
    from ufl import split
    uu, ee, AA, UU, KK, MM, qq, mum, mug = split(z)
    H = H0_h + ee
    n = CellNormal(mesh)
    m = cross(n, grad(AA))
    x = SpatialCoordinate(mesh)
    f_C = Constant(2.0 * OMEGA_FRAME_VALUE) * x[2]

    F = (
        # D1
        (inner(w_U, UU) - H * inner(uu, w_U)) * dxq
        # D2 (A1)
        + phi_K * (
            KK
            - 0.5 * inner(uu, uu)
            + inner(m, m) / (2.0 * Constant(KAPPA_VALUE) * H**2)
            - Constant(GSTAR_VALUE) * ee
        ) * dxq
        # D3
        + (
            gamma_M * MM
            - inner(grad(gamma_M), grad(AA))
            / (Constant(KAPPA_VALUE) * H)
        ) * dxq
        # weak PV
        + (
            H * qq * gamma_q
            + inner(uu, cross(n, grad(gamma_q)))
            - f_C * gamma_q
        ) * dxq
        # stationary SD1
        + (
            -qq * inner(w_u, cross(n, UU))
            + div(w_u) * KK
            + (MM / H) * inner(grad(AA), w_u)
        ) * dxq
        # stationary SD2 with scalar compatibility multiplier
        + (-phi_eta * div(UU) + mum * phi_eta) * dxq
        # stationary SD3 with scalar gauge compatibility multiplier
        + (-gamma_A * inner(UU / H, grad(AA)) + mug * gamma_A) * dxq
        # target mass and zero-mean A gauge
        + nu_mass * (H - H_hat) * dxq
        + nu_gauge * AA * dxq
    )

    problem = NonlinearVariationalProblem(F, z)
    solver = NonlinearVariationalSolver(
        problem,
        solver_parameters=monolithic_solver_parameters(),
    )
    solver.solve()

    reason = int(solver.snes.getConvergedReason())

    # Copy outputs away from mixed views and reconstruct H coefficient-wise.
    u_out = Function(V1, name="base_u")
    eta_out = Function(V2, name="base_eta")
    A_out = Function(V0, name="base_A")
    H_out = Function(V2, name="base_H")
    u_out.assign(u)
    eta_out.assign(eta)
    A_out.assign(A)
    H_out.dat.data[:] = H0_h.dat.data_ro + eta_out.dat.data_ro

    # Characterize actual discrete stationarity by solving the frozen rate maps.
    pieces, raw_total, scale, rel = stationary_term_characterization(
        u_out, H_out, eta_out, A_out, mesh, V0, V1, V2, dxq
    )

    # Momentum L2 rate from raw stationary residual.
    from firedrake import TestFunction, TrialFunction, solve
    w = TestFunction(V1)
    du = Function(V1)
    du_trial = TrialFunction(V1)

    # Recompute the full frozen SD1 via characterization auxiliaries is avoided
    # here; raw_total is dual norm characterization.  Monolithic state equation
    # residual is additionally reported by SNES below.  Admission uses SNES
    # convergence + mass/gauge/positivity/DIVB, and the frozen independent
    # stationary-rate gate is evaluated in the companion witness script.

    mass = float(assemble(H_out * dxq))
    mass_error = abs(mass - target_mass)
    mass_rel = mass_error / max(abs(target_mass), 1.0)
    gauge = abs(float(assemble(A_out * dxq)))
    m_out = Function(V1)
    m_out.interpolate(cross(n, grad(A_out)))
    divb = l2_scalar(div(m_out), dxq)
    h_min = float(np.min(H_out.dat.data_ro))
    D = base_d_metric(u_out, H_out, A_out, u_hat, H_hat, A_hat, n, dxq)

    # The monolithic stationary solve is the primary construction criterion.
    # raw_total and R_base remain characterization data until a BASE numerical
    # acceptance rule is separately frozen.
    admitted = (
        reason > 0
        and (mass_error < MASS_ABS_TOL or mass_rel < MASS_REL_TOL)
        and gauge < GAUGE_TOL
        and h_min > 0.0
        and divb < DIVB_TOL
    )

    return BaseCandidate(
        u_h=u_out,
        H_h=H_out,
        A_h=A_out,
        eta_h=eta_out,
        base_d=D,
        stationary_abs=raw_total,
        stationary_scale=scale,
        stationary_rel=rel,
        mass_error=mass_error,
        gauge=gauge,
        divb=divb,
        h_min=h_min,
        snes_reason=reason,
        admitted=admitted,
    ), pieces


if __name__ == "__main__":
    candidate, pieces = solve_discrete_base()
    labels = ("adv_metric", "coriolis", "depth", "magnetic")
    print("GENERIC BASE SOLVER: NON-SOLAR MANUFACTURED TARGET")
    print(f"GENERIC BASE SNES reason                    = {candidate.snes_reason}")
    print(f"GENERIC BASE admitted                       = {candidate.admitted}")
    print(f"GENERIC BASE BASE-D                         = {candidate.base_d:.17e}")
    print(f"GENERIC BASE raw stationary momentum norm   = {candidate.stationary_abs:.17e}")
    print(f"GENERIC BASE S_base                         = {candidate.stationary_scale:.17e}")
    print(f"GENERIC BASE R_base                         = {candidate.stationary_rel:.17e}")
    for name, value in zip(labels, pieces):
        print(f"GENERIC BASE term {name:10s}              = {value:.17e}")
    print(f"GENERIC BASE mass error                     = {candidate.mass_error:.17e}")
    print(f"GENERIC BASE gauge                          = {candidate.gauge:.17e}")
    print(f"GENERIC BASE DIVB                           = {candidate.divb:.17e}")
    print(f"GENERIC BASE H minimum                      = {candidate.h_min:.17e}")
    print("GENERIC BASE solar Omega0 consumed           = NO")
    print("GENERIC BASE BURGAMOTS forcing consumed      = NO")
    if not candidate.admitted:
        raise AssertionError("generic BASE solver did not construct an admitted discrete equilibrium")
    print("GENERIC BASE SOLVER WITNESS: PASSED")
