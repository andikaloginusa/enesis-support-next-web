import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";

/**
 * useKlaimDetail — Hook untuk fetching klaim full detail.
 *
 * Controlled: parent passes klaimId langsung; hook refetch ketika klaimId berubah.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.klaimId] - Klaim ID to fetch
 * @param {"nasional"|"internasional"} [options.variant] - Tipe klaim (default: nasional)
 */
export const useKlaimDetail = ({ klaimId, variant = "nasional" } = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["klaim", "detail", variant, klaimId],
    queryFn: async () => {
      const fetchDetail =
        variant === "internasional"
          ? klaimService.getKlaimInternasionalDetail
          : klaimService.getKlaimDetail;
      const response = await fetchDetail({
        klaim_id: klaimId,
      });
      if (response.ok) {
        return response.data?.result ?? null;
      }
      return null;
    },
    enabled: Boolean(klaimId),
    placeholderData: (prev) => prev,
  });

  return {
    detail: data,
    isLoading,
    isFetching,
    refetch,
  };
};
