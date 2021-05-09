import { FelinoConfig, FelinoOptions, Logger } from './types';

import { cosmiconfig } from 'cosmiconfig';
import path from 'path';

const explorer = cosmiconfig('felino');

interface ConfigResult {
  config: FelinoConfig;
  configFile: string;
}

export async function loadConfig(
  options: FelinoOptions,
  logger: Logger
): Promise<ConfigResult> {
  if (options.config) {
    const configPath = path.resolve(options.config);
    logger.debug(`Loading custom configuration: ${configPath}`);
    const cosmic = await explorer.load(configPath);
    return { config: cosmic.config, configFile: cosmic.filepath };
  }

  const cosmic = await explorer.search();
  logger.debug(`Using configuration from: ${cosmic.filepath}`);
  return { config: cosmic.config, configFile: cosmic.filepath };
}
