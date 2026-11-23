import { api } from "./api";

/**
 * Submit Faktur Support Services — Factory pattern matching existing service modules.
 *
 * Response envelope (Sails `api/responses/success.js`):
 *   - payload tanpa key `result` → `data`
 *   - error 1-argumen (`res.error({...})`) → HTTP 500, pesan asli ada di `meta.message`
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const SubmitFakturServices = (apiInstance) => {
  /**
   * Fetch a paginated Submit Faktur invoice list.
   * GET /support/submit-faktur/get/
   *
   * Filter yang didukung backend: `currentPage`, `pageSize`, `searchText`,
   * `periode` (YYYY-MM), `status` (kode_status), `transporter` (m_transporter_id),
   * `m_user_id` (scope organisasi).
   *
   * @param {Object} params - { currentPage, pageSize, searchText, periode, status, transporter, m_user_id }
   */
  const getList = (params) => apiInstance.get("support/submit-faktur/get/", params);

  /**
   * Fetch a single invoice detail.
   * GET /support/submit-faktur/get/:c_invoice_id
   *
   * @param {string} cInvoiceId - c_invoice_id (UUID)
   */
  const getDetail = (cInvoiceId) =>
    apiInstance.get(`support/submit-faktur/get/${cInvoiceId}`);

  /**
   * Update a single invoice.
   * PATCH /support/submit-faktur/update/:c_invoice_id
   *
   * `kode_status` hanya boleh dikirim bersamaan dengan `status`.
   *
   * @param {string} cInvoiceId - c_invoice_id (UUID)
   * @param {Object} data - { status, kode_status, reason_reject, tanggal_invoice, tanggal_faktur, payment_term }
   */
  const updateInvoice = (cInvoiceId, data) =>
    apiInstance.patch(`support/submit-faktur/update/${cInvoiceId}`, data);

  return {
    getList,
    getDetail,
    updateInvoice,
  };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const submitFakturService = SubmitFakturServices(api);
