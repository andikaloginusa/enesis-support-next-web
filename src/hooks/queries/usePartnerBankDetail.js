import { useQuery } from "@tanstack/react-query";
import { partnerBankService } from "@services/partner-bank.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";

/**
 * usePartnerBankDetail — Hook untuk fetching detail partner bank.
 *
 * Dipisah dari `usePartnerBank` supaya modal detail tidak memicu
 * query list yang sama dengan halaman utama.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.partnerBankId] - Partner bank ID to fetch
 */
export const usePartnerBankDetail = ({ partnerBankId } = {}) => {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.partnerBank.detail(partnerBankId),
    queryFn: async () => {
      const response = await partnerBankService.getDetail(partnerBankId);

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_PARTNER_BANK_DETAIL_ERROR);
      return response.data?.result ?? null;
    },
    enabled: Boolean(partnerBankId),
    placeholderData: (prev) => prev,
  });

  return {
    detail: data,
    isLoading,
    isFetching,
    refetch,
  };
};
