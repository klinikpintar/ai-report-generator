import { useCallback, useEffect } from "react";
import { useUserTableContext } from "../context/UserTableContext";
import { fetchUsers } from "../utils/api";

export const useFetchUser = () => {
  const { dispatch, state } = useUserTableContext();

  const getSelectedRole = useCallback(() => {
    const selectedRoles = state.filters.role.selected;
    return selectedRoles.length === 1 ? selectedRoles[0] : undefined;
  }, [state.filters.role.selected]);

  const handleFetchUsers = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const page = state.pagination.currentPage;
      const role = getSelectedRole();
      const response = await fetchUsers({ limit: 5, page: page, role: role });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: { data: response.data, lastPage: response.pagination.total_pages },
      });
    } catch {
      dispatch({ type: "FETCH_ERROR", payload: "Gagal memuat data pengguna" });
    }
  }, [dispatch, state.pagination.currentPage, getSelectedRole]);  

  useEffect(() => {
    handleFetchUsers();
  }, [handleFetchUsers, state.pagination.currentPage, state.filters.role.selected]);

  return { handleFetchUsers };
};