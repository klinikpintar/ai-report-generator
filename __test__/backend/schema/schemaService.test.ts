import schemaService from '@/app/services/schemaService';
import prisma from '@/lib/prisma';
import { Schema } from '@prisma/client';

jest.mock('@/lib/prisma', () => ({
  schema: {
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('SchemaService Unit Tests', () => {
  const mockSchema: Schema = {
    id: 1,
    name: 'Test Schema',
    description: 'Test Description',
    schemaText: 'CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT);',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.schema.create = jest.fn();
    prisma.schema.findMany = jest.fn();
    prisma.schema.update = jest.fn();
    prisma.schema.delete = jest.fn();
  });

  it('should create a schema', async () => {
    (prisma.schema.create as jest.Mock).mockResolvedValue(mockSchema);
    const result = await schemaService.createSchema({
      name: 'Test Schema',
      description: 'Test Description',
      schemaText: 'CREATE TABLE test (id SERIAL PRIMARY KEY, name TEXT);',
    });

    expect(prisma.schema.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockSchema);
  });

  it('should retrieve all schemas', async () => {
    (prisma.schema.findMany as jest.Mock).mockResolvedValue([mockSchema]);
    const result = await schemaService.findAllSchemas();

    expect(prisma.schema.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockSchema]);
  });

  it('should update a schema', async () => {
    const updatedSchema = { ...mockSchema, description: 'Updated Description' };
    (prisma.schema.update as jest.Mock).mockResolvedValue(updatedSchema);
    
    const result = await schemaService.updateSchema({
      id: 1,
      description: 'Updated Description',
    });

    expect(prisma.schema.update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(updatedSchema);
  });

  it('should delete a schema', async () => {
    (prisma.schema.delete as jest.Mock).mockResolvedValue(undefined);
    await schemaService.deleteSchema(1);

    expect(prisma.schema.delete).toHaveBeenCalledTimes(1);
  });

  it('should handle error when updating a non-existing schema', async () => {
    (prisma.schema.update as jest.Mock).mockRejectedValue(new Error('Schema not found'));
    await expect(schemaService.updateSchema({ id: 9999, description: 'Invalid' }))
      .rejects.toThrow('Schema not found');
  });

  it('should handle error when deleting a non-existing schema', async () => {
    (prisma.schema.delete as jest.Mock).mockRejectedValue(new Error('Schema not found'));
    await expect(schemaService.deleteSchema(9999)).rejects.toThrow('Schema not found');
  });
});
