import { PrismaProviderRepository } from '../repositories/PrismaProviderRepository';
import { PrismaAIModelRepository } from '../repositories/PrismaAIModelRepository';
import { ApiKeyService } from '../services/apiKeyService';
import { ProviderService } from '../services/providerService';
import { IProviderRepository } from '../interfaces/IProviderRepository';
import { IApiKeyService } from '../interfaces/IApikeyService';
import { IModelService } from '../interfaces/IModelService';
import { IProviderService } from '../interfaces/IProviderService';
import { ModelService } from '../services/modelService';

/**
 * Manages the creation and
 * lifecycle of services like ProviderService, ModelService, and ApiKeyService while
 * handling their dependency injection needs.
 */
export class ServiceFactory {
  private static providerService: ProviderService | null = null;
  private static apiKeyService: IApiKeyService | null = null;
  private static modelService: IModelService | null = null;
  
  /**
   * Get ApiKeyService instance (singleton)
   */
  static getApiKeyService(): IApiKeyService {
    if (!this.apiKeyService) {
      this.apiKeyService = new ApiKeyService();
    }
    return this.apiKeyService;
  }
  
  /**
   * Get ModelService instance (singleton)
   */
  static getModelService(): IModelService {
    if (!this.modelService) {
      const modelRepo = new PrismaAIModelRepository();
      this.modelService = new ModelService(modelRepo);
    }
    return this.modelService;
  }
  
  /**
   * Get ProviderService instance (singleton)
   */
  static getProviderService(): IProviderService {
    if (!this.providerService) {
      const providerRepo = new PrismaProviderRepository();
      const apiKeyService = this.getApiKeyService();
      const modelService = this.getModelService();
      
      this.providerService = new ProviderService(
        providerRepo, 
        modelService,
        apiKeyService
      );
    }
    return this.providerService;
  }
  
  /**
   * Create a new ProviderService instance with custom dependencies (for testing)
   */
  static createProviderService(
    providerRepo: IProviderRepository,
    modelService: IModelService,
    apiKeyService: IApiKeyService
  ): ProviderService {
    return new ProviderService(
      providerRepo, 
      modelService,
      apiKeyService
    );
  }
  
  /**
   * Reset all service instances (useful for testing)
   */
  static resetServices(): void {
    this.providerService = null;
    this.apiKeyService = null;
    this.modelService = null;
  }
}