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
} from "@/components/ui/pagination"
import { FileIcon } from 'lucide-react';
import React from "react";
import { schemas } from "../constant";
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
          {schemas.map((schema) => (
            <TableRow key={schema.name}>
              <TableCell>{schema.name}</TableCell>
              <TableCell className="px-2">
                <Chip variant="orange" className="w-full cursor-default">{schema.platform}</Chip>
              </TableCell>
              <TableCell className="px-2">
                <Chip variant="pink" className="w-full cursor-default">{schema.service}</Chip>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-700">
                  <FileIcon className="h-4 w-4 mr-1" />
                  File
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" className="mr-2 bg-blue-500 hover:bg-blue-700">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 border-red-500 border-2">
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" className="text-gray-500">Sebelumnya</PaginationPrevious>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="bg-blue-500 text-white hover:bg-blue-600">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="text-gray-500">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="text-gray-500">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis className="text-gray-500" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="text-gray-500">8</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="text-gray-500">9</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" className="text-gray-500">10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" className="text-gray-500">Selanjutnya</PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
