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
