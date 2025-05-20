import { IAIModelRepository } from "../interfaces/IAIModelRepository";
import { IModelService } from "../interfaces/IModelService";
import { ProviderWithModels } from "../interfaces/IProviderRepository";

export class ModelService implements IModelService {
  constructor(private readonly modelRepository: IAIModelRepository) {}
  
  /**
   * Find model by ID and provider ID
   */
  async findById(modelId: string, providerId: string) {
    return this.modelRepository.findById(modelId, providerId);
  }
  
  /**
   * Select default model ID for a provider, or first model if no default
   */
  async selectDefaultModelId(provider: ProviderWithModels): Promise<string | null> {
    if (!provider.models || provider.models.length === 0) return null;
    
    const defaultModel = provider.models.find(model => model.isDefault);
    return defaultModel ? defaultModel.id : provider.models[0].id;
  }
}