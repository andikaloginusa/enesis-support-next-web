/**
 * Error Helpers — Centralized API Error Extraction
 *
 * Standardizes the way error messages are extracted from API responses
 * across all service hooks and mutations, avoiding repetitive chained
 * optional access patterns scattered throughout the codebase.
 *
 * Pattern: Pure utility functions (no side effects).
 */

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
 * @param {Object} response - Raw API response
 * @returns {boolean}
 */
export const isApiError = (response) => !response?.ok;

/**
 * Assert that a response is successful, throwing an Error if not.
 * Intended for use inside `mutationFn` to trigger React Query's `onError` handler.
 *
 * @param {Object} response - Raw API response
 * @param {string} [fallback] - Fallback error message
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
