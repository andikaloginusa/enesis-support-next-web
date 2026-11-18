import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * useBundleReadyInvoice — Query daftar bundle yang siap di-invoice / error validation.
 *
 * Endpoint ini mewajibkan `kode_transporter` (username user ber-role TRANSPORTER),
 * bukan `m_user_id`. Parameter `searchText` mempersempit pemeriksaan di server
 * (hanya mencocokkan `nomor_id`) sehingga scan SAP jauh lebih cepat.
 *
 * Backend response:
 * {
 *   "status": 200,
 *   "error": false,
 *   "message": "3 data error ditemukan.",
 *   "result": {
 *     "data": {
 *       "error": [ ... ]
 *     }
 *   },
 *   "meta": { "total": 3 }
 * }
 *
 * Cache di sini sengaja dibuat panjang karena setiap request memicu panggilan
 * SOAP ke SAP (bisa memakan waktu puluhan detik):
 * - `staleTime` 5 menit  → pindah halaman / buka ulang tidak langsung memanggil SAP
 * - `gcTime` 30 menit   → data tetap tersedia walau sempat tidak dipakai
 * - `refetchOnWindowFocus` dimatikan → berpindah tab tidak memicu scan ulang
 *
 * Catatan: `placeholderData` sengaja TIDAK dipakai. Data dari transporter
 * sebelumnya tidak boleh tampil di bawah label transporter yang lain.
 *
 * @param {Object}   [options]
 * @param {string}   [options.kodeTransporter] - Kode transporter (username user transporter)
 * @param {string}   [options.searchText]      - Kata kunci nomor ID untuk mempersempit pemeriksaan
 * @param {boolean}  [options.enabled]         - Aktif/nonaktifkan query
 */
export const useBundleReadyInvoice = ({
  kodeTransporter = "",
  searchText = "",
  enabled = false,
} = {}) => {
  const cleanSearch = searchText?.trim() || "";
  const params = {
    kode_transporter: kodeTransporter,
    ...(cleanSearch ? { searchText: cleanSearch } : {}),
  };

  const { data, isLoading, isFetching, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: queryKeys.deliveryOrder.bundleReady(params),
    queryFn: async () => {
      const response = await deliveryOrderService.getBundleReady(params);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_BUNDLE_READY_ERROR);
      if (response.data?.error) {
        throw new Error(
          response.data?.message || NOTIF_MESSAGES.FETCH_BUNDLE_READY_ERROR
        );
      }
      return response.data;
    },
    enabled: enabled && Boolean(kodeTransporter),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const errorRows = useMemo(() => data?.result?.data?.error ?? [], [data]);
  const message = data?.message ?? "";
  const total = data?.meta?.total ?? errorRows.length;

  return {
    errorRows,
    message,
    total,
    // Menjaga kompatibilitas jika ada yang membaca summary / successRows
    summary: null,
    successRows: [],
    /** true ketika respons server sudah diterima (berbeda dari masih loading) */
    hasLiveData: data !== undefined,
    /** timestamp (ms) respons server terakhir diterima */
    dataUpdatedAt,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
