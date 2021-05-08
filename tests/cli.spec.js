import { tmpCLI, tmpDir, tmpFiles } from './lib/tmp';

import execa from 'execa';
import path from 'path';
import test from 'ava';

test('Exit code is 0 when no failures', async (t) => {
  const child = await tmpCLI({
    files: ['a.json'],
    config: {
      rules: [
        {
          files: ['./*.json'],
          format: 'kebab',
        },
      ],
    },
  });

  t.is(child.exitCode, 0);
});

test('Exit code is 1 when check fails', async (t) => {
  const child = await tmpCLI({
    files: ['HELLO.json'],
    config: {
      rules: [
        {
          files: ['*.json'],
          format: 'kebab',
        },
      ],
    },
  });

  t.is(child.exitCode, 1);
});

test('Fails when no config found', async (t) => {
  const child = await tmpCLI({
    files: ['hello.json'],
    configName: 'unrecognizable.json',
    config: {
      rules: [
        {
          files: ['*.json'],
          format: 'kebab',
        },
      ],
    },
  });

  t.is(child.exitCode, 1);
});
