import { api } from "./api";

/**
 * Klaim Support Service API Layer
 * Consumes the dynamically-authenticated API client for safe, robust requests.
 */
export const klaimService = {
  /**
   * Fetch the list of proposal claims with pagination, search, and filter queries
   * @param {Object} params - Query filters (e.g., currentPage, pageSize, searchText)
   */
  getListKlaim: (params) => api.get("proposalklaim/list", params),

  /**
   * Delete submit log for a specific claim
   * @param {Object} data - Payload containing `{ nomor_klaim }`
   */
  deleteLogSubmitKlaim: (data) => api.delete("proposalklaim/deleteLogSubmit", data),

  /**
   * Update claim status dynamically
   * @param {Object} data - Payload containing `{ m_user_id, klaim_id, kode_status_baru, reason }`
   */
  updateStatusKlaim: (data) => api.post("support/klaim/update-status", data),
};
