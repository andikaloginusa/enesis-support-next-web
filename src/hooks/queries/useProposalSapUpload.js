/**
 * useProposalSapUpload — Custom React Query Hook for Mass Update Proposal from SAP
 *
 * Handles the Excel-based mass update operation with specialized error handling
 * for data_duplikat and data_not_found arrays returned by the backend.
 *
 * Composed with:
 * - `proposalService.massUpdateProposalFromSap` for FormData-based upload
 * - `getUserId` for consistent m_user_id sourcing
 * - `useNotify` for centralized notification handling
 * - `queryKeys.proposal.sapMassUpload` for cache management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "@services/proposal.service";
import { getUserId } from "@/utils/storage";
import { queryKeys } from "@/lib/queryKeys";
import { NOTIF_MESSAGES } from "@/utils/constants";
import {
  useNotify,
  NOTIF_DURATION_MEDIUM,
  NOTIF_DURATION_LONG,
} from "@/utils/notify";

/**
 * @typedef {Object} SapUploadMeta
 * @property {string} reason
 * @property {"BUDGET"|"END_DATE"} update_type
 * @property {"WBS_NUMBER"|"KODE_EPROP_SAP"} parameter_where_type
 */

/**
 * @typedef {Object} SapUploadError
 * @property {boolean} ok
 * @property {{ message: string, data_duplikat?: string[], data_not_found?: string[] }} data
 */

/**
 * Custom error type carrying structured backend error data.
 * @extends Error
 */
export class SapUploadError extends Error {
  /**
   * @param {string} message
   * @param {string[]} [data_duplikat=[]]
   * @param {string[]} [data_not_found=[]]
   */
  constructor(message, data_duplikat = [], data_not_found = []) {
    super(message);
    this.name = "SapUploadError";
    this.data_duplikat = data_duplikat;
    this.data_not_found = data_not_found;
    /** True if either array has entries — signals a partial failure */
    this.hasPartialFailure = data_duplikat.length > 0 || data_not_found.length > 0;
  }
}

export const useProposalSapUpload = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError, notifyWarning } = useNotify();

  const mutation = useMutation({
    /** @type {import("@tanstack/react-query").MutationFunction<SapUploadError, { file: File, meta: SapUploadMeta }>} */
    mutationFn: async ({ file, meta }) => {
      const m_user_id = getUserId();
      const response = await proposalService.massUpdateProposalFromSap(file, {
        m_user_id,
        ...meta,
      });

      // Backend returns structured error with data_duplikat / data_not_found
      if (!response.ok) {
        const raw = response?.data;
        const message =
          raw?.message ||
          NOTIF_MESSAGES.SAP_MASS_UPDATE_ERROR;

        throw new SapUploadError(
          message,
          Array.isArray(raw?.data_duplikat) ? raw.data_duplikat : [],
          Array.isArray(raw?.data_not_found) ? raw.data_not_found : [],
        );
      }

      return response.data;
    },

    onSuccess: (data) => {
      notifySuccess(
        NOTIF_MESSAGES.SAP_MASS_UPDATE_SUCCESS,
        data?.message || null,
        NOTIF_DURATION_LONG,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.proposal.all() });
    },

    onError: (err) => {
      if (err instanceof SapUploadError && err.hasPartialFailure) {
        // Partial failure — success notification + warning for display in modal
        notifySuccess(
          NOTIF_MESSAGES.SAP_MASS_UPDATE_SUCCESS,
          err.message,
          NOTIF_DURATION_LONG,
        );
        // The component will read err.data_duplikat / err.data_not_found
        // directly to render the detail modal. Do NOT call notifyError here.
      } else {
        notifyError(
          NOTIF_MESSAGES.SAP_MASS_UPDATE_ERROR,
          err.message || NOTIF_MESSAGES.SAP_MASS_UPDATE_ERROR,
          NOTIF_DURATION_LONG,
        );
      }
    },
  });

  return {
    /** @param {{ file: File, meta: SapUploadMeta }} payload */
    massUpdate: mutation.mutateAsync,
    /** @param {{ file: File, meta: SapUploadMeta }} payload */
    massUpdateAndThrow: mutation.mutate,
    isUploading: mutation.isPending,
    uploadResult: mutation.data,
    uploadError: mutation.error,
  };
};
