"""Complete one-step A1 exact-discrete-gradient SWMHD solver.

Engineering branch only.  This is the first coupled nonlinear update
    (u^n, H^n, A^n) -> (u^{n+1}, H^{n+1}, A^{n+1})
using the frozen midpoint-skew operator and exact discrete gradients.

No BURGAMOTS forcing is present here.  The only gates are:
- NUM-POS;
- centered discrete-energy preservation;
- mass preservation;
- compatible DIVB preservation.
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
    as_vector,
    assemble,
    cross,
    div,
    dx,
    grad,
    inner,
)
from gusto.core.function_spaces import Spaces


H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5


@dataclass
class State:
    u: object
    H: object
    eta: object
    A: object


def build():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0, V1, V2 = spaces.H1, spaces.HDiv, spaces.L2
    R = FunctionSpace(mesh, "R", 0)
    dxq = dx(domain=mesh, degree=12, scheme="canonical")
    H0_h = Function(V2, name="H0_h")
    H0_h.assign(H0_VALUE)
    return mesh, V0, V1, V2, R, dxq, H0_h


def coeff_anomaly(H_h, H0_h, name):
    eta = Function(H_h.function_space(), name=name)
    eta.dat.data[:] = H_h.dat.data_ro - H0_h.dat.data_ro
    return eta


def reconstruct_H(eta_h, H0_h, name):
    H = Function(eta_h.function_space(), name=name)
    H.dat.data[:] = H0_h.dat.data_ro + eta_h.dat.data_ro
    return H


def num_pos(H_h):
    minimum = float(np.min(H_h.dat.data_ro))
    return minimum > 0.0, minimum


def energy(state, mesh, dxq):
    n = CellNormal(mesh)
    m = cross(n, grad(state.A))
    return float(
        assemble(
            (
                0.5 * state.H * inner(state.u, state.u)
                + inner(m, m) / (2.0 * Constant(KAPPA_VALUE) * state.H)
                + 0.5 * Constant(GSTAR_VALUE) * state.eta**2
            ) * dxq
        )
    )


def mass(state, dxq):
    return float(assemble(state.H * dxq))


def gauge(state, dxq):
    return float(assemble(state.A * dxq))


def divb(state, mesh, dxq):
    n = CellNormal(mesh)
    m = cross(n, grad(state.A))
    return sqrt(abs(float(assemble(div(m) * div(m) * dxq))))


def manufactured_initial(mesh, V0, V1, V2, H0_h, dxq):
    x = SpatialCoordinate(mesh)
    axis = as_vector((0.0, 0.0, 1.0))
    u = Function(V1, name="u_n")
    H = Function(V2, name="H_n")
    A = Function(V0, name="A_n")

    # Nontrivial positive state; it need not be stationary.
    u.interpolate(Constant(0.03) * cross(axis, x))
    H.dat.data[:] = H0_VALUE + 0.2 * np.cos(np.arange(H.dat.data.size, dtype=float))

    # Use a directly assigned FE coefficient pattern for A; subtract its
    # quadrature mean through a constant coefficient shift.
    A.dat.data[:] = 2.0e-4 * np.sin(np.arange(A.dat.data.size, dtype=float))
    area = float(assemble(Constant(1.0) * dxq))
    mean = float(assemble(A * dxq)) / area
    A.dat.data[:] -= mean

    eta = coeff_anomaly(H, H0_h, "eta_n")
    return State(u=u, H=H, eta=eta, A=A)


def nonlinear_parameters():
    return {
        "snes_type": "newtonls",
        "snes_rtol": 1.0e-11,
        "snes_atol": 1.0e-12,
        "snes_stol": 1.0e-12,
        "snes_max_it": 40,
        "snes_linesearch_type": "bt",
        "ksp_type": "preonly",
        "pc_type": "lu",
        "mat_type": "aij",
    }


def attempt_step(state_n, dt, mesh, V0, V1, V2, R, dxq, H0_h):
    # Unknowns: u+, eta+, A+, Ubar, Kbar, Mbar, qbar, gauge multiplier.
    W = V1 * V2 * V0 * V1 * V2 * V0 * V0 * R
    z = Function(W, name="dg_step_unknown")
    u_p, eta_p, A_p, U_b, K_b, M_b, q_b, gauge_lam = z.subfunctions
    u_p.assign(state_n.u)
    eta_p.assign(state_n.eta)
    A_p.assign(state_n.A)

    w_u, phi_eta, gamma_A, w_U, phi_K, gamma_M, gamma_q, nu_g = TestFunctions(W)

    from ufl import split
    up, ep, Ap, Ub, Kb, Mb, qb, gl = split(z)

    un = state_n.u
    en = state_n.eta
    An = state_n.A
    Hn = state_n.H
    Hp = H0_h + ep
    Hbar = 0.5 * (Hp + Hn)
    ubar = 0.5 * (up + un)
    Abar = 0.5 * (Ap + An)

    n = CellNormal(mesh)
    mp = cross(n, grad(Ap))
    mn = cross(n, grad(An))

    # Exact discrete gradients.
    Gm = (
        Constant(1.0 / (4.0 * KAPPA_VALUE))
        * (1.0 / Hp + 1.0 / Hn)
        * (mp + mn)
    )
    Kkin = 0.25 * (inner(up, up) + inner(un, un))
    Kmag = -(inner(mp, mp) + inner(mn, mn)) / (
        Constant(4.0 * KAPPA_VALUE) * Hp * Hn
    )
    Kgrav = 0.5 * Constant(GSTAR_VALUE) * (ep + en)

    x = SpatialCoordinate(mesh)
    fC = Constant(2.0 * OMEGA_FRAME_VALUE) * x[2]

    F = (
        # Riesz representation of exact kinetic derivative Ubar = Hbar*ubar.
        (inner(w_U, Ub) - Hbar * inner(ubar, w_U)) * dxq
        # Riesz representation of exact K discrete derivative.
        + phi_K * (Kb - Kkin - Kmag - Kgrav) * dxq
        # A derivative from exact magnetic Gm and m=R grad A.
        + (gamma_M * Mb - inner(cross(n, grad(gamma_M)), Gm)) * dxq
        # Midpoint weak PV.
        + (
            Hbar * qb * gamma_q
            + inner(ubar, cross(n, grad(gamma_q)))
            - fC * gamma_q
        ) * dxq
        # Midpoint-skew momentum update.
        + (
            inner(w_u, (up - un) / Constant(dt))
            + qb * inner(w_u, cross(n, Ub))
            - div(w_u) * Kb
            - (Mb / Hbar) * inner(grad(Abar), w_u)
        ) * dxq
        # Thickness update.
        + phi_eta * ((ep - en) / Constant(dt) + div(Ub)) * dxq
        # Flux-potential update + algebraic zero-mean gauge.
        + gamma_A * (
            (Ap - An) / Constant(dt)
            + (Ub / Hbar) * grad(Abar)
            + gl
        ) * dxq
        + nu_g * Ap * dxq
    )

    problem = NonlinearVariationalProblem(F, z)
    solver = NonlinearVariationalSolver(
        problem,
        solver_parameters=nonlinear_parameters(),
    )
    solver.solve()
    reason = int(solver.snes.getConvergedReason())

    u_out = Function(V1, name="u_np1")
    eta_out = Function(V2, name="eta_np1")
    A_out = Function(V0, name="A_np1")
    u_out.assign(u_p)
    eta_out.assign(eta_p)
    A_out.assign(A_p)
    H_out = reconstruct_H(eta_out, H0_h, "H_np1")
    return State(u=u_out, H=H_out, eta=eta_out, A=A_out), reason


def step_with_num_pos(state_n, dt, mesh, V0, V1, V2, R, dxq, H0_h, max_retries=8):
    trial_dt = float(dt)
    for retry in range(max_retries + 1):
        state_p, reason = attempt_step(
            state_n, trial_dt, mesh, V0, V1, V2, R, dxq, H0_h
        )
        ok, minimum = num_pos(state_p.H)
        if reason > 0 and ok:
            return state_p, trial_dt, retry, minimum, reason
        trial_dt *= 0.5
    raise RuntimeError("nonlinear/NUM-POS step failed after retry budget")


def run_gate():
    mesh, V0, V1, V2, R, dxq, H0_h = build()
    state_n = manufactured_initial(mesh, V0, V1, V2, H0_h, dxq)

    E0 = energy(state_n, mesh, dxq)
    M0 = mass(state_n, dxq)
    D0 = divb(state_n, mesh, dxq)
    G0 = gauge(state_n, dxq)

    state_p, dt_used, retries, hmin, reason = step_with_num_pos(
        state_n, 1.0e-3, mesh, V0, V1, V2, R, dxq, H0_h
    )

    E1 = energy(state_p, mesh, dxq)
    M1 = mass(state_p, dxq)
    D1 = divb(state_p, mesh, dxq)
    G1 = gauge(state_p, dxq)

    dE = E1 - E0
    dM = M1 - M0

    print("FULL DG STEP forcing                         = NONE")
    print(f"FULL DG STEP SNES reason                     = {reason}")
    print(f"FULL DG STEP dt requested                    = {1.0e-3:.17e}")
    print(f"FULL DG STEP dt accepted                     = {dt_used:.17e}")
    print(f"FULL DG STEP NUM-POS retries                 = {retries}")
    print(f"FULL DG STEP H minimum                       = {hmin:.17e}")
    print(f"FULL DG STEP energy n                        = {E0:.17e}")
    print(f"FULL DG STEP energy n+1                      = {E1:.17e}")
    print(f"FULL DG STEP Delta energy                    = {dE:.17e}")
    print(f"FULL DG STEP mass n                          = {M0:.17e}")
    print(f"FULL DG STEP mass n+1                        = {M1:.17e}")
    print(f"FULL DG STEP Delta mass                      = {dM:.17e}")
    print(f"FULL DG STEP DIVB n                          = {D0:.17e}")
    print(f"FULL DG STEP DIVB n+1                        = {D1:.17e}")
    print(f"FULL DG STEP gauge n                         = {G0:.17e}")
    print(f"FULL DG STEP gauge n+1                       = {G1:.17e}")

    # Gate values characterize the actual solver realization; no scientific
    # response criterion is introduced here.
    if reason <= 0:
        raise AssertionError(f"nonlinear step did not converge: reason={reason}")
    if hmin <= 0.0:
        raise AssertionError("NUM-POS failed")
    if abs(dE) > 1.0e-10:
        raise AssertionError(f"unforced exact-DG energy defect too large: {dE}")
    if abs(dM) > 1.0e-10:
        raise AssertionError(f"mass defect too large: {dM}")
    if D1 > 1.0e-10:
        raise AssertionError(f"DIVB defect too large: {D1}")

    print("FULL DG STEP GATE: PASSED")


if __name__ == "__main__":
    run_gate()
