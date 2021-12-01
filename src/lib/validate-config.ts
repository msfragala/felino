import { getType, isType } from './is';

function isArrayOfStrings(input: any) {
  return Boolean(input.every?.((item: any) => typeof item === 'string'));
}

export function validateConfig(config: any): string[] {
  const errors: string[] = [];

  if (!isType(config, 'object')) {
    errors.push('Configuration must be an object.');
    return errors;
  }

  if (!config.rules) {
    errors.push('Configuration is missing "rules" field.');
    return errors;
  }

  if (!isType(config.rules, 'array')) {
    errors.push('"rules" option should be an array.');
    return errors;
  }

  if (config.rules.length === 0) {
    errors.push('No rules found — "rules" option is empty');
    return errors;
  }

  config.rules.forEach((rule: any, i: number) => {
    errors.push(...validateRule(rule, i));
  });

  return errors;
}

function validateRule(rule: any, i: number): string[] {
  const errors: string[] = [];
  const prefix = `Rule at index ${i}:`;

  if (!isType(rule, 'object')) {
    errors.push(`${prefix} should be an object, but is ${getType(rule)}`);
  }

  if (!rule.files && !rule.directories) {
    errors.push(`${prefix} must have a "files" or "directories" option`);
  } else if (rule.files && rule.directories) {
    errors.push(`${prefix} cannot have both "files" and "directories" options`);
  } else if (rule.files && !isArrayOfStrings(rule.files)) {
    errors.push(`${prefix} "files" option should be an array of strings`);
  } else if (rule.directories && !isArrayOfStrings(rule.directories)) {
    errors.push(
      `${prefix} "directories" option for should be an array of strings`
    );
  }

  if (rule.ignore && !isArrayOfStrings(rule.ignore)) {
    errors.push(`${prefix} "ignore" option should be an array of strings`);
  }

  if (rule.forbid && !isArrayOfStrings(rule.forbid)) {
    errors.push(`${prefix} "forbid" option should be an array of strings`);
  }

  if (rule.format && !isType(rule.format, ['string', 'function', 'regexp'])) {
    errors.push(`${prefix} format should be a string, function, or regexp`);
  }

  return errors;
}
