import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

/**
 * Delivery Order Support Services — Factory pattern matching existing service modules.
 *
 * Wraps all backend Delivery Order endpoints. The Excel upload uses authFetch
 * for FormData support; the rest use the standard api client.
 *
 * Response envelope notes (Sails `api/responses/success.js`):
 *   - array payload  → `results`
 *   - object payload → `result`
 *   - no result key  → `data`
 *   - error payload  → `meta.data` (per-row details)
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const DeliveryOrderServices = (apiInstance) => {
  /**
   * Fetch a paginated Delivery Order list.
   * GET /support/do/get/
   *
   * `searchText` only matches `bundle_id` or `console_number` on the backend.
   * `limit` caps the total rows scanned (default 200, max 2000) — it is not a page size.
   *
   * @param {Object} params - { currentPage, pageSize, limit, searchText, getAll }
   */
  const getList = (params) => apiInstance.get("support/do/get/", params);

  /**
   * Fetch bundles that are ready to be invoiced.
   * GET /support/do/get/list-bundle-ready
   *
   * `m_user_id` is required — the backend maps it to an m_transporter_id.
   * The response is nested: `result.data.{summary,success,error}`.
   *
   * @param {Object} params - { m_user_id, searchText, currentPage, pageSize, limit, getAll }
   */
  const getBundleReady = (params) =>
    apiInstance.get("support/do/get/list-bundle-ready", params);

  /**
   * Fetch a single Delivery Order with its items, tracking and audit trail.
   * GET /support/do/get/:id
   *
   * @param {string} id - delivery_order_id (UUID)
   */
  const getDetail = (id) => apiInstance.get(`support/do/get/${id}`);

  /**
   * Update the status of a single Delivery Order.
   * PUT /support/do/update/
   *
   * @param {Object} data - { delivery_order_id, kode_status, m_user_id }
   */
  const updateStatus = (data) => apiInstance.put("support/do/update/", data);

  /**
   * Bulk-update Delivery Order statuses via Excel.
   * PUT /support/do/update/excel
   *
   * Sends multipart/form-data; field name "excel" matches the BE Skipper key.
   * Rows are matched on `bundle_id`, not `delivery_order_id`.
   *
   * @param {Object}  payload
   * @param {File}    payload.file      - The Excel file (already validated FE-side)
   * @param {string}  payload.m_user_id - ID of the currently authenticated user
   */
  const updateStatusFromExcel = ({ file, m_user_id }) => {
    const formData = new FormData();
    formData.append("excel", file);
    formData.append("m_user_id", m_user_id);
    return authFetch("PUT", "support/do/update/excel", { body: formData });
  };

  return {
    getList,
    getBundleReady,
    getDetail,
    updateStatus,
    updateStatusFromExcel,
  };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const deliveryOrderService = DeliveryOrderServices(api);
