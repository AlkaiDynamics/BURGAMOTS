import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateContract } from '../evidence/validator.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

test('blocked original-purpose hypothesis validates without invented scientific fields', () => {
  const schema = readJson('contracts/hypothesis.schema.json');
  const record = readJson('evidence/hypotheses/original-purpose.json');
  const checked = validateContract(schema, record);
  assert.equal(checked.valid, true, checked.errors.join('\n'));
  assert.equal(record.status, 'BLOCKED');
  assert.ok(record.unresolvedFields.includes('targetOutcome'));
  assert.equal(record.targetOutcome, null);
});

test('public heliophysics and original-purpose hypotheses have isolated IDs', () => {
  const original = readJson('evidence/hypotheses/original-purpose.json');
  const publicProposal = readJson('evidence/hypotheses/public-heliophysics.json');
  assert.notEqual(original.id, publicProposal.id);
  assert.equal(original.status, 'BLOCKED');
  assert.equal(publicProposal.status, 'BLOCKED');
});

test('missing required contract fields fail closed', () => {
  const schema = readJson('contracts/hypothesis.schema.json');
  const checked = validateContract(schema, { schemaVersion: '1.0.0' });
  assert.equal(checked.valid, false);
  assert.ok(checked.errors.some((error) => /id/.test(error)));
});