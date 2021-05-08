import { ParsedPath } from 'path';
import cases from 'change-case';
import globby from 'globby';
import matcher from 'matcher';
import path from 'path';
import { performance } from 'perf_hooks';

export type CasePattern = 'kebab' | 'camel' | 'constant' | 'pascal' | 'snake';
export type Validator = (name: string, file: ParsedPath) => Promise<boolean>;
export type RuleFormat = CasePattern | RegExp | Validator | string;

export interface Rule {
  files: string[];
  ignore?: string[];
  format?: RuleFormat;
  forbid?: string[];
}

export interface RuleCheckResult {
  errorCount: number;
  errorPaths: string[];
  results: Record<string, FileResult>;
}

export interface FileResult {
  file: string;
  valid: boolean | undefined;
  forbidMatches: string[];
}

export interface FelinoConfig {
  rules: Rule[];
}

export interface CheckResult {
  checks: RuleCheckResult[];
  errorCount: number;
  errorPaths: string[];
  duration: number;
}

export async function check(options: FelinoConfig): Promise<CheckResult> {
  const start = performance.now();
  const rules = options.rules ?? [];
  const errorPaths: string[] = [];

  let errorCount = 0;
  const checks = await Promise.all(
    rules.map(async (r) => {
      const result = await runRuleCheck(r);
      errorCount += result.errorCount;
      errorPaths.push(...result.errorPaths);
      return result;
    })
  );

  return {
    checks,
    errorCount,
    errorPaths,
    duration: performance.now() - start,
  };
}

async function runRuleCheck(rule: Rule): Promise<RuleCheckResult> {
  const files = await globby(rule.files, { ignore: rule.ignore ?? [] });
  const validator = resolveValidator(rule.format);
  const results: Record<string, FileResult> = {};
  const errorPaths: string[] = [];
  let errorCount = 0;

  await Promise.all(
    files.map(async (file) => {
      const parsed = path.parse(file);
      const valid = await validator?.(parsed.name, parsed);
      const forbidMatches = matchForbidden(parsed.base, rule.forbid);

      if (valid === false || forbidMatches.length > 0) {
        errorCount += 1;
        errorPaths.push(file);
      }

      results[file] = {
        file,
        valid,
        forbidMatches,
      };
    })
  );

  return { errorCount, errorPaths, results };
}

function matchForbidden(base: string, forbid?: string[]): string[] {
  if (!forbid) return [];
  return forbid.filter((f) => matcher.isMatch(base, f));
}

const caseFormatters: { [key: string]: Function } = {
  camel: (name: string) => cases.camelCase(name),
  kebab: (name: string) => cases.paramCase(name),
  pascal: (name: string) => cases.pascalCase(name),
  constant: (name: string) => cases.constantCase(name),
  snake: (name: string) => cases.snakeCase(name),
};

function resolveValidator(format?: RuleFormat): Validator | undefined {
  if (!format) return undefined;

  if (typeof format === 'function') {
    return format;
  }

  if (format instanceof RegExp) {
    return async (name) => format.test(name);
  }

  const caseFormatter = caseFormatters[format];

  if (caseFormatter) {
    return async (name) => {
      const [namePart] = name.split('.');
      return namePart === caseFormatter(namePart);
    };
  }

  const rx = new RegExp(format);
  return async (name) => rx.test(name);
}
