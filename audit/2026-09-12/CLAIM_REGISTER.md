# BURGAMOTS Claim Register

Frozen at `AlkaiDynamics/BURGAMOTS` `8a9029b69b107d4230c9f053b4c8ef545a99e90e`.

The register is intentionally claim-centered rather than file-centered. “Status” refers only to what the audited artifact establishes.

## C-001 — Original purpose

- **Claim / exact substance:** Owner-supplied: BURGAMOTS is a falsification/validation instrument for zodiacal/astronomical relational efficacy.
- **Claim type:** Purpose
- **Required evidence:** An operational zodiac/relational hypothesis, strong null/control, unit of analysis, held-out/prospective evaluation, provenance.
- **Relevant evidence locations:** Owner statement; compare repository purpose files.
- **Operational test required:** Incremental out-of-sample test against ordinary astronomy/time and adversarial representations.
- **Possible falsifier:** No improvement beyond controls under prespecified design.
- **Known confounds:** Purpose drift; target ambiguity; post-hoc feature selection.
- **Current status:** **Not implemented/preserved as operational experiment in repository.**

## C-002 — Public purpose

- **Claim / exact substance:** “A deterministic framework for heliospheric prediction addressing stochastic model failures through integrated gravitational forcing.”
- **Claim type:** Purpose
- **Required evidence:** Executable predictor plus traceable data/results.
- **Relevant evidence locations:** metadata.json; Hero.tsx; README.md; FullPaper.tsx.
- **Operational test required:** Reproduce stated predictor and evaluate on valid holdout/prospective data.
- **Possible falsifier:** No incremental forecast skill over strong baselines.
- **Known confounds:** Target selection; periodicity; leakage; weak comparator.
- **Current status:** **Stated, but scientific implementation/result chain is not present.**

## C-003 — Primary synchronization mechanism

- **Claim / exact substance:** Planetary gravitational forcing is the primary synchronization mechanism for the solar dynamo.
- **Claim type:** Mechanism
- **Required evidence:** Physical operationalization, parameterized mechanism, discriminating causal/physical tests.
- **Relevant evidence locations:** App.tsx; README.md; FullPaper.tsx.
- **Operational test required:** Mechanism-specific predictions not explained by simpler astronomical/time models.
- **Possible falsifier:** Predictions fail or alternatives explain data equally/better.
- **Known confounds:** Shared periodicity; energy scale; model misspecification.
- **Current status:** **Not established.**

## C-004 — PINN implementation

- **Claim / exact substance:** The core engine uses DeepXDE PINNs with MHD/Navier–Stokes constraints and N-body forcing.
- **Claim type:** Implementation/Reproducibility
- **Required evidence:** Executable DeepXDE code, dependencies, configs, training artifacts.
- **Relevant evidence locations:** README.md §4/§10; FullPaper.tsx; package.json; repository tree.
- **Operational test required:** Execute documented engine and reproduce outputs.
- **Possible falsifier:** No executable engine / method differs from description.
- **Known confounds:** External/private code could exist.
- **Current status:** **Contradicted as a repository-availability claim.**

## C-005 — Data acquisition

- **Claim / exact substance:** JPL Horizons, SDO/SILSO, ERA5/OISST data were acquired and transformed for analysis.
- **Claim type:** Provenance
- **Required evidence:** Data manifests, queries, versions, hashes, acquisition scripts, transformation logs.
- **Relevant evidence locations:** README.md §4.1; FullPaper.tsx; repository tree.
- **Operational test required:** Reconstruct exact inputs and transformations.
- **Possible falsifier:** Inputs cannot be identified/retrieved or were not used.
- **Known confounds:** External storage could exist.
- **Current status:** **Not independently verifiable from repository.**

## C-006 — Uncertainty reduction

- **Claim / exact substance:** BURGAMOTS reduces prediction uncertainty by an order of magnitude.
- **Claim type:** Performance
- **Required evidence:** Defined uncertainty metric, baseline, sample, estimates and intervals.
- **Relevant evidence locations:** App.tsx abstract.
- **Operational test required:** Replicate comparison on held-out data.
- **Possible falsifier:** No material reduction or estimate unstable.
- **Known confounds:** Comparator choice; normalization; cherry-picked horizons.
- **Current status:** **Not established.**

## C-007 — 14% RMSE improvement

