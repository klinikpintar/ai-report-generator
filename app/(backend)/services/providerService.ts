import { NotFoundResponse } from '../utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { z } from 'zod';
import { IProviderRepository, ProviderInclude} from '../interfaces/IProviderRepository';
import { IApiKeyService } from '@backend/interfaces/IApiKeyService';
import { IModelService } from '@backend/interfaces/IModelService';
import { DefaultProviderFactory } from '../factories/defaultProviderFactory';
import { IProviderService } from '../interfaces/IProviderService';

export class ProviderService implements IProviderService {
  private readonly defaultProviderFactory: DefaultProviderFactory;
  
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly modelService: IModelService,
    private readonly apiKeyService: IApiKeyService
  ) {
    this.defaultProviderFactory = new DefaultProviderFactory(providerRepository, apiKeyService);
  }

  /**
   * Mendapatkan semua provider dengan model-modelnya
   */
  async getAllProviders(
    optionsInput?: z.infer<typeof ProviderValidation.GET>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_INTERNAL>[] | z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS_INTERNAL>[]> {
    const options = ProviderValidation.GET.parse(optionsInput || {});

    const include: ProviderInclude = { activeModel: true };
    const where = options.onlyActive ? { isActive: true } : undefined;

    if (options.includeModels) {
      include.models = {
        orderBy: { name: 'asc' },
      };
    }

    const providers = await this.providerRepository.findMany({
      where,
      include,
    });

    return providers.map(provider =>
      options.includeModels
        ? ProviderValidation.RESPONSE_WITH_MODELS_INTERNAL.parse(provider)
        : ProviderValidation.RESPONSE.parse(provider)
    );
  }

  /**
   * Mendapatkan provider aktif atau default dengan fallback
   */
  async getActiveOrDefaultProvider(): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    // Coba dapatkan provider aktif
    let provider = await this.providerRepository.findActive({
      activeModel: true,
      models: {
        where: { isAvailable: true },
        orderBy: { name: 'asc' }
      }
    });

    // Jika tidak ada provider aktif, gunakan provider default
    if (!provider) {
      provider = await this.providerRepository.findByDefault({
        activeModel: true,
        models: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      });

      // Aktifkan provider default jika ditemukan
      if (provider) {
        // Gunakan updateById yang ditingkatkan untuk ACID
        provider = await this.providerRepository.updateById(
          provider.id,
          { isActive: true },
          {
            activeModel: true,
            models: {
              where: { isAvailable: true },
              orderBy: { name: 'asc' }
            }
          }
        );
      }
    }

    // Jika provider tidak memiliki model aktif, tetapkan model default atau pertama
    if (provider && !provider.activeModel && provider.models && provider.models.length > 0) {
      const modelId = await this.modelService.selectDefaultModelId(provider);
      
      if (modelId) {
        provider = await this.providerRepository.updateById(
          provider.id,
          { activeModelId: modelId },
          {
            activeModel: true,
            models: {
              where: { isAvailable: true },
              orderBy: { name: 'asc' }
            }
          }
        );
      }
    }

    // Jika masih tidak ada provider, buat provider default on-the-fly
    if (!provider) {
      provider = await this.defaultProviderFactory.createDefault();
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
    const validatedData = ProviderValidation.SET_ACTIVE_MODEL.parse({
      providerId,
      modelId
    });

    // Verifikasi provider exists
    const provider = await this.providerRepository.findById(validatedData.providerId);

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Verifikasi model exists dan milik provider ini
    const model = await this.modelService.findById(
      validatedData.modelId,
      validatedData.providerId
    );

    if (!model) {
      throw new NotFoundResponse(
        `Model with ID ${validatedData.modelId} not found or not available for provider ${validatedData.providerId}`
      );
    }

    // Update activeModelId
    const updatedProvider = await this.providerRepository.updateActiveModel(
      validatedData.providerId,
      validatedData.modelId
    );

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
    const validatedData = ProviderValidation.UPDATE_API_KEY.parse({
      providerId,
      apiKey
    });

    const provider = await this.providerRepository.findById(validatedData.providerId);

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Validasi API key dengan request ke API provider
    await this.apiKeyService.validateApiKey(provider.name, validatedData.apiKey);

    const encryptedApiKey = this.apiKeyService.encryptApiKey(validatedData.apiKey);

    // Update API key
    const updatedProvider = await this.providerRepository.updateApiKey(
      validatedData.providerId,
      encryptedApiKey
    );

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(updatedProvider);
  }

  /**
   * Set provider as active and deactivate others
   * Mengimplementasikan ACID dengan transaksi untuk menjamin bahwa operasi
   * deactivateAll dan setActive terjadi dalam satu transaksi atomik
   */
  async setActiveProvider(
    providerId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    const validatedData = ProviderValidation.ACTIVATE.parse({ providerId });

    const provider = await this.providerRepository.findById(validatedData.providerId);

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Menggunakan setActive yang ditingkatkan untuk menjalankan deactivateAll dan update dalam satu transaksi
    const updatedProvider = await this.providerRepository.setActive(validatedData.providerId);

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE_WITH_MODELS.parse(updatedProvider);
  }

  /**
   * Buat provider baru
   * Mengimplementasikan ACID untuk operasi reset defaults dan create provider
   */
  async createProvider(
    data: z.infer<typeof ProviderValidation.POST>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>> {
    const validatedData = ProviderValidation.POST.parse(data);

    // Validasi API key dengan request ke API provider
    await this.apiKeyService.validateApiKey(validatedData.name, validatedData.apiKey);

    const encryptedApiKey = this.apiKeyService.encryptApiKey(validatedData.apiKey);

    const provider = await this.providerRepository.createWithDefaults({
      name: validatedData.name,
      displayName: validatedData.displayName,
      apiKey: encryptedApiKey,
      isActive: validatedData.isActive,
      isDefault: validatedData.isDefault,
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE.parse(provider);
  }
}