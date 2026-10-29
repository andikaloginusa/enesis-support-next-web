import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { partnerBankService } from "@services/partner-bank.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";

/**
 * usePartnerBank — Custom React Query Hook for the Partner Bank Module
 *
 * Manages:
 * - Paginated partner bank list with search
 * - Single partner bank detail
 * - Create / Update / Delete mutations
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `queryKeys.partnerBank.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing
 * - `notifySuccess`/`notifyError` for centralized notification handling
 *
 * Detail fetching lives in `usePartnerBankDetail` so the detail modal does not
 * trigger a duplicate list query.
 */
export const usePartnerBank = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search state
  const { params, handlePaginationChange, handleSearchChange } = useListParams();

  // Query: Paginated Partner Bank List
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.partnerBank.list(params),
    queryFn: async () => {
      const response = await partnerBankService.getList({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        searchText: params.searchText,
      });

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_PARTNER_BANK_ERROR);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Create Partner Bank
  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await partnerBankService.create(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.CREATE_PARTNER_BANK_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.CREATE_PARTNER_BANK_SUCCESS,
        response?.data?.message || "Partner bank berhasil ditambahkan.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerBank.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.CREATE_PARTNER_BANK_ERROR,
        err.message || NOTIF_MESSAGES.CREATE_PARTNER_BANK_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Mutation: Update Partner Bank
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await partnerBankService.update(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.UPDATE_PARTNER_BANK_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPDATE_PARTNER_BANK_SUCCESS,
        response?.data?.message || "Partner bank berhasil diperbarui.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerBank.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPDATE_PARTNER_BANK_ERROR,
        err.message || NOTIF_MESSAGES.UPDATE_PARTNER_BANK_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Mutation: Delete Partner Bank
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await partnerBankService.remove(id);
      assertApiSuccess(response, NOTIF_MESSAGES.DELETE_PARTNER_BANK_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.DELETE_PARTNER_BANK_SUCCESS,
        response?.data?.message || "Partner bank berhasil dihapus.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.partnerBank.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.DELETE_PARTNER_BANK_ERROR,
        err.message || NOTIF_MESSAGES.DELETE_PARTNER_BANK_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  return {
    // List Query
    partnerBankList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Pagination & Search
    params,
    handlePaginationChange,
    handleSearchChange,

    // Mutations
    createPartnerBank: createMutation.mutateAsync,
    isCreatingPartnerBank: createMutation.isPending,

    updatePartnerBank: updateMutation.mutateAsync,
    isUpdatingPartnerBank: updateMutation.isPending,

    deletePartnerBank: deleteMutation.mutateAsync,
    isDeletingPartnerBank: deleteMutation.isPending,
  };
};
