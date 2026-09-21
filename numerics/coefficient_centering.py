"""Authoritative coefficient-space Casimir centering for BURGAMOTS_NUMERICS_v1 A1.

H_h remains the evolved DG1 thickness state.  H0_h is the exactly represented
constant background in the same DG1 space.  eta_h is a deterministic derived
field formed by coefficient-space subtraction; it is not a new prognostic
variable.

The same eta_h representation is used by the centered gravitational energy,
D2 derivative, and exact discrete-gradient gravity term.
"""

from firedrake import Constant, Function


def exact_background_field(V2, H0_value, name="H0_h"):
    H0_h = Function(V2, name=name)
    H0_h.assign(float(H0_value))
    return H0_h


def coefficient_anomaly(H_h, H0_h, name="eta_h"):
    if H_h.function_space() != H0_h.function_space():
        raise ValueError("H_h and H0_h must share the same DG1 function space")
    eta_h = Function(H_h.function_space(), name=name)
    eta_h.dat.data[:] = H_h.dat.data_ro - H0_h.dat.data_ro
    return eta_h


def centered_gravity_energy_density(eta_h, gstar_value):
    return 0.5 * Constant(float(gstar_value)) * eta_h**2


def centered_gravity_d2(eta_h, gstar_value):
    return Constant(float(gstar_value)) * eta_h


def centered_gravity_discrete_gradient(eta_minus, eta_plus, gstar_value):
    if eta_minus.function_space() != eta_plus.function_space():
        raise ValueError("eta_minus and eta_plus must share the same DG1 function space")
    return 0.5 * Constant(float(gstar_value)) * (eta_plus + eta_minus)
