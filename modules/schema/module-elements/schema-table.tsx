"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FileIcon } from "lucide-react";
import React from "react";
import { Chip } from "@/components/ui/chip";
import { Schema } from "../types";
import { generatePagination } from "../utils/pagination";
import EditSchemaModal from "@/app/components/EditSchemaModal";
import { deleteSchema } from "../utils/api";

type SchemaTableProps = {
  schemas: Schema[];
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
};

export const SchemaTable: React.FC<SchemaTableProps> = ({
  schemas,
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
}) => {
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [selectedSchema, setSelectedSchema] = React.useState<Schema | null>(null);
  const pages = generatePagination(currentPage, lastPage);

  const handleEdit = (schema: Schema) => {
    setSelectedSchema(schema);
    setShowEditModal(true);
  };

  const handleDelete = async (schema: Schema) => {
    const response = await deleteSchema(schema.id);
    if (response.ok) {
      alert("Skema berhasil dihapus");
    } else {
      alert("Gagal menghapus skema");
    }
  };

  return (
    <div className="flex flex-col gap-4" data-testid="schema-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Skema</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>File</TableHead>
            <TableHead>Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schemas.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {isLoading ? "Loading..." : "Tidak ada skema yang ditemukan"}
              </TableCell>
            </TableRow>
          )}
          {schemas.map((schema) => (
            <TableRow key={schema.id}>
              <TableCell>{schema.name}</TableCell>
              <TableCell className="px-2">
                <Chip variant="orange" className="w-full cursor-default">
                  {schema.service ? schema.service.platform.name : "Unknown"}
                </Chip>
              </TableCell>
              <TableCell className="px-2">
                <Chip variant="pink" className="w-full cursor-default">
                  {schema.service ? schema.service.name : "Unknown"}
                </Chip>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#00B0EB] hover:text-[#00B0EB]/90"
                >
                  <FileIcon className="h-4 w-4 mr-1" />
                  File
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  onClick={() => handleEdit(schema)}
                  className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(schema)}
                  className="text-red-500 hover:text-red-700 border-red-500 border-2"
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination className="w-full flex justify-between">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href={currentPage > 1 ? `?page=${currentPage - 1}` : ""} />
          </PaginationItem>
        </PaginationContent>
        <PaginationContent>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {typeof page === "number" ? (
                <PaginationLink href={`?page=${page}`} isActive={page === currentPage}>
                  {page}
                </PaginationLink>
              ) : (
                <PaginationEllipsis />
              )}
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href={currentPage < lastPage ? `?page=${currentPage + 1}` : ""} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      {showEditModal && (
        <EditSchemaModal
          isVisible={showEditModal}
          onClose={() => setShowEditModal(false)}
          schema={
            selectedSchema
              ? {
                  id: selectedSchema.id,
                  name: selectedSchema.name,
                  description: selectedSchema.description ?? "",
                  schemaText: selectedSchema.schemaText,
                  fileName: selectedSchema.name,
                }
              : null
          }
        />
      )}
    </div>
  );
};
