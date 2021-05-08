#!/usr/bin/env node

import { check } from './api';
import { cosmiconfig } from 'cosmiconfig';
import pkg from '../package.json';
import { reportError } from './lib/report-error';
import sade from 'sade';

const app = sade('felino', true);
const explorer = cosmiconfig('felino');

app
  .version(pkg.version)
  .action(async () => {
    const cosmic = await explorer.search(process.cwd());

    if (!cosmic?.config) {
      process.exitCode = 1;
      throw new Error('Cannot find felino configuration');
    }

    const result = await check(cosmic.config);
    if (result.errorCount === 0) {
      process.exitCode = 0;
      return;
    }

    process.exitCode = 1;
    reportError(result);
  })
  .parse(process.argv);
