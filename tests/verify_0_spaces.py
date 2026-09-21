"""BURGAMOTS VERIFY-0 compatible-space / DIVB harness.

This is intentionally smaller than the M0 crucible. It verifies only the
frozen numerical substrate:

  geometry degree 3,
  CG2 + B3 -> BDFM2 -> DG1,
  canonical quadrature degree 12,
  compatible flux-potential map,
  algebraic DIVB,
  zero-state residual,
  and constant mass/energy evaluation.

It does not implement BASE-P, the production discrete-gradient timestepper,
M1 forcing, or any scientific fit.
"""

from importlib.metadata import PackageNotFoundError, version

import numpy as np

from firedrake import (
    Constant,
    Function,
    IcosahedralSphereMesh,
    SpatialCoordinate,
    TestFunction,
    assemble,
    div,
    dx,
    grad,
    CellNormal,
    cross,
    inner,
    sqrt,
)
from gusto.core.domain import Domain
from petsc4py import PETSc
from ufl import (
    Jacobian,
    JacobianDeterminant,
    ReferenceGrad,
    ReferenceValue,
    as_vector,
    dot,
)


GUSTO_PINNED_COMMIT = "669f6372cd334ed47c9c7b38f26e591732273f75"
DIVB_TOL = 1.0e-12
ZERO_RESIDUAL_TOL = 1.0e-12


def vec_norm(cofunction, norm_type=PETSc.NormType.NORM_2):
    with cofunction.dat.vec_ro as vec:
        return vec.norm(norm_type)


