import { ParsedPath } from 'path';

export type LogLevel = 'silent' | 'error' | 'info' | 'debug';

export interface FelinoOptions {
  config?: string;
  logLevel: LogLevel;
  color: boolean;
}

export type CasePattern = 'kebab' | 'camel' | 'constant' | 'pascal' | 'snake';
export type Validator = (name: string, file: ParsedPath) => Promise<boolean>;
export type RuleFormat = CasePattern | RegExp | Validator | string;

export interface Rule {
  files: string[];
  ignore?: string[];
  format?: RuleFormat;
  forbid?: string[];
}

export interface FelinoConfig {
  rules: Rule[];
}
