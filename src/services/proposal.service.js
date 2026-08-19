import { api } from "./api";

/**
 * Higher-order factory function to instantiate Proposal Support Services.
 * Allows custom API client injection for testing or isolation.
 *
 * @param {Object} apiInstance - Axios/lightweight fetch client wrapper
 * @returns {Object} Exposed service methods
 */
export const ProposalSupportServices = (apiInstance) => {
  /**
   * Fetch paginated and filtered list of Proposal entries
   * @param {Object} data - Search, pagination, and filter parameters
   */
  const getListProposal = (data) => apiInstance.get("proposal", data);

  /**
   * Fetch single Proposal entry detail
   * @param {string|number} id - Proposal ID parameter
   * @param {Object} query - Query parameters: m_user_id, employee_id
   */
  const getDetailProposal = (id, query) =>
    apiInstance.get(`proposal/${id}`, query);

  /**
   * Update dynamic proposal details (title, objective, background, mechanism, kpi, expired_date)
   * @param {Object} data - Update payload containing proposal_id and fields to modify
   */
  const updateProposalData = (data) =>
    apiInstance.put(
      "support/proposal/update/update-data-header-proposal",
      data,
    );

  /**
   * Delegate/reassign a proposal approval step to a new user (employee).
   * @param {Object} data - Payload: { employee_id_new, proposal_approval_id }
   */
  const updateApprovalProposal = (data) =>
    apiInstance.put("support/proposal/update/approval-list", data);

  /**
   * Fetch list of available employees for proposal approval delegation.
   * @param {Object} [params] - Optional filters (e.g., { jabatan })
   */
  const getListUserApprovalProposal = (params) =>
    apiInstance.get("support/proposal/get/approval-list", params);

  /**
   * Upload Excel file to trigger send-ulang-email for batch proposals.
   * Uses raw fetch (not api client) because multipart/form-data cannot use JSON body.
   * @param {File} file - Excel file selected by the user
   */
  const uploadSendEmailUlang = async (file) => {
    const formData = new FormData();
    formData.append("excel", file);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://apiesales.enesis.com/apigateway/apiesales/";

    let authHeader = {};
    try {
      const credsStr =
        typeof window !== "undefined" && localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        const token = creds.access_token || creds.token;
        if (token) authHeader = { Authorization: `Bearer ${token}` };
      }
    } catch (_) {}

    const response = await fetch(
      `${baseUrl}support/proposal/send-ulang-email`,
      { method: "POST", headers: authHeader, body: formData },
    );
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data, status: response.status };
  };

  /**
   * Upload Excel file for Reversal Internasional batch processing.
   * @param {File} file - Excel file selected by the user
   */
  const uploadReversalInternasional = async (file) => {
    const formData = new FormData();
    formData.append("excel", file);

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://apiesales.enesis.com/apigateway/apiesales/";

    let authHeader = {};
    try {
      const credsStr =
        typeof window !== "undefined" && localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        const token = creds.access_token || creds.token;
        if (token) authHeader = { Authorization: `Bearer ${token}` };
      }
    } catch (_) {}

    const response = await fetch(
      `${baseUrl}support/proposal/upload/reversal-internasional`,
      { method: "POST", headers: authHeader, body: formData },
    );
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data, status: response.status };
  };

  return {
    getListProposal,
    getDetailProposal,
    updateProposalData,
    updateApprovalProposal,
    getListUserApprovalProposal,
    uploadSendEmailUlang,
    uploadReversalInternasional,
  };
};

/**
 * Pre-configured singleton instance of Proposal Support Services
 * bound to standard authorized client api instance.
 */
export const proposalService = ProposalSupportServices(api);
