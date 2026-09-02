/**
 * Error Helpers — Centralized API Error Extraction
 *
 * Standardizes the way error messages and data are extracted from API responses
 * across all service hooks and mutations, avoiding repetitive chained
 * optional access patterns scattered throughout the codebase.
 *
 * Pattern: Pure utility functions (no side effects).
 */

// ─────────────────────────────────────────────
// Error Extraction
// ─────────────────────────────────────────────

/**
 * Extract a human-readable error message from an API response object.
 * Tries multiple known response shapes before falling back to the provided default.
 *
 * @param {Object|null|undefined} response - The API response object
 * @param {string} [fallback="Terjadi kesalahan. Silakan coba lagi."] - Fallback message
 * @returns {string}
 *
 * @example
 * // In a useMutation onError or throw:
 * throw new Error(extractApiError(response, "Gagal memperbarui data"));
 */
export const extractApiError = (response, fallback = "Terjadi kesalahan. Silakan coba lagi.") => {
  return (
    response?.data?.message ||
    response?.data?.error ||
    response?.problem ||
    response?.error ||
    fallback
  );
};

/**
 * Check if a TanStack Query / API response is a failed response.
 * Returns true for non-ok responses, null/undefined, or network errors.
 *
 * @param {Object|null|undefined} response - Raw API response
 * @returns {boolean}
 */
export const isApiError = (response) => !response?.ok;

// ─────────────────────────────────────────────
// Success Assertion
// ─────────────────────────────────────────────

/**
 * Assert that a response is successful, throwing an Error if not.
 * Intended for use inside `mutationFn` to trigger React Query's `onError` handler.
 *
 * @param {Object} response - Raw API response
 * @param {string} fallback - Error message used when extraction fails (effectively required)
 * @throws {Error} if response.ok is false
 *
 * @example
 * mutationFn: async (payload) => {
 *   const response = await fkrService.rejectListApprovalFkr(payload);
 *   assertApiSuccess(response, "Gagal melakukan penolakan FKR");
 *   return response;
 * }
 */
export const assertApiSuccess = (response, fallback) => {
  if (isApiError(response)) {
    throw new Error(extractApiError(response, fallback));
  }
};

// ─────────────────────────────────────────────
// Data Extraction
// ─────────────────────────────────────────────

/**
 * Extract the payload data from an API response, trying multiple common shapes.
 * Returns null if no usable data is found.
 *
 * Supported shapes:
 *   - { ok: true, data: { results: [...] } }
 *   - { ok: true, data: { result: [...] } }
 *   - { ok: true, data: [...] }
 *
 * @param {Object} response - A successful API response (always check `isApiError` first)
 * @returns {*} The extracted data payload, or null
 *
 * @example
 * const data = extractResponseData(response);
 * if (Array.isArray(data)) { ... }
 */
export const extractResponseData = (response) => {
  if (!response?.data) return null;
  const d = response.data;
  if (Array.isArray(d)) return d;
  return d.results ?? d.result ?? d;
};
