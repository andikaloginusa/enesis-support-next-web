import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

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
   * Delete submit log for a specific claim via query parameter.
   * DELETE /support/klaim/delete-log-submit?klaim_id=...
   * @param {Object|string|number} params - Query params containing `{ klaim_id }` or raw klaim_id
   */
  const deleteLogSubmitKlaim = (params) => {
    const query =
      typeof params === "object" && params !== null
        ? params
        : { klaim_id: params };
    return apiInstance.delete("support/klaim/delete-log-submit", query);
  };

  /**
   * Update claim status dynamically.
   * @param {Object} data - Payload containing `{ m_user_id, klaim_id, kode_status_baru, reason }`
   */
  const updateStatusKlaim = (data) =>
    apiInstance.put("support/klaim/update-status", data);

  /**
   * Re-upload a single document for an existing klaim record.
   * Sends FormData so the file is transmitted as multipart/form-data.
   *
   * PUT /support/klaim/reupload-dokumen-klaim
   *
   * @param {Object} payload
   * @param {string}   payload.klaim_id     - Target klaim record ID
   * @param {string}   payload.document_type - Document type key (e.g. "faktur_pajak")
   * @param {string}   payload.reason       - Nomor Work Order (WO) as audit log
   * @param {File}     payload.document    - The new file to upload
   */
  const reuploadDokumenKlaim = ({ klaim_id, document_type, reason, document }) => {
    const formData = new FormData();
    formData.append("klaim_id", klaim_id);
    formData.append("document_type", document_type);
    formData.append("reason", reason);
    formData.append("document", document);
    return authFetch("PUT", "support/klaim/reupload-dokumen-klaim", { body: formData });
  };

  return {
    getListKlaim,
    deleteLogSubmitKlaim,
    updateStatusKlaim,
    reuploadDokumenKlaim,
  };
};

/**
 * Pre-configured singleton instance of Klaim Support Services
 * bound to the standard authorized API client.
 */
export const klaimService = KlaimSupportServices(api);
