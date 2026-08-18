import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fkrService } from "@services/fkr.service";
import { useState, useCallback } from "react";
import { App } from "antd";
import { getUserId } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess, extractApiError } from "@/utils/errorHelpers";
import { useListParams } from "@/hooks/useListParams";

/**
 * useFkr — Custom React Query Hook for FKR Support Module
 *
 * Manages paginated list, single detail, reject action, candidates list,
 * and approval updates for the Formulir Klaim Ritel (FKR) module.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `storage.getUserId` for consistent localStorage access
 * - `queryKeys.fkr.*` for centralized cache key management
 * - `assertApiSuccess` / `extractApiError` for standardized error handling
 *
 * @param {string|number|null} [fkrId=null] - Optional FKR ID to enable detail query
 */
export const useFkr = (fkrId = null) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  // 1. Shared pagination + search state (composed, not copy-pasted)
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // 2. Local candidates state (dynamic per-jabatan caching)
  const [candidatesCache, setCandidatesCache] = useState({});
  const [activeCandidates, setActiveCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  /**
   * Fetch and cache approval candidates for a given jabatan (position).
   * Uses an in-component cache to avoid redundant API calls within a session.
   *
   * @param {string} jabatan - Position/role identifier
   */
  const fetchCandidatesForJabatan = useCallback(
    async (jabatan) => {
      if (!jabatan) return;
      const key = jabatan.toUpperCase();

      // Return instantly from local state cache if already fetched
      if (candidatesCache[key]) {
        setActiveCandidates(candidatesCache[key]);
        return;
      }

      setIsLoadingCandidates(true);
      try {
        const response = await fkrService.getListUserApproval({ jabatan });
        if (response.ok && response.data) {
          const result = response.data.results || response.data.result || response.data;
          if (Array.isArray(result)) {
            setCandidatesCache((prev) => ({ ...prev, [key]: result }));
            setActiveCandidates(result);
            setIsLoadingCandidates(false);
            return;
          }
        }
      } catch (err) {
        console.warn(`[useFkr] Failed to fetch candidates for jabatan ${jabatan}`, err);
      }

      setCandidatesCache((prev) => ({ ...prev, [key]: [] }));
      setActiveCandidates([]);
      setIsLoadingCandidates(false);
    },
    [candidatesCache]
  );

  const clearActiveCandidates = useCallback(() => {
    setActiveCandidates([]);
  }, []);

  // 3. Query: Paginated FKR List
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.fkr.list(params),
    queryFn: async () => {
      try {
        const response = await fkrService.getListApprovalFkr({
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          m_user_id: getUserId(),
          searchText: params.searchText,
        });

        if (response.ok && response.data) {
          return response.data;
        }
      } catch (err) {
        console.warn("[useFkr] List API request failed, using empty fallback.", err);
      }

      return { results: [], meta: { count: 0 } };
    },
    placeholderData: (prev) => prev,
  });

  // 4. Query: Single FKR Detail
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: queryKeys.fkr.detail(fkrId),
    enabled: !!fkrId,
    queryFn: async () => {
      try {
        const response = await fkrService.getDetailListFkr(fkrId);
        if (response.ok && response.data) {
          return response.data.result || response.data;
        }
      } catch (err) {
        console.warn("[useFkr] Detail API request failed.", err);
      }
      return null;
    },
  });

  // 5. Mutation: Reject FKR
  const rejectMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.rejectListApprovalFkr(payload);
      assertApiSuccess(response, "Gagal melakukan penolakan FKR");
      return response;
    },
    onSuccess: (response, variables) => {
      notification.success({
        message: "Reject Berhasil",
        description:
          response?.data?.message ||
          `FKR berhasil direject dengan alasan: "${variables.reason}"`,
        duration: 3,
      });
      // Invalidate entire fkr scope to refresh both list and current detail
      queryClient.invalidateQueries({ queryKey: queryKeys.fkr.all() });
    },
    onError: (err) => {
      notification.error({
        message: "Reject Gagal",
        description: err.message || "Gagal melakukan penolakan FKR",
        duration: 3,
      });
    },
  });

  // 6. Mutation: Reassign/Update Approver User
  const updateApprovalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.updateListApprovalFkr(payload);
      assertApiSuccess(response, "Gagal memperbarui user approval FKR");
      return response;
    },
    onSuccess: (response) => {
      notification.success({
        message: "Approval Diperbarui",
        description: response?.data?.message || "User approval FKR berhasil diperbarui",
        duration: 3,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.fkr.detail(fkrId) });
    },
    onError: (err) => {
      notification.error({
        message: "Update Gagal",
        description: err.message || "Gagal memperbarui user approval FKR",
        duration: 3,
      });
    },
  });

  return {
    // List Query
    fkrList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Detail Query
    fkrDetail: detailData || null,
    isDetailLoading,
    refetchDetail,

    // Candidates
    candidatesList: activeCandidates,
    isCandidatesLoading: isLoadingCandidates,
    fetchCandidatesForJabatan,
    clearActiveCandidates,

    // Pagination & Search
    params,
    handlePaginationChange,
    handleSearchChange,

    // Mutations
    rejectFkr: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,

    updateApprover: updateApprovalMutation.mutateAsync,
    isUpdatingApprover: updateApprovalMutation.isPending,
  };
};
