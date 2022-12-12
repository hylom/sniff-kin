export function baseUrl() {
  if (process.env.NODE_ENV === 'production') {
    return '/';
  }
  if (process.env.SK_BASE_URL) {
    return process.env.SK_BASE_URL;
  }
  return 'http://localhost:8080/';
}
