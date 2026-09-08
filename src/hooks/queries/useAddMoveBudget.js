import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@services/budget.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { useNotify, NOTIF_DURATION_SHORT, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { getUserId } from "@/utils/storage";

/**
 * useAddMoveBudget — Custom React Query Hook for Add and Move Budgeting
 *
 * Manages:
 * - Paginated Budget Allocation List with search & year filtering
 * - Upload Add Budget mutation (Excel file upload)
 * - Upload Move Budget mutation (Excel file upload)
 */
export const useAddMoveBudget = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search + budgetYear state
  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
  } = useListParams({ budgetYear: "" });

  // Query: Paginated Budget List
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.budget.budgetList(params),
    queryFn: async () => {
      const currentUserId = getUserId();
      const response = await budgetService.getBudgetList({
        m_user_id: currentUserId,
        budgetYear: params.budgetYear || "",
        searchText: params.searchText || "",
        currentPage: params.currentPage,
        pageSize: params.pageSize,
      });
      assertApiSuccess(response, "Gagal memuat data Budget");
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Upload Add Budget
  const uploadAddBudgetMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("excel", file);

      const response = await budgetService.uploadAddBudget(formData);
      assertApiSuccess(response, "Gagal menambahkan budget");
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        "Sukses",
        response.data?.message || "Budget berhasil ditambahkan",
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.all() });
    },
    onError: (err) => {
      notifyError(
        "Gagal",
        err.message || "Terjadi kesalahan saat upload Add Budget",
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Mutation: Upload Move Budget
  const uploadMoveBudgetMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("excel", file);

      const response = await budgetService.uploadMoveBudget(formData);
      assertApiSuccess(response, "Gagal memindahkan budget");
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        "Sukses",
        response.data?.message || "Budget berhasil dipindahkan",
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.all() });
    },
    onError: (err) => {
      notifyError(
        "Gagal",
        err.message || "Terjadi kesalahan saat upload Move Budget",
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  return {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleYearChange: (year) => handleFilterChange("budgetYear", year),
    budgetData: data,
    isLoading,
    isFetching,
    refetch,

    uploadAddBudget: uploadAddBudgetMutation.mutateAsync,
    isUploadingAdd: uploadAddBudgetMutation.isPending,

    uploadMoveBudget: uploadMoveBudgetMutation.mutateAsync,
    isUploadingMove: uploadMoveBudgetMutation.isPending,
  };
};
