import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { klaimService } from "@services/klaim.service";

/**
 * useKlaimDetail — Hook for fetching klaim full detail.
 *
 * Controlled: parent passes klaimId directly; hook refetches when klaimId changes.
 *
 * @param {Object}   [options]
 * @param {string|null} [options.klaimId] - Klaim ID to fetch
 */
export const useKlaimDetail = ({ klaimId } = {}) => {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["klaim", "detail", klaimId],
    queryFn: async () => {
      const response = await klaimService.getKlaimDetail({
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
