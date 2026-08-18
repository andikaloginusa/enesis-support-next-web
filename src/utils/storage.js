/**
 * Storage Utility — Centralized localStorage Access Layer
 *
 * Provides a consistent, safe interface for all localStorage operations.
 * Eliminates copy-paste parsing logic across hooks and ensures consistent
 * key naming, error handling, and SSR-safety (window guard).
 *
 * Pattern: Module Pattern with explicit public interface.
 */

const KEYS = {
  USER_CREDENTIALS: "user_credent",
  CHANGE_CREDENTIALS: "change_credent",
};

/** @returns {boolean} true if running in browser context */
const isBrowser = () => typeof window !== "undefined";

// ─────────────────────────────────────────────
// User Credentials
// ─────────────────────────────────────────────

/**
 * Retrieve and parse user credentials from localStorage.
 * @returns {{ m_user_id: string, employee_id: string, nik: string, access_token: string } | null}
 */
export const getUserCredentials = () => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.USER_CREDENTIALS);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("[storage] Failed to parse user credentials:", err);
    return null;
  }
};

/**
 * Retrieve only the user ID from stored credentials.
 * Supports both `m_user_id` and `id` field formats.
 * @returns {string}
 */
export const getUserId = () => {
  const creds = getUserCredentials();
  return creds?.m_user_id || creds?.id || "";
};

/**
 * Retrieve the auth token from stored credentials.
 * Supports both `access_token` and `token` field formats.
 * @returns {string}
 */
export const getUserToken = () => {
  const creds = getUserCredentials();
  return creds?.access_token || creds?.token || "";
};

/**
 * Persist user credentials to localStorage.
 * @param {Object} data - Credentials object to serialize and store
 */
export const setUserCredentials = (data) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEYS.USER_CREDENTIALS, JSON.stringify(data));
  } catch (err) {
    console.error("[storage] Failed to save user credentials:", err);
  }
};

/**
 * Remove user credentials from localStorage.
 */
export const clearUserCredentials = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.USER_CREDENTIALS);
};

// ─────────────────────────────────────────────
// Change / Password Reset Credentials
// ─────────────────────────────────────────────

/**
 * Retrieve and parse change credentials (used during password reset flow).
 * @returns {Object | null}
 */
export const getChangeCredentials = () => {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.CHANGE_CREDENTIALS);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error("[storage] Failed to parse change credentials:", err);
    return null;
  }
};

/**
 * Persist change credentials to localStorage.
 * @param {Object} data - Credential object for password reset flow
 */
export const setChangeCredentials = (data) => {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(KEYS.CHANGE_CREDENTIALS, JSON.stringify(data));
  } catch (err) {
    console.error("[storage] Failed to save change credentials:", err);
  }
};

/**
 * Remove change credentials from localStorage.
 */
export const clearChangeCredentials = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.CHANGE_CREDENTIALS);
};
