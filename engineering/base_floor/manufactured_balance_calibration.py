"""Non-solar manufactured BASE cancellation-floor calibration.

Purpose:
- exercise the actual compatible BASE-P semidiscrete operator with all SD1
  mechanisms nonzero before any Omega_0 solar record enters;
- measure term scale S_base and cancellation ratio R_base;
- make no acceptance-rule change and consume no BURGAMOTS forcing/observations.

Manufactured continuum equilibrium:
    u_phi = U_amp sin(theta)
    B_phi = B_amp sin(theta)
with eta(theta) obtained from the frozen meridional balance B1 for constant
synthetic amplitudes. This is deliberately non-solar.

Both the current uncentered depth representative and the isolated
coefficient-centered candidate are measured side by side. No choice is made
from these measurements; the candidate becomes relevant only if Lane A passes.
"""

from math import sqrt

import numpy as np
from firedrake import (
    CellNormal,
    Constant,
    Function,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    TestFunction,
    TrialFunction,
    as_vector,
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
U_AMP = 10.0
B_AMP = 8.0


def strict_solver_params():
    return {"ksp_rtol": 1.0e-14, "ksp_atol": 1.0e-15}


def dual_norm(cofunction, norm_type=PETSc.NormType.NORM_2):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def l2_scalar(expr, dxq):
    return sqrt(abs(float(assemble(expr * expr * dxq))))


def l2_vector(expr, dxq):
    return sqrt(abs(float(assemble(inner(expr, expr) * dxq))))


def build():
    mesh = IcosahedralSphereMesh(radius=1.0, refinement_level=2, degree=3)
    mesh.init_cell_orientations(SpatialCoordinate(mesh))
    spaces = Spaces(mesh)
    spaces.build_compatible_spaces(family="BDFM", horizontal_degree=1)
    return mesh, spaces.H1, spaces.HDiv, spaces.L2, dx(
        domain=mesh, degree=12, scheme="canonical"
    )


def coefficient_anomaly(H_h, V2):
    H0_h = Function(V2, name="cal_H0_h")
    H0_h.assign(H0_VALUE)
    eta_h = Function(V2, name="cal_eta_h")
    eta_h.dat.data[:] = H_h.dat.data_ro - H0_h.dat.data_ro
    return H0_h, eta_h


def manufactured_balanced_state(mesh, V0, V1, V2, dxq):
    x = SpatialCoordinate(mesh)
    z = x[2]
    axis = as_vector((0.0, 0.0, 1.0))

    # B1 coefficient for U=U_amp sin(theta), B=B_amp sin(theta), r=1.
    C = U_AMP**2 - B_AMP**2 + 2.0 * OMEGA_FRAME_VALUE * U_AMP
    eta_amp = C / (2.0 * GSTAR_VALUE)

    # eta = eta_amp*(sin^2(theta)-2/3) = eta_amp*(1/3-z^2).
    eta_expr = Constant(eta_amp) * (Constant(1.0 / 3.0) - z**2)
    H_expr = Constant(H0_VALUE) + eta_expr

    # Solid-body-like zonal velocity: |cross(k,x)| = sin(theta) on r=1.
    u_expr = Constant(U_AMP) * cross(axis, x)

    # A_z derivative chosen so cross(n,grad(A)) = H*B_amp*sin(theta)e_phi.
    A_expr = -Constant(B_AMP) * (
        Constant(H0_VALUE + eta_amp / 3.0) * z
        - Constant(eta_amp / 3.0) * z**3
    )

    u_h = Function(V1, name="cal_u")
    H_h = Function(V2, name="cal_H")
    A_h = Function(V0, name="cal_A")
    u_h.interpolate(u_expr)
    H_h.interpolate(H_expr)
    A_h.interpolate(A_expr)

    # Remove the tiny numerical gauge mean without fitting any physics.
    area = float(assemble(Constant(1.0) * dxq))
    A_mean = float(assemble(A_h * dxq)) / area
    A_h.dat.data[:] -= A_mean

    return u_h, H_h, A_h, eta_amp


def assemble_residuals(mesh, V0, V1, V2, dxq, u_h, H_h, A_h):
    n = CellNormal(mesh)
    kappa = Constant(KAPPA_VALUE)
    gstar = Constant(GSTAR_VALUE)

    def rot(v):
        return cross(n, v)

    m_h = Function(V1, name="cal_m")
    m_h.interpolate(cross(n, grad(A_h)))

    w = TestFunction(V1)
    gamma = TestFunction(V0)
    phi = TestFunction(V2)

    U_h = Function(V1, name="cal_U")
    U_trial = TrialFunction(V1)
    solve(
        inner(w, U_trial) * dxq == H_h * inner(u_h, w) * dxq,
        U_h,
        solver_parameters=strict_solver_params(),
    )

    # Split weak PV into relative-vorticity and Coriolis pieces.
    q_rel = Function(V0, name="cal_q_rel")
    q_cor = Function(V0, name="cal_q_cor")
    q_trial = TrialFunction(V0)
    x = SpatialCoordinate(mesh)
    f_C = 2.0 * OMEGA_FRAME_VALUE * x[2]
    solve(
        H_h * q_trial * gamma * dxq
        == -inner(u_h, rot(grad(gamma))) * dxq,
        q_rel,
        solver_parameters=strict_solver_params(),
    )
    solve(
        H_h * q_trial * gamma * dxq == f_C * gamma * dxq,
        q_cor,
        solver_parameters=strict_solver_params(),
    )

    M_h = Function(V0, name="cal_M")
    M_trial = TrialFunction(V0)
    solve(
        gamma * M_trial * dxq
        == inner(grad(gamma), grad(A_h)) / (kappa * H_h) * dxq,
        M_h,
        solver_parameters=strict_solver_params(),
    )

    H0_h, eta_h = coefficient_anomaly(H_h, V2)

    K_common = 0.5 * inner(u_h, u_h) - inner(m_h, m_h) / (2.0 * kappa * H_h**2)
    K_trial = TrialFunction(V2)

    K_unc = Function(V2, name="cal_K_unc")
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * H_h) * dxq,
        K_unc,
        solver_parameters=strict_solver_params(),
    )

    K_ctr = Function(V2, name="cal_K_ctr")
    solve(
        phi * K_trial * dxq == phi * (K_common + gstar * eta_h) * dxq,
        K_ctr,
        solver_parameters=strict_solver_params(),
    )

    adv_form = -q_rel * inner(w, rot(U_h))
    cor_form = -q_cor * inner(w, rot(U_h))
    mag_form = (M_h / H_h) * inner(grad(A_h), w)

    r_adv = assemble(adv_form * dxq)
    r_cor = assemble(cor_form * dxq)
    r_mag = assemble(mag_form * dxq)

    def evaluate(label, K_h):
        depth_form = div(w) * K_h
        r_depth = assemble(depth_form * dxq)
        r_total = assemble((adv_form + cor_form + depth_form + mag_form) * dxq)

        norms = {
            "adv": dual_norm(r_adv),
            "cor": dual_norm(r_cor),
            "depth": dual_norm(r_depth),
            "mag": dual_norm(r_mag),
            "total": dual_norm(r_total),
        }
        S = norms["adv"] + norms["cor"] + norms["depth"] + norms["mag"]
        R = norms["total"] / S if S > 0.0 else float("nan")

        du_h = Function(V1, name=f"cal_du_{label}")
        du_trial = TrialFunction(V1)
        solve(
            inner(w, du_trial) * dxq
            == (adv_form + cor_form + depth_form + mag_form) * dxq,
            du_h,
            solver_parameters=strict_solver_params(),
        )

        print(f"BASE-FLOOR {label} adv norm                   = {norms['adv']:.17e}")
        print(f"BASE-FLOOR {label} coriolis norm              = {norms['cor']:.17e}")
        print(f"BASE-FLOOR {label} depth norm                 = {norms['depth']:.17e}")
        print(f"BASE-FLOOR {label} magnetic norm              = {norms['mag']:.17e}")
        print(f"BASE-FLOOR {label} total raw norm             = {norms['total']:.17e}")
        print(f"BASE-FLOOR {label} S_base                     = {S:.17e}")
        print(f"BASE-FLOOR {label} R_base                     = {R:.17e}")
        print(f"BASE-FLOOR {label} ||du_dt|| L2               = {l2_vector(du_h, dxq):.17e}")

        return S, R

    return (
        m_h,
        eta_h,
        evaluate("UNCENTERED_CURRENT", K_unc),
        evaluate("COEFF_CENTERED_CANDIDATE", K_ctr),
    )


