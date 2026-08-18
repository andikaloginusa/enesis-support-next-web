"use client";

import { useState, useCallback } from "react";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/utils/constants";

/**
 * useListParams — Shared Pagination & Search State Hook
 *
 * Extracts the identical pagination + search state management logic
 * that was previously copy-pasted across `useKlaim`, `useFkr`, and `useProposal`.
 *
 * Pattern: Custom Hook Composition — designed to be composed inside
 * domain-specific hooks (useFkr, useKlaim, useProposal) rather than
 * used directly by page components.
 *
 * @param {Object} [initialParams={}] - Override default param values
 * @param {number} [initialParams.currentPage]
 * @param {number} [initialParams.pageSize]
 * @param {string} [initialParams.searchText]
 * @param {*}      [initialParams.*] - Any additional domain-specific filter keys
 *
 * @returns {{
 *   params: Object,
 *   setParams: Function,
 *   handlePaginationChange: (page: number, pageSize: number) => void,
 *   handleSearchChange: (text: string) => void,
 *   handleFilterChange: (key: string, value: any) => void,
 *   resetParams: () => void,
 * }}
 *
 * @example
 * // Inside useFkr.js:
 * const { params, handlePaginationChange, handleSearchChange } = useListParams();
 *
 * @example
 * // With additional domain-specific filter defaults:
 * const { params, handleFilterChange } = useListParams({ division: "", fcstatus: "" });
 */
export const useListParams = (initialParams = {}) => {
  const defaults = {
    currentPage: DEFAULT_PAGE,
    pageSize: DEFAULT_PAGE_SIZE,
    searchText: "",
    ...initialParams,
  };

  const [params, setParams] = useState(defaults);

  /**
   * Handle Ant Design Table / Pagination component page change.
   * Updates `currentPage` and `pageSize` while preserving all other filters.
   *
   * @param {number} page - New page number
   * @param {number} pageSize - New page size
   */
  const handlePaginationChange = useCallback((page, pageSize) => {
    setParams((prev) => ({
      ...prev,
      currentPage: page,
      pageSize: pageSize || prev.pageSize,
    }));
  }, []);

  /**
   * Handle search input change.
   * Automatically resets page to 1 to avoid stale page index on new search results.
   *
   * @param {string} text - Search query text
   */
  const handleSearchChange = useCallback((text) => {
    setParams((prev) => ({
      ...prev,
      searchText: text?.trim() ?? "",
      currentPage: DEFAULT_PAGE,
    }));
  }, []);

  /**
   * Handle a generic filter field change by key.
   * Automatically resets page to 1 on any filter change.
   * Normalizes `null` and `undefined` values to empty string for API compatibility.
   *
   * @param {string} key - The filter parameter key to update
   * @param {*} value - The new filter value
   */
  const handleFilterChange = useCallback((key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value === undefined || value === null ? "" : value,
      currentPage: DEFAULT_PAGE,
    }));
  }, []);

  /**
   * Reset all params back to initial default values.
   * Useful for "Reset Filter" buttons.
   */
  const resetParams = useCallback(() => {
    setParams(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    params,
    setParams,
    handlePaginationChange,
    handleSearchChange,
    handleFilterChange,
    resetParams,
  };
};
