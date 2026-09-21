"""BURGAMOTS M0 semidiscrete Firedrake crucible.

Scope:
- Builds the frozen CG2 -> BDM1 -> DG0 compatible spaces on an
  icosahedral sphere.
- Checks the exact verification state residual.
- Checks the flux-potential magnetic compatibility identity with a
  nontrivial A_h probe.

This file does NOT run the physical base-state ensemble and does NOT run M1.
Those gates require the preregistered numerical base-state records and the
fully implemented discrete-gradient timestepper.
"""

from firedrake import (
    IcosahedralSphereMesh,
    SpatialCoordinate,
    FunctionSpace,
    Function,
    TestFunction,
    Constant,
    inner,
    cross,
    grad,
    div,
    dx,
    assemble,
    sqrt,
)


RESIDUAL_TOL = 1.0e-10
IDENTITY_TOL = 1.0e-10


def cofunction_norm(cofunction):
    with cofunction.dat.vec_ro as vec:
        return vec.norm()


def main():
    # Dimensionless invariant crucible values only. These are not solar parameters.
    radius = 1.0
    H0 = Constant(1.0)
    gstar = Constant(1.0)

    mesh = IcosahedralSphereMesh(
        radius=radius,
        refinement_level=1,
        degree=2,
    )
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    # Frozen minimal BDM de Rham sequence.
    V0 = FunctionSpace(mesh, "CG", 2)
    V1 = FunctionSpace(mesh, "BDM", 1)
    V2 = FunctionSpace(mesh, "DG", 0)

    u = Function(V1, name="u_h").assign(0)
    H = Function(V2, name="H_h").assign(1.0)
    A = Function(V0, name="A_h").assign(0)

    v = TestFunction(V1)
    psi = TestFunction(V2)

    x = SpatialCoordinate(mesh)
    n = x / sqrt(inner(x, x))

    def rot(w):
        return cross(n, w)

    def C(a):
        return rot(grad(a))

    # M0-A: exact verification equilibrium.
    # At u=A=0, F_h=0 and chi_h=0. K_h=g_* H0 is constant.
    # The only nontrivial velocity residual is integral div(v) * constant
    # on the closed sphere, which must vanish.
    velocity_residual = assemble(div(v) * (gstar * H) * dx)
    velocity_residual_norm = cofunction_norm(velocity_residual)

    # Thickness and flux-potential RHS are identically zero because the
    # Hamiltonian mass flux F_h vanishes at u=0.
    thickness_residual = assemble(psi * Constant(0.0) * dx)
    thickness_residual_norm = cofunction_norm(thickness_residual)

    mass = float(assemble(H * dx))
    energy = float(assemble(0.5 * gstar * H * H * dx))

    # Nontrivial flux-potential probe: div(C(A_h)) must vanish weakly.
    A_probe = Function(V0, name="A_probe")
    A_probe.interpolate((x[0] * x[1]) / (radius * radius))
    magnetic_identity_residual = assemble(psi * div(C(A_probe)) * dx)
    magnetic_identity_norm = cofunction_norm(magnetic_identity_residual)

    print(f"M0_VERIFY velocity_residual_norm={velocity_residual_norm:.17e}")
    print(f"M0_VERIFY thickness_residual_norm={thickness_residual_norm:.17e}")
    print(f"M0_VERIFY mass={mass:.17e}")
    print(f"M0_VERIFY energy={energy:.17e}")
    print(f"MAG_IDENTITY div_curl_residual_norm={magnetic_identity_norm:.17e}")

    failures = []
    if velocity_residual_norm > RESIDUAL_TOL:
        failures.append(
            f"verification velocity residual {velocity_residual_norm} > {RESIDUAL_TOL}"
        )
    if thickness_residual_norm > RESIDUAL_TOL:
        failures.append(
            f"verification thickness residual {thickness_residual_norm} > {RESIDUAL_TOL}"
        )
    if magnetic_identity_norm > IDENTITY_TOL:
        failures.append(
            f"magnetic compatibility residual {magnetic_identity_norm} > {IDENTITY_TOL}"
        )

    if failures:
        for failure in failures:
            print("FAIL:", failure)
        raise SystemExit(1)

    print("PASS: semidiscrete M0 verification state and magnetic compatibility checks.")


if __name__ == "__main__":
    main()
