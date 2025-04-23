/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSchemaContext } from "../context/SchemaContext";
import { fetchSchemas } from "../utils/api";
import { toast } from "react-toastify";

export const useSchemaTable = () => {
  const { state, dispatch } = useSchemaContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      router.push(`?page=${page}`);
      dispatch({ type: "SET_PAGE", payload: page });
    },
    [router, dispatch]
  );

  // Fetch schemas based on current filters
  const fetchFilteredSchemas = useCallback(async () => {
    try {
      dispatch({ type: "FETCH_START" });

      const params = {
        serviceIds: state.filters.service.selected.map((service) => service.id),
        platformCodes: state.filters.platform.selected,
      };

      const {data, pagination} = await fetchSchemas(params);

      dispatch({
        type: "FETCH_SUCCESS",
        payload: {
          data,
          lastPage: pagination.total_pages,
        },
      });
    } catch {
      dispatch({ type: "FETCH_ERROR", payload: "Failed to fetch schemas" });
      toast.error("Failed to fetch schemas");
    }
  }, [dispatch, state.filters.service.selected, state.filters.platform.selected]);

  // First load the schemas
  useEffect(() => {
    fetchFilteredSchemas();
  }, []);

  // Fetch schemas when filters change
  useEffect(() => {
    if (state.filters.platform.all.length === 0 || state.filters.service.all.length === 0) {
      return;
    }
    fetchFilteredSchemas();
  }, [state.filters.platform.selected, state.filters.service.selected, fetchFilteredSchemas]);

  // Set page from URL on mount
  useEffect(() => {
    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  return {
    schemas: state.data,
    isLoading: state.isLoading,
    error: state.error,
    currentPage: state.pagination.currentPage,
    lastPage: state.pagination.lastPage,
    handlePageChange,
    refreshSchemas: fetchFilteredSchemas,
  };
};
