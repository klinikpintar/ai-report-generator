import { useCallback } from "react";
import { useSchemaContext } from "../context/SchemaContext";
import { fetchSchemas, FetchSchemasParams } from "../utils/api";

export const useRefreshSchema = () => {
  const { state, dispatch } = useSchemaContext();

  // Helper function for getting selected filters. Omitting all options when user selects all option. Select All == Select Nothing.
  const getSelectedFilters = () => {
    const between = (x: number, min: number, max: number) => {
      return x > min && x < max;
    };

    const doesFilterByService = between(
      state.filters.service.selected.length,
      0,
      state.filters.service.all.length
    );

    const doesFilterByPlatform = between(
      state.filters.platform.selected.length,
      0,
      state.filters.platform.all.length
    );

    const selectedServiceIds = doesFilterByService
      ? state.filters.service.selected.map((service) => service.id)
      : [];
    const selectedPlatformCodes = doesFilterByPlatform ? state.filters.platform.selected : [];

    return [selectedServiceIds, selectedPlatformCodes];
  };

  // Fetch schemas based on current filters
  const fetchFilteredSchemas = useCallback(
    async ({ page }: { page?: number } = {}) => {
      try {
        dispatch({ type: "FETCH_START" });

        const [selectedServiceIds, selectedPlatformCodes] = getSelectedFilters();

        const params: FetchSchemasParams = {
          serviceIds: selectedServiceIds,
          platformCodes: selectedPlatformCodes,
          page: page || state.pagination.currentPage,
        };

        const { data, pagination } = await fetchSchemas(params);

        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            data,
            lastPage: pagination.total_pages,
          },
        });
      } catch {
        dispatch({ type: "FETCH_ERROR", payload: "Failed to fetch schemas" });
      }
    },
    [
      dispatch, 
      state.filters.service.selected, 
      state.filters.platform.selected
    ]
  );

  return {
    refreshSchemas: fetchFilteredSchemas,
  }
}