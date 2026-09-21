"""Coefficient-space Casimir centering copied from adopted BURGAMOTS A1.

Engineering branch helper. H_h remains prognostic; eta_h is derived in DG1.
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


def centered_gravity_discrete_gradient(eta_minus, eta_plus, gstar_value):
    if eta_minus.function_space() != eta_plus.function_space():
        raise ValueError("eta_minus and eta_plus must share the same DG1 function space")
    return 0.5 * Constant(float(gstar_value)) * (eta_plus + eta_minus)
