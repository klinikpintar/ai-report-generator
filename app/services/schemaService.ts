import { ISchemaService, UpdateSchemaDto } from '../interfaces/ISchemaService';
import prisma from '@/lib/prisma';
import { Schema } from '@prisma/client';
import { CreateSchemaDto as CreateSchemaValidator } from '../api/dtos/schema.dtos';

class SchemaService implements ISchemaService {
  public async createSchema(data: unknown): Promise<Schema> {
    const parsedData = CreateSchemaValidator.parse(data);

    return await prisma.schema.create({
      data: {
        name: parsedData.name,
        description: parsedData.description,
        schemaText: parsedData.schemaText,
      },
    });
  }

  public async findAllSchemas(): Promise<Schema[]> {
    return await prisma.schema.findMany();
  }

  public async updateSchema(data: UpdateSchemaDto): Promise<Schema> {
    const { id, ...updateFields } = data;

    return await prisma.schema.update({
      where: { id },
      data: updateFields,
    });
  }

  public async deleteSchema(id: number): Promise<void> {
    await prisma.schema.delete({
      where: { id },
    });
  }
}

// Singleton Instance
class SchemaServiceSingleton {
  private static instance: SchemaService;

  private constructor() {}

  public static getInstance(): SchemaService {
    if (!SchemaServiceSingleton.instance) {
      SchemaServiceSingleton.instance = new SchemaService();
    }
    return SchemaServiceSingleton.instance;
  }
}

const schemaService = SchemaServiceSingleton.getInstance();
export default schemaService;
