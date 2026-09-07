import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { cmoService } from "@services/cmo.service";
import { useNotify, NOTIF_DURATION_LONG } from "@/utils/notify";
import { getUserId } from "@/utils/storage";
import { CMO_BULAN_OPTIONS, CMO_TAHUN_OPTIONS } from "@/config/cmoConfig";

/**
 * useCmoSapCOrderWaitingList — Hook for the Proses SAP C-Order Modal.
 *
 * Manages:
 * - Filter state (tahun, bulan)
 * - Process SAP C-Order batch (PUT /cmo/process-sap-c-order)
 * - Loading / result state for UX feedback
 *
 * @param {Object}   [options]
 * @param {Function} [options.onSuccess] - Callback after processSapCOrder succeeds
 */
export const useCmoSapCOrderWaitingList = (options = {}) => {
  const { notifySuccess, notifyError } = useNotify();

  // Local filter state
  const [filterTahun, setFilterTahun] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  const canProcess = Boolean(filterTahun && filterBulan);

  // Mutation: Process SAP C-Order batch
  const processSapCOrderMutation = useMutation({
    mutationFn: async () => {
      const response = await cmoService.processSapCOrder({
        tahun: filterTahun,
        bulan: filterBulan,
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

  const handleTahunChange = useCallback((val) => setFilterTahun(val), []);
  const handleBulanChange = useCallback((val) => setFilterBulan(val), []);

  const resetFilters = useCallback(() => {
    setFilterTahun("");
    setFilterBulan("");
  }, []);

  return {
    // Filter options (static)
    CMO_TAHUN_OPTIONS,
    CMO_BULAN_OPTIONS,

    // Filter state
    filterTahun,
    filterBulan,
    handleTahunChange,
    handleBulanChange,
    canProcess,

    // States
    isProcessing: processSapCOrderMutation.isPending,
    result: processSapCOrderMutation.data,

    // Actions
    processSapCOrder: processSapCOrderMutation.mutateAsync,
    resetFilters,
  };
};
