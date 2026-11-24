import { useQuery } from "@tanstack/react-query";
import {
  dataApprovalDirectOutletService,
  extractOutletDetail,
} from "@services/data-approval-direct-outlet.service";
import { queryKeys } from "@/lib/queryKeys";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { extractApiError } from "@/utils/errorHelpers";

/**
 * useDataApprovalDirectOutletDetail — Hook untuk fetching detail data
 * approval direct outlet.
 *
 * Dipisah dari `useDataApprovalDirectOutlet` supaya halaman detail tidak
 * memicu query list.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.dataApprovalDirectOutletId] - ID to fetch
 */
export const useDataApprovalDirectOutletDetail = ({
  dataApprovalDirectOutletId,
} = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.dataApprovalDirectOutlet.detail(
      dataApprovalDirectOutletId,
    ),
    queryFn: async () => {
      const response = await dataApprovalDirectOutletService.getDetail(
        dataApprovalDirectOutletId,
      );

      if (!response?.ok) {
        throw new Error(
          extractApiError(
            response,
            NOTIF_MESSAGES.FETCH_DATA_APPROVAL_DIRECT_OUTLET_DETAIL_ERROR,
          ),
        );
      }

      return extractOutletDetail(response.data);
    },
    enabled: Boolean(dataApprovalDirectOutletId),
    placeholderData: (prev) => prev,
  });

  return {
    detail: data,
    isLoading,
    isFetching,
    refetch,
  };
};
