import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveryOrderService } from "@services/delivery-order.service";
import { queryKeys } from "@/lib/queryKeys";
import { extractErrorDetail } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_LONG } from "@/utils/notify";
import { getUserId } from "@/utils/storage";

/**
 * useDeliveryOrderExcelUpload — Mutation untuk update status DO massal via Excel.
 *
 * Backend mencocokkan baris Excel ke `bundle_id` (bukan `delivery_order_id`)
 * dan bersifat all-or-nothing: bila satu baris invalid, tidak ada DO yang
 * ter-update dan response berisi daftar per-baris `{ bundle_id, reason }`.
 *
 * @returns {{ uploadDeliveryOrderStatus: Function, isUploading: boolean, errorDetails: Array }}
 */
export const useDeliveryOrderExcelUpload = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const uploadMutation = useMutation({
    mutationFn: async ({ file, keterangan_perubahan }) => {
      const response = await deliveryOrderService.updateStatusFromExcel({
        file,
        m_user_id: getUserId(),
        keterangan_perubahan: keterangan_perubahan || undefined,
      });

      if (!response?.ok) {
        const error = new Error(
          response?.data?.message || NOTIF_MESSAGES.UPLOAD_DO_ERROR,
        );
        error.details = extractErrorDetail(response);
        throw error;
      }

      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_DO_SUCCESS,
        response?.data?.message ||
          "Update status Delivery Order dari Excel berhasil.",
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveryOrder.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_DO_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_DO_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  return {
    uploadDeliveryOrderStatus: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    errorDetails: uploadMutation.error?.details ?? [],
    resetExcelUpload: uploadMutation.reset,
  };
};
