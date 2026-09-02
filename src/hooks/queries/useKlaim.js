import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_SHORT, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";

/**
 * useKlaim — Custom React Query Hook for Proposal Claims (Klaim) Module
 *
 * Manages paginated list, delete log submit, and status update mutations.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `queryKeys.klaim.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing in mutations
 * - `useNotify` for centralized notification handling
 */
export const useKlaim = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // Query: Paginated Klaim List
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.klaim.list(params),
    queryFn: async () => {
      const response = await klaimService.getListKlaim({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        searchText: params.searchText,
      });

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_CLAIMS_ERROR);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Delete Log Submit
  const deleteMutation = useMutation({
    mutationFn: async (nomor_klaim) => {
      const response = await klaimService.deleteLogSubmitKlaim({ nomor_klaim });
      assertApiSuccess(response, NOTIF_MESSAGES.DELETE_LOG_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.SUCCESS,
        response.data?.message || NOTIF_MESSAGES.DELETE_LOG_SUCCESS,
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.klaim.all() });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.ERROR, err.message || NOTIF_MESSAGES.DELETE_LOG_ERROR, NOTIF_DURATION_MEDIUM);
    },
  });

  // Mutation: Update Klaim Status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await klaimService.updateStatusKlaim(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.UPDATE_STATUS_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.SUCCESS,
        response.data?.message || NOTIF_MESSAGES.UPDATE_STATUS_SUCCESS,
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.klaim.all() });
    },
    onError: (err) => {
      notifyError(NOTIF_MESSAGES.ERROR, err.message || NOTIF_MESSAGES.UPDATE_STATUS_ERROR, NOTIF_DURATION_MEDIUM);
    },
  });

  return {
    // List Query
    klaimList: data?.results || [],
    totalCount: data?.meta?.count || 0,
    isListFetching: isLoading || isFetching,
    refetchList: refetch,
    error,
    params,

    // Mutations
    deleteLogSubmit: deleteMutation.mutateAsync,
    updateStatusKlaim: updateStatusMutation.mutateAsync,

    // Loading states
    loadingDelete: deleteMutation.isPending,
    loadingUpdateStatus: updateStatusMutation.isPending,

    // Pagination & Search controls
    handlePaginationChange,
    handleSearchChange,
  };
};
