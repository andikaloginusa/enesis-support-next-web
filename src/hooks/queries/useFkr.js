import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fkrService } from "@services/fkr.service";
import { useState, useCallback } from "react";
import { App } from "antd";

/**
 * Helper to safely extract m_user_id from local storage current_user.
 * Defined outside the hook to maintain stable reference and reduce memory footprint.
 */
const getUserIdFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const credsStr = localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        return creds.m_user_id || creds.id || "";
      }
    } catch (err) {
      console.error("Failed to parse user credentials from storage", err);
    }
  }
  return "";
};

/**
 * Custom React Query hook for FKR Support Module
 * Manages lists, detail records, reject actions, candidates list, and approval updates.
 */
export const useFkr = (fkrId = null) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  // 1. Pagination, Search, and Candidates Filtering State
  const [params, setParams] = useState({
    currentPage: 1,
    pageSize: 10,
    searchText: "",
  });

  // State caching candidates per Jabatan locally for performance & reliability
  const [candidatesCache, setCandidatesCache] = useState({});
  const [activeCandidates, setActiveCandidates] = useState([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Dynamic caching fetcher that is invoked on edit modal click
  const fetchCandidatesForJabatan = useCallback(async (jabatan) => {
    if (!jabatan) return;
    const key = jabatan.toUpperCase();

    // 1. Instantly return from local state cache if already fetched!
    if (candidatesCache[key]) {
      setActiveCandidates(candidatesCache[key]);
      return;
    }

    setIsLoadingCandidates(true);
    try {
      const response = await fkrService.getListUserApproval({ jabatan });
      if (response.ok && response.data) {
        const result = response.data.results || response.data.result || response.data;
        if (Array.isArray(result)) {
          setCandidatesCache((prev) => ({
            ...prev,
            [key]: result,
          }));
          setActiveCandidates(result);
          setIsLoadingCandidates(false);
          return;
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch candidates for jabatan ${jabatan}`, err);
    }

    setCandidatesCache((prev) => ({
      ...prev,
      [key]: [],
    }));
    setActiveCandidates([]);
    setIsLoadingCandidates(false);
  }, [candidatesCache]);

  const clearActiveCandidates = useCallback(() => {
    setActiveCandidates([]);
  }, []);

  // 2. Query: Fetch List of FKR (Preserves your custom local changes)
  const { 
    data: listData, 
    isLoading: isListLoading, 
    isFetching: isListFetching, 
    refetch: refetchList 
  } = useQuery({
    queryKey: ["fkr-list", params],
    queryFn: async () => {
      try {
        const response = await fkrService.getListApprovalFkr({
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          m_user_id: getUserIdFromStorage(),
          searchText: params.searchText,
        });

        if (response.ok && response.data) {
          return response.data;
        }
      } catch (err) {
        console.warn("API request failed, returning empty list fallback.", err);
      }

      return {
        results: [],
        meta: { count: 0 }
      };
    },
    placeholderData: (prev) => prev,
  });

  // 3. Query: Fetch Single FKR Detail (Unwraps result parameter correctly)
  const { 
    data: detailData, 
    isLoading: isDetailLoading, 
    refetch: refetchDetail 
  } = useQuery({
    queryKey: ["fkr-detail", fkrId],
    enabled: !!fkrId,
    queryFn: async () => {
      try {
        const response = await fkrService.getDetailListFkr(fkrId);
        if (response.ok && response.data) {
          // Robust mapping of result wrapper
          return response.data.result || response.data;
        }
      } catch (err) {
        console.warn("Detail API request failed.", err);
      }

      return null;
    },
  });

  // 4. Obsolete candidates query replaced with dynamic state caching above

  // 5. Mutation: Reject FKR
  const rejectMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.rejectListApprovalFkr(payload);
      if (!response.ok) {
        throw new Error(response.data?.message || response.problem || "Gagal melakukan penolakan FKR");
      }
      return response;
    },
    onSuccess: (response, variables) => {
      const successMsg = response?.data?.message || `FKR berhasil direject dengan alasan: "${variables.reason}"`;
      notification.success({
        message: "Reject Berhasil",
        title: "Reject Berhasil",
        description: successMsg,
        duration: 3,
      });
      queryClient.invalidateQueries({ queryKey: ["fkr-list"] });
      queryClient.invalidateQueries({ queryKey: ["fkr-detail", fkrId] });
    },
    onError: (err) => {
      notification.error({
        message: "Reject Gagal",
        title: "Reject Gagal",
        description: err.message || "Gagal melakukan penolakan FKR",
        duration: 3,
      });
    },
  });

  // 6. Mutation: Reassign/Update Approver User
  const updateApprovalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await fkrService.updateListApprovalFkr(payload);
      if (!response.ok) {
        throw new Error(response.data?.message || response.problem || "Gagal memperbarui user approval FKR");
      }
      return response;
    },
    onSuccess: (response) => {
      const successMsg = response?.data?.message || "User approval FKR berhasil diperbarui";
      notification.success({
        message: "Approval Diperbarui",
        title: "Approval Diperbarui",
        description: successMsg,
        duration: 3,
      });
      // Invalidate detail to refresh the progress list
      queryClient.invalidateQueries({ queryKey: ["fkr-detail", fkrId] });
    },
    onError: (err) => {
      notification.error({
        message: "Update Gagal",
        title: "Update Gagal",
        description: err.message || "Gagal memperbarui user approval FKR",
        duration: 3,
      });
    },
  });

  // Actions
  const handlePaginationChange = useCallback((page, pageSize) => {
    setParams((prev) => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  const handleSearchChange = useCallback((text) => {
    setParams((prev) => ({
      ...prev,
      searchText: text?.trim(),
      currentPage: 1,
    }));
  }, []);

  return {
    // Queries
    fkrList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    fkrDetail: detailData || null,
    isDetailLoading,
    refetchDetail,

    candidatesList: activeCandidates,
    isCandidatesLoading: isLoadingCandidates,
    fetchCandidatesForJabatan,
    clearActiveCandidates,

    params,
    handlePaginationChange,
    handleSearchChange,

    // Mutations
    rejectFkr: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,

    updateApprover: updateApprovalMutation.mutateAsync,
    isUpdatingApprover: updateApprovalMutation.isPending,
  };
};
