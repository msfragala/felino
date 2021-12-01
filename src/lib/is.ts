export type Type = 'string' | 'function' | 'array' | 'object' | 'regexp';

export function getType(input: any): Type | void {
  const string = `${input}`;
  const typeOf = typeof input;

  if (typeOf === 'string') {
    return 'string';
  } else if (typeOf === 'function') {
    return 'function';
  } else if (Array.isArray(input)) {
    return 'array';
  } else if (typeOf === 'object' && string === '[object Object]') {
    return 'object';
  } else if (input instanceof RegExp) {
    return 'regexp';
  }
}

export function isType(input: any, types: Type | Type[]): boolean {
  const type = getType(input);
  if (!type) return false;
  const allowed = Array.isArray(types) ? types : [types];
  return allowed.includes(type);
}
