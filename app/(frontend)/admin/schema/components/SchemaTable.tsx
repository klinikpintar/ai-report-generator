"use client";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import type React from "react";
import { Chip } from "@/components/ui/chip";
import type { Platform, Schema } from "@frontend/common/types";
import { GenericTable, type GenericTableColumn, TablePagination } from "@frontend/components/table";
import { useSchemaTable } from "@frontend/admin/schema/hooks";

const getPlatformColor = (platform: Platform) => {
  switch (platform.toUpperCase()) {
    case "POSTGRESQL":
      return "#013F59";
    case "MYSQL":
      return "#FF9500";
    case "MONGODB":
      return "#009951";
    default:
      return "#000000";
  }
};

type SchemaTableProps = {
  onEditSchema: (schema: Schema) => void;
  onDeleteSchema: (schema: Schema) => void;
  onViewSchema: (schema: Schema) => void;
};

export const SchemaTable: React.FC<SchemaTableProps> = ({
  onEditSchema,
  onDeleteSchema,
  onViewSchema,
}) => {
  const { schemas, isLoading, currentPage, lastPage, handlePageChange } = useSchemaTable();

  const columns: GenericTableColumn<Schema>[] = [
    {
      key: "name",
      header: "Nama Skema",
      renderCell: (schema) => schema.name,
    },
    {
      key: "platform",
      header: "Platform",
      renderCell: (schema) => (
        <Chip
          variant="default"
          className="w-full cursor-default text-white"
          style={{ backgroundColor: getPlatformColor(schema.service.platformCode) }}
        >
          {schema.service.platformCode}
        </Chip>
      ),
    },
    {
      key: "service",
      header: "Service",
      renderCell: (schema) => schema.service?.name,
    },
    {
      key: "file",
      header: "File",
      renderCell: (schema) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewSchema(schema)}
          className="text-blue-6 hover:text-blue-6/90"
        >
          <FileIcon className="h-4 w-4 mr-1" />
          File
        </Button>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      renderCell: (schema) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            role="button"
            name="Edit"
            onClick={() => onEditSchema(schema)}
            className="bg-blue-6 hover:bg-blue-6/90"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            role="button"
            name="Delete"
            onClick={() => onDeleteSchema(schema)}
            className="text-red-500 hover:text-red-700 border-red-500 border-2"
          >
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4" data-testid="schema-table">
      <GenericTable<Schema>
        columns={columns}
        data={schemas}
        isLoading={isLoading}
        emptyMessage="Tidak ada skema yang ditemukan"
        loadingMessage="Loading..."
        keyExtractor={(schema) => schema.id}
      />

      <TablePagination
        currentPage={currentPage}
        lastPage={lastPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
