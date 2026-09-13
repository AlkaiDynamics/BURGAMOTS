import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('active App routes scientific presentation through the evidence view model', () => {
  const app = read('App.tsx');
  assert.match(app, /createEvidenceViewModel/);
  assert.match(app, /EvidencePanel/);
  assert.match(app, /original-purpose\.json/);
  assert.match(app, /public-heliophysics\.json/);
  assert.match(app, /original-purpose-blocked\.json/);
  assert.match(app, /public-heliophysics-blocked\.json/);
});

test('legacy validation and paper components are not imported into the active App', () => {
  const app = read('App.tsx');
  for (const legacy of [
    'SolarCycleChart',
    'FlareCorrelationChart',
    'ValidationCharts',
    'FullPaper',
    'SolarSystemViz',
    'PINNDiagram',
    'SystemArchDiagram',
    'PipelineDiagram',
    'GrangerChart',
  ]) {
    assert.equal(app.includes(legacy), false, `legacy active import/reference remains: ${legacy}`);
  }
});

test('active evidence UI contains no frozen unsupported validation language', () => {
  const activeFiles = ['App.tsx', 'components/EvidencePanel.tsx'];
  for (const file of activeFiles) {
    assert.equal(existsSync(new URL(`../${file}`, import.meta.url)), true, `missing active UI file: ${file}`);
  }
  const activeText = activeFiles.map(read).join('\n');
  for (const phrase of [
    '99.8%', '94.2%', '5σ', 'Granger Causality Test', 'DeepXDE predictive mode active',
    'High-Fidelity Training', 'reduce prediction uncertainty by an order of magnitude',
    'r = 0.89', '$2T', 'physical torque measurement',
  ]) {
    assert.equal(activeText.includes(phrase), false, `unsupported active phrase: ${phrase}`);
  }
});

test('EvidencePanel renders derived state and preserves missing values instead of fabricating zeroes', () => {
  const panel = read('components/EvidencePanel.tsx');
  assert.match(panel, /viewModel\.statusLabel/);
  assert.match(panel, /viewModel\.summary/);
  assert.match(panel, /viewModel\.provenanceSummary/);
  assert.match(panel, /viewModel\.limitations/);
  assert.match(panel, /viewModel\.unresolvedFields/);
  assert.match(panel, /viewModel\.estimate !== null/);
  assert.match(panel, /viewModel\.pValue !== null/);
});

test('active UI labels absent scientific systems as proposed rather than operational', () => {
  const app = read('App.tsx');
  assert.match(app, /PROPOSED ARCHITECTURE — NOT CURRENTLY IMPLEMENTED/);
  assert.match(app, /Scientific execution remains blocked/);
});
