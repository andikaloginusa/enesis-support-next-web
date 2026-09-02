import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

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
   * @param {string|number} id - FKR ID parameter
   * @param {Object} [queryParams] - Additional query parameters
   */
  const getDetailListFkr = (id, queryParams) =>
    apiInstance.get(`fkr/${id}`, queryParams);

  /**
   * Reject FKR entry with a formal reason
   * @param {Object} data - Payload containing `{ fkr_id, reason, kode_status, m_user_id }`
   */
  const rejectListApprovalFkr = (data) =>
    apiInstance.put("support/fkr/update/status", data);

  /**
   * Update active user approval assignment
   * @param {Object} data - Payload containing approval updates
   */
  const updateListApprovalFkr = (data) =>
    apiInstance.put("fkr/ubah-user-approval-fkr", data);

  /**
   * Re-upload a single document attached to an FKR row.
   * Sends multipart/form-data; field name "document" must match the BE
   * Skipper upload key.
   *
   * @param {Object}  payload
   * @param {string|number} payload.fkr_id
   * @param {string}  payload.document_type  - One of the keys in FE FKR_DOCUMENT_TYPES
   * @param {File}    payload.file           - The selected file (already validated FE-side)
   */
  const reuploadDocument = ({ fkr_id, document_type, file }) => {
    const formData = new FormData();
    formData.append("fkr_id", fkr_id);
    formData.append("document_type", document_type);
    formData.append("document", file);
    return authFetch("PUT", "support/fkr/update/re-upload-document", {
      body: formData,
    });
  };

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
    reuploadDocument,
  };
};

/**
 * Pre-configured singleton instance of FKR Support Services
 * bound to standard authorized client api instance.
 */
export const fkrService = ListFKRApprovalServices(api);
