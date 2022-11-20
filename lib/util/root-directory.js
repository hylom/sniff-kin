// root-dir.js: this file must exist as {root_dir}/lib/util/root-dir.js.
import path from 'path';

function _dirname() {
  return path.dirname(new URL(import.meta.url).pathname);
}

export function getRootDirectory() {
  return path.normalize(path.join(_dirname(), '../../'));
}
