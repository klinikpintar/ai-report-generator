import { PaginationResponse } from "@frontend/common/types";
import { User } from "../types/user";

type FetchUsersParams = {
  page?: number;
  limit?: number;
  role?: string;
};

export const fetchUsers = async ({ page, limit, role }: FetchUsersParams) => {
  
}