import { tmpCLI } from './lib/tmp';
import test from 'ava';

test('Can load custom JSON config', async (t) => {
  const configName = `config/${Date.now()}.json`;
  const child = await tmpCLI({
    files: ['a.json'],
    args: ['-c', configName, '--log-level=debug'],
    configName,
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

test('Can load custom JS config', async (t) => {
  const configName = `config/${Date.now()}.js`;
  const child = await tmpCLI({
    files: ['a.json'],
    args: ['-c', configName, '--log-level=debug'],
    configName,
    config: `
      module.exports = {
        rules: [
          {
            files: ['./*.json'],
            format: 'kebab',
          },
        ],
      }
    `,
  });

  t.is(child.exitCode, 0);
});

test('Displays helpful error message when no config found', async (t) => {
  const child = await tmpCLI({
    files: ['a.json'],
  });

  t.is(child.exitCode, 1);
});
