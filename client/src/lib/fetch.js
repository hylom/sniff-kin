import { baseUrl } from './base-url';

const serverEndpoint = `${baseUrl()}api`;

function createError(type, message, cause={}) {
  if (type === 'INVALID_RESPONSE') {
    return new Error(`${cause.status}: ${message}`);
  }
  return new Error(message);
}


async function _decodeResponse(resp) {
  let body;
  try {
    body = await resp.json();
  } catch (err) {
    body = resp.statusText;
  }

  if (!resp.ok) {
    throw createError('INVALID_RESPONSE', body.message, resp);
  }

  return body;
}

export function get(path, parameter) {
  const url = _getUrl(path);
  const init = {};
  return fetch(url, init).then(_decodeResponse);
}

function _getUrl(path) {
  return serverEndpoint + path;
}
