# BURGAMOTS Reproduction Log

## Frozen target

```text
Repository: AlkaiDynamics/BURGAMOTS
Branch: main
Commit: 8a9029b69b107d4230c9f053b4c8ef545a99e90e
Audit date: 2026-09-12
```

## Audit runtime

```text
OS: Debian GNU/Linux 13 (trixie)
Kernel: Linux 6.18.44 x86_64
Node: v22.16.0
npm: 10.9.2
Python: 3.13.5
```

## Repository retrieval attempt

Command:

```bash
git clone --depth 1 https://github.com/AlkaiDynamics/BURGAMOTS.git /tmp/burgamots-audit-clone
```

Observed result:

```text
Cloning into '/tmp/burgamots-audit-clone'...
fatal: unable to access 'https://github.com/AlkaiDynamics/BURGAMOTS.git/': Could not resolve host: github.com
```

**Classification:** audit-environment network failure. This is not classified as a BURGAMOTS defect.

Repository files were instead inspected through the authenticated GitHub connector pinned to the commit SHA.

## Declared npm workflow

`package.json` declares:

```text
dev     = vite
build   = vite build
lint    = tsc --noEmit
preview = vite preview
```

There is **no `test` script** and no separate `typecheck` script. Scientific-computing dependencies such as DeepXDE/TensorFlow/PyTorch/NumPy/Pandas/SciPy are not declared.

Because the repository could not be cloned into the local execution environment, `npm install`, `npm run lint`, and `npm run build` were not locally executed during this audit.

## Remote build observation

The frozen commit reports a successful Vercel status. This establishes only that a frontend deployment path succeeded in that environment. No GitHub Actions workflow runs were returned for the commit.

## Scientific reproduction attempt

**Result: not possible from the audited tree.**

The documentation states that the repository contains complete DeepXDE code, preprocessed JPL data, custom loss functions, notebooks, and model hyperparameters. The audited tree instead contains 20 frontend/configuration files and no scientific engine, datasets, notebooks, model checkpoints, run manifests, or result artifacts.

Accordingly, the following could not be reproduced from the repository:

- JPL/SDO/SILSO/ERA5/OISST acquisition and preprocessing;
- SOLAR-PINN or ATMOS-PINN training;
- Carrington/Dust Bowl hindcasts;
- Solar Cycle 24 blind test;
- Solar Cycle 25 reported forecast skill;
- flare correlation r=0.89;
- Granger p-values or claimed causal flow;
- 99.8% historical accuracy / 94.2% blind accuracy / 5σ confidence;
- Cycle 26 forecast generation;
- uncertainty intervals;
- reported 14% RMSE improvement.

## Determinism/nondeterminism inspection

The scientific analysis pipeline is absent, so its seeds and nondeterminism cannot be audited. The frontend visualization does use `Math.random()` for textures, star fields, asteroid placement, and related decorative rendering without a seed. Those uses affect visual reproduction, not demonstrated scientific inference.

## Dependency ambiguity

`package.json` declares React 18/Vite 5/Recharts 2/Three 0.160-era dependencies, while `index.html` includes an import map referencing newer React 19/Vite 7/Recharts 3/Three 0.182-era packages. The deployed bundling path may make the import map irrelevant to some builds, so this is treated as reproducibility ambiguity rather than proof of a runtime defect.

## Reproduction classification

| Outcome | Status |
|---|---|
| Frontend source is inspectable | Established |
| Remote frontend deployment succeeded | Established by commit status |
| Local frontend build reproduced in audit container | Not achieved due audit-environment network restriction |
| Scientific analysis reproduced | **Not achieved** |
| Reported empirical outputs traceable to executable runs | **Not established** |
| Original zodiac falsification experiment reproducible | **Not established** |
