import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "@services/proposal.service";
import { getUserId } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES, API_LABELS } from "@/utils/constants";
import {
  useNotify,
  NOTIF_DURATION_LONG,
} from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";

/**
 * Generate a kode proses (reason code) dengan format {PREFIX}-{YYYYMMDDHHmm}.
 * @param {string} prefix - e.g. "PROPSAP", "PROPSAPIMP", "PROPSAPAMOUNT"
 * @returns {string}
 */
export function generateReasonCode(prefix) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `${prefix}-${yyyy}${mm}${dd}${hh}${min}`;
}

/**
 * Generate kode proses untuk Update Brand, format UPD-BRAND-{YYYYMMDD}-{HHmm}.
 * @returns {string}
 */
export function generateBrandReasonCode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `UPD-BRAND-${yyyy}${mm}${dd}-${hh}${min}`;
}

/**
 * useProposalFromSap — Custom React Query Hook untuk modul Proposal From SAP
 *
 * Mengelola:
 * - list tabel `proposal_from_sap` (paginated + filter brand/budget_year/isactive/kode_proses)
 * - upload Excel Update Proposal From SAP (Klaim & Budget ID / Import / Amount)
 * - upload Excel Update Brand Proposal From SAP
 * - lookup budget proposal by kode e-prop SAP
 *
 * Composed with:
 * - `useListParams` untuk state pagination/search/filter
 * - `queryKeys.proposalFromSap.*` untuk manajemen cache
 * - `assertApiSuccess` + `notifySuccess`/`notifyError` untuk handling error seragam
 *
 * @returns {Object} API list + mutasi upload
 */
