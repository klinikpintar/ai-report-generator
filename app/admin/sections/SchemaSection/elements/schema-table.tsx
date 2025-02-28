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
import { dummySchemas } from "../constant";
import { Chip } from "@/components/ui/chip";

export const SchemaTable = () => {
  return (
    <div className="flex flex-col gap-4">
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
          {dummySchemas.map((schema) => (
            <TableRow key={schema.id}>
              <TableCell>{schema.name}</TableCell>
              <TableCell className="px-2">
                <Chip variant="orange" className="w-full cursor-default">
                  {schema.service.platform.name}
                </Chip>
              </TableCell>
              <TableCell className="px-2">
                <Chip variant="pink" className="w-full cursor-default">
                  {schema.service.name}
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
                <Button size="sm" className="mr-2 bg-[#00B0EB] hover:bg-[#00B0EB]/90">
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
            <PaginationPrevious href="#" />
          </PaginationItem>
        </PaginationContent>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#" isActive={true}>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">9</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
        </PaginationContent>
        <PaginationContent>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
