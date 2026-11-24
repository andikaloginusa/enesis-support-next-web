import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  dataApprovalDirectOutletService,
  extractOutletRows,
  extractOutletTotal,
} from "@services/data-approval-direct-outlet.service";
import { queryKeys } from "@/lib/queryKeys";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { extractApiError } from "@/utils/errorHelpers";

/**
 * useDataApprovalDirectOutlet — Custom React Query Hook for the Data Approval
 * Direct Outlet module.
 *
 * Mengelola daftar approval direct outlet (server-side pagination + search)
 * dan pembaruan NIK KAM pada satu baris.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `queryKeys.dataApprovalDirectOutlet.*` for centralized cache key management
 * - `notifySuccess`/`notifyError` for centralized notification handling
 */
export const useDataApprovalDirectOutlet = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // Backend memakai `page`/`limit`/`search`, repo memakai
  // `currentPage`/`pageSize`/`searchText` — dipetakan eksplisit di sini.
  const requestParams = {
    page: params.currentPage,
    limit: params.pageSize,
    ...(params.searchText ? { search: params.searchText } : {}),
  };

  // Query: Paginated Direct Outlet list
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.dataApprovalDirectOutlet.list(requestParams),
    queryFn: async () => {
      const response = await dataApprovalDirectOutletService.getList(
        requestParams,
      );

      if (!response?.ok) {
        throw new Error(
          extractApiError(
            response,
            NOTIF_MESSAGES.FETCH_DATA_APPROVAL_DIRECT_OUTLET_ERROR,
          ),
        );
      }

      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Update NIK KAM
  const updateNikKamMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await dataApprovalDirectOutletService.updateNikKam(
        payload,
      );

      if (!response?.ok) {
        throw new Error(
          extractApiError(
            response,
            NOTIF_MESSAGES.UPDATE_DATA_APPROVAL_DIRECT_OUTLET_ERROR,
          ),
        );
      }

      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPDATE_DATA_APPROVAL_DIRECT_OUTLET_SUCCESS,
        response?.data?.message || "NIK KAM berhasil diperbarui.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({
        queryKey: queryKeys.dataApprovalDirectOutlet.all(),
      });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPDATE_DATA_APPROVAL_DIRECT_OUTLET_ERROR,
        err.message || NOTIF_MESSAGES.UPDATE_DATA_APPROVAL_DIRECT_OUTLET_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Baris & total dibaca lewat extractor karena envelope response endpoint ini
  // berbeda dari modul lain di repo ini.
  const rows = extractOutletRows(listData);
  const totalCount = extractOutletTotal(listData);

  return {
    // List Query
    outletList: Array.isArray(rows) ? rows : [],
    totalCount,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Pagination & Search
    params,
    handlePaginationChange,
    handleSearchChange,

    // Mutations
    updateNikKam: updateNikKamMutation.mutateAsync,
    isUpdatingNikKam: updateNikKamMutation.isPending,
  };
};
