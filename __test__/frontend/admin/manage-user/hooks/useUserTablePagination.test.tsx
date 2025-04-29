import { renderHook, act } from "@testing-library/react";
import { useUserTablePagination } from "@frontend/admin/manage-user/hooks/useUserTablePagination"; 
import { useUserTableContext } from "@frontend/admin/manage-user/context/UserTableContext";
import { useRouter } from "next/navigation";

// Mocks
jest.mock("@frontend/admin/manage-user/context/UserTableContext", () => ({
  useUserTableContext: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("useUserTablePagination", () => {
  const dispatchMock = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    (useUserTableContext as jest.Mock).mockReturnValue({ dispatch: dispatchMock });
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    dispatchMock.mockClear();
    pushMock.mockClear();
  });

  const setup = (url = "http://localhost/admin/manage-user") => {
    delete (window as any).location;
    (window as any).location = new URL(url);
    return renderHook(() => useUserTablePagination());
  };

  it("✅ should update URL and fetch users when page changes", async () => {
    setup();

    const { result } = renderHook(() => useUserTablePagination());

    await act(async () => {
      await result.current.handlePageChange(2);
    });

    expect(dispatchMock).toHaveBeenCalledWith({ type: "SET_PAGE", payload: 2 });
    expect(pushMock).toHaveBeenCalledWith("/admin/manage-user?page=2");
  });

  it("✅ should remove page param from URL if page is falsy", async () => {
    setup("http://localhost/admin/manage-user?page=3");

    const { result } = renderHook(() => useUserTablePagination());

    await act(async () => {
      await result.current.handlePageChange(0); // 0 dianggap falsy
    });

    expect(dispatchMock).toHaveBeenCalledWith({ type: "SET_PAGE", payload: 0 });
    expect(pushMock).toHaveBeenCalledWith("/admin/manage-user?");
  });

  it("✅ should parse page from URL on mount", () => {
    setup("http://localhost/admin/manage-user?page=5");

    renderHook(() => useUserTablePagination());

    expect(dispatchMock).toHaveBeenCalledWith({ type: "SET_PAGE", payload: 5 });
  });

  it("✅ should fallback to page 1 if no page param in URL", () => {
    setup("http://localhost/admin/manage-user");

    renderHook(() => useUserTablePagination());

    expect(dispatchMock).toHaveBeenCalledWith({ type: "SET_PAGE", payload: 1 });
  });
});