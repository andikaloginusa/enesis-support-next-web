import { useQuery } from "@tanstack/react-query";
import { submitFakturService } from "@services/submit-faktur.service";
import { queryKeys } from "@/lib/queryKeys";
import { extractApiError } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * useSubmitFakturDetail — Hook untuk fetching detail invoice Submit Faktur.
 *
 * Dipisah dari `useSubmitFaktur` supaya halaman detail tidak memicu query
 * list yang sama dengan halaman utama.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.cInvoiceId] - c_invoice_id to fetch
 */
export const useSubmitFakturDetail = ({ cInvoiceId } = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.submitFaktur.detail(cInvoiceId),
    queryFn: async () => {
      const response = await submitFakturService.getDetail(cInvoiceId);

      if (!response?.ok) {
        throw new Error(
          extractApiError(response, NOTIF_MESSAGES.FETCH_SUBMIT_FAKTUR_ERROR),
        );
      }

      return response.data?.data ?? null;
    },
    enabled: Boolean(cInvoiceId),
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
