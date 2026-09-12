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

test('protected solar backup is the exact frozen Git blob', () => {
  const backup = read('protected/solar-visualization-frozen-8a9029b6.tsx');
  assert.equal(gitBlobSha(backup), frozenBlobSha);
});

test('active solar visualization retains protected orbital/alignment machinery', () => {
  const source = readText('components/SolarSystemViz.tsx');
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
    assert.ok(source.includes(invariant), `protected solar invariant missing: ${invariant}`);
  }
});

test('solar visualization remains mounted in the active application', () => {
  const app = readText('App.tsx');
  assert.match(app, /import SolarSystemViz from ['"]\.\/components\/SolarSystemViz['"]/);
  assert.match(app, /<SolarSystemViz/);
});

test('protected product feature is not replaced by a placeholder', () => {
  const source = readText('components/SolarSystemViz.tsx');
  assert.equal(/placeholder|static image/i.test(source), false);
  assert.ok(source.length > 60000, 'SolarSystemViz unexpectedly shrank below protected implementation scale');
});
