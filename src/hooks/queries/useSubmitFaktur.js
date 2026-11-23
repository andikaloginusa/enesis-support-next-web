import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { submitFakturService } from "@services/submit-faktur.service";
import { queryKeys } from "@/lib/queryKeys";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { extractApiError } from "@/utils/errorHelpers";

/**
 * useSubmitFaktur — Custom React Query Hook for the Submit Faktur Support module.
 *
 * Mengelola daftar invoice (server-side pagination + filter) dan pembaruan
 * satu invoice (status, tanggal, payment term).
 *
 * Cakupan data sengaja **tidak** sending `m_user_id`: backend memakai parameter
 * itu untuk melakukan scoping per organisasi (role logistik tetap melihat
 * semua invoice, role lain dibatasi organisasinya). Halaman ini dipakai tim
 * IT Support untuk monitoring global, jadi seluruh invoice ditampilkan.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search/filter state (DRY)
 * - `queryKeys.submitFaktur.*` for centralized cache key management
 * - `notifySuccess`/`notifyError` for centralized notification handling
 */
export const useSubmitFaktur = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + search + filter state
  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
  } = useListParams({ periode: "", status: "", transporter: "" });

  // Filter kosong tidak dikirim agar query string tetap bersih.
  const requestParams = {
    currentPage: params.currentPage,
    pageSize: params.pageSize,
    ...(params.searchText ? { searchText: params.searchText } : {}),
    ...(params.periode ? { periode: params.periode } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.transporter ? { transporter: params.transporter } : {}),
  };

  // Query: Paginated Submit Faktur list
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.submitFaktur.list(requestParams),
    queryFn: async () => {
      const response = await submitFakturService.getList(requestParams);

      if (!response?.ok) {
        throw new Error(
          extractApiError(response, NOTIF_MESSAGES.FETCH_SUBMIT_FAKTUR_ERROR),
        );
      }

      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Update a single invoice
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ c_invoice_id, ...payload }) => {
      const response = await submitFakturService.updateInvoice(
        c_invoice_id,
        payload,
      );

      if (!response?.ok) {
        throw new Error(
          extractApiError(response, NOTIF_MESSAGES.UPDATE_SUBMIT_FAKTUR_ERROR),
        );
      }

      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.UPDATE_SUBMIT_FAKTUR_SUCCESS,
        response?.data?.message || "Data Invoice berhasil diperbarui.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.submitFaktur.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPDATE_SUBMIT_FAKTUR_ERROR,
        err.message || NOTIF_MESSAGES.UPDATE_SUBMIT_FAKTUR_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Backend membungkus baris di `data.data` dan paginasi di `data.meta`.
  const invoiceList = listData?.data?.data ?? [];
  const listMeta = listData?.data?.meta ?? {};

  return {
    // List Query
    invoiceList: Array.isArray(invoiceList) ? invoiceList : [],
    totalCount: listMeta.total ?? 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Pagination, Search & Filter
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,

    // Mutations
    updateInvoice: updateInvoiceMutation.mutateAsync,
    isUpdatingInvoice: updateInvoiceMutation.isPending,
  };
};
