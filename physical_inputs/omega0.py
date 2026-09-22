"""Executable frozen Omega0(theta) record.

Source coefficients are stored in omega0-record.json.  This evaluator exposes
only the frozen latitudinal profile at r=0.700 R_sun and performs no fitting.
"""

import json
import math
from pathlib import Path

_RECORD = json.loads(
    (Path(__file__).with_name("omega0-record.json")).read_text(encoding="utf-8")
)
_C0, _C2, _C4 = _RECORD["representation"]["coefficients"]


def omega0_over_2pi_nhz(theta):
    c = math.cos(float(theta))
    return _C0 + _C2 * c * c + _C4 * c**4


def omega0_rad_s(theta):
    return 2.0 * math.pi * omega0_over_2pi_nhz(theta) * 1.0e-9


if __name__ == "__main__":
    for theta in (0.0, math.pi / 4.0, math.pi / 2.0, 3.0 * math.pi / 4.0, math.pi):
        print(theta, omega0_over_2pi_nhz(theta), omega0_rad_s(theta))
