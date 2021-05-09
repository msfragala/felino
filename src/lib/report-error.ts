import { CheckResult, FileResult, RuleCheckResult } from '../api';

import { RuleFormat } from './types';
import kleur from 'kleur';
import path from 'path';
import { plural } from './plural';

export function reportError({ checks }: CheckResult) {
  const errors = flattenErrors(checks);

  let errorCount = 0;
  errors.forEach((error) => {
    errorCount += error.forbidMatches.length;
    errorCount += error.formatMisMatches.length;
  });

  const tokenProblem = plural('problem', 'problems', errorCount);
  const tokenFile = plural('file', 'files', errors.length);
  const summary = kleur
    .bold()
    .red(
      `✖ ${errorCount} ${tokenProblem} across ${errors.length} ${tokenFile}`
    );

  return `
${errors.map(formatFileErrors).join('\n\n')}
\n${summary}
  `;
}

function formatFileErrors({
  file,
  forbidMatches,
  formatMisMatches,
}: FileErrorList) {
  const prefix = kleur.red('error');
  const heading = kleur.underline(path.resolve(file));
  const formatMessages = formatMisMatches.map(
    (f) => `Does not match pattern: ${f}`
  );
  const forbidMessages = forbidMatches.map(
    (f) => `Matches forbidden pattern: ${f}`
  );

  let output = heading;
  output += formatMessages.map((m) => `\n  ${prefix}  ${m}`).join('');
  output += forbidMessages.map((m) => `\n  ${prefix}  ${m}`).join('');

  return output;
}

interface FileErrorList {
  file: string;
  formatMisMatches: RuleFormat[];
  forbidMatches: string[];
}

function flattenErrors(checks: RuleCheckResult[]): FileErrorList[] {
  const errors: Record<string, FileErrorList> = {};

  checks.forEach((check) => {
    check.errorPaths.forEach((file) => {
      const result = check.results[file];
      errors[file] ??= {
        file,
        formatMisMatches: [],
        forbidMatches: [],
      };

      if (result.valid === false) {
        errors[file].formatMisMatches.push(result.format);
      }

      if (result.forbidMatches.length > 0) {
        errors[file].forbidMatches.push(...result.forbidMatches);
      }
    });
  });

  return Object.values(errors);
}
