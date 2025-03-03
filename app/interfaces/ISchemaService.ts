import { Schema } from '@prisma/client';

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
export interface ISchemaService {
  /**
   * Create a new schema
   * @param data - Required fields to create a schema
   * @returns Promise<Schema> The created schema
   */
  createSchema(data: CreateSchemaDto): Promise<Schema>;

  /**
   * Find all schemas
   * @returns Promise<Schema[]> Array of schemas
   */
  findAllSchemas(): Promise<Schema[]>;

  /**
   * Update a schema
   * @param data - Contains schema ID and fields to update
   * @returns Promise<Schema> The updated schema
   */
  updateSchema(data: UpdateSchemaDto): Promise<Schema>;

  /**
   * Delete a schema by ID
   * @param id - Schema ID
   * @returns Promise<void> if deletion is successful
   */
  deleteSchema(id: number): Promise<void>;
}
