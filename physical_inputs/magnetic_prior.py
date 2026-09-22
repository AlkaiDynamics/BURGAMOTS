"""Executable preregistered toroidal magnetic-prior family.

This module is deliberately fail-closed at ADMIT(A) until the already-frozen
SW-GEOM and EQRES numerical thresholds are recovered/frozen.  It never invents
those thresholds.
"""

import math


ANCHORS_KG = (0.0, 50.0, 100.0, 300.0)


def b_phi0_kG(theta, amplitude_kG):
    return float(amplitude_kG) * math.sin(2.0 * float(theta))


def a_eq_kG(mu0, rho0, kinetic_integral, shape_integral):
    if shape_integral <= 0.0:
        raise ValueError("shape_integral must be positive")
    value_T = math.sqrt(float(mu0) * float(rho0) * float(kinetic_integral) / float(shape_integral))
    return value_T * 10.0  # 1 tesla = 10 kG


def preregistered_amplitudes_kG(aeq_kG):
    values = [0.0, 50.0, 100.0, 300.0]
    if float(aeq_kG) <= 300.0:
        values.append(float(aeq_kG))
    # exact deterministic duplicate collapse
    return tuple(sorted(set(values)))


def admit(amplitude_kG, *, mag1, sw_geom, eqres):
    """Evaluate the frozen conjunction only when all predicates are supplied."""
    if mag1 is None or sw_geom is None or eqres is None:
        raise RuntimeError(
            "ADMIT(A) fail-closed: executable SW-GEOM/EQRES criteria are not yet frozen in the active record"
        )
    return bool(mag1) and bool(sw_geom) and bool(eqres)
