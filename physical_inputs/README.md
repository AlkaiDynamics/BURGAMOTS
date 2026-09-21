# Physical BASE input records — preparation only

Status:

```text
OMEGA0 RECORD:          NOT RETRIEVED / NOT FROZEN
MAGNETIC PRIOR FAMILY: NOT RETRIEVED / NOT FROZEN
BASE-PHYS:             BLOCKED
```

This branch prepares the machine-readable record contracts required by
`BURGAMOTS_BASESTATE_PROTOCOL_v1` without inventing, selecting, or fitting any
physical values.

## Firewall

These records must be frozen independently of BURGAMOTS response outcomes.
They may not contain:

- fitted BURGAMOTS amplitudes;
- response-selected latitude profiles;
- M1 results;
- observational target outcomes;
- SUN-derived tuning;
- post-hoc magnetic-family selection.

No record becomes authoritative merely because it validates against a schema.

## Required record 1 — Omega0(theta)

The observational angular-velocity record must carry:

- an immutable record identifier and version;
- source citation / source URL or archival locator;
- acquisition date;
- source publication/data-product version;
- coordinate convention, with theta explicitly declared as colatitude;
- units;
- representation type (tabulated samples, coefficients, or analytic fit
  published by the source);
- the actual values/coefficients exactly as frozen;
- interpolation/evaluation prescription if tabulated;
- validity/domain metadata;
- cryptographic content hash;
- an explicit statement that BURGAMOTS outcomes were not used in selection.

## Required record 2 — finite toroidal magnetic-prior family

The family record must carry:

- immutable family identifier and version;
- a finite ordered list of preregistered members;
- for every member, the complete B_phi0(theta) definition;
- units and normalization convention;
- provenance/rationale external to BURGAMOTS outcomes;
- pole-regularity declaration;
- any amplitude bounds and their external basis;
- content hashes;
- explicit prohibition on selecting a member after inspecting BURGAMOTS
  response.

The family may include a deliberately declared zero-field control if the frozen
physical protocol permits it, but no member is added here without an
authoritative external basis.

## Admission

`BASE-PHYS` remains blocked until actual records are supplied, provenance is
verified, hashes are frozen, and both schemas validate. This branch contains
contracts only; it contains no physical solar values.


## Current notarized state — 2026-09-21

Workflow `physical-base-record-contract`, run `35662996338`, passed the
record-integrity contract.

### Omega0

`omega0-schou-charbonneau-tachocline-center-v1.json` is frozen and
content-hashed. It is an externally sourced, outcome-independent
helioseismic rotation record evaluated at the tachocline-center radius of the
published analytic fit.

Status:

```text
OMEGA0 RECORD: FROZEN
BURGAMOTS RESPONSE USED: NO
```

### Magnetic candidates

`magnetic-prior-preregistration-v1.json` freezes the preregistered profile

```text
B_phi0(theta; A) = A sin(2 theta)
```

with fixed candidates 0, 50, 100, and 300 kG plus the derived integrated
equipartition candidate `A_eq`. The no-clipping, duplicate-collapse,
300-kG omission rule for `A_eq`, and the exact logical admission predicate

```text
ADMIT(A) = MAG1(A) AND SW_GEOM(A) AND EQRES(A)
```

are frozen before any physical BURGAMOTS response exists.

Status:

```text
MAGNETIC CANDIDATE PREREGISTRATION: FROZEN
FINAL ADMITTED FAMILY: BLOCKED
BURGAMOTS RESPONSE USED: NO
```

### Fail-closed blocker

Final `ADMIT(A)` evaluation requires a separately frozen physical constants /
admission-threshold record. The repository does not currently contain frozen
numerical values for every required item:

- tachocline radius `r_t`;
- v1 shallow-water layer thickness `H0`;
- reference density `rho0`;
- reduced/effective gravity `gstar`;
- permeability convention/value `mu0`;
- rotating-frame angular velocity `Omega_frame`;
- the numerical `SW_GEOM` thin-shell cutoff;
- the numerical `EQRES` acceptance tolerance.

The first item is present as provenance metadata in the external rotation fit,
but it is not silently promoted into the independent v1 geometry contract.
Likewise, standard physical constants or commonly used solar-model values are
not silently substituted for missing frozen model parameters.

Therefore:

```text
MAGNETIC ADMISSION = BLOCKED_MISSING_FROZEN_CONSTANTS_AND_THRESHOLDS
BASE-PHYS          = BLOCKED
```

This is intentional. Resolving this blocker requires an explicit
outcome-independent physical/model-parameter freeze; it is not a numerical
debugging task and cannot be inferred from BURGAMOTS response.
