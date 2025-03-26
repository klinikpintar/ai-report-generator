import schemaService from '@backend/services/schemaService';
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
      serviceId: 'db9caeca-aa1a-46f6-84de-adfe0a414c03',
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
    (prisma.schema.update as jest.Mock).mockRejectedValue(new Error('Instance not found'));
    await expect(schemaService.updateSchema({ id: 9999, description: 'Invalid' }))
      .rejects.toThrow('Instance not found');
  });

  it('should handle error when deleting a non-existing schema', async () => {
    (prisma.schema.delete as jest.Mock).mockRejectedValue(new Error('Instance not found'));
    await expect(schemaService.deleteSchema(9999)).rejects.toThrow('Instance not found');
  });

  it('should retrieve schemas filtered by serviceId', async () => {
    const SERVICE_ID = "bd7a4c7a-1234-4c5e-b123-df12345abcd1";
    const SERVICE_ID_2 = "bd7a4c7a-1234-4c5e-b123-df12345abcd2";
  
    const filteredSchemas = [
      {
        id: 1,
        name: "products",
        description: "Table for product info",
        schemaText: "CREATE TABLE products (id SERIAL PRIMARY KEY);",
        serviceId: SERVICE_ID,
      },
      {
        id: 1,
        name: "users",
        description: "Table for user info",
        schemaText: "CREATE TABLE users (id SERIAL PRIMARY KEY);",
        serviceId: SERVICE_ID_2,
      },
    ];
  
    (prisma.schema.findMany as jest.Mock).mockImplementation(({ where }) => {
      return Promise.resolve(filteredSchemas.filter(schema => schema.serviceId == where.serviceId));
    });
  
    const result = await schemaService.findAllSchemas(SERVICE_ID);
  
    expect(prisma.schema.findMany).toHaveBeenCalledWith({
      where: { serviceId: SERVICE_ID },
    });
    expect(result).toEqual([filteredSchemas[0]]);
  });
  
});
