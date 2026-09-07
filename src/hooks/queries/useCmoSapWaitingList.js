import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmoService } from "@services/cmo.service";
import { queryKeys } from "@/lib/queryKeys";
import { useNotify, NOTIF_DURATION_LONG } from "@/utils/notify";
import { getUserId } from "@/utils/storage";
import { CMO_BULAN_OPTIONS, CMO_TAHUN_OPTIONS } from "@/config/cmoConfig";

/**
 * useCmoSapWaitingList — Hook for the Proses SAP CMO Modal.
 *
 * Manages:
 * - Filter state (tahun, bulan) — controlled by parent via props / internal state
 * - Paginated SAP-waiting CMO list (GET /cmo/list-get-sap-cmo)
 * - Process SAP CMO batch (PUT /cmo/process-sap-cmo)
 *
 * Query is DISABLED by default — caller must call `triggerFetch(tahun, bulan)`
 * to enable and run the query.
 *
 * @param {Object}   [options]
 * @param {Function} [options.onSuccess] - Callback after processSapCMO succeeds
 */
export const useCmoSapWaitingList = (options = {}) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Active filter params — populated when user clicks "Tampilkan"
  const [activeParams, setActiveParams] = useState({
    tahun: "",
    bulan: "",
    currentPage: 1,
    pageSize: 10,
  });

  // Track whether user has clicked "Tampilkan"
  const hasActiveParams = Boolean(activeParams.tahun && activeParams.bulan);

  // Query: SAP-waiting CMO list — only runs when hasActiveParams
  const {
    data: listData,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["cmo", "sap-waiting-list", activeParams],
    queryFn: async () => {
      const response = await cmoService.getSapWaitingList({
        tahun: activeParams.tahun,
        bulan: activeParams.bulan,
        currentPage: activeParams.currentPage,
        pageSize: activeParams.pageSize,
      });
      if (response.ok) return response.data;
      return { data: [], meta: { count: 0 } };
    },
    enabled: hasActiveParams,
    placeholderData: (prev) => prev,
  });

  // Mutation: Process SAP CMO batch
  const processSapCMutation = useMutation({
    mutationFn: async () => {
      const response = await cmoService.processSapCMO({
        tahun: activeParams.tahun,
        bulan: activeParams.bulan,
        m_user_id: getUserId(),
      });
      return response;
    },
    onSuccess: (response) => {
      const message = response?.data?.message;
      notifySuccess(
        "Proses SAP CMO Berhasil",
        typeof message === "object" ? message?.detail : message || "Proses selesai.",
        NOTIF_DURATION_LONG,
      );
      refetch();
      if (typeof options?.onSuccess === "function") options.onSuccess();
    },
    onError: (err) => {
      notifyError(
        "Proses SAP CMO Gagal",
        err.message || "Terjadi kesalahan saat memproses SAP CMO.",
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Trigger fetch with new filter values — called when user clicks "Tampilkan"
  const triggerFetch = useCallback((tahun, bulan) => {
    setActiveParams({ tahun, bulan, currentPage: 1, pageSize: 10 });
  }, []);

  // Handle pagination change
  const handlePageChange = useCallback((page, size) => {
    setActiveParams((prev) => ({ ...prev, currentPage: page, pageSize: size }));
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setActiveParams({ tahun: "", bulan: "", currentPage: 1, pageSize: 10 });
  }, []);

  return {
    // Filter options (static)
    CMO_TAHUN_OPTIONS,
    CMO_BULAN_OPTIONS,

    // Active params
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
    isProcessing: processSapCMutation.isPending,

    // Actions
    triggerFetch,
    handlePageChange,
    processSapCMO: processSapCMutation.mutateAsync,
    refetch,
    resetState,
  };
};
