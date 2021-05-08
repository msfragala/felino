import { tmpFiles, tmpSetup } from './lib/tmp';

import { check } from '../api';
import test from 'ava';

test('Captures failure count and paths', async (t) => {
  const files = await tmpFiles({
    files: ['bad.json', 'good.json'],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'good',
      },
    ],
  });

  t.is(result.errorCount, 1);
  t.is(result.errorCount, result.errorPaths.length);
  t.is(result.errorPaths[0], files[0]);
});

test('Forbid option supports literal names', async (t) => {
  const files = await tmpFiles({
    files: ['bad.json'],
  });

  const result = await check({
    rules: [
      {
        files,
        forbid: ['bad.json'],
      },
    ],
  });

  t.is(result.errorCount, 1);
});

test('Forbid option supports wildcards', async (t) => {
  const files = await tmpFiles({
    files: ['bad-bad.json'],
  });

  const result = await check({
    rules: [
      {
        files,
        forbid: ['*-*.json'],
      },
    ],
  });

  t.is(result.errorCount, 1);
});
