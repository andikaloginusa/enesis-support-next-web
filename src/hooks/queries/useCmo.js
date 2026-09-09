import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmoService } from "@services/cmo.service";
import { queryKeys } from "@/lib/queryKeys";
import { assertApiSuccess } from "@/utils/errorHelpers";
import { NOTIF_MESSAGES } from "@/utils/constants";
import { useNotify, NOTIF_DURATION_MEDIUM, NOTIF_DURATION_LONG } from "@/utils/notify";
import { useListParams } from "@/hooks/useListParams";
import { buildSearchText } from "@/config/cmoConfig";
import { getUserId } from "@/utils/storage";

/**
 * useCmo — Custom React Query Hook for CMO Support Module.
 *
 * Manages:
 * - Paginated SAP-waiting CMO list
 * - Process SAP CMO (pull XML from SFTP)
 * - Process SAP C-Order (pull XML from SFTP)
 * - Regenerate C-Order records
 * - Reject or kill a single CMO
 * - Replace template upload
 *
 * Composed with:
 * - `useListParams` for shared pagination/search state (DRY)
 * - `queryKeys.cmo.*` for centralized cache key management
 * - `assertApiSuccess` for standardized error throwing
 * - `notifySuccess`/`notifyError` for centralized notification handling
 *
 * @param {Object}   [initialParams={}] - Override default param values for the list query
 * @param {string}   [initialParams.bulan]     - Month filter
 * @param {string}   [initialParams.tahun]     - Year filter
 * @param {number}   [initialParams.currentPage]
 * @param {number}   [initialParams.pageSize]
 */
export const useCmo = (initialParams = {}) => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useNotify();

  // Shared pagination + filter state
  const { params, handlePaginationChange, handleFilterChange } = useListParams({
    tahun: "",
    bulan: "",
    kategori: "",
    searchMode: "filter",
    customSearchText: "",
    ...initialParams,
  });

  // Determine active searchText:
  // - "custom": uses customSearchText (e.g. full nomor CMO)
  // - "filter" (default): generates from dropdown filters (tahun/kategori/bulan_abbrev)
  const searchText =
    params.searchMode === "custom"
      ? (params.customSearchText?.trim() ?? "")
      : buildSearchText(params.tahun, params.kategori, params.bulan);

  // Query: Filtered CMO List via searchText endpoint
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: queryKeys.cmo.sapWaitingList({ ...params, searchText }),
    queryFn: async () => {
      const response = await cmoService.getFilteredList({
        m_user_id: getUserId(),
        searchText,
        currentPage: params.currentPage,
        pageSize: params.pageSize,
      });

      if (response.ok) return response.data;
      return { results: [], meta: { count: 0 } };
    },
    // Only run the query when searchText is present
    enabled: Boolean(searchText),
    placeholderData: (prev) => prev,
  });

  // Mutation: Process SAP CMO — pull XML, update no_sap + status
  const processSapCMOMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await cmoService.processSapCMO(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.PROCESS_SAP_CMO_ERROR);
      return response;
    },
    onSuccess: (response) => {
      const message = response?.data?.message;
      notifySuccess(
        NOTIF_MESSAGES.PROCESS_SAP_CMO_SUCCESS,
        typeof message === "string" ? message : "Proses selesai.",
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.cmo.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.PROCESS_SAP_CMO_ERROR,
        err.message || NOTIF_MESSAGES.PROCESS_SAP_CMO_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Process SAP C-Order — pull XML, update nomor_sap + status
  const processSapCOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await cmoService.processSapCOrder(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.PROCESS_SAP_C_ORDER_ERROR);
      return response;
    },
    onSuccess: (response) => {
      const message = response?.data?.message;
      notifySuccess(
        NOTIF_MESSAGES.PROCESS_SAP_C_ORDER_SUCCESS,
        typeof message === "string" ? message : "Sinkronisasi selesai.",
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.cmo.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.PROCESS_SAP_C_ORDER_ERROR,
        err.message || NOTIF_MESSAGES.PROCESS_SAP_C_ORDER_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Regenerate C-Order — build header + detail from CMO
  const regenerateCOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await cmoService.regenerateCOrder(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.REGEN_C_ORDER_ERROR);
      return response;
    },
    onSuccess: (response) => {
      const payload = response?.data;
      notifySuccess(
        NOTIF_MESSAGES.REGEN_C_ORDER_SUCCESS,
        payload?.message || "Regenerasi C-Order selesai.",
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.cmo.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.REGEN_C_ORDER_ERROR,
        err.message || NOTIF_MESSAGES.REGEN_C_ORDER_ERROR,
        NOTIF_DURATION_LONG,
      );
    },
  });

  // Mutation: Reject or Kill a single CMO
  const rejectOrKillCMOMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await cmoService.rejectOrKillCMO(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.REJECT_CMO_ERROR);
      return response;
    },
    onSuccess: (response, variables) => {
      const isKill = variables.action === "kill";
      notifySuccess(
        isKill ? NOTIF_MESSAGES.KILL_CMO_SUCCESS : NOTIF_MESSAGES.REJECT_CMO_SUCCESS,
        response?.data?.message || (isKill ? "CMO berhasil dimatikan." : "CMO berhasil direject."),
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.cmo.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.REJECT_CMO_ERROR,
        err.message || NOTIF_MESSAGES.REJECT_CMO_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  // Mutation: Replace template — upload Excel + update version
  const replaceTemplateMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await cmoService.replaceTemplate(payload);
      assertApiSuccess(response, NOTIF_MESSAGES.REPLACE_TEMPLATE_ERROR);
      return response;
    },
    onSuccess: (response) => {
      notifySuccess(
        NOTIF_MESSAGES.REPLACE_TEMPLATE_SUCCESS,
        response?.data?.message || "Template berhasil diganti.",
        NOTIF_DURATION_MEDIUM,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.cmo.all() });
    },
    onError: (err) => {
      notifyError(
        NOTIF_MESSAGES.REPLACE_TEMPLATE_ERROR,
        err.message || NOTIF_MESSAGES.REPLACE_TEMPLATE_ERROR,
        NOTIF_DURATION_MEDIUM,
      );
    },
  });

  return {
    // List Query
    cmoList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    currentPage: listData?.meta?.currentPage || 1,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    // Params & Handlers
    params,
    searchText,
    handlePaginationChange,
    handleFilterChange,

    // Mutations
    processSapCMO: processSapCMOMutation.mutateAsync,
    isProcessingSapCMO: processSapCMOMutation.isPending,

    processSapCOrder: processSapCOrderMutation.mutateAsync,
    isProcessingSapCOrder: processSapCOrderMutation.isPending,

    regenerateCOrder: regenerateCOrderMutation.mutateAsync,
    isRegeneratingCOrder: regenerateCOrderMutation.isPending,

    rejectOrKillCMO: rejectOrKillCMOMutation.mutateAsync,
    isRejectingOrKilling: rejectOrKillCMOMutation.isPending,

    replaceTemplate: replaceTemplateMutation.mutateAsync,
    isReplacingTemplate: replaceTemplateMutation.isPending,

    // Raw response access for result modals
    regenCOrderResult: regenerateCOrderMutation.data,
  };
};