- **Claim / exact substance:** Carrington/Dust Bowl/SC25 validation demonstrates ~14% RMSE reduction over standard autoregressive/ensemble methods.
- **Claim type:** Performance
- **Required evidence:** Exact target series, baseline implementations, splits, RMSE definition, uncertainty.
- **Relevant evidence locations:** README.md abstract/SC25; FullPaper.tsx; ValidationCharts.tsx.
- **Operational test required:** Recompute from source data and models.
- **Possible falsifier:** No improvement on prespecified evaluation.
- **Known confounds:** Normalization; event selection; baseline tuning.
- **Current status:** **Not established; displayed numbers are source literals.**

## C-008 — Flare correlation

- **Claim / exact substance:** A strong positive correlation r = 0.89 exists between PINN Torque Index and X-class flare behavior.
- **Claim type:** Empirical
- **Required evidence:** Observed flare data, computed physical index, inclusion rules, correlation method/uncertainty.
- **Relevant evidence locations:** App.tsx §4.4; FlareCorrelationChart.tsx.
- **Operational test required:** Recompute from traceable data.
- **Possible falsifier:** Correlation absent/unstable or explained by controls.
- **Known confounds:** Mock data; event selection; time trend; autocorrelation.
- **Current status:** **Unsupported and internally inconsistent with plotted mock values.**

## C-009 — Carrington hindcast

- **Claim / exact substance:** The model identifies/reproduces the 1859 Carrington event with a successful hindcast.
- **Claim type:** Empirical/Performance
- **Required evidence:** Predefined target, input provenance, model artifact, event-independent evaluation.
- **Relevant evidence locations:** App.tsx Validation; ValidationCharts.tsx.
- **Operational test required:** Reproduce hindcast from documented model/data.
- **Possible falsifier:** Model fails event-independent criterion.
- **Known confounds:** Case selection; retrospective tuning.
- **Current status:** **Not established.**

## C-010 — Dust Bowl hindcast

- **Claim / exact substance:** The model successfully reproduces Dust Bowl blocking/high-pressure behavior with RMSE <10%.
- **Claim type:** Empirical/Performance
- **Required evidence:** Atmospheric fields, target definition, trained model, RMSE denominator, controls.
- **Relevant evidence locations:** App.tsx Validation; ValidationCharts.tsx.
- **Operational test required:** Reproduce from traceable data/model.
- **Possible falsifier:** Threshold not met on prespecified metric.
- **Known confounds:** Case selection; attribution confounds.
- **Current status:** **Not established.**

## C-011 — SC25 forecast

- **Claim / exact substance:** BURGAMOTS predicted peak SSN 160.2 ±12 and achieved ~+0.1% error relative to observation.
- **Claim type:** Performance
- **Required evidence:** Timestamped forecast artifact preceding outcome, data cutoff, uncertainty derivation.
- **Relevant evidence locations:** README.md §V; App.tsx; SolarCycleChart.tsx.
- **Operational test required:** Verify timestamp/model/data state and recompute error.
- **Possible falsifier:** Forecast created after target visibility or misses prespecified metric.
- **Known confounds:** Retrospective reconstruction; moving observed peak/definition.
- **Current status:** **Not established as prospective forecast.**

## C-012 — Blind test

- **Claim / exact substance:** Cycle 24 achieved 94.2% in a blind test.
- **Claim type:** Performance
- **Required evidence:** Frozen pre-test model/data boundary and blind evaluation artifact.
- **Relevant evidence locations:** App.tsx Validation Summary.
- **Operational test required:** Reproduce blind protocol and score.
- **Possible falsifier:** Boundary cannot be reconstructed / performance not replicated.
- **Known confounds:** Evaluation visibility; metric ambiguity.
- **Current status:** **Not established.**

## C-013 — Historical accuracy

- **Claim / exact substance:** Historical hindcast accuracy is 99.8%.
- **Claim type:** Performance
- **Required evidence:** Metric definition, event universe, inputs/outputs, uncertainty.
- **Relevant evidence locations:** App.tsx Validation Summary.
- **Operational test required:** Recompute over declared sampling frame.
- **Possible falsifier:** Score changes under full event census/defined metric.
- **Known confounds:** Selective events; undefined denominator.
- **Current status:** **Not established.**

## C-014 — 5 sigma confidence

- **Claim / exact substance:** Statistical confidence reaches 5σ.
- **Claim type:** Statistics/Performance
- **Required evidence:** Defined statistic/null/distribution/multiplicity and generated result.
- **Relevant evidence locations:** App.tsx Validation Summary.
- **Operational test required:** Recompute significance under stated design.
- **Possible falsifier:** Threshold not reached after proper design corrections.
- **Known confounds:** Multiplicity; autocorrelation; selection.
- **Current status:** **Not established.**

