import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "@services/proposal.service";
import { useState } from "react";
import { App } from "antd";
import { getUserCredentials } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { useListParams } from "@/hooks/useListParams";

/**
 * useProposal — Custom React Query Hook for the Proposal Module
 *
 * Manages paginated list, single detail, update data mutation,
 * and delegation (reassign approver) mutation.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search/filter state (DRY)
 * - `storage.getUserCredentials` for consistent localStorage access
 * - `queryKeys.proposal.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing in mutations
 *
 * @param {string|number|null} [proposalId=null] - Optional proposal ID to enable detail query
 */
export const useProposal = (proposalId = null) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  // 1. Shared pagination + search + filter state
  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
  } = useListParams({ division: "", fcstatus: "" });

  // 2. Flag to enable/disable the candidates query (controlled by delegasi modal lifecycle)
  //    Using a boolean instead of jabatan because the API returns all candidates
  //    regardless of position — no jabatan parameter needed.
  const [isCandidatesEnabled, setIsCandidatesEnabled] = useState(false);

  // 3. Candidates Query — fires only when the delegasi modal is open
  const {
    data: candidatesList = [],
    isLoading: isCandidatesLoading,
  } = useQuery({
    queryKey: queryKeys.proposal.candidates(),
    enabled: isCandidatesEnabled,
    // staleTime: 0 — always fetch fresh when modal opens so options are never stale/empty
    staleTime: 0,
    queryFn: async () => {
      const response = await proposalService.getListUserApprovalProposal();
      if (response.ok && response.data) {
        const result =
          response.data.results || response.data.result || response.data;
        if (Array.isArray(result)) return result;
      }
      return [];
    },
  });

  /** Enable candidates query when delegasi modal opens */
  const fetchCandidatesForJabatan = () => {
    setIsCandidatesEnabled(true);
  };

  /** Disable candidates query when delegasi modal closes */
  const clearActiveCandidates = () => {
    setIsCandidatesEnabled(false);
  };

  // 4. Query: Paginated Proposal List
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
          nik: creds?.nik || "",
          employee_id: creds?.employee_id || creds?.employeeId || "",
          searchText: params.searchText,
          division: params.division,
          fcstatus: params.fcstatus,
        });

        if (response.ok && response.data) {
          return response.data;
        }
      } catch (err) {
        console.warn(
          "[useProposal] List request failed, using empty fallback.",
          err,
        );
      }

      return { results: [], meta: { count: 0 } };
    },
    placeholderData: (prev) => prev,
  });

  // 5. Query: Single Proposal Detail
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

        if (response.ok && response.data) {
          return response.data.result || response.data;
        }
      } catch (err) {
        console.warn(
          `[useProposal] Detail request failed for ID ${proposalId}`,
          err,
        );
      }

      return null;
    },
  });

  // 6. Mutation: Update Proposal Data
  const updateProposalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await proposalService.updateProposalData(payload);
      assertApiSuccess(response, "Gagal memperbarui data proposal");
      return response.data;
    },
    onSuccess: (res) => {
      notification.success({
        message: "Sukses",
        description: res?.message || "Data Proposal Berhasil Diperbarui",
        duration: 2,
      });
      // Invalidate both list and current detail to keep cache consistent
      queryClient.invalidateQueries({ queryKey: queryKeys.proposal.all() });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        description: err.message || "Gagal memperbarui data proposal",
        duration: 3,
      });
    },
  });

  // 7. Mutation: Delegasi — Reassign Proposal Approval Step to New Employee
  const delegasiMutation = useMutation({
    mutationFn: async (payload) => {
      // payload: { nip, proposal_approval_id }
      const response = await proposalService.updateApprovalProposal(payload);
      assertApiSuccess(response, "Gagal mendelegasikan approval proposal");
      return response.data;
    },
    onSuccess: (res) => {
      notification.success({
        message: "Delegasi Berhasil",
        description: res?.message || "Approval proposal berhasil didelegasikan",
        duration: 3,
      });
      // Refresh detail to show updated approver info
      queryClient.invalidateQueries({
        queryKey: queryKeys.proposal.detail(proposalId),
      });
      // Clear ALL candidates caches so next modal open always fetches fresh.
      // Without this, reopening the same jabatan served stale empty cache.
      queryClient.removeQueries({
        queryKey: ["proposal", "candidates"],
        exact: false,
      });
    },
    onError: (err) => {
      notification.error({
        message: "Delegasi Gagal",
        description: err.message || "Gagal mendelegasikan approval proposal",
        duration: 3,
      });
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

    // Candidates for Delegasi Modal (React Query managed — no stale/empty bugs)
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
  };
};
