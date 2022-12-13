import { get } from './fetch';

export function getLogs(query={}) {
  const params = [];
  if (query.lastId) {
    params.push(`last_id=${query.lastId}`);
  }

  let url = '/logs';
  if (params.length) {
    url = `${url}?${params.join('&')}`;
  }
    
  return get(url);
}
