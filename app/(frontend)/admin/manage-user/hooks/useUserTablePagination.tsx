import { useEffect } from "react";
import { useUserTableContext } from "../context/UserTableContext";
import { useRouter } from "next/navigation";

export const useUserTablePagination = () => {
  const { dispatch } = useUserTableContext();
  const router = useRouter();

  const writePageToUrl = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    if (page) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    router.push(`/admin/manage-user?${params.toString()}`);
  }

  const handlePageChange = async (page: number) => {
    // Update page in state (used for pagination component)
    dispatch({ type: "SET_PAGE", payload: page });

    // Update page in URL (used for browser navigation)
    writePageToUrl(page);
  };

  const parsePageFromUrl = () => {
    const page = new URLSearchParams(window.location.search).get("page");
    return page ? parseInt(page) : 1;
  };

  useEffect(() => {
    const page = parsePageFromUrl();
    dispatch({ type: "SET_PAGE", payload: page });
  }, [dispatch]);

  return { handlePageChange };
}