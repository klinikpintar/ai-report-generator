import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export interface GenericTableColumn<T> {
  key: string;
  header: string;
  renderCell: (item: T) => React.ReactNode;
  width?: React.CSSProperties["width"];
}

export interface GenericTableProps<T> {
  readonly columns: GenericTableColumn<T>[];
  readonly data: T[];
  readonly isLoading: boolean;
  readonly emptyMessage?: string;
  readonly keyExtractor: (item: T) => string | number;
}

export function GenericTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = "No data found",
  keyExtractor,
}: GenericTableProps<T>) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.key} style={{ width: column.width }} className="text-nowrap">
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          [...Array(5)].map((i) => (
            <TableRow key={`loader-${i}`}>
              {columns.map((column) => (
                <TableCell key={column.key} style={{ width: column.width }} className="h-12">
                  <Skeleton className="h-4 w-4/5" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        {!isLoading && data.length === 0 && (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          data.length > 0 &&
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
          ))}
      </TableBody>
    </Table>
  );
}
