#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import read from 'read';
import { Server } from '../lib/server.js';
import { logger } from '../lib/logger.js';
import { createConfig } from '../lib/cli/create-config.js';

const SNIFF_CONFIG = 'sniff.config.mjs';

async function main() {
  if (process.argv[2] == 'init') {
    await createConfig();
    return;
  }
  start();
}

async function promisedRead(option) {
  return new Promise((resolve, reject) => {
    read(option, (error, result, isDefault) => {
      if (error) {
        reject(error);
        return;
      }
      resolve({ result, isDefault, });
    });
  });
}

async function start() {
  const configPath = path.join(process.cwd(), SNIFF_CONFIG);
  try {
    const stat = await fs.promises.stat(configPath);
    if (!stat.isFile()) {
      logger.error(`${SNIFF_CONFIG} exists but it is not regular file!`);
      process.exit(10);
    }
  } catch (err) {
    const prompt = `${SNIFF_CONFIG} not found. Create it? (yes/no):`;
    const { result, isDefault } = await promisedRead({ prompt, default: 'yes', edit: true, });
    const res = result.toLowerCase();
    if (res == 'yes' || res == 'y') {
      await createConfig();
      // restart start() process
      return start();
    } else {
      logger.info(`note: you can create ${SNIFF_CONFIG} with \`init\` subcommand.`);
      process.exit(11);
    }
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
