import path from 'path';
import fs from 'fs';
import { Server } from '../lib/server.js';
import { logger } from '../lib/logger.js';
import { createConfig } from '../lib/cli/create-config.js';

const SNIFF_CONFIG = 'sniff.config.js';

async function main() {
  if (process.argv[2] == 'init') {
    createConfig();
    logger.info(`create ${SNIFF_CONFIG}. Please edit it.`);
    return;
  }
  start();
}

async function start() {
  const configPath = path.join(process.cwd(), SNIFF_CONFIG);
  try {
    const stat = await fs.promises.lstat(configPath);
    if (!stat.isFile()) {
      logger.error(`${SNIFF_CONFIG} exists but it is not regular file!`);
      process.exit(10);
    }
  } catch (err) {
    logger.error(`${SNIFF_CONFIG} is not exists!`);
    logger.info(`note: you can create ${SNIFF_CONFIG} with \`init\` subcommand.`);
    process.exit(11);
  }

  import(configPath)
    .then(m => startServer(m.config))
    .catch(err => {
      logger.error(err);
    });
}

function startServer(config) {
  logger.info('sniffkin starting...');
  logger.debug(config);
  const server = new Server(config);

  process.on('SIGINT', () => {
    logger.debug('SIGINT received.');
    server.stop();
  });

  try {
    server.start();
  } catch (err) {
    console.log(err);
  }
}

main();
