import { FelinoOptions, LogLevel, Logger } from './types';

import kleur from 'kleur';

const infoLevels: LogLevel[] = ['info', 'debug'];
const errorLevels: LogLevel[] = ['error', 'debug', 'info'];
const debugLevels: LogLevel[] = ['debug'];

export function createLogger({ logLevel, color }: FelinoOptions): Logger {
  if (!color) kleur.enabled = false;
  return {
    info(message) {
      if (infoLevels.includes(logLevel)) {
        process.stdout.write(`${message}\n`);
      }
    },
    error(message, error) {
      if (errorLevels.includes(logLevel)) {
        const prefix = `[${kleur.red('error')}]`;
        if (error) {
          const err = kleur.red(error.toString());
          process.stderr.write(`${prefix} ${message}\n${err}\n`);
        } else {
          process.stderr.write(`${prefix} ${message}\n`);
        }
      }
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
