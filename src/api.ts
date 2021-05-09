import {
  FelinoConfig,
  FelinoOptions,
  Logger,
  Rule,
  RuleFormat,
  Validator,
} from './lib/types';

import cases from 'change-case';
import { createLogger } from './lib/logger';
import globby from 'globby';
import matcher from 'matcher';
import path from 'path';
import { performance } from 'perf_hooks';

export interface RuleCheckResult {
  errorCount: number;
  errorPaths: string[];
  results: Record<string, FileResult>;
}

export interface FileResult {
  file: string;
  format?: RuleFormat;
  valid: boolean | undefined;
  forbidMatches: string[];
}

export interface CheckResult {
  checks: RuleCheckResult[];
  errorCount: number;
  errorPaths: string[];
  duration: number;
}

const defaultOptions: FelinoOptions = {
  color: true,
  logLevel: 'info',
};

export async function check(
  config: FelinoConfig,
  options: FelinoOptions = defaultOptions,
  logger: Logger = createLogger(options)
): Promise<CheckResult> {
  const start = performance.now();
  const rules = config.rules ?? [];
  const errorPaths: string[] = [];

  let errorCount = 0;
  const checks = await Promise.all(
    rules.map(async (r) => {
      const result = await runRuleCheck(r, logger);
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

const automaticIgnore = ['node_modules'];

async function runRuleCheck(
  rule: Rule,
  logger: Logger
): Promise<RuleCheckResult> {
  const ignore = rule.ignore ?? [];
  const files = await globby(rule.files, {
    ignore: [...automaticIgnore, ...ignore],
  });

  if (!files.length) {
    logger.error(`No files found for glob ${JSON.stringify(rule.files)}:`);
    process.exit(1);
  }

  const validator = resolveValidator(rule.format, logger);
  const results: Record<string, FileResult> = {};
  const errorPaths: string[] = [];
  let errorCount = 0;

  await Promise.all(
    files.map(async (f) => {
      const file = path.normalize(f);
      const parsed = path.parse(file);
      const valid = await validator?.(parsed.name, parsed);
      const forbidMatches = matchForbidden(parsed.base, rule.forbid);

      if (valid === false || forbidMatches.length > 0) {
        errorCount += 1;
        errorPaths.push(file);
      }

      results[file] = {
        file,
        format: rule.format,
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

function resolveValidator(
  format: RuleFormat | undefined,
  logger: Logger
): Validator | undefined {
  if (!format) return undefined;

  if (typeof format === 'function') {
    logger.debug('Rule format: function');
    return format;
  }

  if (format instanceof RegExp) {
    logger.debug(`Rule format: regex literal — ${format}`);
    return async (name) => format.test(name);
  }

  const caseFormatter = caseFormatters[format];

  if (caseFormatter) {
    logger.debug(`Rule format: ${format} (built-in)`);
    return async (name) => {
      const [namePart] = name.split('.');
      return namePart === caseFormatter(namePart);
    };
  }

  logger.debug(`Rule format: regex string — ${format}`);
  const rx = new RegExp(format);
  return async (name) => rx.test(name);
}
