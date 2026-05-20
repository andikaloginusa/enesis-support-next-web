/**
 * A lightweight native fetch wrapper inspired by apisauce.
 * Standardizes response format and handles baseURL, default headers, and token injection.
 */

// Helper to safely retrieve token from localStorage in client-side Next.js
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    try {
      const credsStr = localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        // Supports both 'access_token' and 'token' formats dynamically
        const token = creds.access_token || creds.token;
        if (token) {
          return { Authorization: `Bearer ${token}` };
        }
      }
    } catch (err) {
      console.error("Failed to parse user credentials from localStorage", err);
    }
  }
  return {};
};

const createApiClient = (
  baseURL,
  injectAuth = false
) => {
  const baseHeaders = {
    "Content-Type": "application/json",
  };

  const request = async (method, endpoint, data = null, customHeaders = {}) => {
    const url = `${baseURL}${endpoint}`;
    
    // Inject Authorization header dynamically if requested
    const authHeader = injectAuth ? getAuthHeader() : {};
    
    const options = {
      method,
      headers: { ...baseHeaders, ...authHeader, ...customHeaders },
    };

    let fetchUrl = url;

    if (data) {
      if (method === "GET") {
        // Append query parameters for GET requests, maintaining raw slash characters and standard %20 for spaces
        const params = new URLSearchParams(data)
          .toString()
          .replace(/%2F/gi, "/")
          .replace(/\+/g, "%20");
        fetchUrl = `${url}?${params}`;
      } else {
        // Add JSON body for other requests
        options.body = JSON.stringify(data);
      }
    }

    try {
      const response = await fetch(fetchUrl, options);
      
      // Attempt to parse JSON response
      const responseData = await response.json().catch(() => null);

      // Convert Headers object to a plain JavaScript object
      const responseHeaders = {};
      if (response.headers) {
        response.headers.forEach((value, key) => {
          responseHeaders[key.toLowerCase()] = value;
        });
      }

      if (!response.ok) {
        return { 
          ok: false, 
          problem: response.statusText || "CLIENT_ERROR", 
          data: responseData, 
          status: response.status,
          headers: responseHeaders
        };
      }

      return { 
        ok: true, 
        data: responseData, 
        status: response.status,
        headers: responseHeaders
      };
    } catch (error) {
      return { 
        ok: false, 
        problem: "NETWORK_ERROR", 
        error: error.message,
        headers: {}
      };
    }
  };

  return {
    get: (endpoint, data, headers) => request("GET", endpoint, data, headers),
    post: (endpoint, data, headers) => request("POST", endpoint, data, headers),
    put: (endpoint, data, headers) => request("PUT", endpoint, data, headers),
    patch: (endpoint, data, headers) => request("PATCH", endpoint, data, headers),
    delete: (endpoint, data, headers) => request("DELETE", endpoint, data, headers),
  };
};

// 1. BASE_URL Client - Hits standard endpoints, automatically injects Authorization: Bearer {token}
const standardBaseUrl = 
  process.env.NEXT_PUBLIC_BASE_URL || 
  process.env.BASE_URL || 
  "https://apiesales.enesis.com/apigateway/apiesales/";

export const api = createApiClient(standardBaseUrl, true);

// 2. BASE_URL_LOGIN Client - Hits login endpoints, no authorization headers injected
const loginBaseUrl = 
  process.env.NEXT_PUBLIC_BASE_URL_LOGIN || 
  process.env.BASE_URL_LOGIN || 
  "https://apiesales.enesis.com/apigateway/api/";

export const apiLogin = createApiClient(loginBaseUrl, false);
