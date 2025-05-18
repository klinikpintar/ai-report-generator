import { IApiKeyService } from "../interfaces/IApiKeyService";
import { IProviderRepository, ProviderWithModels } from "../interfaces/IProviderRepository";
import { ProviderValidation } from '../dtos/provider.dto';
import { AIModelValidation } from "../dtos/aimodel.dto";
import { randomUUID } from "crypto";

export class DefaultProviderFactory {
  constructor(
    private readonly providerRepository: IProviderRepository,
    private readonly apiKeyService: IApiKeyService
  ) {}
  
  /**
   * Create default provider with model
   */
  async createDefault(): Promise<ProviderWithModels> {
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

    // Karena API key diperoleh dari env variable, tidak dilakukan validasi tambahan
    const encryptedApiKey = this.apiKeyService.encryptApiKey(defaultProviderData.apiKey);

    // Validasi data model dengan Zod
    const defaultModelData = AIModelValidation.POST.parse({
      name: 'Gemini 2.0 Flash',
      modelIdentifier: 'gemini-2.0-flash',
      providerId: randomUUID(), // Will be replaced in transaction, only needed to pass validation
      isDefault: true,
      isAvailable: true
    });

    // Menggunakan createDefaultProviderWithModel yang menjalankan semua operasi dalam satu transaksi
    const completeProvider = await this.providerRepository.createDefaultProviderWithModel(
      {
        name: defaultProviderData.name,
        displayName: defaultProviderData.displayName,
        apiKey: encryptedApiKey,
        isActive: defaultProviderData.isActive,
        isDefault: defaultProviderData.isDefault,
      },
      {
        name: defaultModelData.name,
        modelIdentifier: defaultModelData.modelIdentifier,
        isDefault: defaultModelData.isDefault,
        isAvailable: defaultModelData.isAvailable
      }
    );

    if (!completeProvider) {
      throw new Error("Failed to create default provider");
    }

    return completeProvider;
  }
}