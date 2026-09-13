import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url));
const readText = (path) => read(path).toString('utf8');
const frozenBlobSha = 'e56d956cf927c56b24543259ccee9475ab41d6b6';

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`);
  return createHash('sha1').update(Buffer.concat([header, bytes])).digest('hex');
}

test('protected AYLI-bound solar archive is the exact frozen Git blob', () => {
  const backup = read('protected/solar-visualization-frozen-8a9029b6.tsx');
  assert.equal(gitBlobSha(backup), frozenBlobSha);
  assert.ok(backup.length > 60000, 'protected solar archive unexpectedly shrank');
});

test('protected archive retains the frozen orbital/alignment implementation', () => {
  const source = readText('protected/solar-visualization-frozen-8a9029b6.tsx');
  for (const invariant of [
    'const PLANETS_DATA: OrbitalElements[]',
    "{ name: 'Mercury', a: 0.387",
    "{ name: 'Neptune', a: 30.07",
    'const TRAIL_STEPS = 60000',
    'function solveKepler',
    'function getPlanetPositionHeliocentric',
    'function getSunBarycentricOffset',
    'const EXAGGERATION = 200.0',
    'function calculateTorqueIndex',
    'new THREE.WebGLRenderer',
    'new OrbitControls',
    'new THREE.CatmullRomCurve3',
    'const coronaMat = new THREE.ShaderMaterial',
    'const magMat = new THREE.ShaderMaterial',
    'plasmaFieldRef.current',
    'type="range"',
    'onYearChange',
    'TIME_STEPS.map',
  ]) {
    assert.ok(source.includes(invariant), `archived solar invariant missing: ${invariant}`);
  }
});

test('scientific evidence pipeline does not depend on the archived visualization', () => {
  const evidenceFiles = [
    'evidence/claimPolicy.js',
    'evidence/provenance.js',
    'evidence/boundary.js',
    'evidence/resultLoader.js',
    'evidence/viewModel.js',
  ];
  for (const path of evidenceFiles) {
    const source = readText(path);
    assert.equal(source.includes('SolarSystemViz'), false, `${path} depends on SolarSystemViz`);
    assert.equal(source.includes('calculateTorqueIndex'), false, `${path} depends on the synthetic cycle driver`);
    assert.equal(source.includes('Torque Index'), false, `${path} imports a historical visualization claim`);
  }
});

test('archive preservation does not require SolarSystemViz to remain mounted in BURGAMOTS', () => {
  const app = readText('App.tsx');
  // This is intentionally permissive: the active app may retain or remove the novelty visualization.
  // Scientific claims are governed by the evidence pipeline either way.
  assert.ok(typeof app === 'string' && app.length > 0);
});
