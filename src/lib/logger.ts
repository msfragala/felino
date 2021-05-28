import { FelinoOptions, LogLevel } from './types';

import kleur from 'kleur';

const infoLevels: LogLevel[] = ['info', 'debug'];
const errorLevels: LogLevel[] = ['error', 'debug', 'info'];
const debugLevels: LogLevel[] = ['debug'];

export interface Logger {
  log(message: string): void;
  info(message: string): void;
  error(message: string, error?: Error): void;
  panic(message: string, error?: Error): never;
  debug(message: string, details?: any): void;
}

export function createLogger({ logLevel, color }: FelinoOptions): Logger {
  if (!color) kleur.enabled = false;
  return {
    log(message) {
      if (infoLevels.includes(logLevel)) {
        process.stdout.write(`${message}\n`);
      }
    },
    info(message) {
      if (infoLevels.includes(logLevel)) {
        const prefix = `[${kleur.blue('info')}]`;
        process.stdout.write(`${prefix} ${message}\n`);
      }
    },
    error(message, error) {
      const colorMessgage = kleur.red(message);
      if (errorLevels.includes(logLevel)) {
        const prefix = `[${kleur.red('error')}]`;
        if (error) {
          const err = kleur.red(error.toString());
          process.stderr.write(`${prefix} ${colorMessgage}\n${err}\n`);
        } else {
          process.stderr.write(`${prefix} ${colorMessgage}\n`);
        }
      }
    },
    panic(message, error) {
      this.error(message, error);
      process.exit(1);
    },
    debug(message, details) {
      if (debugLevels.includes(logLevel)) {
        const prefix = `[${kleur.blue('debug')}]`;

        if (details) {
          const data = JSON.stringify(details, null, '  ');
          process.stdout.write(`${prefix} ${message}:\n${data}\n`);
        } else {
          process.stdout.write(`${prefix} ${message}\n`);
        }
      }
    },
  };
}
