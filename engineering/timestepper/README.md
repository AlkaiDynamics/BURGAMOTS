# Discrete-gradient timestepper engineering branch

Status: **speculative / isolated / unmerged**

This branch is allowed to advance while BASE-KKT-0 remains on the narrow
certification spine. It consumes only the frozen numerical contract and
manufactured states. It does **not** consume BURGAMOTS forcing, observations,
or response outcomes.

Implemented first:
- frozen Firedrake/Gusto mesh, compatible spaces, and canonical degree-12 dxq;
- exact v1 kinetic, magnetic, and gravity discrete-gradient algebra;
- manufactured positive FE state pair;
- discrete Hamiltonian chain-rule residual measurement;
- DG1 NUM-POS acceptance and dt-halving rejection policy.

Not yet claimed:
- coupled nonlinear SD1-SD3 solve;
- production M0 timestep acceptance;
- physical base-state stepping;
- M1 forcing;
- convergence/certification.

This branch must not merge into the certification line until its own numerical
gate is defined and the BASE-KKT-0 decision is resolved.
