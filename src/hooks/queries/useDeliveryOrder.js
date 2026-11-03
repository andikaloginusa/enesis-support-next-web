import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess, extractErrorDetail } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { getUserId } from "@/utils/storage";

/** Hard cap on the number of rows the backend scans for this list. */
export const DELIVERY_ORDER_QUERY_LIMIT = 200;

/**
 * useDeliveryOrder — Custom React Query Hook for the Delivery Order module.
 *
 * Manages the paginated Delivery Order list and the single-record status update.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `storage.getUserId` for the acting user sent as `m_user_id`
 * - `queryKeys.deliveryOrder.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing
 * - `notifySuccess`/`notifyError` for centralized notification handling
 */
export const useDeliveryOrder = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // Query: Paginated Delivery Order list
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.deliveryOrder.list(params),
    queryFn: async () => {
      const response = await deliveryOrderService.getList({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        limit: DELIVERY_ORDER_QUERY_LIMIT,
        searchText: params.searchText,
      });

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_DO_ERROR);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Update the status of a single Delivery Order
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      delivery_order_id,
      kode_status,
      keterangan_perubahan,
    }) => {
      const response = await deliveryOrderService.updateStatus({
        delivery_order_id,
        kode_status,
        m_user_id: getUserId(),
        keterangan_perubahan: keterangan_perubahan || undefined,
      });

      if (!response?.ok) {
        const error = new Error(
          response?.data?.message || NOTIF_MESSAGES.UPDATE_DO_ERROR,
        );
        error.details = extractErrorDetail(response);
        throw error;
      }

      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPDATE_DO_SUCCESS,
        response?.data?.message || "Status Delivery Order berhasil diperbarui.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryOrder.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPDATE_DO_ERROR,
        err.message || NOTIF_MESSAGES.UPDATE_DO_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  return {
    // List Query
    deliveryOrderList: listData?.results || [],
    totalCount: listData?.meta?.total || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Pagination & Search
    params,
    handlePaginationChange,
    handleSearchChange,

    // Mutations
    updateDeliveryOrderStatus: updateStatusMutation.mutateAsync,
    isUpdatingDeliveryOrderStatus: updateStatusMutation.isPending,
    updateErrorDetails: updateStatusMutation.error?.details ?? null,
    resetUpdateStatus: updateStatusMutation.reset,
  };
};
