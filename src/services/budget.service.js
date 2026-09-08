import { api } from "./api";
import { authFetch } from "@/utils/authFetch";

/**
 * Higher-order factory function to instantiate Budget Support Services.
 * Covers Reversal Budget (Header & Request detail) and Add & Move Budget endpoints.
 *
 * @param {Object} apiInstance - Lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const BudgetSupportServices = (apiInstance) => {
  // ─── Reversal Budget ────────────────────────────────────────────────────────

  /**
   * Fetch paginated list of Reversal Header entries
   * GET /reversalheader
   * @param {Object} params - { currentPage, pageSize, kodeProses }
   */
  const getReversalHeader = (params) =>
    apiInstance.get("reversalheader", params);

  /**
   * Fetch single Reversal Header details by ID
   * GET /reversalheader/:id
   * @param {string|number} id - reversal_header_id
   */
  const getReversalHeaderById = (id) =>
    apiInstance.get(`reversalheader/${id}`);

  /**
   * Fetch console number for generating process code (tab)
   * GET /consolenumber
   * @param {Object} params - { m_user_id }
   */
  const getConsoleNumber = (params) =>
    apiInstance.get("consolenumber", params);

  /**
   * Upload Reversal Excel file to server storage
   * POST /upload/reversal
   * @param {FormData} formData - Contains m_user_id, tab, nama, excel, excelpath
   */
  const uploadReversal = (formData) =>
    authFetch("POST", "upload/reversal", { body: formData });

  /**
   * Insert Reversal Header history record after file upload
   * POST /insertreversalheader
   * @param {FormData} formData - Contains m_user_id, tab, nama, excel, excelpath
   */
  const insertReversalHeader = (formData) =>
    authFetch("POST", "insertreversalheader", { body: formData });

  /**
   * Fetch list of successful reversal entries for a process code
   * GET /reversalbudget
   * @param {Object} params - { kodeProses, currentPage, pageSize }
   */
  const getReversalSuccess = (params) =>
    apiInstance.get("reversalbudget", params);

  /**
   * Fetch list of rejected reversal entries for a process code
   * GET /reversalreject
   * @param {Object} params - { kodeProses, currentPage, pageSize }
   */
  const getReversalReject = (params) =>
    apiInstance.get("reversalreject", params);

  // ─── Add & Move Budget ──────────────────────────────────────────────────────

  /**
   * Fetch paginated list of Budget allocations
   * GET /budgeting
   * @param {Object} params - { m_user_id, budgetYear, searchText, currentPage, pageSize }
   */
  const getBudgetList = (params) =>
    apiInstance.get("budgeting", params);

  /**
   * Upload Excel file to Add Budget
   * POST /upload/budget/addbudget
   * @param {FormData} formData - Contains excel (file)
   */
  const uploadAddBudget = (formData) =>
    authFetch("POST", "upload/budget/addbudget", { body: formData });

  /**
   * Upload Excel file to Move (Pindah) Budget
   * POST /upload/budget/pindahbudget
   * @param {FormData} formData - Contains excel (file)
   */
  const uploadMoveBudget = (formData) =>
    authFetch("POST", "upload/budget/pindahbudget", { body: formData });

  return {
    getReversalHeader,
    getReversalHeaderById,
    getConsoleNumber,
    uploadReversal,
    insertReversalHeader,
    getReversalSuccess,
    getReversalReject,
    getBudgetList,
    uploadAddBudget,
    uploadMoveBudget,
  };
};

export const budgetService = BudgetSupportServices(api);
