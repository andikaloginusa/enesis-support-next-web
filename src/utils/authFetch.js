/**
 * authFetch — Authorized fetch utility
 *
 * Provides a shared way to make authenticated HTTP requests using the
 * stored user credentials. Eliminates duplicated token-extraction and
 * FormData-building logic across service files.
 *
 * Pattern: Pure utility (no React hooks, no side effects beyond network).
 */

import { getUserCredentials } from "./storage";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://apiesales.enesis.com/apigateway/apiesales/";

/**
 * Build the Authorization header from stored credentials.
 * Supports both `access_token` and `token` field names.
 *
 * @returns {{ Authorization: string } | {}}
 */
export function buildAuthHeader() {
  const creds = getUserCredentials();
  const token = creds?.access_token || creds?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Build the full URL for a given endpoint path.
 *
 * @param {string} endpoint
 * @returns {string}
 */
export function buildUrl(endpoint) {
  return `${BASE_URL}${endpoint}`;
}

/**
 * Execute an authorized fetch request, returning a normalized response
 * compatible with the apisauce-style { ok, data, status } shape used
 * throughout the app.
 *
 * @param {string} method   - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param {string} endpoint - API endpoint path (without base URL)
 * @param {Object} [options]
 * @param {FormData|Object|null} [options.body]    - Request body. Object is JSON-stringified; FormData is sent as-is.
 * @param {Object}          [options.headers]        - Extra headers merged on top of Authorization.
 * @param {Object}          [options.params]        - Query params appended to GET requests.
 * @returns {Promise<{ ok: boolean, data: any, status: number }>}
 */
export async function authFetch(method, endpoint, { body, headers = {}, params } = {}) {
  let url = buildUrl(endpoint);

  const requestHeaders = { ...buildAuthHeader(), ...headers };

  const fetchOptions = { method, headers: requestHeaders };

  if (body !== undefined) {
    if (body instanceof FormData) {
      fetchOptions.body = body;
      // Let the browser set Content-Type for FormData (includes boundary)
      delete fetchOptions.headers["Content-Type"];
    } else {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers["Content-Type"] = "application/json";
    }
  }

  if (params && method === "GET") {
    const qs = new URLSearchParams(params)
      .toString()
      .replace(/%2F/gi, "/")
      .replace(/\+/g, "%20");
    url = `${url}?${qs}`;
  }

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (networkError) {
    return { ok: false, problem: "NETWORK_ERROR", data: networkError.message, status: 0 };
  }

  let parsed;
  try {
    parsed = await response.json();
  } catch {
    parsed = null;
  }

  return {
    ok: response.ok,
    data: parsed,
    status: response.status,
  };
}