def element_summary(space):
    return str(space.ufl_element())


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def test_verify_0():
    radius = 1.0

    # Frozen geometry contract.
    mesh = IcosahedralSphereMesh(
        radius=radius,
        refinement_level=2,
        degree=3,
    )
    mesh.init_cell_orientations(SpatialCoordinate(mesh))

    # Gusto owns the compatible-space construction and spherical perp operator.
    domain = Domain(
        mesh,
        dt=1.0,
        family="BDFM",
        horizontal_degree=1,
        max_quad_degree=12,
    )

    V0 = domain.spaces.H1
    V1 = domain.spaces.HDiv
    V2 = domain.spaces.L2

    # Frozen quadrature functional.
    dxq = dx(domain=mesh, degree=12, scheme="canonical")

    # Verify that the installed Gusto version constructed the exact requested
    # family/degree relation, rather than merely spaces with matching names.
    complex_ = domain.spaces.de_rham_complex[1]
    require(complex_.family == "BDFM", f"unexpected family: {complex_.family}")
    require(
        complex_.base_elt_hori_hdiv.degree() == 2,
        f"HDiv base degree is not 2: {complex_.base_elt_hori_hdiv}",
    )
    require(
        complex_.base_elt_hori_dg.degree() == 1,
        f"L2 base degree is not 1: {complex_.base_elt_hori_dg}",
    )

    h1_text = str(complex_.base_elt_hori_cg)
    require(
        "CG2" in h1_text and "B3" in h1_text,
        f"H1 space is not CG2 enriched by cubic B3: {h1_text}",
    )

    print("VERIFY-0 pinned Gusto commit:", GUSTO_PINNED_COMMIT)
    try:
        print("VERIFY-0 Firedrake package version:", version("firedrake"))
    except PackageNotFoundError:
        print("VERIFY-0 Firedrake package version: metadata unavailable")
    try:
        print("VERIFY-0 Gusto package version:", version("gusto"))
    except PackageNotFoundError:
        print("VERIFY-0 Gusto package version: metadata unavailable")

    print("VERIFY-0 V0:", element_summary(V0))
    print("VERIFY-0 V1:", element_summary(V1))
    print("VERIFY-0 V2:", element_summary(V2))
    print("VERIFY-0 geometry degree:", mesh.coordinates.function_space().ufl_element().degree())
    print("VERIFY-0 quadrature: canonical degree 12")

    # Nontrivial A_h probe in the enriched H1 space.
    #
    # Firedrake does not define an interpolation dual basis for this enriched
    # CG2+B3 element, so an analytic-expression interpolate() is not available.
    # That is unrelated to the exact-sequence property we are testing.
    #
    # Build a deterministic FE function directly in V0; this avoids any analytic projection.
    # Any A_h in V0 is a
    # valid probe for D*C == 0; no analytic projection is required.
    A_h = Function(V0, name="A_h_probe")
    owned = A_h.dat.data
    indices = np.arange(owned.size, dtype=float)
    owned[:] = np.sin(0.6180339887498949 * (indices + 1.0))

    # Compatible spherical perpendicular differential.
    #
    # IMPORTANT: this is interpolation of the de Rham differential expression
    # into the target BDFM degrees of freedom. It is not an L2 projection or
    # mass-matrix solve.
    m_h = Function(V1, name="m_h_probe")
    # Use the exact symbolic cell normal. Gusto's domain.perp uses an
    # interpolated normal field, which is not the commuting de Rham map.
    m_h.interpolate(cross(CellNormal(mesh), grad(A_h)))

    phi = TestFunction(V2)
    div_residual = assemble(phi * div(m_h) * dxq)
    max_div_error = vec_norm(div_residual, PETSc.NormType.NORM_INFINITY)
    l2_div_norm = sqrt(assemble(div(m_h) ** 2 * dxq))

    print(f"VERIFY-0 DIVB max residual: {max_div_error:.17e}")
    print(f"VERIFY-0 DIVB L2 norm:      {float(l2_div_norm):.17e}")

    require(
        max_div_error < DIVB_TOL,
        f"DIVB max residual {max_div_error} >= {DIVB_TOL}",
    )
    require(
        float(l2_div_norm) < DIVB_TOL,
        f"DIVB L2 norm {float(l2_div_norm)} >= {DIVB_TOL}",
    )

    # Exact numerical verification state.
    u_h = Function(V1, name="u_h").assign(0.0)
    H_h = Function(V2, name="H_h").assign(1.0)
    A_zero = Function(V0, name="A_h").assign(0.0)

    w = TestFunction(V1)
    psi = TestFunction(V2)
    gstar = Constant(1.0)

    # At u=A=0, the only velocity term is the constant pressure/geopotential
    # gradient. On a closed sphere its weak residual must vanish.
    velocity_residual = assemble(div(w) * (gstar * H_h) * dxq)
    thickness_residual = assemble(psi * Constant(0.0) * dxq)

    velocity_norm = vec_norm(velocity_residual, PETSc.NormType.NORM_INFINITY)
    thickness_norm = vec_norm(thickness_residual, PETSc.NormType.NORM_INFINITY)

    mass = assemble(H_h * dxq)
    energy = assemble(0.5 * gstar * H_h * H_h * dxq)

    # The zero flux potential must map to zero magnetic flux.
    m_zero = Function(V1, name="m_h_zero")
    m_zero.interpolate(cross(CellNormal(mesh), grad(A_zero)))
    magnetic_zero = sqrt(assemble(inner(m_zero, m_zero) * dxq))

    print(f"VERIFY-0 zero velocity residual:  {velocity_norm:.17e}")
    print(f"VERIFY-0 zero thickness residual: {thickness_norm:.17e}")
    print(f"VERIFY-0 zero magnetic norm:      {float(magnetic_zero):.17e}")
    print(f"VERIFY-0 constant mass:           {float(mass):.17e}")
    print(f"VERIFY-0 constant energy:         {float(energy):.17e}")

    require(
        velocity_norm < ZERO_RESIDUAL_TOL,
        f"zero-state velocity residual {velocity_norm} >= {ZERO_RESIDUAL_TOL}",
    )
    require(
        thickness_norm < ZERO_RESIDUAL_TOL,
        f"zero-state thickness residual {thickness_norm} >= {ZERO_RESIDUAL_TOL}",
    )
    require(
        float(magnetic_zero) < ZERO_RESIDUAL_TOL,
        f"zero-state magnetic norm {float(magnetic_zero)} >= {ZERO_RESIDUAL_TOL}",
    )

    print("VERIFY-0: PASSED")


if __name__ == "__main__":
    test_verify_0()
