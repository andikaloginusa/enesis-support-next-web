import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

/**
 * Partner Bank Services — Factory pattern matching existing service modules.
 *
 * Wraps all backend partner bank (r_partner_bank_key) endpoints.
 * Create/Update send multipart/form-data through authFetch so the backend
 * receives the fields on `req.body`; reads use the standard api client.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const PartnerBankServices = (apiInstance) => {
  /**
   * Fetch a paginated partner bank list.
   * GET /partner-bank?currentPage=&pageSize=&searchText=
   *
   * @param {Object} params - { currentPage, pageSize, searchText }
   */
  const getList = (params) => apiInstance.get("partner-bank", params);

  /**
   * Fetch a single partner bank record.
   * GET /partner-bank/:id
   *
   * @param {string} id - r_partner_bank_key_id
   */
  const getDetail = (id) => apiInstance.get(`partner-bank/${id}`);

  /**
   * Create a new partner bank record.
   * POST /partner-bank (multipart/form-data)
   *
   * @param {Object} data - { kode_cabang, bank_key, bank_account, part_bank_key, reference_details, account_holder }
   */
  const create = (data) =>
    authFetch("POST", "partner-bank", { body: buildFormData(data) });

  /**
   * Update an existing partner bank record.
   * PUT /partner-bank (multipart/form-data)
   *
   * @param {Object} data - { id, kode_cabang, bank_key, bank_account, part_bank_key, reference_details, account_holder }
   */
  const update = (data) =>
    authFetch("PUT", "partner-bank", { body: buildFormData(data) });

  /**
   * Delete a partner bank record.
   * DELETE /partner-bank?id={id}
   *
   * The id is sent in the query string. The backend controller still reads the
   * id from `req.body`, so the same id is mirrored into a JSON body — without
   * it the DELETE runs with `id = undefined` and deletes nothing.
   *
   * @param {string} id - r_partner_bank_key_id
   */
  const remove = (id) =>
    authFetch("DELETE", `partner-bank?id=${encodeURIComponent(id)}`, {
      body: { id },
    });

  return {
    getList,
    getDetail,
    create,
    update,
    remove,
  };
};

/**
 * Build a multipart FormData body from a plain object.
 * Null/undefined values are skipped so the backend never receives "undefined".
 *
 * @param {Object} data
 * @returns {FormData}
 */
function buildFormData(data) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, String(value));
  });

  return formData;
}

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const partnerBankService = PartnerBankServices(api);
