"use client";

import { useCallback, useEffect } from "react";
import { useSchemaContext } from "../context/SchemaContext";
import { fetchPlatforms, fetchServices } from "@frontend/admin/schema/utils/api";
import type { Platform, Service } from "@frontend/common/types";
import { toast } from "react-toastify";

export const useSchemaFilters = () => {
  const { state, dispatch } = useSchemaContext();

  // Load platforms and services
  useEffect(() => {
    const loadFiltersData = async () => {
      try {
        const [allServices, allPlatforms] = await Promise.all([fetchServices(), fetchPlatforms()]);

        dispatch({
          type: "SET_FILTERS",
          payload: {
            platform: { all: allPlatforms, selected: allPlatforms },
            service: { all: allServices, selected: allServices },
          },
        });
      } catch {
        toast.error("Failed to load filters data");
      }
    };

    loadFiltersData();
  }, [dispatch]);

  // Handle platform filter change
  const handlePlatformChange = useCallback(
    (platforms: Platform[]) => {
      dispatch({
        type: "SET_FILTERS",
        payload: {
          platform: { all: state.filters.platform.all, selected: platforms },
        },
      });
    },
    [dispatch, state.filters.platform.all]
  );

  // Handle service filter change
  const handleServiceChange = useCallback(
    (services: Service[]) => {
      dispatch({
        type: "SET_FILTERS",
        payload: {
          service: { all: state.filters.service.all, selected: services },
        },
      });
    },
    [dispatch, state.filters.service.all]
  );

  return {
    platforms: state.filters.platform.all,
    services: state.filters.service.all,
    selectedPlatforms: state.filters.platform.selected,
    selectedServices: state.filters.service.selected,
    handlePlatformChange,
    handleServiceChange,
  };
};
