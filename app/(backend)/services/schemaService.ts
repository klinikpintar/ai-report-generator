import { ISchemaService, UpdateSchemaDto } from '../interfaces/ISchemaService';
import prisma from '@/lib/prisma';
import { Schema } from '@prisma/client';
import { CreateSchemaDto as CreateSchemaValidator } from '../dtos/schema.dtos';

class SchemaService implements ISchemaService {
  async createSchema(data: unknown): Promise<Schema> {
    const parsedData = CreateSchemaValidator.parse(data);
    return prisma.schema.create({
      data: {
        name: parsedData.name,
        description: parsedData.description,
        schemaText: parsedData.schemaText,
      },
    });
  }

  async findAllSchemas(): Promise<Schema[]> {
    return prisma.schema.findMany();
  }

  async updateSchema(data: UpdateSchemaDto): Promise<Schema> {
    const { id, ...updateFields } = data;
    return prisma.schema.update({
      where: { id },
      data: updateFields,
    });
  }

  async deleteSchema(id: number): Promise<void> {
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
