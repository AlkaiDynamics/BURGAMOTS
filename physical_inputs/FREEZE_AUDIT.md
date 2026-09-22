# Physical BASE record freeze audit

## Status

```text
OMEGA0(theta):                    FROZEN
MAGNETIC PROFILE FAMILY:          PREREGISTERED
MAGNETIC CANDIDATE AMPLITUDES:    PREREGISTERED
FINAL ADMIT(A) EVALUATION:        BLOCKED
BURGAMOTS RESPONSE USED:          NO
REAL M1 FORCING USED:             NO
```

## 1. Externally frozen observational input

The authoritative rotation record is:

`omega0-schou-charbonneau-tachocline-center-v1.json`

It freezes the published helioseismic analytic rotation profile at the
tachocline transition center and carries immutable coefficients, source
citations, coordinate convention, units, and a content hash.

No BURGAMOTS response was used to select or fit that record.

## 2. Magnetic family preregistration

The authoritative preregistration record is:

`magnetic-prior-preregistration-v1.json`

with

[
B_{\phi0}(\theta;A)=A\sin(2\theta)
]

and the pre-response candidate set

[
\{0,;A_{\rm eq},;50\,\mathrm{kG},;100\,\mathrm{kG},;300\,\mathrm{kG}\}.
]

The profile, candidate set, A_eq rule, no-clipping rule, duplicate-collapse
rule, and prohibition on post-hoc outcome selection are frozen before any
physical BURGAMOTS response run.

This is a preregistered prior family, not a claim that each listed amplitude is
an observational estimate.

## 3. What remains unfrozen

Final execution of

[
\operatorname{ADMIT}(A)
=
\operatorname{MAG1}(A)
\land
\operatorname{SW\_GEOM}(A)
\land
\operatorname{EQRES}(A)
]

requires the separate physical/model-constant record defined by
`base-physical-constants.schema.json`.

That record currently lacks frozen values for all required fields, including:

- tachocline model radius (r_t);
- layer reference depth (H_0);
- reference density (ho_0);
- reduced/effective gravity (g_*);
- frame rotation (Omega_{\rm frame});
- shallow-water geometry admission cutoff;
- B1 equilibrium-residual admission tolerance.

The magnetic family MUST NOT be marked finally admitted until that record is
frozen independently of BURGAMOTS response.

## 4. Provenance classes

The missing fields are not all the same kind of quantity.

### External physical / observational constraints

Where an authoritative external value is appropriate, the record must cite its
source and transformation into the model convention.

### Preregistered model conventions

Quantities such as effective/reduced gravity, reference layer depth, and
admission cutoffs can depend on the chosen shallow-water reduction rather than
being uniquely observed solar constants.

If such a value is a modeling convention, it must be labeled explicitly as a
`PREREGISTERED_MODEL_CONVENTION` with its independent rationale. It must not
be represented as an observational measurement.

### Numerical admission thresholds

The EQRES arithmetic criterion is a numerical contract. It must be frozen from
pre-response numerical characterization/certification, not selected after
inspecting a BURGAMOTS physical response.

## 5. Fail-closed rule

Until the physical/model-constant record is complete:

```text
MAGNETIC ADMISSION = BLOCKED_MISSING_FROZEN_CONSTANTS_AND_THRESHOLDS
BASE-PHYS          = BLOCKED
```

This blocker does not invalidate the already-frozen Omega0 record or the
magnetic-family preregistration.
