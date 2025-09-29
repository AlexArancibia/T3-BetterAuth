"use client";

import { useCallback, useState } from "react";
import type {
  PaginationInput,
  UsePaginationOptions,
  UsePaginationReturn,
} from "../lib/pagination";

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSearch = "",
    defaultSortBy = "createdAt",
    defaultSortOrder = "desc",
  } = options;

  const [page, setPageState] = useState(defaultPage);
  const [limit, setLimitState] = useState(defaultLimit);
  const [search, setSearchState] = useState(defaultSearch);
  const [sortBy, setSortByState] = useState(defaultSortBy);
  const [sortOrder, setSortOrderState] = useState<"asc" | "desc">(
    defaultSortOrder
  );

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setLimit = useCallback((newLimit: number) => {
    setLimitState(newLimit);
    setPageState(1); // Reset to first page when changing limit
  }, []);

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPageState(1); // Reset to first page when searching
  }, []);

  const setSortBy = useCallback((newSortBy: string) => {
    setSortByState(newSortBy);
    setPageState(1); // Reset to first page when changing sort
  }, []);

  const setSortOrder = useCallback((newSortOrder: "asc" | "desc") => {
    setSortOrderState(newSortOrder);
    setPageState(1); // Reset to first page when changing sort order
  }, []);

  const reset = useCallback(() => {
    setPageState(defaultPage);
    setLimitState(defaultLimit);
    setSearchState(defaultSearch);
    setSortByState(defaultSortBy);
    setSortOrderState(defaultSortOrder);
  }, [
    defaultPage,
    defaultLimit,
    defaultSearch,
    defaultSortBy,
    defaultSortOrder,
  ]);

  const getQueryParams = useCallback(
    (): PaginationInput => ({
      page,
      limit,
      search: search || undefined,
      sortBy: sortBy && sortBy.trim() !== "" ? sortBy : undefined,
      sortOrder,
    }),
    [page, limit, search, sortBy, sortOrder]
  );

  return {
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    setPage,
    setLimit,
    setSearch,
    setSortBy,
    setSortOrder,
    reset,
    getQueryParams,
  };
}
