import { Provider } from '@prisma/client';
import prisma from '@/lib/prisma';
import { IProviderRepository, ProviderInclude, ProviderWithModels } from '../interfaces/IProviderRepository';

export class PrismaProviderRepository implements IProviderRepository {
  async findMany(options: {
    where?: { isActive?: boolean };
    include?: ProviderInclude;
  }): Promise<ProviderWithModels[]> {
    return prisma.provider.findMany(options) as Promise<ProviderWithModels[]>;
  }

  async findActive(include?: ProviderInclude): Promise<ProviderWithModels | null> {
    return prisma.provider.findFirst({
      where: { isActive: true },
      include
    }) as Promise<ProviderWithModels | null>;
  }

  async findByDefault(include?: ProviderInclude): Promise<ProviderWithModels | null> {
    return prisma.provider.findFirst({
      where: { isDefault: true },
      include
    }) as Promise<ProviderWithModels | null>;
  }

  async findById(id: string, include?: ProviderInclude): Promise<ProviderWithModels | null> {
    return prisma.provider.findUnique({
      where: { id },
      include
    }) as Promise<ProviderWithModels | null>;
  }

  async updateActiveModel(providerId: string, modelId: string): Promise<ProviderWithModels> {
    return prisma.provider.update({
      where: { id: providerId },
      data: { activeModelId: modelId },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true,
      }
    }) as Promise<ProviderWithModels>;
  }

  async updateApiKey(providerId: string, encryptedApiKey: string): Promise<ProviderWithModels> {
    return prisma.provider.update({
      where: { id: providerId },
      data: { apiKey: encryptedApiKey },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true,
      }
    }) as Promise<ProviderWithModels>;
  }

  async setActive(providerId: string): Promise<ProviderWithModels> {
    return prisma.provider.update({
      where: { id: providerId },
      data: { isActive: true },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true
      }
    }) as Promise<ProviderWithModels>;
  }

  async create(data: {
    name: string;
    displayName: string;
    apiKey: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<Provider> {
    return prisma.provider.create({
      data
    });
  }

  async resetDefaults(): Promise<void> {
    await prisma.provider.updateMany({
      where: { isDefault: true },
      data: { isDefault: false }
    });
  }

  async updateById(id: string, data: Partial<Provider>, include?: ProviderInclude): Promise<ProviderWithModels> {
    return prisma.provider.update({
      where: { id },
      data,
      include
    }) as Promise<ProviderWithModels>;
  }

  async deactivateAll(): Promise<void> {
    await prisma.provider.updateMany({
      data: { isActive: false }
    });
  }
}