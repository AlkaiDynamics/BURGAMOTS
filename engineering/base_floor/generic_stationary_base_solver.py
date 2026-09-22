"""Reusable constrained discrete stationary BASE-P solver.

This is the first generic implementation of the frozen BASE-P definition:

    minimize BASE-D(state, target)
    subject to the full unforced compatible stationary residual,
               target mass,
               zero-mean A gauge,
               positive depth.

The equality-constrained minimization is solved as one KKT system.  The
manufactured non-solar B1 target from Lane B is used only as the first target.
No solar Omega_0, BURGAMOTS forcing, observations, or response outcomes enter.
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
    TrialFunction,
    TrialFunctions,
    TestFunctions,
    as_vector,
    assemble,
    cross,
    derivative,
    div,
    dx,
    grad,
    inner,
    solve,
    split,
)
from gusto.core.function_spaces import Spaces
from petsc4py import PETSc

H0_VALUE = 1000.0
GSTAR_VALUE = 9.81
KAPPA_VALUE = 1.0
OMEGA_FRAME_VALUE = 7.292e-5
U_AMP = 10.0
B_AMP = 8.0
BASE_GATE = 1.0e-12


def dual_norm(cofunction):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(PETSc.NormType.NORM_2)


def l2_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def build(refinement=0):
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=refinement, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    return mesh, spaces.H1, spaces.HDiv, spaces.L2, dx(
        domain=mesh, degree=12, scheme="canonical"
    )


def zero_mean_project_v0(mesh, V0, dxq, source_expr, name):
    R = FunctionSpace(mesh, "R", 0)
    W = V0 * R
    z = Function(W, name=f"{name}_projection")
    a, lam = TrialFunctions(W)
    gamma, mu = TestFunctions(W)
    solve(
        (gamma * a + lam * gamma + mu * a) * dxq == gamma * source_expr * dxq,
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


def manufactured_target(mesh, V0, V1, V2, dxq):
    x = SpatialCoordinate(mesh)
    zcoord = x[2]
    axis = as_vector((0.0, 0.0, 1.0))

    C = U_AMP**2 - B_AMP**2 + 2.0 * OMEGA_FRAME_VALUE * U_AMP
    eta_amp = C / (2.0 * GSTAR_VALUE)
    eta_expr = Constant(eta_amp) * (Constant(1.0 / 3.0) - zcoord**2)
    u_expr = Constant(U_AMP) * cross(axis, x)
    A_expr = -Constant(B_AMP) * (
        Constant(H0_VALUE + eta_amp / 3.0) * zcoord
        - Constant(eta_amp / 3.0) * zcoord**3
    )

    u_t = Function(V1, name="target_u")
    eta_t = Function(V2, name="target_eta")
    u_t.interpolate(u_expr)
    eta_t.interpolate(eta_expr)
    A_t = zero_mean_project_v0(mesh, V0, dxq, A_expr, "target_A")

    H0_h = Function(V2, name="H0_h")
    H0_h.assign(H0_VALUE)
    return u_t, eta_t, A_t, H0_h, eta_amp


def initialize_primal_aux(mesh, V0, V1, V2, dxq, u, eta, A, H0_h):
    n = CellNormal(mesh)
    H = H0_h + eta
    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    U = Function(V1, name="init_U")
    Ut = TrialFunction(V1)
    solve(inner(w, Ut) * dxq == H * inner(u, w) * dxq, U)

    m = Function(V1, name="init_m")
    m.interpolate(cross(n, grad(A)))

    K = Function(V2, name="init_K")
    Kt = TrialFunction(V2)
    solve(
        phi * Kt * dxq
        == phi
        * (
            0.5 * inner(u, u)
            - inner(m, m) / (2.0 * Constant(KAPPA_VALUE) * H**2)
            + Constant(GSTAR_VALUE) * eta
        )
        * dxq,
        K,
    )

    M = Function(V0, name="init_M")
    Mt = TrialFunction(V0)
    solve(
        gamma * Mt * dxq
        == inner(grad(gamma), grad(A)) / (Constant(KAPPA_VALUE) * H) * dxq,
        M,
    )

    q = Function(V0, name="init_q")
    qt = TrialFunction(V0)
    x = SpatialCoordinate(mesh)
    fC = 2.0 * Constant(OMEGA_FRAME_VALUE) * x[2]
    solve(
        H * qt * gamma * dxq
        == (-inner(u, cross(n, grad(gamma))) + fC * gamma) * dxq,
        q,
    )
    return U, K, M, q


def physical_characterization(mesh, V0, V1, V2, dxq, u, eta, A, H0_h):
    n = CellNormal(mesh)
    H = Function(V2, name="char_H")
    H.dat.data[:] = H0_h.dat.data_ro + eta.dat.data_ro

    m = Function(V1, name="char_m")
    m.interpolate(cross(n, grad(A)))

    w = TestFunction(V1)
    phi = TestFunction(V2)
    gamma = TestFunction(V0)

    U = Function(V1, name="char_U")
    Ut = TrialFunction(V1)
    solve(inner(w, Ut) * dxq == H * inner(u, w) * dxq, U)

    K = Function(V2, name="char_K")
    Kt = TrialFunction(V2)
    solve(
        phi * Kt * dxq
        == phi
        * (
            0.5 * inner(u, u)
            - inner(m, m) / (2.0 * Constant(KAPPA_VALUE) * H**2)
            + Constant(GSTAR_VALUE) * eta
        )
        * dxq,
        K,
    )

    M = Function(V0, name="char_M")
    Mt = TrialFunction(V0)
    solve(
        gamma * Mt * dxq
        == inner(grad(gamma), grad(A)) / (Constant(KAPPA_VALUE) * H) * dxq,
        M,
    )

    x = SpatialCoordinate(mesh)
    fC = 2.0 * Constant(OMEGA_FRAME_VALUE) * x[2]

    qrel = Function(V0, name="char_qrel")
    qcor = Function(V0, name="char_qcor")
    qt = TrialFunction(V0)
    solve(
        H * qt * gamma * dxq
        == -inner(u, cross(n, grad(gamma))) * dxq,
        qrel,
    )
    solve(H * qt * gamma * dxq == fC * gamma * dxq, qcor)

    adv = -qrel * inner(w, cross(n, U))
    cor = -qcor * inner(w, cross(n, U))
    depth = div(w) * K
    mag = (M / H) * inner(grad(A), w)

    ra = assemble(adv * dxq)
    rc = assemble(cor * dxq)
    rd = assemble(depth * dxq)
    rm = assemble(mag * dxq)
    rt = assemble((adv + cor + depth + mag) * dxq)

    norms = {
        "adv": dual_norm(ra),
        "cor": dual_norm(rc),
        "depth": dual_norm(rd),
        "mag": dual_norm(rm),
        "total": dual_norm(rt),
    }
    S = sum(norms[k] for k in ("adv", "cor", "depth", "mag"))
    Rscaled = norms["total"] / S if S > 0 else 0.0

    du = Function(V1, name="char_du")
    dut = TrialFunction(V1)
    solve(inner(w, dut) * dxq == (adv + cor + depth + mag) * dxq, du)

    dH = Function(V2, name="char_dH")
    dHt = TrialFunction(V2)
    solve(phi * dHt * dxq == -phi * div(U) * dxq, dH)

    Rspace = FunctionSpace(mesh, "R", 0)
    WA = V0 * Rspace
    za = Function(WA, name="char_dA")
    dAt, lg = TrialFunctions(WA)
    ga, mu = TestFunctions(WA)
    solve(
        (ga * dAt + lg * ga + mu * dAt) * dxq
        == -ga * inner(U / H, grad(A)) * dxq,
        za,
        solver_parameters={"ksp_type": "preonly", "pc_type": "lu"},
    )
    dA = za.subfunctions[0]

    rates = {
        "du": l2_vector(du, dxq),
        "dH": l2_scalar(dH, dxq),
        "dA": l2_scalar(dA, dxq),
    }
    Rabs = max(rates.values())
    return H, m, norms, S, Rscaled, rates, Rabs


def base_d(mesh, V1, dxq, u, eta, A, u_t, eta_t, A_t):
    n = CellNormal(mesh)
    m = cross(n, grad(A))
    mt = cross(n, grad(A_t))
    return float(
        assemble(
            (
                0.5 * Constant(H0_VALUE) * inner(u - u_t, u - u_t)
                + inner(m - mt, m - mt)
                / (2.0 * Constant(KAPPA_VALUE * H0_VALUE))
                + 0.5 * Constant(GSTAR_VALUE) * (eta - eta_t) ** 2
            )
            * dxq
        )
    )


def solve_generic_base():
    mesh, V0, V1, V2, dxq = build(refinement=0)
    u_t, eta_t, A_t, H0_h, eta_amp = manufactured_target(
        mesh, V0, V1, V2, dxq
    )
    U0, K0, M0, q0 = initialize_primal_aux(
        mesh, V0, V1, V2, dxq, u_t, eta_t, A_t, H0_h
    )

    R = FunctionSpace(mesh, "R", 0)

    # primal: u, eta, A, U, K, M, q
    # multipliers: lambda_SD1, lambda_SD2, lambda_SD3,
    #              lambda_D1, lambda_D2, lambda_D3, lambda_PV,
    #              lambda_mass, lambda_gauge
    W = (
        V1 * V2 * V0 * V1 * V2 * V0 * V0
        * V1 * V2 * V0 * V1 * V2 * V0 * V0 * R * R
    )
    z = Function(W, name="generic_BASE_P_KKT")
    subs = z.subfunctions

    subs[0].assign(u_t)
    subs[1].assign(eta_t)
    subs[2].assign(A_t)
    subs[3].assign(U0)
    subs[4].assign(K0)
    subs[5].assign(M0)
    subs[6].assign(q0)
    for sf in subs[7:]:
        sf.assign(0.0)

    (
        u, eta, A, U, K, M, q,
        lu, lH, lA, lU, lK, lM, lq, lmass, lgauge,
    ) = split(z)

    n = CellNormal(mesh)
    H = H0_h + eta
    m = cross(n, grad(A))
    mt = cross(n, grad(A_t))
    kappa = Constant(KAPPA_VALUE)
    gstar = Constant(GSTAR_VALUE)
    x = SpatialCoordinate(mesh)
    fC = 2.0 * Constant(OMEGA_FRAME_VALUE) * x[2]

    D = (
        0.5 * Constant(H0_VALUE) * inner(u - u_t, u - u_t)
        + inner(m - mt, m - mt) / (2.0 * Constant(KAPPA_VALUE * H0_VALUE))
        + 0.5 * gstar * (eta - eta_t) ** 2
    ) * dxq

    # Equality constraints, paired with their KKT multipliers.
    c_D1 = (inner(lU, U) - H * inner(u, lU)) * dxq
    c_D2 = lK * (
        K
        - (
            0.5 * inner(u, u)
            - inner(m, m) / (2.0 * kappa * H**2)
            + gstar * eta
        )
    ) * dxq
    c_D3 = (
        lM * M - inner(grad(lM), grad(A)) / (kappa * H)
    ) * dxq
    c_PV = (
        H * q * lq
        + inner(u, cross(n, grad(lq)))
        - fC * lq
    ) * dxq

    c_SD1 = (
        -q * inner(lu, cross(n, U))
        + div(lu) * K
        + (M / H) * inner(grad(A), lu)
    ) * dxq
    c_SD2 = lH * div(U) * dxq
    c_SD3 = lA * inner(U / H, grad(A)) * dxq

    c_mass = lmass * (eta - eta_t) * dxq
    c_gauge = lgauge * A * dxq

    L = D + c_D1 + c_D2 + c_D3 + c_PV + c_SD1 + c_SD2 + c_SD3 + c_mass + c_gauge
    v = TestFunction(W)
    F = derivative(L, z, v)

    # Firedrake can assemble this KKT Jacobian legally as a MatNest, including
    # the two Real-space constraint rows, but PyOP2 cannot assemble the same
    # mixed object monolithically.  Keep the exact KKT residual and perform a
    # small explicit Newton loop: assemble as MatNest, convert the completed
    # PETSc nest to AIJ, then use a direct linear solve.  This is linear-algebra
    # plumbing only; objective, constraints, target, and acceptance gates are
    # unchanged.
    Jform = derivative(F, z)
    max_newton = 60
    rtol = 1.0e-10
    atol = 1.0e-11
    initial_norm = None
    converged = False

    for iteration in range(max_newton):
        residual = assemble(F)
        with residual.dat.vec_ro as rv:
            rnorm = rv.norm(PETSc.NormType.NORM_2)

        if initial_norm is None:
            initial_norm = max(rnorm, 1.0)
        rel = rnorm / initial_norm
        print(
            f"GENERIC BASE NEWTON iter={iteration:02d} "
            f"residual={rnorm:.17e} relative={rel:.17e}"
        )
        if rnorm < atol or rel < rtol:
            converged = True
            break

        Jnest = assemble(Jform, mat_type="nest")
        A = Jnest.petscmat.convert("aij")

        ksp = PETSc.KSP().create(comm=mesh.comm)
        ksp.setOperators(A)
        ksp.setType("preonly")
        pc = ksp.getPC()
        pc.setType("lu")
        ksp.setFromOptions()

        with residual.dat.vec_ro as rv, z.dat.vec as zv:
            rhs = rv.copy()
            rhs.scale(-1.0)
            delta = zv.duplicate()
            delta.set(0.0)
            ksp.solve(rhs, delta)
            if ksp.getConvergedReason() <= 0:
                raise RuntimeError(
                    f"generic BASE Newton linear solve failed: "
                    f"{ksp.getConvergedReason()}"
                )

            z_before = zv.copy()
            accepted = False
            alpha = 1.0
            for _ in range(14):
                zv.copy(z_before)
                zv.axpy(alpha, delta)

                # Positivity is a hard constraint; never evaluate a trial state
                # with nonpositive H in the rational magnetic terms.
                hmin_trial = float(
                    np.min(H0_h.dat.data_ro + subs[1].dat.data_ro)
                )
                if hmin_trial <= 0.0:
                    alpha *= 0.5
                    continue

                trial_residual = assemble(F)
                with trial_residual.dat.vec_ro as trv:
                    trial_norm = trv.norm(PETSc.NormType.NORM_2)
                if trial_norm < rnorm:
                    accepted = True
                    break
                alpha *= 0.5

            if not accepted:
                zv.copy(z_before)
                raise RuntimeError(
                    "generic BASE Newton line search failed to reduce KKT residual"
                )

        ksp.destroy()
        A.destroy()

    if not converged:
        raise RuntimeError(
            f"generic BASE Newton failed after {max_newton} iterations"
        )

    u_s = Function(V1, name="base_u")
    eta_s = Function(V2, name="base_eta")
    A_s = Function(V0, name="base_A")
    u_s.assign(subs[0])
    eta_s.assign(subs[1])
    A_s.assign(subs[2])

    H_s, m_s, norms, S, Rscaled, rates, Rabs = physical_characterization(
        mesh, V0, V1, V2, dxq, u_s, eta_s, A_s, H0_h
    )

    Dval = base_d(mesh, V1, dxq, u_s, eta_s, A_s, u_t, eta_t, A_t)
    mass_target = float(assemble((H0_h + eta_t) * dxq))
    mass_state = float(assemble(H_s * dxq))
    mass_err = abs(mass_state - mass_target)
    gauge = abs(float(assemble(A_s * dxq)))
    Hmin = float(np.min(H_s.dat.data_ro))
    divb = l2_scalar(div(m_s), dxq)

    print("GENERIC BASE SOLVER target                      = NON_SOLAR_B1_MANUFACTURED")
    print("GENERIC BASE SOLVER method                      = EQUALITY_CONSTRAINED_KKT")
    print(f"GENERIC BASE SOLVER eta analytic amplitude       = {eta_amp:.17e}")
    print(f"GENERIC BASE SOLVER BASE-D                       = {Dval:.17e}")
    print(f"GENERIC BASE SOLVER du_dt L2                     = {rates['du']:.17e}")
    print(f"GENERIC BASE SOLVER dH_dt L2                     = {rates['dH']:.17e}")
    print(f"GENERIC BASE SOLVER dA_dt L2                     = {rates['dA']:.17e}")
    print(f"GENERIC BASE SOLVER R_M0                         = {Rabs:.17e}")
    print(f"GENERIC BASE SOLVER adv dual norm                = {norms['adv']:.17e}")
    print(f"GENERIC BASE SOLVER coriolis dual norm           = {norms['cor']:.17e}")
    print(f"GENERIC BASE SOLVER depth dual norm              = {norms['depth']:.17e}")
    print(f"GENERIC BASE SOLVER magnetic dual norm           = {norms['mag']:.17e}")
    print(f"GENERIC BASE SOLVER total dual norm              = {norms['total']:.17e}")
    print(f"GENERIC BASE SOLVER S_base                       = {S:.17e}")
    print(f"GENERIC BASE SOLVER scaled R_base                = {Rscaled:.17e}")
    print(f"GENERIC BASE SOLVER mass abs error               = {mass_err:.17e}")
    print(f"GENERIC BASE SOLVER gauge                        = {gauge:.17e}")
    print(f"GENERIC BASE SOLVER H minimum                    = {Hmin:.17e}")
    print(f"GENERIC BASE SOLVER DIVB L2                      = {divb:.17e}")
    print("GENERIC BASE SOLVER solar Omega_0 consumed       = NO")
    print("GENERIC BASE SOLVER BURGAMOTS forcing consumed   = NO")

    if Hmin <= 0.0:
        raise AssertionError(f"positivity failed: Hmin={Hmin}")
    if mass_err >= 1.0e-10:
        raise AssertionError(f"mass constraint failed: {mass_err}")
    if gauge >= 1.0e-10:
        raise AssertionError(f"gauge constraint failed: {gauge}")
    if Rabs >= BASE_GATE:
        raise AssertionError(f"stationary BASE gate failed: {Rabs} >= {BASE_GATE}")

    print("GENERIC BASE SOLVER ADMITTED                     = YES")
    print("GENERIC BASE SOLVER STATUS                       = ENGINEERING_GATE_PASSED")


if __name__ == "__main__":
    solve_generic_base()
