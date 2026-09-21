"""Paired-run configuration firewall for engineering tests.

The only permitted M0 versus synthetic-M1 difference is potential_mode.
This module does not run the physical model and cannot load real forcing.
"""

from dataclasses import asdict, dataclass, replace
import hashlib
import json


@dataclass(frozen=True)
class EngineeringRunConfig:
    mesh_refinement: int = 2
    geometry_degree: int = 3
    quadrature_degree: int = 12
    quadrature_scheme: str = "canonical"
    space_family: str = "BDFM"
    horizontal_degree: int = 1
    dt_policy: str = "shared-num-pos-halving"
    initial_state_id: str = "manufactured-sentinel-v1"
    potential_mode: str = "NONE"


def config_digest(config):
    payload = json.dumps(asdict(config), sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def make_paired_configs():
    null = EngineeringRunConfig(potential_mode="NONE")
    forced = replace(null, potential_mode="SYNTHETIC_ANALYTIC_ONLY")
    return null, forced


def assert_single_intervention(null, forced):
    left = asdict(null)
    right = asdict(forced)
    differing = sorted(k for k in left if left[k] != right[k])
    if differing != ["potential_mode"]:
        raise AssertionError(
            f"paired-run firewall violation; differences={differing}"
        )
    if null.potential_mode != "NONE":
        raise AssertionError("M0 potential must be NONE")
    if forced.potential_mode != "SYNTHETIC_ANALYTIC_ONLY":
        raise AssertionError("engineering M1 may use only synthetic analytic potential")
    return differing


if __name__ == "__main__":
    m0, m1 = make_paired_configs()
    differences = assert_single_intervention(m0, m1)
    print(f"PAIRED RUN differences              = {differences}")
    print(f"PAIRED RUN M0 digest                = {config_digest(m0)}")
    print(f"PAIRED RUN synthetic-M1 digest      = {config_digest(m1)}")
    print("PAIRED RUN real forcing permitted    = NO")
    print("PAIRED RUN STATUS                    = ENGINEERING_ONLY_UNMERGED")
