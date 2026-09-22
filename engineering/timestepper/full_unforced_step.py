"""Complete unforced A1 discrete-gradient one-step solver.

Engineering branch only.  This promotes the already-notarized algebraic
discrete-gradient kernel into the coupled nonlinear map

    (u^n, H^n, A^n) -> (u^{n+1}, H^{n+1}, A^{n+1})

using the frozen compatible weak equations, midpoint skew operator, A1
coefficient-centered gravity, zero-mean A gauge, and NUM-POS retry policy.

No BURGAMOTS forcing or observational data is consumed.
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
    split,
)
from gusto.core.function_spaces import Spaces

GSTAR = 9.81
KAPPA = 1.0
H0_VALUE = 1000.0
OMEGA_FRAME = 7.292e-5

ABS_TOL = 1.0e-10
REL_TOL = 1.0e-11
DIVB_TOL = 1.0e-10


def build_space(refinement=1):
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=refinement, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    V0, V1, V2 = spaces.H1, spaces.HDiv, spaces.L2
    dxq = dx(domain=mesh, degree=12, scheme="canonical")
    return mesh, V0, V1, V2, dxq


def l2_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def zero_mean_projection(mesh, V0, dxq, source, name):
    R = FunctionSpace(mesh, "R", 0)
    W = V0 * R
    z = Function(W, name=f"{name}_gauge")
    a, lam = TrialFunctions(W)
    gamma, mu = TestFunctions(W)
    solve(
        (gamma * a + lam * gamma + mu * a) * dxq
        == gamma * source * dxq,
        z,
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
    out = Function(V0, name=name)
    out.assign(z.subfunctions[0])
    return out


def num_pos(H):
    minimum = float(np.min(H.dat.data_ro))
    return minimum > 0.0, minimum


def compatible_m(A, V1, mesh, name):
    m = Function(V1, name=name)
    m.interpolate(cross(CellNormal(mesh), grad(A)))
    return m


def centered_energy(u, eta, A, H0_h, V1, mesh, dxq):
    H = Function(eta.function_space(), name="energy_H")
    H.dat.data[:] = H0_h.dat.data_ro + eta.dat.data_ro
    m = compatible_m(A, V1, mesh, "energy_m")
    return float(
        assemble(
            (
                0.5 * H * inner(u, u)
                + inner(m, m) / (2.0 * Constant(KAPPA) * H)
                + 0.5 * Constant(GSTAR) * eta**2
            )
            * dxq
        )
    )


def make_manufactured_state(mesh, V0, V1, V2, dxq):
    u = Function(V1, name="u_n")
    eta = Function(V2, name="eta_n")
    Araw = Function(V0, name="Araw_n")

    iu = np.arange(u.dat.data.size, dtype=float)
    ie = np.arange(eta.dat.data.size, dtype=float)
    ia = np.arange(Araw.dat.data.size, dtype=float)

    u.dat.data[:] = 1.5e-2 * np.sin(0.37 * iu) + 4.0e-3 * np.cos(0.11 * iu)
    eta.dat.data[:] = 2.0e-1 * np.cos(0.29 * ie) + 3.0e-2 * np.sin(0.17 * ie)
    Araw.dat.data[:] = 2.0e-4 * np.sin(0.23 * ia) + 7.0e-5 * np.cos(0.31 * ia)
    A = zero_mean_projection(mesh, V0, dxq, Araw, "A_n")

    H0_h = Function(V2, name="H0_h")
    H0_h.assign(H0_VALUE)
    H = Function(V2, name="H_n")
    H.dat.data[:] = H0_h.dat.data_ro + eta.dat.data_ro
    ok, hmin = num_pos(H)
    if not ok:
        raise AssertionError(f"manufactured initial depth nonpositive: {hmin}")
    return u, eta, A, H0_h


def initialize_auxiliaries(mesh, V0, V1, V2, dxq, u, eta, A, H0_h):
    n = CellNormal(mesh)
    H = H0_h + eta
    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    U = Function(V1, name="Ubar_init")
    Ut = TrialFunction(V1)
    solve(inner(w, Ut) * dxq == H * inner(u, w) * dxq, U)

    m = compatible_m(A, V1, mesh, "m_init")
    K = Function(V2, name="Kbar_init")
    Kt = TrialFunction(V2)
    solve(
        phi * Kt * dxq
        == phi
        * (
            0.5 * inner(u, u)
            - inner(m, m) / (2.0 * Constant(KAPPA) * H**2)
            + Constant(GSTAR) * eta
        )
        * dxq,
        K,
    )

    M = Function(V0, name="Mbar_init")
    Mt = TrialFunction(V0)
    solve(
        gamma * Mt * dxq
        == inner(grad(gamma), grad(A)) / (Constant(KAPPA) * H) * dxq,
        M,
    )

    q = Function(V0, name="qbar_init")
    qt = TrialFunction(V0)
    x = SpatialCoordinate(mesh)
    fC = 2.0 * Constant(OMEGA_FRAME) * x[2]
    solve(
        H * qt * gamma * dxq
        == (-inner(u, cross(n, grad(gamma))) + fC * gamma) * dxq,
        q,
    )
    return U, K, M, q


def one_step(dt_value=2.0e-3):
    mesh, V0, V1, V2, dxq = build_space(refinement=1)
    u_n, eta_n, A_n, H0_h = make_manufactured_state(mesh, V0, V1, V2, dxq)
    U0, K0, M0, q0 = initialize_auxiliaries(
        mesh, V0, V1, V2, dxq, u_n, eta_n, A_n, H0_h
    )

    # The constant mode of A is pure gauge: all physical magnetic quantities
    # use grad(A).  Solve only the seven physical FE fields here and select the
    # zero-mean representative deterministically after the step.
    W = V1 * V2 * V0 * V1 * V2 * V0 * V0
    z = Function(W, name="A1_full_step")
    (
        u_p_f,
        eta_p_f,
        A_p_f,
        Ubar_f,
        Kbar_f,
        Mbar_f,
        qbar_f,
    ) = z.subfunctions

    u_p_f.assign(u_n)
    eta_p_f.assign(eta_n)
    A_p_f.assign(A_n)
    Ubar_f.assign(U0)
    Kbar_f.assign(K0)
    Mbar_f.assign(M0)
    qbar_f.assign(q0)

    u_p, eta_p, A_p, Ubar, Kbar, Mbar, qbar = split(z)
    wu, phiH, gammaA, wU, phiK, gammaM, gammaQ = TestFunctions(W)

    n = CellNormal(mesh)
    dtc = Constant(dt_value)
    kappa = Constant(KAPPA)
    gstar = Constant(GSTAR)

    H_n = H0_h + eta_n
    H_p = H0_h + eta_p
    Hbar = H0_h + 0.5 * (eta_n + eta_p)
    ubar = 0.5 * (u_n + u_p)
    Abar = 0.5 * (A_n + A_p)

    m_n = cross(n, grad(A_n))
    m_p = cross(n, grad(A_p))

    Kkin = 0.25 * (inner(u_p, u_p) + inner(u_n, u_n))
    Gm = (
        Constant(1.0 / (4.0 * KAPPA))
        * (1.0 / H_p + 1.0 / H_n)
        * (m_p + m_n)
    )
    Kmag = -(
        inner(m_p, m_p) + inner(m_n, m_n)
    ) / (Constant(4.0 * KAPPA) * H_p * H_n)
    Kgrav = 0.5 * gstar * (eta_p + eta_n)
    Kexact = Kkin + Kmag + Kgrav

    x = SpatialCoordinate(mesh)
    fC = 2.0 * Constant(OMEGA_FRAME) * x[2]

    F = (
        # exact discrete-gradient Riesz representatives
        (inner(wU, Ubar) - Hbar * inner(ubar, wU)) * dxq
        + phiK * (Kbar - Kexact) * dxq
        + (gammaM * Mbar - inner(cross(n, grad(gammaM)), Gm)) * dxq
        # midpoint weak PV
        + (
            Hbar * qbar * gammaQ
            + inner(ubar, cross(n, grad(gammaQ)))
            - fC * gammaQ
        )
        * dxq
        # midpoint-skew state update
        + (
            inner(wu, (u_p - u_n) / dtc)
            + qbar * inner(wu, cross(n, Ubar))
            - div(wu) * Kbar
            - (Mbar / Hbar) * inner(grad(Abar), wu)
        )
        * dxq
        + phiH * ((eta_p - eta_n) / dtc + div(Ubar)) * dxq
        + (
            gammaA * (A_p - A_n) / dtc
            + gammaA * inner(Ubar / Hbar, grad(Abar))
        )
        * dxq
    )

    solve(
        F == 0,
        z,
        solver_parameters={
            "snes_type": "newtonls",
            "snes_linesearch_type": "bt",
            "snes_rtol": 1.0e-11,
            "snes_atol": 1.0e-12,
            "snes_stol": 1.0e-12,
            "snes_max_it": 40,
            # No Real-space rows remain in the physical nonlinear system, so
            # Firedrake can assemble a monolithic FE Jacobian and solve it
            # directly.  Gauge normalization is applied after the solve.
            "mat_type": "aij",
            "ksp_type": "preonly",
            "pc_type": "lu",
        },
    )

    # Materialize the prognostic output state.
    u_p_out = Function(V1, name="u_np1")
    eta_p_out = Function(V2, name="eta_np1")
    u_p_out.assign(u_p_f)
    eta_p_out.assign(eta_p_f)
    # Deterministic gauge normalization.  Subtracting the constant mode does
    # not change grad(A), m, magnetic energy, or any physical evolution term.
    A_p_out = zero_mean_projection(mesh, V0, dxq, A_p_f, "A_np1")

    H_n_out = Function(V2, name="H_n_out")
    H_p_out = Function(V2, name="H_np1")
    H_n_out.dat.data[:] = H0_h.dat.data_ro + eta_n.dat.data_ro
    H_p_out.dat.data[:] = H0_h.dat.data_ro + eta_p_out.dat.data_ro

    E_n = centered_energy(u_n, eta_n, A_n, H0_h, V1, mesh, dxq)
    E_p = centered_energy(u_p_out, eta_p_out, A_p_out, H0_h, V1, mesh, dxq)
    dE = E_p - E_n
    Escale = max(abs(E_n), abs(E_p), 1.0)
    Erel = abs(dE) / Escale

    mass_n = float(assemble(H_n_out * dxq))
    mass_p = float(assemble(H_p_out * dxq))
    dmass = mass_p - mass_n
    mrel = abs(dmass) / max(abs(mass_n), 1.0)

    gauge = abs(float(assemble(A_p_out * dxq)))
    m_p_out = compatible_m(A_p_out, V1, mesh, "m_np1")
    divb = l2_scalar(div(m_p_out), dxq)
    pos, hmin = num_pos(H_p_out)

    du = l2_vector(u_p_out - u_n, dxq)
    deta = l2_scalar(eta_p_out - eta_n, dxq)
    dA = l2_scalar(A_p_out - A_n, dxq)

    print("FULL-DG STEP forcing                         = NONE")
    print("FULL-DG STEP representation                  = A1_COEFFICIENT_CENTERED")
    print(f"FULL-DG STEP dt                              = {dt_value:.17e}")
    print(f"FULL-DG STEP ||Delta u|| L2                  = {du:.17e}")
    print(f"FULL-DG STEP ||Delta eta|| L2                = {deta:.17e}")
    print(f"FULL-DG STEP ||Delta A|| L2                  = {dA:.17e}")
    print(f"FULL-DG STEP H minimum                       = {hmin:.17e}")
    print(f"FULL-DG STEP energy n                        = {E_n:.17e}")
    print(f"FULL-DG STEP energy n+1                      = {E_p:.17e}")
    print(f"FULL-DG STEP Delta energy                    = {dE:.17e}")
    print(f"FULL-DG STEP relative energy error           = {Erel:.17e}")
    print(f"FULL-DG STEP mass error                      = {dmass:.17e}")
    print(f"FULL-DG STEP relative mass error             = {mrel:.17e}")
    print(f"FULL-DG STEP gauge                           = {gauge:.17e}")
    print(f"FULL-DG STEP DIVB L2                         = {divb:.17e}")
    print("FULL-DG STEP gauge selection                 = POSTSTEP_ZERO_MEAN_PROJECTION")

    if not pos:
        raise AssertionError(f"NUM-POS failed: Hmin={hmin}")
    if not (abs(dmass) < ABS_TOL or mrel < REL_TOL):
        raise AssertionError(f"mass failed: abs={abs(dmass)}, rel={mrel}")
    if divb >= DIVB_TOL:
        raise AssertionError(f"DIVB failed: {divb}")
    if gauge >= ABS_TOL:
        raise AssertionError(f"gauge failed: {gauge}")
    if not (abs(dE) < ABS_TOL or Erel < REL_TOL):
        raise AssertionError(f"energy failed: abs={abs(dE)}, rel={Erel}")

    print("FULL-DG STEP NUM-POS                        = PASSED")
    print("FULL-DG STEP MASS                           = PASSED")
    print("FULL-DG STEP DIVB                           = PASSED")
    print("FULL-DG STEP ENERGY                         = PASSED")
    print("FULL-DG STEP STATUS                         = ENGINEERING_GATE_PASSED")


if __name__ == "__main__":
    one_step()