## C-015 — Granger causal flow

- **Claim / exact substance:** Granger analysis shows significant causal flow from planetary forcing to solar activity, including lag 4.
- **Claim type:** Statistics/Interpretation
- **Required evidence:** Traceable time series, lag-selection rule, model specification, stationarity handling, df, p-values.
- **Relevant evidence locations:** App.tsx; ValidationCharts.tsx.
- **Operational test required:** Re-run prespecified Granger test and robustness controls.
- **Possible falsifier:** No predictive precedence after controls / model assumptions fail.
- **Known confounds:** Shared cycles; nonstationarity; lag search.
- **Current status:** **Not established; chart is hardcoded.**

## C-016 — Long-horizon superiority

- **Claim / exact substance:** BURGAMOTS maintains skill >60 months / yields 10× five-year improvement.
- **Claim type:** Performance
- **Required evidence:** Forecast protocol by horizon, comparator parity, confidence intervals.
- **Relevant evidence locations:** App.tsx; ValidationCharts.tsx.
- **Operational test required:** Rolling-origin or prospective benchmark.
- **Possible falsifier:** No robust horizon advantage.
- **Known confounds:** Weak baselines; horizon-specific tuning.
- **Current status:** **Not established.**

## C-017 — Kuroshio lead time

- **Claim / exact substance:** ATMOS-PINN identified the 2024 Kuroshio block 14 days in advance.
- **Claim type:** Performance
- **Required evidence:** Timestamped forecast, ATMOS-PINN artifact, ERA5/OISST cutoff, event definition.
- **Relevant evidence locations:** README.md §8.2.
- **Operational test required:** Reproduce prospective-like forecast from data available at issuance.
- **Possible falsifier:** Prediction not pre-outcome or not skillful vs baseline.
- **Known confounds:** Retrospective analysis; event definition.
- **Current status:** **Not established.**

## C-018 — Cycle 26 forecast

- **Claim / exact substance:** Validated SOLAR-PINN predicts SC26 maximum 142.2 ±15 around 2035.3.
- **Claim type:** Prediction
- **Required evidence:** Executable frozen model, issue date/data cutoff, uncertainty method.
- **Relevant evidence locations:** README.md §7.2; FullPaper.tsx.
- **Operational test required:** Preserve issued forecast and eventually compare to prespecified outcome.
- **Possible falsifier:** Outcome outside declared rejection region under valid protocol.
- **Known confounds:** Model not inspectable; future outcome unknown.
- **Current status:** **Prediction text exists; model basis not established.**

## C-019 — Helical-manifold evidence

- **Claim / exact substance:** Helical Tunnel clustering of extremes supports/validates harmonic resonance.
- **Claim type:** Scientific interpretation
- **Required evidence:** Prespecified geometry, event census, null distribution, cluster statistic.
- **Relevant evidence locations:** README.md §4.2; SolarSystemViz.tsx.
- **Operational test required:** Compare clustering against domain-preserving surrogate/null geometries.
- **Possible falsifier:** Observed clustering no stronger than controls.
- **Known confounds:** Visual transform; selected events; periodic coordinates.
- **Current status:** **Not established.**

## C-020 — Repository reproducibility

- **Claim / exact substance:** Complete DeepXDE implementation, datasets, notebooks, losses and hyperparameters are available in the repository.
- **Claim type:** Reproducibility
- **Required evidence:** Files named/described in the audited tree.
- **Relevant evidence locations:** README.md §10.3; FullPaper.tsx §10.3; package.json; tree.
- **Operational test required:** Locate and execute claimed artifacts.
- **Possible falsifier:** Artifacts absent from audited tree.
- **Known confounds:** Could exist in another repository/private storage.
- **Current status:** **Contradicted for this repository/commit.**

## C-021 — Economic/operational utility

- **Claim / exact substance:** BURGAMOTS enables 5–10-year danger windows and large economic/defense benefits.
- **Claim type:** Utility
- **Required evidence:** Validated forecast skill linked to decision model and benefit calculation.
- **Relevant evidence locations:** README.md §VI; App.tsx impact; Hero.tsx.
- **Operational test required:** Decision-analytic validation with traceable assumptions.
- **Possible falsifier:** Forecast/decision value not demonstrated.
- **Known confounds:** Benefit transfer; unsupported lead-time skill.
- **Current status:** **Not established.**
