import path from 'path';
import { getRootDirectory } from '../util/root-directory.js';
import fs from 'fs';

const CONFIG_TEMPLATE_NAME = 'sniff.config.template.js';
const CONFIG_TEMPLATE = path.join(getRootDirectory(), 'resource',
                                  CONFIG_TEMPLATE_NAME);
const DEFAULT_OUTPUT = 'sniff.config.js';

export function createConfig() {
  const template = fs.readFileSync(CONFIG_TEMPLATE, { encoding: 'utf8' });
  fs.writeFileSync(DEFAULT_OUTPUT, template, { encoding: 'utf8' });
}

