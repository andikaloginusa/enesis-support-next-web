import { useQuery } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * useBundleReadyInvoice — Query daftar bundle yang siap di-invoice.
 *
 * Endpoint ini mewajibkan `m_user_id` (ID end-user yang dicari bundle-nya),
 * sehingga query hanya dijalankan setelah user mengisi form di modal.
 *
 * @param {Object}   [options]
 * @param {string}   [options.mUserId] - ID user yang dicari bundle ready-nya
 * @param {boolean}  [options.enabled] - Aktif/nonaktifkan query
 */
export const useBundleReadyInvoice = ({ mUserId = "", enabled = false } = {}) => {
  const params = {
    m_user_id: mUserId,
    currentPage: 1,
    pageSize: 100,
    limit: 200,
    getAll: true,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.deliveryOrder.bundleReady(params),
    queryFn: async () => {
      const response = await deliveryOrderService.getBundleReady(params);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_BUNDLE_READY_ERROR);
      return response.data?.result?.data ?? null;
    },
    enabled: enabled && Boolean(mUserId),
    placeholderData: (prev) => prev,
  });

  return {
    summary: data?.summary ?? null,
    successRows: data?.success ?? [],
    errorRows: data?.error ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
