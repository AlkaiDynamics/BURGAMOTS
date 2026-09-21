const setOf = (value) => new Set(Array.isArray(value) ? value : []);

export function validateBoundaryIntegrity(boundary, { resultExists = false } = {}) {
  const errors = [];
  if (!boundary || typeof boundary !== 'object') return { valid:false, historicalLeakageStatus:'UNRESOLVED', errors:['boundary: expected object'] };

  const training = setOf(boundary.trainingIds);
  const evaluation = setOf(boundary.evaluationIds);
  const control = setOf(boundary.controlIds);

  for (const id of training) if (evaluation.has(id) || control.has(id)) errors.push(`partition cross-over: ${id} appears in training and another partition`);
  for (const id of evaluation) if (control.has(id)) errors.push(`partition cross-over: ${id} appears in evaluation and control`);

  for (const group of Array.isArray(boundary.groupedUnits) ? boundary.groupedUnits : []) {
    const partitions = new Set();
    for (const id of Array.isArray(group?.recordIds) ? group.recordIds : []) {
      if (training.has(id)) partitions.add('training');
      if (evaluation.has(id)) partitions.add('evaluation');
      if (control.has(id)) partitions.add('control');
    }
    if (partitions.size > 1) errors.push(`group ${group?.groupId ?? 'unknown'} crosses evaluation partitions`);
  }

  if (boundary.createdBeforeAnalysis !== true) errors.push('createdBeforeAnalysis: successor boundary must be fixed before analysis');
  if (resultExists && boundary.immutableAfterResult !== true) errors.push('immutableAfterResult: boundary must be immutable once a result exists');
  if (boundary.historicalLeakageStatus !== undefined && boundary.historicalLeakageStatus !== 'UNRESOLVED') {
    errors.push('historicalLeakageStatus: successor controls cannot clear the frozen historical leakage finding');
  }

  return { valid: errors.length === 0, historicalLeakageStatus: 'UNRESOLVED', errors };
}
