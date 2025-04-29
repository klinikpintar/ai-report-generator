import { GetSchemaDto, GetSchemaResponse, ISchemaService, UpdateSchemaDto } from '../interfaces/ISchemaService';
import prisma from '@/lib/prisma';
import { Prisma, Schema } from '@prisma/client';
import { CreateSchemaDto as CreateSchemaValidator, GetSchemaDto as GetSchemaValidator } from '../dtos/schema.dtos';
import { BadRequestResponse } from '@backend/utils/exceptions';
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

  async findAllSchemas(data: GetSchemaDto): Promise<GetSchemaResponse> {
    const parsedData = GetSchemaValidator.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestResponse(parsedData.error.errors[0].message);
    }

    const { serviceIds, platformCodes, limit, page } = parsedData.data;
    const where: Prisma.SchemaWhereInput = {
      AND: [
        serviceIds && serviceIds.length > 0 ? { serviceId: { in: serviceIds } } : {},
        platformCodes && platformCodes.length > 0 ? { service: { platformCode: { in: platformCodes, mode: 'insensitive' } } } : {},
      ]
    };
    const [totalItems, items] = await Promise.all([
      prisma.schema.count({where}),
      prisma.schema.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          service: true,
        },
      })
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    return {
      data: items,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
      },
    };
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
