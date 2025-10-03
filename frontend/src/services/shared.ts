export async function authFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = localStorage.getItem('authToken');
  const headers = new Headers(init?.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}
