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
import React, {useState} from "react";
import { Chip } from "@/components/ui/chip";
import { Schema } from "../types";
import { generatePagination } from "../utils/pagination";
import EditSchemaModal from "./EditSchemaModal";
import { deleteSchema } from "../utils/api";
import { ConfirmationDialog } from "./confirmation-dialog";
import { toast } from "react-toastify";
import Modal from "@frontend/components/Modal";

type SchemaTableProps = {
  schemas: Schema[];
  currentPage?: number;
  lastPage?: number;
  isLoading?: boolean;
  onFinishedAction?: () => void;
};

export const SchemaTable: React.FC<SchemaTableProps> = ({
  schemas,
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  onFinishedAction = () => {},
}) => {
  const [schemaToEdit, setSchemaToEdit] = React.useState<Schema | null>(null);
  const [schemaToDelete, setSchemaToDelete] = React.useState<Schema | null>(null);
  const [schemaToRead, setSchemaToRead] = React.useState<Schema | null>(null);
  const [isAnimateClose, setIsAnimateClose] = useState(false);
  const pages = generatePagination(currentPage, lastPage);

  const handleOpenEditModal = (schema: Schema) => {
    setSchemaToEdit(schema);
  };

  const handleCloseEditModal = () => {
    setSchemaToEdit(null);
    onFinishedAction();
    setIsAnimateClose(true);

    setTimeout(() => {
      setIsAnimateClose(false);
    }, 300);
  };

  const handleOpenDeleteModal = (schema: Schema) => {
    setSchemaToDelete(schema);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!schemaToDelete) return;
      const response = await deleteSchema(schemaToDelete.id);
      if (response.ok) {
        toast.success("Skema berhasil dihapus");
      } else {
        throw new Error("Failed to delete schema");
      }
    } catch {
      toast.error("Gagal menghapus skema");
    }
    handleCloseDeleteModal();
    onFinishedAction();
  };

  const handleCloseDeleteModal = () => {
    setSchemaToDelete(null);
  };

  const handleOpenReadModal = async (schema: Schema) => {
    setSchemaToRead(schema);
  };

  const handleCloseReadModal = async () => {
    setSchemaToRead(null);
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
          {schemas.map((schema) => {
            const platform = schema.service!.platform;
            return (
              <TableRow key={schema.id}>
                <TableCell>{schema.name}</TableCell>
                <TableCell className="px-2">
                  <Chip
                    variant="default"
                    className="w-full cursor-default text-white"
                    style={{ backgroundColor: platform.color }}
                  >
                    {platform.name}
                  </Chip>
                </TableCell>
                <TableCell className="px-2">{schema.service!.name}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenReadModal(schema)}
                    className="text-[#00B0EB] hover:text-[#00B0EB]/90"
                  >
                    <FileIcon className="h-4 w-4 mr-1" />
                    File
                  </Button>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    onClick={() => handleOpenEditModal(schema)}
                    className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDeleteModal(schema)}
                    className="text-red-500 hover:text-red-700 border-red-500 border-2"
                  >
                    Hapus
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
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

      <ConfirmationDialog
        isOpen={schemaToDelete !== null}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Skema"
        description="Apakah Anda yakin ingin menghapus skema ini?"
      />

      {(schemaToEdit || isAnimateClose) && (
        <EditSchemaModal
          isVisible={schemaToEdit !== null}
          onClose={handleCloseEditModal}
          schema={{
            id: schemaToEdit?.id ?? 0,
            name: schemaToEdit?.name ?? "",
            description: schemaToEdit?.description ?? "",
            schemaText: schemaToEdit?.schemaText ?? "",
            fileName: schemaToEdit?.name ?? "",
          }}
        />
      )}

      {schemaToRead && (
        <Modal
          title={schemaToRead.name}
          subtitle=""
          onClose={handleCloseReadModal}
          isVisible={schemaToRead !== null}
          onClearForm={() => {}}
        >
          <div className="p-8">
            <code className="block h-[500px] overflow-y-scroll">{schemaToRead.schemaText}</code>
          </div>
        </Modal>
      )}
    </div>
  );
};
