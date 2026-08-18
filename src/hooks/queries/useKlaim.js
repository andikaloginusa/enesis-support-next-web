import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";
import { App } from "antd";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
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
 */
export const useKlaim = () => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  // 1. Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // 2. Query: Paginated Klaim List
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.klaim.list(params),
    queryFn: async () => {
      const response = await klaimService.getListKlaim({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        searchText: params.searchText,
      });

      assertApiSuccess(
        response,
        response?.data?.message || response?.problem || "Failed to retrieve claim list"
      );
      return response.data;
    },
    // Keep previous data when fetching new pages — no layout flicker
    placeholderData: (prev) => prev,
  });

  // 3. Mutation: Delete Log Submit
  const deleteMutation = useMutation({
    mutationFn: async (nomor_klaim) => {
      const response = await klaimService.deleteLogSubmitKlaim({ nomor_klaim });
      assertApiSuccess(response, "Log Submit Gagal Di Hapus");
      return response;
    },
    onSuccess: (response) => {
      notification.success({
        message: "Sukses",
        description: response.data?.message || "Log Submit Berhasil Di Hapus",
        duration: 2,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.klaim.all() });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        description: err.message || "Log Submit Gagal Di Hapus",
        duration: 3,
      });
    },
  });

  // 4. Mutation: Update Klaim Status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await klaimService.updateStatusKlaim(payload);
      assertApiSuccess(response, "Gagal Memperbarui Status Klaim");
      return response;
    },
    onSuccess: (response) => {
      notification.success({
        message: "Sukses",
        description: response.data?.message || "Status Klaim Berhasil Diperbarui",
        duration: 2,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.klaim.all() });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        description: err.message || "Gagal Memperbarui Status Klaim",
        duration: 3,
      });
    },
  });

  return {
    // Queries
    claims: data?.results || [],
    total: data?.meta?.count || 0,
    fetching: isLoading || isFetching,
    error,
    params,
    refetch,

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
