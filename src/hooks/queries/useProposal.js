import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { proposalService } from "@services/proposal.service";
import { useState, useCallback } from "react";
import { App } from "antd";

/**
 * Utility helper to safely parse user credentials from local storage.
 * Declared in module scope to prevent re-creation and ensure memory efficiency.
 */
const getUserCredsFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const credsStr = localStorage.getItem("user_credent");
      if (credsStr) {
        const creds = JSON.parse(credsStr);
        return {
          m_user_id: creds.m_user_id || creds.id || "",
          employee_id: creds.employee_id || creds.employeeId || "",
          nik: creds.nik || "",
        };
      }
    } catch (err) {
      console.error("Failed to parse user credentials from storage", err);
    }
  }
  return { m_user_id: "", employee_id: "", nik: "" };
};

/**
 * Custom React Query hook for the Proposal Module.
 * Encapsulates search state, paginated lists, and single detail fetches.
 *
 * @param {string|number|null} proposalId - Optional proposal ID for fetching detail
 */
export const useProposal = (proposalId = null) => {
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  // 1. Pagination, Filtering, and Search Parameters
  const [params, setParams] = useState({
    currentPage: 1,
    pageSize: 10,
    searchText: "",
    division: "",
    fcstatus: "",
  });

  // 2. Query: Fetch Proposal List
  const {
    data: listData,
    isLoading: isListLoading,
    isFetching: isListFetching,
    refetch: refetchList,
  } = useQuery({
    queryKey: ["proposal-list", params],
    queryFn: async () => {
      const creds = getUserCredsFromStorage();
      try {
        const response = await proposalService.getListProposal({
          currentPage: params.currentPage,
          pageSize: params.pageSize,
          employee_id: creds.employee_id,
          searchText: params.searchText,
          division: params.division,
          fcstatus: params.fcstatus,
          nik: creds.nik,
        });

        if (response.ok && response.data) {
          return response.data;
        }
      } catch (err) {
        console.warn("Proposal list request failed, returning fallback empty list.", err);
      }

      return {
        results: [],
        meta: { count: 0 },
      };
    },
    placeholderData: (prev) => prev,
  });

  // 3. Query: Fetch Single Proposal Detail
  const {
    data: detailData,
    isLoading: isDetailLoading,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["proposal-detail", proposalId],
    enabled: !!proposalId,
    queryFn: async () => {
      const creds = getUserCredsFromStorage();
      try {
        const response = await proposalService.getDetailProposal(proposalId, {
          m_user_id: creds.m_user_id,
          employee_id: creds.employee_id,
        });

        if (response.ok && response.data) {
          // Unwrap nested result wrapper safely
          return response.data.result || response.data;
        }
      } catch (err) {
        console.warn(`Proposal detail request failed for ID ${proposalId}`, err);
      }

      return null;
    },
  });

  // 3.5 Mutation: Update Proposal Details
  const updateProposalMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await proposalService.updateProposalData(payload);
      if (!response.ok) {
        throw new Error(response.data?.message || response.problem || "Gagal memperbarui data proposal");
      }
      return response.data;
    },
    onSuccess: (res) => {
      notification.success({
        message: "Sukses",
        title: "Sukses",
        description: res?.message || "Data Proposal Berhasil Diperbarui",
        duration: 2,
      });
      queryClient.invalidateQueries({ queryKey: ["proposal-list"] });
      queryClient.invalidateQueries({ queryKey: ["proposal-detail", proposalId] });
    },
    onError: (err) => {
      notification.error({
        message: "Error",
        title: "Error",
        description: err.message || "Gagal memperbarui data proposal",
        duration: 3,
      });
    },
  });

  // 4. Action Handlers (Wrapped in useCallback to ensure reference stability)
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
      currentPage: 1, // Reset to first page on new search
    }));
  }, []);

  const handleFilterChange = useCallback((key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === undefined || value === null ? "" : value,
      currentPage: 1,
    }));
  }, []);

  return {
    // Queries
    proposalList: listData?.results || [],
    totalCount: listData?.meta?.count || 0,
    isListFetching: isListLoading || isListFetching,
    refetchList,

    proposalDetail: detailData || null,
    isDetailLoading,
    refetchDetail,

    params,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,

    // Mutation triggers
    updateProposalData: updateProposalMutation.mutateAsync,
    isUpdatingProposal: updateProposalMutation.isPending,
  };
};
