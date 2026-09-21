"""Notarize frozen physical-input records and fail closed on final admission.

This is deliberately not BASE-PHYS. It verifies that externally sourced Omega0
and the preregistered magnetic candidate family are immutable/outcome-blind,
then checks whether every upstream constant and numerical admission threshold
needed by ADMIT(A) has itself been frozen.

If the constants record is absent, the expected result is BLOCKED with exit 0:
the record-contract lane is healthy, but physical admission is not authorized.
"""

from __future__ import annotations

import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OMEGA = ROOT / "physical_inputs" / "omega0-schou-charbonneau-tachocline-center-v1.json"
MAG = ROOT / "physical_inputs" / "magnetic-prior-preregistration-v1.json"
CONSTANTS = ROOT / "physical_inputs" / "base-physical-constants-v1.json"


def load(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def canonical_hash(record: dict, field: str) -> str:
    payload = dict(record)
    payload.pop(field, None)
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    return hashlib.sha256(encoded).hexdigest()


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


def verify_omega(record: dict):
    require(record["status"] == "FROZEN", "Omega0 record is not frozen")
    require(record["outcome_independence"]["burgamots_response_used"] is False,
            "Omega0 record is response-contaminated")
    require(record["coordinate_convention"]["theta_definition"]
            == "colatitude_radians_north_pole_zero",
            "Omega0 theta convention mismatch")
    rep = record["representation"]
    require(rep["type"] == "coefficients", "Unexpected Omega0 representation")
    require(len(rep["coefficients"]) == 3, "Expected c0,c2,c4 Omega0 coefficients")
    actual = canonical_hash(record, "content_sha256")
    require(actual == record["content_sha256"],
            f"Omega0 content hash mismatch: {actual}")
    print("PHYSICAL RECORD Omega0 status                  = FROZEN")
    print(f"PHYSICAL RECORD Omega0 content sha256          = {actual}")
    print("PHYSICAL RECORD Omega0 BURGAMOTS response used = NO")


def verify_magnetic_prereg(record: dict):
    require(record["status"] == "FROZEN_PREREGISTRATION_PENDING_ADMIT",
            "Magnetic preregistration status mismatch")
    require(record["outcome_independence"]["burgamots_response_used"] is False,
            "Magnetic preregistration is response-contaminated")
    require(record["outcome_independence"]["posthoc_member_selection_allowed"] is False,
            "Post-hoc magnetic selection is not prohibited")
    require(record["profile"]["formula"] == "B_phi0(theta; A)=A*sin(2*theta)",
            "Magnetic profile shape changed")

    fixed = [x["value_kG"] for x in record["candidate_amplitudes"] if x["kind"] == "fixed"]
    derived = [x["symbol"] for x in record["candidate_amplitudes"] if x["kind"] == "derived"]
    require(fixed == [0.0, 50.0, 100.0, 300.0],
            f"Preregistered fixed amplitudes changed: {fixed}")
    require(derived == ["A_eq"], f"Preregistered derived anchors changed: {derived}")
    require(record["A_eq_rule"]["omit_if_greater_than_kG"] == 300.0,
            "A_eq upper-envelope rule changed")
    require(record["A_eq_rule"]["clip"] is False, "A_eq clipping became enabled")
    require(record["A_eq_rule"]["collapse_duplicates"] is True,
            "Duplicate-collapse rule changed")
    require(record["admission_rule"]["formula"]
            == "ADMIT(A)=MAG1(A) AND SW_GEOM(A) AND EQRES(A)",
            "ADMIT predicate changed")

    actual = canonical_hash(record, "content_sha256")
    require(actual == record["content_sha256"],
            f"Magnetic preregistration content hash mismatch: {actual}")

    print("PHYSICAL RECORD magnetic candidates            = FROZEN_PREREGISTRATION")
    print("PHYSICAL RECORD magnetic profile               = A*sin(2*theta)")
    print("PHYSICAL RECORD magnetic fixed kG              = 0,50,100,300")
    print("PHYSICAL RECORD magnetic derived               = A_eq")
    print(f"PHYSICAL RECORD magnetic content sha256         = {actual}")
    print("PHYSICAL RECORD posthoc selection allowed      = NO")


def constants_blockers(record: dict):
    required = [
        "r_t_m", "H0_m", "rho0_kg_m3", "gstar_m_s2", "mu0_H_m",
        "omega_frame_rad_s", "sw_geom_max_abs_eta_over_rt",
        "eqres_abs_tolerance",
    ]
    missing = [k for k in required if k not in record]
    require(not missing, "Missing frozen physical constants: " + ",".join(missing))
    require(record["status"] == "FROZEN", "Physical constants record is not frozen")
    require(record["outcome_independence"]["burgamots_response_used"] is False,
            "Physical constants record is response-contaminated")


def main():
    omega = load(OMEGA)
    mag = load(MAG)
    verify_omega(omega)
    verify_magnetic_prereg(mag)

    if not CONSTANTS.exists():
        print("PHYSICAL RECORD constants/thresholds           = NOT_RETRIEVED_NOT_FROZEN")
        print("MAGNETIC ADMISSION                             = BLOCKED_MISSING_FROZEN_CONSTANTS_AND_THRESHOLDS")
        print("BASE-PHYS                                      = BLOCKED")
        print("PHYSICAL RECORD CONTRACT NOTARIZATION          = PASSED")
        return

    constants = load(CONSTANTS)
    constants_blockers(constants)
    print("PHYSICAL RECORD constants/thresholds           = FROZEN")
    print("MAGNETIC ADMISSION                             = READY_FOR_ADMIT_EVALUATION")
    print("BASE-PHYS                                      = STILL_REQUIRES_EXECUTABLE_ADMIT_AND_BASE_SOLVER")
    print("PHYSICAL RECORD CONTRACT NOTARIZATION          = PASSED")


if __name__ == "__main__":
    main()
