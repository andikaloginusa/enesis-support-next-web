import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fkrService } from "@services/fkr.service";
import { useState, useCallback } from "react";
import { getUserId } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess, extractResponseData } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES, API_LABELS } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
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
 * - `assertApiSuccess` for standardized error throwing
 * - `extractResponseData` for normalized payload extraction
 * - `notifySuccess`/`notifyError` for centralized notification handling
 *
 * @param {string|number|null} [fkrId=null] - Optional FKR ID to enable detail query
 */
export const useFkr = (fkrId = null) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // Local candidates state (dynamic per-jabatan caching)
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

      if (candidatesCache[key]) {
        setActiveCandidates(candidatesCache[key]);
        return;
      }

      setIsLoadingCandidates(true);
      try {
        const response = await fkrService.getListUserApproval({ jabatan });
        if (response.ok) {
          const result = extractResponseData(response);
          if (Array.isArray(result)) {
            setCandidatesCache((prev) => ({ ...prev, [key]: result }));
            setActiveCandidates(result);
            setIsLoadingCandidates(false);
            return;
          }
        }
      } catch (err) {
        console.warn(
          `${API_LABELS.FKR} Failed to fetch candidates for jabatan ${jabatan}`,
          err,
        );
      }

      setCandidatesCache((prev) => ({ ...prev, [key]: [] }));
      setActiveCandidates([]);
      setIsLoadingCandidates(false);
    },
    [candidatesCache],
  );

  const clearActiveCandidates = useCallback(() => setActiveCandidates([]), []);

  // Query: Paginated FKR List
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

        if (response.ok) return response.data;
      } catch (err) {
        console.warn(`${API_LABELS.FKR} List API request failed.`, err);
      }

      return { results: [], meta: { count: 0 } };
    },
    placeholderData: (prev) => prev,
  });

  // Query: Single FKR Detail
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
        if (response.ok) {
          return extractResponseData(response) ?? response.data;
        }
      } catch (err) {
        console.warn(`${API_LABELS.FKR} Detail API request failed.`, err);
      }
      return null;
    },
  });

  // Mutation: Reject FKR
  const rejectMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.rejectListApprovalFkr(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.REJECT_ERROR);
      return response;
    },
    onSuccess: (response, variables) => {
      notifySuccess(
        NOTIF_MESSAGES.REJECT_SUCCESS,
        response?.data?.message || `FKR berhasil direject dengan alasan: "${variables.reason}"`,
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.fkr.all() });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.REJECT_ERROR, err.message || NOTIF_MESSAGES.REJECT_ERROR, NOTIF_DURATION_MEDIUM);
    },
  });

  // Mutation: Reassign/Update Approver User
  const updateApprovalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.updateListApprovalFkr(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.APPROVAL_UPDATE_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.APPROVAL_UPDATE_SUCCESS,
        response?.data?.message || NOTIF_MESSAGES.APPROVAL_UPDATE_SUCCESS,
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.fkr.detail(fkrId) });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.APPROVAL_UPDATE_ERROR, err.message || NOTIF_MESSAGES.APPROVAL_UPDATE_ERROR, NOTIF_DURATION_MEDIUM);
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
