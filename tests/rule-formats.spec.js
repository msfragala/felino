import { check } from '../dist/api';
import test from 'ava';
import { tmpFiles } from './lib/tmp';

test('Format :: camel', async (t) => {
  const files = await tmpFiles({
    files: [
      'bad-name.js',
      'bad-name.module.js',
      'goodName.js',
      'goodName.module.js',
    ],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'camel',
      },
    ],
  });

  t.is(result.errorCount, 2);
  t.is(result.errorPaths[0], files[0]);
  t.is(result.errorPaths[1], files[1]);
});

test('Format :: kebab', async (t) => {
  const files = await tmpFiles({
    files: [
      'badName.js',
      'badName.module.js',
      'good-name.js',
      'good-name.module.js',
    ],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'kebab',
      },
    ],
  });

  t.is(result.errorCount, 2);
  t.is(result.errorPaths[0], files[0]);
  t.is(result.errorPaths[1], files[1]);
});

test('Format :: pascal', async (t) => {
  const files = await tmpFiles({
    files: [
      'badName.js',
      'badName.module.js',
      'GoodName.js',
      'GoodName.module.js',
    ],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'pascal',
      },
    ],
  });

  t.is(result.errorCount, 2);
  t.is(result.errorPaths[0], files[0]);
  t.is(result.errorPaths[1], files[1]);
});

test('Format :: constant', async (t) => {
  const files = await tmpFiles({
    files: [
      'badName.js',
      'badName.module.js',
      'GOOD_NAME.js',
      'GOOD_NAME.module.js',
    ],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'constant',
      },
    ],
  });

  t.is(result.errorCount, 2);
  t.is(result.errorPaths[0], files[0]);
  t.is(result.errorPaths[1], files[1]);
});

test('Format :: snake', async (t) => {
  const files = await tmpFiles({
    files: [
      'badName.js',
      'badName.module.js',
      'good_name.js',
      'good_name.module.js',
    ],
  });

  const result = await check({
    rules: [
      {
        files,
        format: 'snake',
      },
    ],
  });

  t.is(result.errorCount, 2);
  t.is(result.errorPaths[0], files[0]);
  t.is(result.errorPaths[1], files[1]);
});

test('Format :: regex literal', async (t) => {
  const files = await tmpFiles({
    files: ['bad-name.js', 'good-name.js'],
  });

  const result = await check({
    rules: [
      {
        files,
        format: /^good-name$/,
      },
    ],
  });

  t.is(result.errorCount, 1);
  t.is(result.errorPaths[0], files[0]);
});

test('Format :: regex string', async (t) => {
  const files = await tmpFiles({
    files: ['bad-name.js', 'good-name.js'],
  });

  const result = await check({
    rules: [
      {
        files,
        format: '^good-name$',
      },
    ],
  });

  t.is(result.errorCount, 1);
  t.is(result.errorPaths[0], files[0]);
});

test('Format :: function', async (t) => {
  const files = await tmpFiles({
    files: ['bad-name.js', 'good-name.js'],
  });

  const result = await check({
    rules: [
      {
        files,
        format(name, parsedFile) {
          t.truthy(name);
          t.truthy(parsedFile);
          return name === 'good-name';
        },
      },
    ],
  });

  t.is(result.errorCount, 1);
  t.is(result.errorPaths[0], files[0]);
});
