import { PaginationResponse } from "@frontend/common/types";
import { User } from "../types/user";

type FetchUsersParams = {
  page?: number;
  limit?: number;
  role?: string;
};

export const fetchUsers = async ({ page, limit, role }: FetchUsersParams) => {
  // Create the URL with query parameters
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (limit) params.append("limit", limit.toString());
  if (role) params.append("role", role);
  const url = `/api/users?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data: PaginationResponse<User> = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}