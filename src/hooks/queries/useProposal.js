import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "@services/proposal.service";
import { useState } from "react";
import { getUserCredentials } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess, extractResponseData } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES, API_LABELS } from "@/utils/constants";
import {
  useNotify,
  NOTIF_DURATION_SHORT,
  NOTIF_DURATION_MEDIUM,
  NOTIF_DURATION_LONG,
} from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";

/**
 * useProposal — Custom React Query Hook for the Proposal Module
 *
 * Manages paginated list, single detail, update data mutation,
 * delegation (reassign approver), and batch upload mutations.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search/filter state (DRY)
 * - `storage.getUserCredentials` for consistent localStorage access
 * - `queryKeys.proposal.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing
 * - `extractResponseData` for normalized payload extraction
 * - `notifySuccess`/`notifyError` for centralized notification handling
 *
 * @param {string|number|null} [proposalId=null] - Optional proposal ID to enable detail query
 */
export const useProposal = (proposalId = null) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search + filter state
  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
  } = useListParams({ division: "", fcstatus: "" });

  // Flag to enable/disable the candidates query (controlled by delegasi modal lifecycle)
  // The API returns all candidates — no jabatan filter needed.
  const [isCandidatesEnabled, setIsCandidatesEnabled] = useState(false);

  /** Enable candidates query when delegasi modal opens */
  const fetchCandidatesForJabatan = () => setIsCandidatesEnabled(true);

  /** Disable candidates query when delegasi modal closes */
  const clearActiveCandidates = () => setIsCandidatesEnabled(false);

  // Candidates Query — fires only when delegasi modal is open
  const { data: candidatesList = [], isLoading: isCandidatesLoading } = useQuery({
    queryKey: queryKeys.proposal.candidates(),
    enabled: isCandidatesEnabled,
    staleTime: 0,
    queryFn: async () => {
      const response = await proposalService.getListUserApprovalProposal();
      if (response.ok) {
        const result = extractResponseData(response);
        if (Array.isArray(result)) return result;
      }
      return [];
    },
  });

  // Query: Paginated Proposal List
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.proposal.list(params),
    queryFn: async () => {
      const creds = getUserCredentials();
      try {
        const response = await proposalService.getListProposal({
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          nik: creds?.employee_id || "",
          searchText: params.searchText,
          division: params.division,
          fcstatus: params.fcstatus,
        });

        if (response.ok) return response.data;
      } catch (err) {
        console.warn(`${API_LABELS.PROPOSAL} List request failed.`, err);
      }

      return { results: [], meta: { count: 0 } };
    },
    placeholderData: (prev) => prev,
  });

  // Query: Single Proposal Detail
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: queryKeys.proposal.detail(proposalId),
    enabled: !!proposalId,
    queryFn: async () => {
      const creds = getUserCredentials();
      try {
        const response = await proposalService.getDetailProposal(proposalId, {
          m_user_id: creds?.m_user_id || creds?.id || "",
          employee_id: creds?.employee_id || creds?.employeeId || "",
        });

        if (response.ok) {
          return extractResponseData(response) ?? response.data;
        }
      } catch (err) {
        console.warn(
          `${API_LABELS.PROPOSAL} Detail request failed for ID ${proposalId}`,
          err,
        );
      }
      return null;
    },
  });

  // Mutation: Update Proposal Data
  const updateProposalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await proposalService.updateProposalData(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.UPDATE_PROPOSAL_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.SUCCESS,
        res?.message || NOTIF_MESSAGES.UPDATE_PROPOSAL_SUCCESS,
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposal.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.proposal.detail(proposalId) });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.ERROR, err.message || NOTIF_MESSAGES.UPDATE_PROPOSAL_ERROR, NOTIF_DURATION_MEDIUM);
    },
  });

  // Mutation: Delegasi — Reassign Proposal Approval Step
  const delegasiMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await proposalService.updateApprovalProposal(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.DELEGASI_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(NOTIF_MESSAGES.DELEGASI_SUCCESS, res?.message || NOTIF_MESSAGES.DELEGASI_SUCCESS, NOTIF_DURATION_MEDIUM);
      queryClient.invalidateQueries({ queryKey: queryKeys.proposal.detail(proposalId) });
      // Clear all candidates caches so reopening the modal always fetches fresh
      queryClient.removeQueries({ queryKey: ["proposal", "candidates"], exact: false });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.DELEGASI_ERROR, err.message || NOTIF_MESSAGES.DELEGASI_ERROR, NOTIF_DURATION_MEDIUM);
    },
  });

  // Mutation: Upload Send Email Ulang (Excel batch)
  const uploadSendEmailMutation = useMutation({
    mutationFn: async (file) => {
      const response = await proposalService.uploadSendEmailUlang(file);
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_EMAIL_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      const successCount = Array.isArray(res?.detail) ? res.detail.length : 0;
      notifySuccess(
        NOTIF_MESSAGES.EMAIL_RESEND_SUCCESS(successCount),
        res?.message,
        NOTIF_DURATION_LONG,
      );
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.UPLOAD_EMAIL_ERROR, err.message || NOTIF_MESSAGES.EMAIL_RESEND_ERROR, NOTIF_DURATION_LONG);
    },
  });

  // Mutation: Upload Reversal Internasional (Excel batch)
  const uploadReversalMutation = useMutation({
    mutationFn: async (file) => {
      const response = await proposalService.uploadReversalInternasional(file);
      assertApiSuccess(response, NOTIF_MESSAGES.REVERSAL_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(NOTIF_MESSAGES.REVERSAL_SUCCESS, res?.message || NOTIF_MESSAGES.REVERSAL_SUCCESS, NOTIF_DURATION_LONG);
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.UPLOAD_EMAIL_ERROR, err.message || NOTIF_MESSAGES.REVERSAL_ERROR, NOTIF_DURATION_LONG);
    },
  });

  return {
    // List Query
    proposalList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Detail Query
    proposalDetail: detailData || null,
    isDetailLoading,
    refetchDetail,

    // Candidates
    candidatesList,
    isCandidatesLoading,
    fetchCandidatesForJabatan,
    clearActiveCandidates,

    // Pagination, Search & Filter
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,

    // Mutations
    updateProposalData: updateProposalMutation.mutateAsync,
    isUpdatingProposal: updateProposalMutation.isPending,

    delegasiApproval: delegasiMutation.mutateAsync,
    isDelegating: delegasiMutation.isPending,

    uploadSendEmailUlang: uploadSendEmailMutation.mutateAsync,
    isUploadingEmail: uploadSendEmailMutation.isPending,
    uploadEmailResult: uploadSendEmailMutation.data,

    uploadReversalInternasional: uploadReversalMutation.mutateAsync,
    isUploadingReversal: uploadReversalMutation.isPending,
    uploadReversalResult: uploadReversalMutation.data,
  };
};
