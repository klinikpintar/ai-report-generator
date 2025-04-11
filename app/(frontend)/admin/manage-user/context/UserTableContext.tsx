import { createTableContext, createTableProvider, createUseTableContext, TableState } from "@frontend/components/table";
import { UserRole, User } from "../types/user";

type UserTableFilter = {
  role: UserRole;
};

type UserTableState = TableState<User, UserTableFilter>

const initialState: UserTableState = {
  data: [],
  filters: {
    role: { all: [], selected: [] },
  },
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
  },
};

export const UserTableContext = createTableContext<User, UserTableFilter>();
export const UserTableProvider = createTableProvider<User, UserTableFilter>(UserTableContext, initialState);
export const useUserTableContext = createUseTableContext(UserTableContext);
