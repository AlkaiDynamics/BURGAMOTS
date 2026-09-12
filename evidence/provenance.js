import { createHash } from 'node:crypto';

const SHA256_RE = /^[a-f0-9]{64}$/;

export function sha256Bytes(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function verifySha256(bytes, expected) {
  return typeof expected === 'string' && SHA256_RE.test(expected) && sha256Bytes(bytes) === expected;
}

export function registerSource({ datasetId, source, sourceUrl = null, version = null, license = null }) {
  if (!datasetId || !source) throw new Error('datasetId and source are required to register a cited source.');
  return {
    schemaVersion: '1.0.0', datasetId, source, sourceUrl, acquired: false,
    retrievedAt: null, version, license, rawFiles: [], transformations: [], exclusions: []
  };
}

export function validateDatasetManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return { valid:false, empiricalReady:false, errors:['manifest: expected object'] };
  if (!manifest.datasetId) errors.push('datasetId: required');
  if (!manifest.source) errors.push('source: required');
  if (typeof manifest.acquired !== 'boolean') errors.push('acquired: expected boolean');
  if (!Array.isArray(manifest.rawFiles)) errors.push('rawFiles: expected array');
  if (!Array.isArray(manifest.transformations)) errors.push('transformations: expected array');
  if (!Array.isArray(manifest.exclusions)) errors.push('exclusions: expected array');

  const rawFiles = Array.isArray(manifest.rawFiles) ? manifest.rawFiles : [];
  const transformations = Array.isArray(manifest.transformations) ? manifest.transformations : [];
  const rawHashes = new Set();

  if (manifest.acquired) {
    if (!manifest.retrievedAt) errors.push('retrievedAt: acquired input requires retrieval timestamp');
    if (rawFiles.length === 0) errors.push('rawFiles: acquired input requires at least one immutable raw file');
  }

  for (const file of rawFiles) {
    if (!file?.fileId || !file?.path) errors.push('rawFiles: each raw file requires fileId and path');
    if (!SHA256_RE.test(file?.sha256 ?? '')) errors.push(`rawFiles:${file?.fileId ?? 'unknown'} hash: valid SHA-256 required`);
    else rawHashes.add(file.sha256);
  }

  let previousOutput = null;
  for (const [index, transformation] of transformations.entries()) {
    const label = `transformations[${index}]`;
    if (!transformation?.id || !transformation?.step || !transformation?.codeVersion) errors.push(`${label}: id, step, and codeVersion are required`);
    if (!SHA256_RE.test(transformation?.inputHash ?? '')) errors.push(`${label} input hash: valid SHA-256 required`);
    if (!SHA256_RE.test(transformation?.outputHash ?? '')) errors.push(`${label} output hash: valid SHA-256 required`);
    if (index === 0 && rawHashes.size > 0 && SHA256_RE.test(transformation?.inputHash ?? '') && !rawHashes.has(transformation.inputHash)) {
      errors.push(`${label}: transformation chain does not start from a registered raw-file hash`);
    }
    if (index > 0 && previousOutput && transformation?.inputHash !== previousOutput) {
      errors.push(`${label}: transformation chain is broken; inputHash does not match prior outputHash`);
    }
    previousOutput = transformation?.outputHash ?? null;
  }

  const valid = errors.length === 0;
  const empiricalReady = Boolean(manifest.acquired && valid && rawFiles.length > 0);
  return { valid, empiricalReady, errors };
}
