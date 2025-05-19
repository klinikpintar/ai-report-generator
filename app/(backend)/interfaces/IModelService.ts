import { ProviderWithModels } from "./IProviderRepository";
import { AIModel } from "@prisma/client";  // Gunakan type dari Prisma

/**
 * Interface for AI model management operations.
 * Provides functionality to handle model selection, retrieval,
 * and validation across different provider implementations.
 */
export interface IModelService {
  /**
   * Finds an AI model by its ID and provider ID.
   * 
   * @param modelId - The unique identifier of the model to find
   * @param providerId - The provider ID that owns the model
   * @returns A promise that resolves to the AI model if found, or null if not available
   */
  findById(modelId: string, providerId: string): Promise<AIModel | null>;
  
  /**
   * Selects the default model ID for a given provider.
   * Will return the model marked as default, or the first available model
   * if no default is explicitly set.
   * 
   * @param provider - The provider with its associated models
   * @returns A promise that resolves to the selected model ID, or null if no models are available
   */
  selectDefaultModelId(provider: ProviderWithModels): Promise<string | null>;
}