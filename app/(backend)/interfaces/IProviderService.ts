import { z } from 'zod';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';

/**
 * Interface for provider management operations.
 * Provides functionality to handle AI providers, their models, and API keys.
 */
export interface IProviderService {
  /**
   * Gets all providers with optional filtering.
   * 
   * @param optionsInput - Optional filters and include options
   * @returns A promise that resolves to an array of providers
   */
  getAllProviders(
    optionsInput?: z.infer<typeof ProviderValidation.GET>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>[] | z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>[]>;
  
  /**
   * Gets the active provider or falls back to default provider.
   * Creates a default provider if none exists.
   * 
   * @returns A promise that resolves to a provider with models
   */
  getActiveOrDefaultProvider(): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>>;
  
  /**
   * Updates the active model for a provider.
   * 
   * @param providerId - The ID of the provider to update
   * @param modelId - The ID of the model to set as active
   * @returns A promise that resolves to the updated provider
   */
  updateActiveModel(
    providerId: string, 
    modelId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>>;
  
  /**
   * Updates the API key for a provider.
   * 
   * @param providerId - The ID of the provider to update
   * @param apiKey - The new API key
   * @returns A promise that resolves to the updated provider
   */
  updateApiKey(
    providerId: string,
    apiKey: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>>;
  
  /**
   * Sets a provider as active and deactivates others.
   * 
   * @param providerId - The ID of the provider to activate
   * @returns A promise that resolves to the activated provider
   */
  setActiveProvider(
    providerId: string
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS>>;
  
  /**
   * Creates a new provider.
   * 
   * @param data - The provider data
   * @returns A promise that resolves to the created provider
   */
  createProvider(
    data: z.infer<typeof ProviderValidation.POST>
  ): Promise<z.infer<typeof ProviderValidation.RESPONSE>>;
}