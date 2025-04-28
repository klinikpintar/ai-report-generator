import prisma from '@/lib/prisma';
import { Provider, AIModel } from '@prisma/client';
import { encryptApiKey } from '../utils/apiKeyUtils';
import { NotFoundResponse } from '../utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { AIModelValidation } from '@/app/(backend)/dtos/aimodel.dto';
import { z } from 'zod';

// Type untuk internal processing, sebelum transformasi
type PrismaProviderWithModels = Provider & {
  models?: AIModel[]; 
  activeModel?: AIModel | null; 
};

class ProviderService {
  /**
   * Mendapatkan semua provider dengan model-modelnya
   */
  async getAllProviders(
    optionsInput?: z.infer<typeof ProviderValidation.GET>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>[] | z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>[]> {
    // Validasi input dengan Zod
    const options = ProviderValidation.GET.parse(optionsInput || {});

    const query: {
      where?: { isActive?: boolean };
      include: {
        activeModel: boolean;
        models?: {
          orderBy: { name: 'asc' };
        };
      };
    } = {
      include: {
        activeModel: true,
      }
    };

    // Buat query filter berdasarkan options
    if (options.onlyActive) {
      query.where = { isActive: true };
    }

    // Selalu include activeModel
    query.include = {
      activeModel: true,
    };

    // Include models jika diminta
    if (options.includeModels) {
      query.include.models = {
        orderBy: { name: 'asc' },
      };
    }

    const providers = await prisma.provider.findMany(query);

    // Transform output menggunakan skema Zod yang sesuai
    return providers.map(provider =>
      options.includeModels
        ? ProviderValidation.RESPONSE_WITH_MODELS.parse(provider)
        : ProviderValidation.RESPONSE.parse(provider)
    );
  }

  /**
   * Mendapatkan provider aktif atau default dengan fallback
   */
  async getActiveOrDefaultProvider(): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    // Coba dapatkan provider aktif
    let provider = await prisma.provider.findFirst({
      where: { isActive: true },
      include: {
        activeModel: true,
        models: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      }
    }) as PrismaProviderWithModels | null;

    // Jika tidak ada provider aktif, gunakan provider default
    if (!provider) {
      provider = await prisma.provider.findFirst({
        where: { isDefault: true },
        include: {
          activeModel: true,
          models: {
            where: { isAvailable: true },
            orderBy: { name: 'asc' }
          }
        }
      }) as PrismaProviderWithModels | null;

      // Aktifkan provider default jika ditemukan
      if (provider) {
        await prisma.provider.update({
          where: { id: provider.id },
          data: { isActive: true }
        });

        // Update provider dalam memory
        provider.isActive = true;
      }
    }

    // Jika provider tidak memiliki model aktif, tetapkan model default atau pertama
    if (provider && !provider.activeModel && provider.models && provider.models.length > 0) {
      // Cari model default untuk provider ini
      const defaultModel = provider.models.find(model => model.isDefault);
      // Atau gunakan model pertama jika tidak ada default
      const modelToActivate = defaultModel || provider.models[0];

      // Set model sebagai aktif
      await prisma.provider.update({
        where: { id: provider.id },
        data: { activeModelId: modelToActivate.id }
      });

      // Update provider object dalam memory
      provider.activeModelId = modelToActivate.id;
      provider.activeModel = modelToActivate;
    }

    // Jika masih tidak ada provider, buat provider default on-the-fly
    if (!provider) {
      provider = await this.createDefaultProvider();
    }

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(provider);
  }

