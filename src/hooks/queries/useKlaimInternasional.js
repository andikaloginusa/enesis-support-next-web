import { useQuery } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useListParams } from "@/hooks/useListParams";

/**
 * useKlaimInternasional — Hook untuk daftar Klaim Internasional
 * (tabel `eprop_internasional_klaim`).
 *
 * Read-only: modul ini hanya menyediakan daftar + filter, tanpa mutasi
 * (update status / re-upload dokumen / hapus log) seperti pada `useKlaim`.
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `queryKeys.klaimInternasional.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing
 */
export const useKlaimInternasional = () => {
  // Shared pagination + search + filter state
  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
  } = useListParams({
    kode_status: "",
    nomor_proposal: "",
    nomor_klaim: "",
    accounting_document_number: "",
    fiscal_year: "",
    jenis_klaim: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "",
    sortDir: "",
  });

  // Query: Paginated Klaim Internasional List
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.klaimInternasional.list(params),
    queryFn: async () => {
      const response = await klaimService.getListKlaimInternasional({
        currentPage: params.currentPage,
        pageSize: params.pageSize,
        searchText: params.searchText,
        kode_status: params.kode_status,
        nomor_proposal: params.nomor_proposal,
        nomor_klaim: params.nomor_klaim,
        accounting_document_number: params.accounting_document_number,
        fiscal_year: params.fiscal_year,
        jenis_klaim: params.jenis_klaim,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        sortBy: params.sortBy,
        sortDir: params.sortDir,
      });

      assertApiSuccess(response, NOTIF_MESSAGES.FETCH_CLAIMS_ERROR);
      return response.data;
    },
    placeholderData: (prev) => prev,
  });

  return {
    // List Query
    klaimList: data?.results || [],
    totalCount: data?.meta?.count || 0,
    isListFetching: isLoading || isFetching,
    refetchList: refetch,
    error,
    params,

    // Pagination & Search controls
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
  };
};
