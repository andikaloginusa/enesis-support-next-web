import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmoService } from "@services/cmo.service";
import { useNotify, NOTIF_DURATION_LONG } from "@/utils/notify";
import { getUserId } from "@/utils/storage";
import { CMO_BULAN_OPTIONS, CMO_TAHUN_OPTIONS } from "@/config/cmoConfig";

/**
 * useCmoSapCOrderWaitingList — Hook for the Proses SAP C-Order Modal.
 *
 * Manages:
 * - Filter state (tahun, bulan) — triggered via triggerFetch
 * - Paginated SAP-waiting C-Order list (GET /support/cmo/get/list-corder-sap)
 * - Process SAP C-Order batch (PUT /cmo/process-sap-c-order)
 *
 * Query is DISABLED by default — caller must call `triggerFetch(tahun, bulan)`
 * to enable and run the query. Mirrors the pattern of useCmoSapWaitingList.
 *
 * @param {Object}   [options]
 * @param {Function} [options.onSuccess] - Callback after processSapCOrder succeeds
 */
export const useCmoSapCOrderWaitingList = (options = {}) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Active filter params — populated when user selects both tahun & bulan
  const [activeParams, setActiveParams] = useState({
    tahun: "",
    bulan: "",
    currentPage: 1,
    pageSize: 10,
  });

  // Track whether user has selected both filters
  const hasActiveParams = Boolean(activeParams.tahun && activeParams.bulan);

  // Query: SAP-waiting C-Order list — only runs when hasActiveParams
  const {
    data: listData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["cmo", "sap-corder-waiting-list", activeParams],
    queryFn: async () => {
      const response = await cmoService.getSapCOrderWaitingList({
        tahun: activeParams.tahun,
        bulan: activeParams.bulan,
        currentPage: activeParams.currentPage,
        pageSize: activeParams.pageSize,
      });
      if (response.ok) {
        // API returns { error, message, results: [...] }
        const results = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];
        return { data: results, meta: { count: results.length } };
      }
      return { data: [], meta: { count: 0 } };
    },
    enabled: hasActiveParams,
    placeholderData: (prev) => prev,
  });

  // Local filter state (used in modal UI controls)
  const [filterTahun, setFilterTahun] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const handleTahunChange = useCallback(
    (val) => {
      setFilterTahun(val);
      if (val && filterBulan) {
        setActiveParams({ tahun: val, bulan: filterBulan, currentPage: 1, pageSize: 10 });
      }
    },
    [filterBulan],
  );

  const handleBulanChange = useCallback(
    (val) => {
      setFilterBulan(val);
      if (val && filterTahun) {
        setActiveParams({ tahun: filterTahun, bulan: val, currentPage: 1, pageSize: 10 });
      }
    },
    [filterTahun],
  );

  // Trigger fetch with new filter values — called when both filters are selected
  const triggerFetch = useCallback((tahun, bulan) => {
    setActiveParams({ tahun, bulan, currentPage: 1, pageSize: 10 });
  }, []);

  // Handle pagination change
  const handlePageChange = useCallback((page, size) => {
    setActiveParams((prev) => ({ ...prev, currentPage: page, pageSize: size }));
  }, []);

  // Reset all state
  const resetFilters = useCallback(() => {
    setActiveParams({ tahun: "", bulan: "", currentPage: 1, pageSize: 10 });
    setFilterTahun("");
    setFilterBulan("");
  }, []);

  // Mutation: Process SAP C-Order batch
  const processSapCOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await cmoService.processSapCOrder({
        tahun: activeParams.tahun,
        bulan: activeParams.bulan,
        m_user_id: getUserId(),
      });
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        "Proses SAP C-Order Berhasil",
        response?.data?.message || "Sinkronisasi selesai.",
        NOTIF_DURATION_LONG,
      );
      refetch();
      if (typeof options?.onSuccess === "function") options.onSuccess();
    },
    onError: (err) => {
      notifyError(
        "Proses SAP C-Order Gagal",
        err.message || "Terjadi kesalahan saat memproses SAP C-Order.",
        NOTIF_DURATION_LONG,
      );
    },
  });

  return {
    // Filter options (static)
    CMO_TAHUN_OPTIONS,
    CMO_BULAN_OPTIONS,

    // Filter state (local UI controls)
    filterTahun,
    filterBulan,
    handleTahunChange,
    handleBulanChange,

    // Active params (used for query & mutation)
    activeParams,
    hasActiveParams,

    // Table data
    sapList: listData?.data || [],
    totalCount: listData?.meta?.count || 0,
    currentPage: listData?.meta?.currentPage || 1,
    pageSize: activeParams.pageSize,

    // States
    isLoading,
    isFetching,
    isProcessing: processSapCOrderMutation.isPending,

    // Actions
    triggerFetch,
    handlePageChange,
    processSapCOrder: processSapCOrderMutation.mutateAsync,
    refetch,
    resetFilters,
  };
};
