/**
 * Minimal schema validator.
 *
 * @param {object} data   — key/value pairs to validate
 * @param {object} schema — key: 'type[:modifier]'
 *
 * Supported types:  string | number | boolean | array | object
 * Supported modifiers: required | min:<n> | max:<n>
 *
 * @example
 * validate({ prompt: 'a sunset', count: 2 }, {
 *   prompt: 'string:required',
 *   count:  'number:min:1:max:4',
 * });
 */
export function validate(data, schema) {
  for (const [key, rule] of Object.entries(schema)) {
    const parts    = rule.split(':');
    const type     = parts[0];
    const required = parts.includes('required');
    const minIdx   = parts.indexOf('min');
    const maxIdx   = parts.indexOf('max');
    const min      = minIdx !== -1 ? Number(parts[minIdx + 1]) : null;
    const max      = maxIdx !== -1 ? Number(parts[maxIdx + 1]) : null;

    const value = data[key];

    if (value === undefined || value === null || value === '') {
      if (required) throw new TypeError(`"${key}" is required`);
      continue;
    }

    if (typeof value !== type && !(type === 'array' && Array.isArray(value))) {
      throw new TypeError(`"${key}" must be of type ${type}`);
    }

    const len = typeof value === 'string' ? value.length : value;
    if (min !== null && len < min) throw new RangeError(`"${key}" must be at least ${min}`);
    if (max !== null && len > max) throw new RangeError(`"${key}" must be at most ${max}`);
  }
}
