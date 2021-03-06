#!/usr/bin/env node

import { FelinoOptions, LogLevel } from './lib/types';
import ms from 'pretty-ms';
import { check } from './api';
import { createLogger } from './lib/logger';
import { loadConfig } from './lib/load-config';
import pkg from '../package.json';
import { reportError } from './lib/report-error';
import sade from 'sade';

interface Flags {
  'c'?: string;
  'config'?: string;
  'log-level': LogLevel;
  'color'?: Boolean;
}

const app = sade('felino', true);

app
  .version(pkg.version)
  .option('-c, --config', 'Specify a custom configuration file')
  .option(
    '--log-level',
    'Control which types of messages are printed — silent,error,info',
    'info'
  )
  .option('--color', 'Turn on colors', true)
  .option('--no-color', 'Turn off colors')
  .action(async (flags: Flags) => {
    const options: FelinoOptions = {
      color: !!flags.color,
      config: flags.config,
      logLevel: flags['log-level'],
    };
    const logger = createLogger(options);

    logger.debug(`Option "color": ${options.color}`);
    logger.debug(`Option "config": ${options.config ?? '(empty)'}`);
    logger.debug(`Option "logLevel": ${options.logLevel}`);

    const config = await loadConfig(options, logger).catch((error) => {
      logger.panic('Error loading configuration', error);
    });

    if (config) {
      logger.debug('Configuration', config);
    } else if (options.config) {
      logger.panic(`Unable to load custom config file: ${options.config}`);
    } else {
      logger.panic(
        'No configuration found. For helping configuring Felino, check out the documentation here: https://github.com/msfragala/felino#configuration'
      );
    }

    const result = await check(config, options, logger);

    if (result.errorCount > 0) {
      logger.log(reportError(result));
      process.exitCode = 1;
    }

    logger.log(`✨ Done in ${ms(result.duration)}`);
  })
  .parse(process.argv);
