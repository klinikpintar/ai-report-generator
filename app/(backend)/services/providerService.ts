import { encryptApiKey } from '../utils/apiKeyUtils';
import { NotFoundResponse } from '../utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { AIModelValidation } from '@/app/(backend)/dtos/aimodel.dto';
import { z } from 'zod';
import { IProviderRepository, ProviderInclude, ProviderWithModels } from '../interfaces/IProviderRepository';
import { IAIModelRepository } from '../interfaces/IAIModelRepository';
import { PrismaProviderRepository } from '../repositories/PrismaProviderRepository';
import { PrismaAIModelRepository } from '../repositories/PrismaAIModelRepository';

class ProviderService {
  private static instance: ProviderService | null;

  private constructor(
    private providerRepository: IProviderRepository,
    private modelRepository: IAIModelRepository
  ) { }

  public static getInstance(): ProviderService {
    if (!ProviderService.instance) {
      const providerRepository = new PrismaProviderRepository();
      const aiModelRepository = new PrismaAIModelRepository();
      ProviderService.instance = new ProviderService(providerRepository, aiModelRepository);
    }

    return ProviderService.instance;
  }

  public static resetInstance(): void {
    ProviderService.instance = null;
  }

  /**
   * Mendapatkan semua provider dengan model-modelnya
   */
  async getAllProviders(
    optionsInput?: z.infer<typeof ProviderValidation.GET>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>[] | z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>[]> {
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
        ? ProviderValidation.RESPONSE_WITH_MODELS.parse(provider)
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
        await this.providerRepository.updateById(provider.id, { isActive: true });
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
      await this.providerRepository.updateById(provider.id, { activeModelId: modelToActivate.id });

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
    const model = await this.modelRepository.findById(
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

    const encryptedApiKey = encryptApiKey(validatedData.apiKey);

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
   */
  async setActiveProvider(
    providerId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>> {
    const validatedData = ProviderValidation.ACTIVATE.parse({ providerId });

    const provider = await this.providerRepository.findById(validatedData.providerId);

    if (!provider) {
      throw new NotFoundResponse(`Provider with ID ${validatedData.providerId} not found`);
    }

    // Nonaktifkan semua provider
    await this.providerRepository.deactivateAll();

    // Aktifkan provider yang dipilih
    const updatedProvider = await this.providerRepository.setActive(validatedData.providerId);

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
      await this.providerRepository.resetDefaults();
    }

    // Buat provider
    const provider = await this.providerRepository.create({
      name: validatedData.name,
      displayName: validatedData.displayName,
      apiKey: encryptedApiKey,
      isActive: validatedData.isActive,
      isDefault: validatedData.isDefault,
    });

    // Transform output dengan skema Zod
    return ProviderValidation.RESPONSE.parse(provider);
  }

  /**
   * Helper function untuk membuat provider default jika belum ada
   * @private
   */
  private async createDefaultProvider(): Promise<ProviderWithModels> {
    // Default values dengan validasi Zod
    const defaultProviderData = ProviderValidation.POST.parse({
      name: 'gemini',
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY ?? (() => {
        throw new Error('GEMINI_API_KEY env var is required to bootstrap the default provider');
      })(),
      isActive: true,
      isDefault: true,
    });

    // Enkripsi API key
    const encryptedApiKey = encryptApiKey(defaultProviderData.apiKey);

    // Buat provider default
    const provider = await this.providerRepository.create({
      name: defaultProviderData.name,
      displayName: defaultProviderData.displayName,
      apiKey: encryptedApiKey,
      isActive: defaultProviderData.isActive,
      isDefault: defaultProviderData.isDefault,
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
    const model = await this.modelRepository.create(defaultModelData);

    // Set sebagai active model
    await this.providerRepository.updateById(
      provider.id,
      { activeModelId: model.id }
    );

    // Dapatkan provider lengkap dengan model
    const completeProvider = await this.providerRepository.findById(
      provider.id,
      {
        models: {
          orderBy: { name: 'asc' },
          where: { isAvailable: true }
        },
        activeModel: true
      }
    );

    if (!completeProvider) {
      throw new Error("Failed to create default provider");
    }

    return completeProvider;
  }
}

export default ProviderService.getInstance();