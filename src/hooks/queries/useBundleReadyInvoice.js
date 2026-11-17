import { useQuery } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * useBundleReadyInvoice — Query daftar bundle yang siap di-invoice / error validation.
 *
 * Endpoint ini mewajibkan `m_user_id` (ID user yang dicari bundle-nya),
 * dan mendukung `searchText` untuk pencarian bundle/PO/ID.
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
 * @param {Object}   [options]
 * @param {string}   [options.mUserId]    - ID user yang dicari bundle ready-nya
 * @param {string}   [options.searchText] - Kata kunci pencarian (nomor ID, PO, console number, dll.)
 * @param {boolean}  [options.enabled]    - Aktif/nonaktifkan query
 */
export const useBundleReadyInvoice = ({
  mUserId = "",
  searchText = "",
  enabled = false,
} = {}) => {
  const cleanSearch = searchText?.trim() || "";
  const params = {
    m_user_id: mUserId,
    ...(cleanSearch ? { searchText: cleanSearch } : {}),
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
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
    enabled: enabled && Boolean(mUserId),
    placeholderData: (prev) => prev,
  });

  const errorRows = data?.result?.data?.error ?? [];
  const message = data?.message ?? "";
  const total = data?.meta?.total ?? errorRows.length;

  return {
    errorRows,
    message,
    total,
    // Menjaga kompatibilitas jika ada yang membaca summary / successRows
    summary: null,
    successRows: [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
