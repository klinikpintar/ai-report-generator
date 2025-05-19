import { AIModel } from '@prisma/client';
import prisma from '@/lib/prisma';
import { IAIModelRepository } from '../interfaces/IAIModelRepository';

export class PrismaAIModelRepository implements IAIModelRepository {
  async findById(id: string, providerId: string): Promise<AIModel | null> {
    return prisma.aIModel.findFirst({
      where: {
        id,
        providerId,
        isAvailable: true
      }
    });
  }
  
  async create(data: {
    name: string;
    modelIdentifier: string;
    providerId: string;
    isDefault?: boolean;
    isAvailable?: boolean;
  }): Promise<AIModel> {
    return prisma.aIModel.create({
      data
    });
  }
}