  /**
   * Mengubah model aktif untuk sebuah provider
   */
  async updateActiveModel(
    providerId: string,
    modelId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    // Validasi input dengan schema SET_ACTIVE_MODEL
    const validatedData = ProviderValidation.SET_ACTIVE_MODEL.parse({
      providerId,
      modelId
    });

    // Verifikasi provider exists
    const provider = await prisma.provider.findUnique({
      where: { id: validatedData.providerId }
    });

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Verifikasi model exists dan milik provider ini
    const model = await prisma.aIModel.findFirst({
      where: {
        id: validatedData.modelId,
        providerId: validatedData.providerId,
        isAvailable: true
      }
    });

    if (!model) {
      throw new NotFoundResponse(
        `Model with ID ${validatedData.modelId} not found or not available for provider ${validatedData.providerId}`
      );
    }

    // Update activeModelId
    const updatedProvider = await prisma.provider.update({
      where: { id: validatedData.providerId },
      data: { activeModelId: validatedData.modelId },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true,
      }
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(updatedProvider);
  }

  /**
   * Mengubah API key provider
   */
  async updateApiKey(
    providerId: string,
    apiKey: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    // Validasi input dengan schema UPDATE_API_KEY
    const validatedData = ProviderValidation.UPDATE_API_KEY.parse({
      providerId,
      apiKey
    });

    const provider = await prisma.provider.findUnique({
      where: { id: validatedData.providerId }
    });

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    const encryptedApiKey = encryptApiKey(validatedData.apiKey);

    // Update API key
    const updatedProvider = await prisma.provider.update({
      where: { id: validatedData.providerId },
      data: { apiKey: encryptedApiKey },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true,
      }
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(updatedProvider);
  }

  /**
   * Set provider as active and deactivate others
   */
  async setActiveProvider(
    providerId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    // Validasi input dengan schema ACTIVATE
    const validatedData = ProviderValidation.ACTIVATE.parse({ providerId });

    const provider = await prisma.provider.findUnique({
      where: { id: validatedData.providerId }
    });

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Nonaktifkan semua provider
    await prisma.provider.updateMany({
      data: { isActive: false }
    });

    // Aktifkan provider yang dipilih
    const updatedProvider = await prisma.provider.update({
      where: { id: validatedData.providerId },
      data: { isActive: true },
      include: {
        models: {
          orderBy: { name: 'asc' },
        },
        activeModel: true
      }
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(updatedProvider);
  }

  /**
   * Buat provider baru
   */
  async createProvider(
    data: z.infer<typeof ProviderValidation.POST>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>> {
    const validatedData = ProviderValidation.POST.parse(data);

    const encryptedApiKey = encryptApiKey(validatedData.apiKey);

    // Jika ini provider default, reset semua default lain
    if (validatedData.isDefault) {
      await prisma.provider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false }
      });
    }

    // Buat provider
    const provider = await prisma.provider.create({
      data: {
        name: validatedData.name,
        displayName: validatedData.displayName,
        apiKey: encryptedApiKey,
        isActive: validatedData.isActive,
        isDefault: validatedData.isDefault,
      }
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE.parse(provider);
  }

  /**
   * Helper function untuk membuat provider default jika belum ada
   * @private
   */
  private async createDefaultProvider(): Promise<PrismaProviderWithModels> {
    // Default values dengan validasi Zod
    const defaultProviderData = ProviderValidation.POST.parse({
      name: 'gemini',
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY || 'fallback-key',
      isActive: true,
      isDefault: true,
    });

    // Enkripsi API key
    const encryptedApiKey = encryptApiKey(defaultProviderData.apiKey);

    // Buat provider default
    const provider = await prisma.provider.create({
      data: {
        name: defaultProviderData.name,
        displayName: defaultProviderData.displayName,
        apiKey: encryptedApiKey,
        isActive: defaultProviderData.isActive,
        isDefault: defaultProviderData.isDefault,
      }
    });

    // Validasi data model dengan Zod
    const defaultModelData = AIModelValidation.POST.parse({
      name: 'Gemini 2.0 Flash',
      modelIdentifier: 'gemini-2.0-flash',
      providerId: provider.id,
      isDefault: true,
      isAvailable: true
    });

    // Buat model default
    const model = await prisma.aIModel.create({
      data: defaultModelData
    });

    // Set sebagai active model
    await prisma.provider.update({
      where: { id: provider.id },
      data: { activeModelId: model.id }
    });

    // Dapatkan provider lengkap dengan model
    const completeProvider = await prisma.provider.findUnique({
      where: { id: provider.id },
      include: {
        models: true,
        activeModel: true
      }
    });

    if (!completeProvider) {
      throw new Error("Failed to create default provider");
    }

    return completeProvider;
  }
}

const providerService = new ProviderService();
export default providerService;