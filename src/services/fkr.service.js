import { api } from "./api";

/**
 * Higher-order factory function to instantiate FKR Support Services.
 * Allows custom API client injection for testing or isolation.
 *
 * @param {Object} apiInstance - Axios/lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const ListFKRApprovalServices = (apiInstance) => {
  /**
   * Fetch paginated and filtered list of FKR entries
   * @param {Object} data - Search, pagination, and filter parameters
   */
  const getListApprovalFkr = (data) => apiInstance.get("fkr", data);

  /**
   * Fetch single FKR entry detail
   * @param {string|number} data - FKR ID parameter
   * @param {Object} [data2] - Additional query filters
   */
  const getDetailListFkr = (data, data2) => apiInstance.get(`fkr/${data}`, data2);

  /**
   * Reject FKR entry with a formal reason
   * @param {Object} data - Payload containing `{ fkr_id, reason, kode_status, m_user_id }`
   */
  const rejectListApprovalFkr = (data) => apiInstance.put("support/fkr/update/status", data);

  /**
   * Update active user approval assignment
   * @param {Object} data - Payload containing approval updates
   */
  const updateListApprovalFkr = (data) =>
    apiInstance.put("fkr/ubah-user-approval-fkr", data);

  /**
   * Fetch list of available users for FKR approvals
   * @param {Object} [data] - Optional filters
   */
  const getListUserApproval = (data) =>
    apiInstance.get(`fkr/get-user-approval-fkr`, data);

  return {
    getListApprovalFkr,
    getDetailListFkr,
    getListUserApproval,
    rejectListApprovalFkr,
    updateListApprovalFkr,
  };
};

/**
 * Pre-configured singleton instance of FKR Support Services
 * bound to standard authorized client api instance.
 */
export const fkrService = ListFKRApprovalServices(api);
