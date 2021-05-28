import { FelinoOptions } from './types';

import { cosmiconfig } from 'cosmiconfig';
import path from 'path';
import { Logger } from './logger';

const explorer = cosmiconfig('felino');

export async function loadConfig(
  options: FelinoOptions,
  logger: Logger
): Promise<any> {
  if (options.config) {
    const configPath = path.resolve(options.config);
    logger.debug(`Loading custom configuration: ${configPath}`);
    const result = await explorer.load(configPath);

    return result?.config;
  }

  const result = await explorer.search();

  if (result?.config) {
    logger.debug(`Using configuration from: ${result.filepath}`);
    return result.config;
  }
}
