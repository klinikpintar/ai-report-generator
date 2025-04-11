import { useEffect } from "react";
import { useUserTableContext } from "../context/UserTableContext";
import { useRouter } from "next/navigation";

export const useUserTablePagination = (handleFetchUsers: () => Promise<void>) => {
  const { dispatch } = useUserTableContext();
  const router = useRouter();

  const handlePageChange = async (page: number) => {
    // Update page in state (used for pagination component)
    dispatch({ type: "SET_PAGE", payload: page });

    // Update page in URL (used for browser navigation)
    const params = new URLSearchParams();
    params.append("page", page.toString());
    router.push(`/admin/manage-user?${params.toString()}`);

    // Refresh data
    await handleFetchUsers();
  };

  const parsePageFromUrl = () => {
    const page = new URLSearchParams(window.location.search).get("page");
    return page ? parseInt(page) : 1;
  };

  useEffect(() => {
    const page = parsePageFromUrl();
    dispatch({ type: "SET_PAGE", payload: page });
  }, []);

  return { handlePageChange };
}