export const useProposalFromSap = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  const {
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
  } = useListParams({
    brand: "",
    budget_year: "",
    isactive: "",
    kode_proses: "",
  });

  // Query: List proposal_from_sap
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.proposalFromSap.list(params),
    queryFn: async () => {
      try {
        const response = await proposalService.getListProposalFromSap({
          page: params.currentPage,
          limit: params.pageSize,
          search: params.searchText,
          brand: params.brand,
          budget_year: params.budget_year,
          isactive: params.isactive,
          kode_proses: params.kode_proses,
        });

        if (response.ok) {
          const payload = response.data ?? {};
          const rows = payload.results ?? payload.data ?? [];
          return {
            rows,
            total: payload.meta?.count ?? payload.pagination?.total ?? rows.length,
          };
        }
      } catch (err) {
        console.warn(`${API_LABELS.PROPOSAL_FROM_SAP} List request failed.`, err);
      }

      return { rows: [], total: 0 };
    },
    placeholderData: (prev) => prev,
  });

  // Mutation: Upload Proposal SAP Klaim Detail & Budget ID
  const uploadProposalSapKlaimMutation = useMutation({
    mutationFn: async ({ excel, kode_proses }) => {
      const response = await proposalService.uploadProposalSapKlaimDetail({
        m_user_id: getUserId(),
        excel,
        kode_proses,
      });
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_KLAIM_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_KLAIM_SUCCESS,
        res?.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_KLAIM_SUCCESS,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalFromSap.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_KLAIM_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_KLAIM_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Upload Proposal SAP Import
  const uploadProposalSapImportMutation = useMutation({
    mutationFn: async ({ excel, kode_proses }) => {
      const response = await proposalService.uploadProposalSapImport({
        m_user_id: getUserId(),
        excel,
        kode_proses,
      });
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_IMPORT_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_IMPORT_SUCCESS,
        res?.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_IMPORT_SUCCESS,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalFromSap.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_IMPORT_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_IMPORT_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Upload Proposal SAP Amount
  const uploadProposalSapAmountMutation = useMutation({
    mutationFn: async ({ excel, kode_proses }) => {
      const response = await proposalService.uploadProposalSapAmount({
        m_user_id: getUserId(),
        excel,
        kode_proses,
      });
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_AMOUNT_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_AMOUNT_SUCCESS,
        res?.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_AMOUNT_SUCCESS,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalFromSap.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_AMOUNT_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_AMOUNT_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Upload Update Brand Proposal From SAP
  const uploadProposalSapBrandMutation = useMutation({
    mutationFn: async ({ excel, kode_proses }) => {
      const response = await proposalService.updateBrandProposalFromSap({
        m_user_id: getUserId(),
        excel,
        kode_proses,
      });
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_BRAND_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_BRAND_SUCCESS,
        res?.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_BRAND_SUCCESS,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalFromSap.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_BRAND_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_BRAND_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Upload Update GL Account Proposal From SAP
  const uploadProposalSapGlAccountMutation = useMutation({
    mutationFn: async ({ excel, kode_proses }) => {
      const response = await proposalService.uploadProposalSapGlAccount({
        m_user_id: getUserId(),
        excel,
        kode_proses,
      });
      assertApiSuccess(response, NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_GL_ACCOUNT_ERROR);
      return response.data;
    },
    onSuccess: (res) => {
      notifySuccess(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_GL_ACCOUNT_SUCCESS,
        res?.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_GL_ACCOUNT_SUCCESS,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposalFromSap.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_GL_ACCOUNT_ERROR,
        err.message || NOTIF_MESSAGES.UPLOAD_PROPOSAL_SAP_GL_ACCOUNT_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  return {
    // List Query
    sapList: listData?.rows || [],
    totalCount: listData?.total || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Pagination, Search & Filter
    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,

    // Mutation: Upload Proposal SAP Klaim Detail & Budget ID
    uploadProposalSapKlaimDetail: uploadProposalSapKlaimMutation.mutateAsync,
    isUploadingProposalSapKlaim: uploadProposalSapKlaimMutation.isPending,
    uploadProposalSapKlaimResult: uploadProposalSapKlaimMutation.data,

    // Mutation: Upload Proposal SAP Import
    uploadProposalSapImport: uploadProposalSapImportMutation.mutateAsync,
    isUploadingProposalSapImport: uploadProposalSapImportMutation.isPending,
    uploadProposalSapImportResult: uploadProposalSapImportMutation.data,

    // Mutation: Upload Proposal SAP Amount
    uploadProposalSapAmount: uploadProposalSapAmountMutation.mutateAsync,
    isUploadingProposalSapAmount: uploadProposalSapAmountMutation.isPending,
    uploadProposalSapAmountResult: uploadProposalSapAmountMutation.data,

    // Mutation: Upload Update Brand Proposal From SAP
    uploadProposalSapBrand: uploadProposalSapBrandMutation.mutateAsync,
    isUploadingProposalSapBrand: uploadProposalSapBrandMutation.isPending,
    uploadProposalSapBrandResult: uploadProposalSapBrandMutation.data,

    // Mutation: Upload Update GL Account Proposal From SAP
    uploadProposalSapGlAccount: uploadProposalSapGlAccountMutation.mutateAsync,
    isUploadingProposalSapGlAccount: uploadProposalSapGlAccountMutation.isPending,
    uploadProposalSapGlAccountResult: uploadProposalSapGlAccountMutation.data,
  };
};

/**
 * useProposalFromSapBudget — Lookup ringkasan budget proposal by Kode E-Prop SAP.
 *
 * Dipakai oleh modal "Cek Budget Proposal" (baik yang dipanggil dari toolbar
 * maupun langsung dari baris tabel).
 *
 * @param {string} kodeEpropSap - Kode e-proposal SAP, mis. "L/007109/MT/11/26"
 * @param {boolean} [enabled=true] - Aktifkan query (false = jangan fetch)
 */
export const useProposalFromSapBudget = (kodeEpropSap, enabled = true) => {
  const kode = (kodeEpropSap || "").trim();

  const { data, isFetching, error } = useQuery({
    queryKey: queryKeys.proposalFromSap.budget(kode),
    enabled: enabled && Boolean(kode),
    retry: false,
    queryFn: async () => {
      const response = await proposalService.getProposalFromSapBudget({
        kodeEpropSap: kode,
      });

      if (!response.ok) {
        throw new Error(
          response?.data?.message ||
            NOTIF_MESSAGES.FETCH_PROPOSAL_FROM_SAP_BUDGET_ERROR,
        );
      }

      // Backend membalas `error: true` (HTTP 200) bila kode proposal tidak ditemukan.
      if (response.data?.error) {
        throw new Error(
          response.data.message ||
            NOTIF_MESSAGES.FETCH_PROPOSAL_FROM_SAP_BUDGET_ERROR,
        );
      }

      return response.data?.data ?? null;
    },
  });

  return {
    budgetData: data ?? null,
    isBudgetFetching: isFetching,
    budgetError: error?.message ?? null,
  };
};
