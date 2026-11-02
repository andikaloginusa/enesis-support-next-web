import { useQuery } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * useDeliveryOrderDetail — Hook untuk fetching detail Delivery Order.
 *
 * Dipisah dari `useDeliveryOrder` supaya halaman detail tidak memicu
 * query list yang sama dengan halaman utama.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.deliveryOrderId] - delivery_order_id to fetch
 */
export const useDeliveryOrderDetail = ({ deliveryOrderId } = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.deliveryOrder.detail(deliveryOrderId),
    queryFn: async () => {
      const response = await deliveryOrderService.getDetail(deliveryOrderId);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_DO_DETAIL_ERROR);
      return response.data?.data ?? null;
    },
    enabled: Boolean(deliveryOrderId),
    placeholderData: (prev) => prev,
  });

  return {
    detail: data,
    isLoading,
    isFetching,
    error,
    refetch,
  };
};
