"use client";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Chip, ChipProps } from "@/components/ui/chip";
import React from "react";
import { User } from "../types";
import { generatePagination } from "../utils/pagination";

interface UserTableProps {
  users: User[];
  currentPage: number;
  lastPage: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentPage = 1,
  lastPage = 1,
  isLoading = false,
  onPageChange,
}) => {
  const pages = generatePagination(currentPage, lastPage);

  const roleVariantMap: Record<string, ChipProps["variant"]> = {
    ADMIN: "orange",
    BUSINESS_ANALYST: "yellow",
  };

  const statusVariantMap: Record<string, ChipProps["variant"]> = {
    true: "green",
    false: "destructive",
  };

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                {isLoading ? "Loading..." : "Tidak ada user yang ditemukan"}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    variant={roleVariantMap[user.role] ?? "default"}
                    className="w-full cursor-default"
                  >
                    {user.role}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Chip
                    variant={statusVariantMap[user.isActive.toString()]}
                    className="w-full cursor-default"
                  >
                    {user.isActive ? "Aktif" : "Tidak Aktif"}
                  </Chip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pagination className="w-full flex justify-between">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={currentPage > 1 ? `?page=${currentPage - 1}` : "#"}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
        <PaginationContent>
          {pages.map((page, index) => (
            <PaginationItem key={index}>
              <PaginationLink
                href={`?page=${page}`}
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof page === "number") {
                    onPageChange(page);
                  }
                }}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext
              href={currentPage < lastPage ? `?page=${currentPage + 1}` : "#"}
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < lastPage) onPageChange(currentPage + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
