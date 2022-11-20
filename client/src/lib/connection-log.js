import { get } from './fetch';

export function getLogs(query) {
  return get('/logs');
}
