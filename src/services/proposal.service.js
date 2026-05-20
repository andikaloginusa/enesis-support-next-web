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
  const getDetailProposal = (id, query) => apiInstance.get(`proposal/${id}`, query);

  /**
   * Update dynamic proposal details (title, objective, background, mechanism, kpi, expired_date)
   * @param {Object} data - Update payload containing proposal_id and fields to modify
   */
  const updateProposalData = (data) => apiInstance.put("support/proposal/update/update-data", data);

  return {
    getListProposal,
    getDetailProposal,
    updateProposalData,
  };
};

/**
 * Pre-configured singleton instance of Proposal Support Services
 * bound to standard authorized client api instance.
 */
export const proposalService = ProposalSupportServices(api);
