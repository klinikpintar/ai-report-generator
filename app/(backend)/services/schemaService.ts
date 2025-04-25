import { ISchemaService, UpdateSchemaDto } from '../interfaces/ISchemaService';
import prisma from '@/lib/prisma';
import { Schema } from '@prisma/client';
import { CreateSchemaDto as CreateSchemaValidator } from '../dtos/schema.dtos';
import { generateSchemaEmbeddings } from '@/lib/schema-embedding';

class SchemaService implements ISchemaService {
  async createSchema(data: unknown): Promise<Schema> {
    const parsedData = CreateSchemaValidator.parse(data);
    const schema = await prisma.schema.create({
      data: {
        name: parsedData.name,
        description: parsedData.description,
        schemaText: parsedData.schemaText,
        serviceId: parsedData.serviceId
      },
    });
    
    // Generate embeddings for the new schema
    try {
      await generateSchemaEmbeddings({
        id: schema.id,
        name: schema.name,
        description: schema.description,
        schemaText: schema.schemaText
      });
      console.log(`Generated embeddings for schema ${schema.id}`);
    } catch (error) {
      console.error(`Error generating embeddings for schema ${schema.id}:`, error);
    }
    
    return schema;
  }

async findAllSchemas(serviceIds?: string[], platformCodes?: string[]): Promise<Schema[]> {
  return prisma.schema.findMany({
    where: {
      ...(serviceIds?.length ? { serviceId: { in: serviceIds } } : {}),
      ...(platformCodes?.length
        ? {
            service: {
              platformCode: {
                in: platformCodes,
              },
            },
          }
        : {}),
    },
    include: {
      service: true,
    },
  });
}

  async updateSchema(data: UpdateSchemaDto): Promise<Schema> {
    const { id, ...updateFields } = data;
    const schema = await prisma.schema.update({
      where: { id },
      data: updateFields,
    });
    
    // If schema text was updated, regenerate the embeddings
    if (updateFields.schemaText) {
      try {
        await generateSchemaEmbeddings({
          id: schema.id,
          name: schema.name,
          description: schema.description,
          schemaText: schema.schemaText
        });
        console.log(`Updated embeddings for schema ${schema.id}`);
      } catch (error) {
        console.error(`Error updating embeddings for schema ${schema.id}:`, error);
      }
    }
    
    return schema;
  }

  async deleteSchema(id: number): Promise<void> {
    // Embeddings will be automatically deleted via cascade delete
    await prisma.schema.delete({
      where: { id },
    });
  }
}

const schemaService = new SchemaService();
export default schemaService;
