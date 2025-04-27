import { Schema } from '@prisma/client';

export interface GetSchemaDto {
  serviceIds?: string[];
  platformCodes?: string[];
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export type GetSchemaResponse = PaginatedResponse<Schema>;

export interface CreateSchemaDto {
  name: string;
  description: string;
  schemaText: string;
}

export interface UpdateSchemaDto {
  id: number;
  name?: string;
  description?: string;
  schemaText?: string;
}

/**
 * The ISchemaService interface specifies how we'll create, read, update, and delete schemas.
 */
export interface ISchemaService extends IReadSchemaService, IWriteSchemaService, IDeleteSchemaService { }

export interface IReadSchemaService {
  /**
   * Find all schemas filtered by service IDs or platform codes
   * @returns Promise<Schema[]> Array of schemas
   */
  findAllSchemas(data: GetSchemaDto): Promise<GetSchemaResponse>;
}


export interface IWriteSchemaService {
  /**
   * Create a new schema
   * @param data - Required fields to create a schema
   * @returns Promise<Schema> The created schema
   */
  createSchema(data: CreateSchemaDto): Promise<Schema>;

  /**
   * Update a schema
   * @param data - Contains schema ID and fields to update
   * @returns Promise<Schema> The updated schema
   */
  updateSchema(data: UpdateSchemaDto): Promise<Schema>;
}


export interface IDeleteSchemaService {
  /**
   * Delete a schema by ID
   * @param id - Schema ID
   * @returns Promise<void> if deletion is successful
   */
  deleteSchema(id: number): Promise<void>;
}
