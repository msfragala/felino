import fs from 'fs-extra';
import path from 'path';
import tempy from 'tempy';

export async function tmpConfig({
  config,
  dir = tempy.directory(),
  name = 'felinorc.json',
}) {
  const content = typeof config === 'string' ? config : JSON.stringify(config);
  const file = path.join(dir, name);
  await fs.outputFile(file, content);
  return file;
}

export async function tmpFiles({ files, dir = tempy.directory() }) {
  return Promise.all(
    files.map(async (f) => {
      const file = path.join(dir, f);
      await fs.outputFile(file, '');
      return file;
    })
  );
}

export async function tmpSetup({ config, configName, files }) {
  const dir = tempy.directory();
  const configPath = await tmpConfig({ config, dir, name: configName });
  const filePaths = await tmpFiles({ files, dir });

  return { dir, config: configPath, files: filePaths };
}
