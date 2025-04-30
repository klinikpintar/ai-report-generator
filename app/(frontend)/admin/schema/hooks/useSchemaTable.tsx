/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSchemaContext } from "../context/SchemaContext";
import { useRefreshSchema } from "./useRefreshSchema";

export const useSchemaTable = () => {
  const { state, dispatch } = useSchemaContext();
  const { refreshSchemas } = useRefreshSchema();
  const router = useRouter();

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      dispatch({ type: "SET_PAGE", payload: page });
      refreshSchemas({ page });
    },
    [router, dispatch]
  );

  // First load the schemas
  useEffect(() => {
    refreshSchemas();
  }, []);

  // Fetch schemas when filters change
  useEffect(() => {
    if (state.filters.platform.all.length === 0 || state.filters.service.all.length === 0) {
      return;
    }
    refreshSchemas();
  }, [state.filters.platform.selected, state.filters.service.selected, refreshSchemas]);

  return {
    schemas: state.data,
    isLoading: state.isLoading,
    error: state.error,
    currentPage: state.pagination.currentPage,
    lastPage: state.pagination.lastPage,
    handlePageChange,
    refreshSchemas,
  };
};
