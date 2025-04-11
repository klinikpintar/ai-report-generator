import { mockUsers } from "@/__mocks__/user-data";
import { fetchUsers } from "@frontend/admin/manage-user/utils/api";

global.fetch = jest.fn() as jest.Mock;

describe("fetchUsers", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: mockUsers, pagination: { total_pages: 1 } }),
    });
  });

  // Positive test cases
  it("should fetch users even without parameter", async () => {
    const response = await fetchUsers({});
    expect(response.data).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/users"), expect.anything());
  });
  it("should fetch users with page parameter", async () => {
    const response = await fetchUsers({ page: 1 });
    expect(response.data).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/users"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("page=1"), expect.anything());
  });
  it("should fetch users with limit parameter", async () => {
    const response = await fetchUsers({ limit: 5 });
    expect(response.data).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/users"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"), expect.anything());
  });
  it("should fetch users with role parameter", async () => {
    const response = await fetchUsers({ role: "admin" });
    expect(response.data).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/users"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("role=admin"), expect.anything());
  });

  // Edge test cases
  it("should fetch users with multiple parameters", async () => {
    const response = await fetchUsers({ page: 1, limit: 5, role: "admin" });
    expect(response.data).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/api/users"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("page=1"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("limit=5"), expect.anything());
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining("role=admin"), expect.anything());
  });

  // Negative test cases
  it("should handle throw error when response is not okay", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "error" }),
    });
    await expect(fetchUsers({})).rejects.toThrow(expect.any(Error));
  });
  it("should handle throw error when response is not json", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    });
    await expect(fetchUsers({})).rejects.toThrow(expect.any(Error));
  });
  it("should handle throw error when fetch failed", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));
    await expect(fetchUsers({})).rejects.toThrow(expect.any(Error));
  });
});
