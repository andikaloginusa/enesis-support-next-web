import { api, apiLogin } from "./api";

/**
 * Authentication Service
 * Manages login (BASE_URL_LOGIN without auth headers) and logout (BASE_URL with auth headers).
 */
export const authService = {
  /**
   * Authenticate user credentials.
   * Hits BASE_URL_LOGIN + 'login' without token.
   * 
   * @param {Object} credentials - { username, password }
   * @returns {Promise<Object>} API response payload
   */
  async login(credentials) {
    const payload = {
      username: credentials.username,
      password: credentials.password,
    };
    return await apiLogin.post("login", payload);
  },

  /**
   * Revoke session token and sign out.
   * Hits BASE_URL + 'logout' with token automatically injected in headers.
   * 
   * @param {Object} payload - { m_user_id }
   * @returns {Promise<Object>} API response payload
   */
  async logout(payload) {
    return await api.post("logout", payload);
  },
};
