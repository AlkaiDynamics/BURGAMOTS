import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const activeFiles = ['App.tsx','components/Hero.tsx','components/Navigation.tsx','components/Timeline.tsx','components/Diagrams.tsx','components/SolarSystemViz.tsx'];
const activeText = activeFiles.map(read).join('\n');

test('active UI contains no frozen unsupported validation language', () => {
  for (const phrase of ['99.8%','94.2%','5σ','Granger Causality Test','DeepXDE predictive mode active','High-Fidelity Training','Torque Index (η)']) {
    assert.equal(activeText.includes(phrase), false, `unsupported active phrase: ${phrase}`);
  }
});

test('synthetic periodic visual driver is disclosed as illustrative and dimensionless', () => {
  const viz = read('components/SolarSystemViz.tsx');
  assert.match(viz, /Synthetic Cycle Demonstration/);
  assert.match(viz, /dimensionless/i);
  assert.equal(viz.includes('calculateTorqueIndex'), false);
});

test('proposed scientific diagrams disclose non-implementation', () => {
  const diagrams = read('components/Diagrams.tsx');
  assert.match(diagrams, /PROPOSED ARCHITECTURE — NOT CURRENTLY IMPLEMENTED/);
});

test('active application presents explicit blocked scientific state', () => {
  const app = read('App.tsx');
  assert.match(app, /Status: BLOCKED/);
  assert.match(app, /No inspectable empirical result is available/);
});