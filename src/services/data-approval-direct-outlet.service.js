import { api } from "./api";

/**
 * Data Approval Direct Outlet Services — Factory pattern matching existing
 * service modules.
 *
 * Response envelope:
 *   - list   → baris pada `result`, paginasi pada `meta` ({ count, page, limit, total_pages })
 *   - detail → payload pada `data`
 *   - update → pesan pada `message`
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const DataApprovalDirectOutletServices = (apiInstance) => {
  /**
   * Fetch a paginated direct outlet approval list.
   * GET /support/data-approval-direct-outlet/get/list?page=&limit=&search=
   *
   * @param {Object} params - { page, limit, search }
   */
  const getList = (params) =>
    apiInstance.get("support/data-approval-direct-outlet/get/list", params);

  /**
   * Fetch a single direct outlet approval record.
   * GET /support/data-approval-direct-outlet/get/detail?data_approval_direct_outlet_id=
   *
   * @param {string} id - data_approval_direct_outlet_id (UUID)
   */
  const getDetail = (id) =>
    apiInstance.get("support/data-approval-direct-outlet/get/detail", {
      data_approval_direct_outlet_id: id,
    });

  /**
   * Update the NIK KAM of a direct outlet approval record.
   * PUT /support/data-approval-direct-outlet/update/nik-kam
   *
   * @param {Object} data - { data_approval_direct_outlet_id, nik_kam }
   */
  const updateNikKam = (data) =>
    apiInstance.put("support/data-approval-direct-outlet/update/nik-kam", data);

  return {
    getList,
    getDetail,
    updateNikKam,
  };
};

/** Pre-configured singleton instance bound to the standard authorized API client. */
export const dataApprovalDirectOutletService =
  DataApprovalDirectOutletServices(api);
