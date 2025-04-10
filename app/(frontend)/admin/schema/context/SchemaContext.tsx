import { Platform, Schema, Service } from "../types";
import { createTableContext, createTableProvider, createUseTableContext, TableState } from "@frontend/components/table/TableContext";

type SchemaFilters = {
  platform: Platform;
  service: Service;
};

type SchemaTableState = TableState<Schema, SchemaFilters>

const initialState: SchemaTableState = {
  data: [],
  filters: {
    platform: { all: [], selected: [] },
    service: { all: [], selected: [] },
  },
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
  },
};

export const SchemaContext = createTableContext<Schema, SchemaFilters>();
export const SchemaProvider = createTableProvider<Schema, SchemaFilters>(SchemaContext, initialState);
export const useSchemaContext = createUseTableContext(SchemaContext);
