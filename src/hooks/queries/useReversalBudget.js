import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@services/budget.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { useNotify, NOTIF_DURATION_SHORT, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { getUserId } from "@/utils/storage";

/**
 * useReversalBudget — Custom React Query Hook for Reversal Budget (Headers & Detail Requests)
 *
 * Manages:
 * - Paginated Reversal Header history list
 * - Single Reversal Header metadata details
 * - Paginated Reversal Success items
 * - Paginated Reversal Reject items
 * - Upload Reversal mutation (upload file + insert history record)
 *
 * @param {Object} [options]
 * @param {string|number} [options.revheadId] - For Detail view
 * @param {string} [options.kodeProses] - For Detail view (matches success & reject queries)
 */
export const useReversalBudget = (options = {}) => {
  const { revheadId = null, kodeProses = null } = options;
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state for header list
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // ── 1. Query: Paginated Reversal Header List ─────────────────────────────
  const {
    data: headersData,
    isLoading: isHeadersLoading,
    isFetching: isHeadersFetching,
    refetch: refetchHeaders,
  } = useQuery({
    queryKey: queryKeys.budget.reversalHeaders(params),
    queryFn: async () => {
      const response = await budgetService.getReversalHeader({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        kodeProses: params.searchText,
      });
      assertApiSuccess(response, "Gagal memuat data Reversal Header");
      return response.data;
    },
    placeholderData: (prev) => prev,
    enabled: !revheadId,
  });

  // ── 2. Query: Reversal Header Detail by ID ─────────────────────────────────
  const {
    data: headerDetail,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: queryKeys.budget.reversalHeaderDetail(revheadId),
    queryFn: async () => {
      const response = await budgetService.getReversalHeaderById(revheadId);
      assertApiSuccess(response, "Gagal memuat detail Reversal Header");
      return response.data?.results || response.data;
    },
    enabled: Boolean(revheadId),
  });

  // ── 3. Query: Reversal Success Items ──────────────────────────────────────
  const {
    data: successData,
    isLoading: isSuccessLoading,
    refetch: refetchSuccess,
  } = useQuery({
    queryKey: queryKeys.budget.reversalSuccess({ kodeProses }),
    queryFn: async () => {
      const response = await budgetService.getReversalSuccess({
        kodeProses,
        currentPage: 1,
        pageSize: 1000, // Fetch all items for the process batch
      });
      assertApiSuccess(response, "Gagal memuat data Reversal Success");
      return response.data;
    },
    enabled: Boolean(kodeProses),
  });

  // ── 4. Query: Reversal Reject Items ───────────────────────────────────────
  const {
    data: rejectData,
    isLoading: isRejectLoading,
    refetch: refetchReject,
  } = useQuery({
    queryKey: queryKeys.budget.reversalReject({ kodeProses }),
    queryFn: async () => {
      const response = await budgetService.getReversalReject({
        kodeProses,
        currentPage: 1,
        pageSize: 1000, // Fetch all rejected items for the batch
      });
      assertApiSuccess(response, "Gagal memuat data Reversal Reject");
      return response.data;
    },
    enabled: Boolean(kodeProses),
  });

  // ── 5. Mutation: Upload Reversal Budget ────────────────────────────────────
  const uploadReversalMutation = useMutation({
    mutationFn: async ({ nama, file, tab }) => {
      const currentUserId = getUserId();
      const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const fileName = `REVERSE_BUDGET-${currentDate}-${tab}`;

      const formData = new FormData();
      formData.set("m_user_id", currentUserId);
      formData.set("tab", tab);
      formData.set("nama", nama);
      formData.set("excel", file);
      formData.set("excelpath", fileName);

      // Step 1: Upload file to storage
      const uploadRes = await budgetService.uploadReversal(formData);
      assertApiSuccess(uploadRes, "Gagal mengunggah file reversal");

      // Step 2: Insert reversal header history record
      const insertRes = await budgetService.insertReversalHeader(formData);
      assertApiSuccess(insertRes, "Gagal menyimpan riwayat reversal header");

      return uploadRes;
    },
    onSuccess: (response) => {
      notifySuccess(
        "Sukses",
        response.data?.message || "Data Reversal berhasil ditambahkan",
        NOTIF_DURATION_SHORT,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.budget.all() });
    },
    onError: (err) => {
      notifyError(
        "Gagal",
        err.message || "Terjadi kesalahan saat upload reversal",
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  /**
   * Helper to generate a unique process code (tab)
   * @param {string} division
   * @returns {Promise<string>}
   */
  const generateProcessCode = async (division) => {
    try {
      const currentUserId = getUserId();
      await budgetService.getConsoleNumber({ m_user_id: currentUserId });
      const randomSuffix = Math.floor(Math.random() * 1000);
      return `${division || "GT"}_${randomSuffix}`;
    } catch {
      const randomSuffix = Math.floor(Math.random() * 1000);
      return `${division || "GT"}_${randomSuffix}`;
    }
  };

  return {
    // Header List
    params,
    handlePaginationChange,
    handleSearchChange,
    headersData,
    isHeadersLoading,
    isHeadersFetching,
    refetchHeaders,

    // Detail View
    headerDetail,
    isDetailLoading,
    refetchDetail,

    // Success & Reject
    successData,
    isSuccessLoading,
    refetchSuccess,
    rejectData,
    isRejectLoading,
    refetchReject,

    // Actions
    uploadReversal: uploadReversalMutation.mutateAsync,
    isUploading: uploadReversalMutation.isPending,
    generateProcessCode,
  };
};
