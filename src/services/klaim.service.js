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
   *
   * GET /support/klaim/get-all
   *
   * Supported query params (all optional, send empty string to skip):
   *   currentPage, pageSize, searchText,
   *   kode_status, m_distributor_id, nomor_proposal, nomor_klaim,
   *   accounting_document_number, fiscal_year, jenis_klaim,
   *   dateFrom, dateTo,
   *   sortBy, sortDir
   *
   * Response shape (new endpoint):
   *   {
   *     status, error,
   *     message,
   *     results: KlaimRow[],
   *     meta: { currentPage, pageCount, pageSize, count }
   *   }
   *
   * @param {Object} params - Query filters (currentPage, pageSize, searchText, etc.)
   */
  const getListKlaim = (params) =>
    apiInstance.get("support/klaim/get-all", params);

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
   * Sends multipart/form-data; field name "document" must match the BE Skipper upload key.
   * Pattern reference: `fkr.service.js` → reuploadDocument, uploadFkrPemusnahan.
   *
   * PUT /support/klaim/reupload-dokumen-klaim
   *
   * FormData fields (semua wajib):
   *   - m_user_id      : ID user yang melakukan aksi (dari storage/getUserId)
   *   - klaim_id       : ID record klaim target
   *   - document_type  : Tipe dokumen — salah satu key di KLAIM_DOC_CONFIG
   *                      (e.g. "faktur_pajak", "e_proposal", "ktp", "invoice", dll.)
   *   - reason         : Nomor Work Order (WO) sebagai alasan/justifikasi audit log
   *   - document       : File PDF baru (sudah divalidasi FE — tipe & ukuran)
   *
   * @param {Object}  payload
   * @param {string}  payload.m_user_id       - ID user terautentikasi
   * @param {string}  payload.klaim_id       - Target klaim record ID
   * @param {string}  payload.document_type  - Salah satu key di KLAIM_DOC_CONFIG
   * @param {string}  payload.reason         - Nomor Work Order (WO)
   * @param {File}    payload.document       - File PDF yang sudah divalidasi FE-side
   */
  const reuploadDokumenKlaim = ({ klaim_id, document_type, reason, document, m_user_id }) => {
    const formData = new FormData();
    formData.append("m_user_id", m_user_id);
    formData.append("klaim_id", klaim_id);
    formData.append("document_type", document_type);
    formData.append("reason", reason);
    formData.append("document", document);
    return authFetch("PUT", "support/klaim/reupload-dokumen-klaim", { body: formData });
  };

  /**
   * Fetch full detail of a single klaim record.
   * GET /support/klaim/get-detail?klaim_id=...
   *
   * Returns: { result: { klaim_v_id, details[], logSubmit[], lines[], ... } }
   *
   * @param {Object} params
   * @param {string} params.klaim_id - Target klaim record ID
   */
  const getKlaimDetail = (params) =>
    apiInstance.get("support/klaim/get-detail", params);

  return {
    getListKlaim,
    deleteLogSubmitKlaim,
    updateStatusKlaim,
    reuploadDokumenKlaim,
    getKlaimDetail,
  };
};

/**
 * Pre-configured singleton instance of Klaim Support Services
 * bound to the standard authorized API client.
 */
export const klaimService = KlaimSupportServices(api);
