import { Provider } from '@prisma/client';
import prisma from '@/lib/prisma';
import {
  IProviderRepository,
  ProviderInclude,
  ProviderWithModels,
  ProviderCreateData,
  ModelCreateData
} from '../interfaces/IProviderRepository';

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
    // Menonaktifkan semua dan mengaktifkan satu dalam satu transaksi
    const [, updatedProvider] = await prisma.$transaction([
      prisma.provider.updateMany({
        data: { isActive: false }
      }),
      prisma.provider.update({
        where: { id: providerId },
        data: { isActive: true },
        include: {
          models: {
            orderBy: { name: 'asc' },
          },
          activeModel: true
        }
      })
    ]);

    return updatedProvider as ProviderWithModels;
  }

  async create(data: ProviderCreateData): Promise<Provider> {
    return prisma.provider.create({
      data
    });
  }

  async createWithDefaults(data: ProviderCreateData): Promise<Provider> {
    // Menggunakan transaksi untuk reset dan create dalam satu operasi atomik
    return prisma.$transaction(async (tx) => {
      // Jika ini provider default, reset semua default lain
      if (data.isDefault) {
        await tx.provider.updateMany({
          where: { isDefault: true },
          data: { isDefault: false }
        });
      }

      return tx.provider.create({ data });
    });
  }

  async createDefaultProviderWithModel(
    providerData: ProviderCreateData,
    modelData: ModelCreateData
  ): Promise<ProviderWithModels> {
    return prisma.$transaction(async (tx) => {
      // Reset default provider jika ada
      await tx.provider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });

      // Buat provider default
      const provider = await tx.provider.create({
        data: providerData
      });

      // Buat model default untuk provider ini
      const model = await tx.aIModel.create({
        data: {
          ...modelData,
          providerId: provider.id
        }
      });

      // Set sebagai active model
      return tx.provider.update({
        where: { id: provider.id },
        data: { activeModelId: model.id },
        include: {
          models: {
            orderBy: { name: 'asc' },
            where: { isAvailable: true }
          },
          activeModel: true
        }
      }) as Promise<ProviderWithModels>;
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