import { api } from "./api";

/**
 * Higher-order factory function to instantiate Klaim Support Services.
 * Allows custom API client injection for testing or isolation.
 * Consistent with the Factory Pattern used in `fkr.service.js` and `proposal.service.js`.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const KlaimSupportServices = (apiInstance) => {
  /**
   * Fetch the list of proposal claims with pagination, search, and filter queries.
   * @param {Object} params - Query filters (e.g., currentPage, pageSize, searchText)
   */
  const getListKlaim = (params) =>
    apiInstance.get("proposalklaim/list", params);

  /**
   * Delete submit log for a specific claim.
   * @param {Object} data - Payload containing `{ nomor_klaim }`
   */
  const deleteLogSubmitKlaim = (data) =>
    apiInstance.delete("proposalklaim/deleteLogSubmit", data);

  /**
   * Update claim status dynamically.
   * @param {Object} data - Payload containing `{ m_user_id, klaim_id, kode_status_baru, reason }`
   */
  const updateStatusKlaim = (data) =>
    apiInstance.put("support/klaim/update-status", data);

  return {
    getListKlaim,
    deleteLogSubmitKlaim,
    updateStatusKlaim,
  };
};

/**
 * Pre-configured singleton instance of Klaim Support Services
 * bound to the standard authorized API client.
 */
export const klaimService = KlaimSupportServices(api);
