const typeName = (value) => value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) ? 'integer' : typeof value;

function matchesType(value, expected) {
  if (expected === 'null') return value === null;
  if (expected === 'array') return Array.isArray(value);
  if (expected === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
  if (expected === 'integer') return Number.isInteger(value);
  if (expected === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === expected;
}

function validateNode(schema, value, path, errors) {
  if (!schema || typeof schema !== 'object') return;

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
    return;
  }

  if (schema.enum && !schema.enum.some((item) => Object.is(item, value))) {
    errors.push(`${path}: must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(', ')}`);
    return;
  }

  if (schema.type !== undefined) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!allowed.some((type) => matchesType(value, type))) {
      errors.push(`${path}: expected ${allowed.join('|')}, received ${typeName(value)}`);
      return;
    }
  }

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: must have length >= ${schema.minLength}`);
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) errors.push(`${path}: does not match required pattern`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: must contain at least ${schema.minItems} item(s)`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${path}: items must be unique`);
    if (schema.items) value.forEach((item, index) => validateNode(schema.items, item, `${path}[${index}]`, errors));
    return;
  }

  if (value !== null && typeof value === 'object') {
    const properties = schema.properties ?? {};
    for (const key of schema.required ?? []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${path}.${key}: required`);
    }
    for (const [key, child] of Object.entries(value)) {
      if (properties[key]) validateNode(properties[key], child, `${path}.${key}`, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}.${key}: unknown property`);
    }
  }
}

export function validateContract(schema, value) {
  const errors = [];
  validateNode(schema, value, '$', errors);
  return { valid: errors.length === 0, errors };
}
