// Base URL — update to your deployed backend URL for production builds
const BASE_URL = 'http://localhost:5000/api/v1';

let _token: string | null = null;

export const setAuthToken = (token: string | null): void => {
  _token = token;
};

export const getAuthToken = (): string | null => _token;

const buildHeaders = (extra?: Record<string, string>): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
  ...extra,
});

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const apiGet = (path: string) =>
  fetch(`${BASE_URL}${path}`, { headers: buildHeaders() }).then(handleResponse);

export const apiPost = (path: string, body: unknown) =>
  fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const apiPatch = (path: string, body: unknown) =>
  fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  }).then(handleResponse);

export const apiDelete = (path: string) =>
  fetch(`${BASE_URL}${path}`, { method: 'DELETE', headers: buildHeaders() }).then(handleResponse);
