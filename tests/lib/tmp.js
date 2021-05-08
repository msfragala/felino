import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';
import tempy from 'tempy';

/**
 *
 * @param {object} options
 * @param {import('../../dist/api').FelinoConfig} options.config
 * @param {string} [options.dir]
 * @param {string} [options.name]
 * @returns {Promise<string>}
 */
export async function tmpConfig({
  config,
  dir = tempy.directory(),
  name = '.felinorc.json',
}) {
  const content = typeof config === 'string' ? config : JSON.stringify(config);
  const file = path.join(dir, name);
  await fs.outputFile(file, content);
  return file;
}

/**
 *
 * @param {object} options
 * @param {string[]} options.files
 * @param {string} [options.dir]
 * @returns {Promise<string[]>}
 */
export async function tmpFiles({ files, dir = tmpDir() }) {
  return Promise.all(
    files.map(async (f) => {
      const file = path.join(dir, f);
      await fs.outputFile(file, '');
      return file;
    })
  );
}

/**
 *
 * @typedef Setup
 * @type {object}
 * @property {string} dir
 * @property {string} config
 * @property {string[]} files
 *
 * @param {object} options
 * @param {import('../../dist/api').FelinoConfig} options.config
 * @param {string[]} options.files
 * @param {string} [options.configName]
 * @returns {Promise<Setup>}
 */
export async function tmpSetup({ config, configName, files }) {
  const dir = tmpDir();
  const configPath = await tmpConfig({ config, dir, name: configName });
  const filePaths = await tmpFiles({ files, dir });

  return { dir, config: configPath, files: filePaths };
}

/**
 *
 * @param {object} options
 * @param {import('../../dist/api').FelinoConfig} options.config
 * @param {string[]} options.files
 * @param {string[]} [options.arguments]
 * @param {string} [options.configName]
 * @returns {Promise<import('execa').ExecaChildProcess>}
 */
export async function tmpCLI({ args, config, configName, files }) {
  const execPath = path.resolve('./cli.js');
  const { dir } = await tmpSetup({ config, configName, files });
  const child = await execa(execPath, args, { reject: false, cwd: dir });
  return child;
}

/**
 *
 * @returns {string}
 */
export function tmpDir() {
  return tempy.directory();
}
