import { GetSchemaDto, ISchemaService, UpdateSchemaDto } from '../interfaces/ISchemaService';
import prisma from '@/lib/prisma';
import { Schema } from '@prisma/client';
import { CreateSchemaDto as CreateSchemaValidator, GetSchemaDto as GetSchemaValidator } from '../dtos/schema.dtos';
import { BadRequestResponse } from '@backend/utils/exceptions';

class SchemaService implements ISchemaService {
  async createSchema(data: unknown): Promise<Schema> {
    const parsedData = CreateSchemaValidator.parse(data);
    return prisma.schema.create({
      data: {
        name: parsedData.name,
        description: parsedData.description,
        schemaText: parsedData.schemaText,
        serviceId: parsedData.serviceId
      },
    });
  }

  async findAllSchemas(data: GetSchemaDto): Promise<Schema[]> {
    const parsedData = GetSchemaValidator.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestResponse(parsedData.error.errors[0].message);
    }

    const { serviceIds, platformCodes } = parsedData.data;

    return prisma.schema.findMany({
      where: {
        AND: [
          serviceIds && serviceIds.length > 0 ? { serviceId: { in: serviceIds } } : {},
          platformCodes && platformCodes.length > 0 ? { service: { platformCode: { in: platformCodes, mode: 'insensitive' } } } : {},
        ]
      },
      include: {
        service: true,
      },
    });
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

const schemaService = new SchemaService();
export default schemaService;
