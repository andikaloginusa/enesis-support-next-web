import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";
import { useState, useCallback } from "react";
import { App } from "antd";

/**
 * Custom React Query hook to manage Proposal Claims data and mutations.
 * Fully replaces legacy Redux-Saga files with reactive, debounced caching and clean state mutators.
 */
export const useKlaim = () => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp(); // Safe Ant Design v6 theme-aware notifications context

  // 1. Pagination and Search Filtering State
  const [params, setParams] = useState({
    currentPage: 1,
    pageSize: 10,
    searchText: "",
  });

  // 2. Data Fetching via React Query
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["klaim-list", params],
    queryFn: async () => {
      const response = await klaimService.getListKlaim({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        searchText: params.searchText,
      });

      if (!response.ok) {
        throw new Error(
          response.data?.message || response.problem || "Failed to retrieve claim list"
        );
      }
      return response.data;
    },
    // Keep previous data when fetching new pages for superior UX (no layout flicker)
    placeholderData: (prev) => prev,
  });

  // 3. Delete Log Submit Mutation
  const deleteMutation = useMutation({
    mutationFn: async (nomor_klaim) => {
      const response = await klaimService.deleteLogSubmitKlaim({ nomor_klaim });
      if (!response.ok) {
        throw new Error(response.data?.message || response.problem || "Log Submit Gagal Di Hapus");
      }
      return response;
    },
    onSuccess: (response) => {
      notification.success({
        message: "Sukses",
        title: "Sukses",
        description: response.data?.message || "Log Submit Berhasil Di Hapus",
        duration: 2,
      });
      queryClient.invalidateQueries({ queryKey: ["klaim-list"] });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        title: "Error",
        description: err.message || "Log Submit Gagal Di Hapus",
        duration: 3,
      });
    },
  });

  // 4. Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await klaimService.updateStatusKlaim(payload);
      if (!response.ok) {
        throw new Error(response.data?.message || response.problem || "Gagal Memperbarui Status Klaim");
      }
      return response;
    },
    onSuccess: (response) => {
      notification.success({
        message: "Sukses",
        title: "Sukses",
        description: response.data?.message || "Status Klaim Berhasil Diperbarui",
        duration: 2,
      });
      queryClient.invalidateQueries({ queryKey: ["klaim-list"] });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        title: "Error",
        description: err.message || "Gagal Memperbarui Status Klaim",
        duration: 3,
      });
    },
  });

  // Helper actions to easily update query keys
  const handlePaginationChange = useCallback((page, pageSize) => {
    setParams((prev) => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  const handleSearchChange = useCallback((text) => {
    setParams((prev) => ({
      ...prev,
      searchText: text?.trim(),
      currentPage: 1, // Reset to first page on new search
    }));
  }, []);

  return {
    // Queries
    claims: data?.results || [],
    total: data?.meta?.count || 0,
    fetching: isLoading || isFetching,
    error,
    params,
    refetch,

    // Mutation triggers
    deleteLogSubmit: deleteMutation.mutateAsync,
    updateStatusKlaim: updateStatusMutation.mutateAsync,

    // Loading states
    loadingDelete: deleteMutation.isPending,
    loadingUpdateStatus: updateStatusMutation.isPending,

    // Filter controls
    handlePaginationChange,
    handleSearchChange,
  };
};
