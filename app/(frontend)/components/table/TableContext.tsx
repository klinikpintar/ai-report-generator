import React, { createContext, useContext, useReducer, ReactNode, Dispatch, useMemo } from "react";

export interface FilterGroup<T> {
  all: T[];
  selected: T[];
}

export interface TableState<T, FilterTypes extends Record<string, unknown>> {
  data: T[];
  filters: {
    [K in keyof FilterTypes]: FilterGroup<FilterTypes[K]>;
  };
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
  };
}

export type TableAction<T, FilterTypes extends Record<string, unknown>> =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { data: T[]; lastPage: number } }
  | { type: "FETCH_ERROR"; payload: string }
  | {
      type: "SET_FILTERS";
      payload: Partial<{
        [K in keyof FilterTypes]: FilterGroup<FilterTypes[K]>;
      }>;
    }
  | { type: "SET_PAGE"; payload: number };

export interface TableContextProps<T, FilterTypes extends Record<string, unknown>> {
  state: TableState<T, FilterTypes>;
  dispatch: Dispatch<TableAction<T, FilterTypes>>;
}

export function createTableContext<T, FilterTypes extends Record<string, unknown>>() {
  return createContext<TableContextProps<T, FilterTypes> | undefined>(undefined);
}

export function tableReducer<T, FilterTypes extends Record<string, unknown>>(
  state: TableState<T, FilterTypes>,
  action: TableAction<T, FilterTypes>
): TableState<T, FilterTypes> {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return {
        ...state,
        data: action.payload.data,
        pagination: {
          ...state.pagination,
          lastPage: action.payload.lastPage,
        },
        isLoading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, currentPage: 1 }, // Reset to first page when filters change
      };
    case "SET_PAGE":
      return { ...state, pagination: { ...state.pagination, currentPage: action.payload } };
    default:
      return state;
  }
}

// Generic table provider generator
export function createTableProvider<T, FilterTypes extends Record<string, unknown>>(
  TableContext: React.Context<TableContextProps<T, FilterTypes> | undefined>,
  initialState: TableState<T, FilterTypes>
) {
  return function TableProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(
      (state: TableState<T, FilterTypes>, action: TableAction<T, FilterTypes>) =>
        tableReducer(state, action),
      initialState
    );

    const contextValue = useMemo(() => {
      return { state, dispatch };
    }, [state, dispatch]); 

    return <TableContext.Provider value={contextValue}>{children}</TableContext.Provider>;
  };
}

// Custom hook to use table context
export function createUseTableContext<T, FilterTypes extends Record<string, unknown>>(
  TableContext: React.Context<TableContextProps<T, FilterTypes> | undefined>
) {
  return function useTableContext() {
    const context = useContext(TableContext);
    if (context === undefined) {
      throw new Error("useTableContext must be used within a TableProvider");
    }
    return context;
  };
}
