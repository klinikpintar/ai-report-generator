import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface GenericTableColumn<T> {
  key: string;
  header: string;
  renderCell: (item: T) => React.ReactNode;
  width?: React.CSSProperties["width"];
}

export interface GenericTableProps<T> {
  columns: GenericTableColumn<T>[];
  data: T[];
  isLoading: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  keyExtractor: (item: T) => string | number;
}

export function GenericTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  loadingMessage = "Loading...",
  keyExtractor,
}: GenericTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} style={{ width: column.width }}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              {isLoading ? loadingMessage : emptyMessage}
            </TableCell>
          </TableRow>
        ) : (
          data.map((item) => (
            <TableRow key={keyExtractor(item)}>
              {columns.map((column) => (
                <TableCell
                  key={`${keyExtractor(item)}-${column.key}`}
                  style={{ width: column.width }}
                >
                  {column.renderCell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
