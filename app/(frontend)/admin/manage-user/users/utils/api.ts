import { User } from "../types";

export interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  [key: string]: unknown;
}

interface ApiResponse {
  data: User[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
  };
  messages: string;
}

export async function fetchUsers(
  params: FetchUsersParams = {}
): Promise<ApiResponse> {
  const queryString = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      queryString.append(key, String(value));
    }
  }

  const response = await fetch(
    `${window.location.origin}/api/users?${queryString.toString()}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gagal fetch: ${response.status} - ${errorText}`);
  }

  const result = (await response.json()) as ApiResponse;

  return result;
}
