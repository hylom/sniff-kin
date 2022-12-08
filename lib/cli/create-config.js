import path from 'path';
import fs from 'fs';
import util from 'util';
import { logger } from '../logger.js';

import { getRootDirectory } from '../util/root-directory.js';
import { getConnectedPrivateNetworks } from '../util/get-serve-ip.js';
import { fillIn } from 'fill-in';

const SCHEMA_FILE = 'sniff_config.schema.json';
const SCHEMA_PATHNAME = path.join(getRootDirectory(), 'resource', SCHEMA_FILE);
const DEFAULT_OUTPUT = 'sniff.config.js';

export async function createConfig() {
  try {
    if (await isConfigFileExists()) {
      logger.error(`configuration file (${DEFAULT_OUTPUT}) already exists. Do nothing.`);
      return;
    }
  } catch (err) {
    logger.error(`${err} Do nothing.`);
    return;
  }

  const defaults = createDefaults();
  const schemaJson = fs.readFileSync(SCHEMA_PATHNAME, { encoding: 'utf8' });
  const schema = JSON.parse(schemaJson);
  const result = await fillIn(schema, { defaults, });
  const resultString = util.inspect(result, { depth: null, breakLength: 72,});
  const output = `export const config = ${resultString};\n`;
  await fs.promises.writeFile(DEFAULT_OUTPUT, output, { encoding: 'utf8' });
  logger.info(`${DEFAULT_OUTPUT} is created. Please check it.`);
}

async function isConfigFileExists() {
  try {
    const stat = await fs.promises.stat(DEFAULT_OUTPUT);
    if (stat.isFile()) {
      return true;
    }
    throw Error(`configuration file (${DEFAULT_OUTPUT}) exists but not file.`);
  } catch (err) {
    return false;
  }
}

function createDefaults() {
  const result = {
    network: {
      bind: '0.0.0.0',
    },
  };
  const networks = getConnectedPrivateNetworks();
  if (networks.length) {
    result.network.externalIpAddress = { network: networks[0] };
  }
  return result;
}
