import path from 'path';
import { getRootDirectory } from '../util/root-directory.js';
import fs from 'fs';
import { fillIn } from 'fill-in';

const SCHEMA_FILE = 'sniff_config.schema.json';
const SCHEMA_PATHNAME = path.join(getRootDirectory(), 'resource', SCHEMA_FILE);
const DEFAULT_OUTPUT = 'sniff.config.js';



export async function createConfig() {
  const schemaJson = fs.readFileSync(SCHEMA_PATHNAME, { encoding: 'utf8' });
  const schema = JSON.parse(schemaJson);
  const result = await fillIn(schema);
  const resultJson = JSON.stringify(result, null, 2);
  const output = `export const config = ${resultJson};`;
  fs.writeFileSync(DEFAULT_OUTPUT, output, { encoding: 'utf8' });
}

