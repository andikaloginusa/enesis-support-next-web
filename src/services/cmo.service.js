import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

/**
 * CMO Support Services — Factory pattern matching existing service modules.
 *
 * Wraps all backend CMO endpoints. File uploads (replaceTemplate) use authFetch
 * for FormData support; everything else uses the standard api client.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const CmoSupportServices = (apiInstance) => {
  /**
   * Fetch filtered CMO list using combined searchText payload.
   * GET /cmo
   *
   * @param {Object} params - { m_user_id, searchText: "YYYY/KATEGORI/MONTH_ABBREV", currentPage, pageSize }
   */
  const getFilteredList = (params) =>
    apiInstance.get("cmo", params);

  /**
   * Fetch paginated list of CMO records waiting for SAP response.
   * GET /cmo/list-get-sap-cmo
   *
   * @param {Object} params - { bulan, tahun, currentPage, pageSize }
   */
  const getSapWaitingList = (params) =>
    apiInstance.get("cmo/list-get-sap-cmo", params);

  /**
   * Pull SAP return XML for all WAITING CMO records in a period.
   * PUT /cmo/process-sap-cmo
   *
   * @param {Object} data - { tahun, bulan, m_user_id }
   */
  const processSapCMO = (data) =>
    apiInstance.put("cmo/process-sap-cmo", data);

  /**
   * Pull SAP return XML for all WAITING C-Order records in a period.
   * PUT /cmo/process-sap-c-order
   *
   * @param {Object} data - { tahun, bulan }
   */
  const processSapCOrder = (data) =>
    apiInstance.put("cmo/process-sap-c-order", data);

  /**
   * Generate C-Order records from CMO data for a specific week.
   * POST /cmo/regenerate-c-order
   *
   * @param {Object} data - { tahun, bulan, week_number }
   */
  const regenerateCOrder = (data) =>
    apiInstance.post("cmo/regenerate-c-order", data);

  /**
   * Reject or kill a single CMO record.
   * POST /cmo/reject-or-kill-cmo
   *
   * @param {Object} data - { cmo_id, action: "reject"|"kill", m_user_id }
   */
  const rejectOrKillCMO = (data) =>
    apiInstance.post("cmo/reject-or-kill-cmo", data);

  /**
   * Upload a new Excel template and update its version in the database.
   * Uses FormData (authFetch) because the payload includes a binary file.
   * POST /cmo/replace-template
   *
   * @param {Object} payload - { tipe_template, version, file }
   */
  const replaceTemplate = ({ tipe_template, version, file }) => {
    const formData = new FormData();
    formData.append("tipe_template", tipe_template);
    formData.append("version", version);
    formData.append("document", file); // Key "document" is required by backend
    return authFetch("POST", "cmo/replace-template", { body: formData });
  };

  return {
    getFilteredList,
    getSapWaitingList,
    processSapCMO,
    processSapCOrder,
    regenerateCOrder,
    rejectOrKillCMO,
    replaceTemplate,
  };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const cmoService = CmoSupportServices(api);