def run_calibration():
    mesh, V0, V1, V2, dxq = build()
    u_h, H_h, A_h, eta_amp = manufactured_balanced_state(
        mesh, V0, V1, V2, dxq
    )

    m_h, eta_h, unc, ctr = assemble_residuals(
        mesh, V0, V1, V2, dxq, u_h, H_h, A_h
    )

    print("BASE-FLOOR CALIBRATION: NON-SOLAR MANUFACTURED BALANCE")
    print(f"BASE-FLOOR U_amp                             = {U_AMP:.17e}")
    print(f"BASE-FLOOR B_amp                             = {B_AMP:.17e}")
    print(f"BASE-FLOOR analytic eta amplitude            = {eta_amp:.17e}")
    print(f"BASE-FLOOR ||u_h|| L2                        = {l2_vector(u_h, dxq):.17e}")
    print(f"BASE-FLOOR ||eta_h|| L2                      = {l2_scalar(eta_h, dxq):.17e}")
    print(f"BASE-FLOOR ||A_h|| L2                        = {l2_scalar(A_h, dxq):.17e}")
    print(f"BASE-FLOOR ||m_h|| L2                        = {l2_vector(m_h, dxq):.17e}")
    print(f"BASE-FLOOR H minimum                         = {float(np.min(H_h.dat.data_ro)):.17e}")
    print(f"BASE-FLOOR A gauge                           = {abs(float(assemble(A_h*dxq))):.17e}")
    print(f"BASE-FLOOR DIVB L2                           = {l2_scalar(div(m_h), dxq):.17e}")
    print("BASE-FLOOR solar Omega_0 consumed            = NO")
    print("BASE-FLOOR BURGAMOTS forcing consumed        = NO")
    print("BASE-FLOOR acceptance rule changed           = NO")
    print("BASE-FLOOR STATUS                            = CALIBRATION_ONLY_UNMERGED")


if __name__ == "__main__":
    run_calibration()
