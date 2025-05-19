import { Provider, AIModel } from '@prisma/client';

export type ProviderInclude = {
  activeModel?: boolean;
  models?: {
    orderBy?: { name: 'asc' };
    where?: { isAvailable?: boolean };
  };
};

export type ProviderWithModels = Provider & {
  models?: AIModel[];
  activeModel?: AIModel | null;
};

export interface IProviderRepository {
  findMany(options: {
    where?: { isActive?: boolean };
    include?: ProviderInclude;
  }): Promise<ProviderWithModels[]>;
  
  findActive(include?: ProviderInclude): Promise<ProviderWithModels | null>;
  
  findByDefault(include?: ProviderInclude): Promise<ProviderWithModels | null>;
  
  findById(id: string, include?: ProviderInclude): Promise<ProviderWithModels | null>;
  
  updateActiveModel(providerId: string, modelId: string): Promise<ProviderWithModels>;
  
  updateApiKey(providerId: string, encryptedApiKey: string): Promise<ProviderWithModels>;
  
  setActive(providerId: string): Promise<ProviderWithModels>;
  
  create(data: {
    name: string;
    displayName: string;
    apiKey: string;
    isActive?: boolean;
    isDefault?: boolean;
  }): Promise<Provider>;
  
  resetDefaults(): Promise<void>;
  
  updateById(id: string, data: Partial<Provider>, include?: ProviderInclude): Promise<ProviderWithModels>;
  
  deactivateAll(): Promise<void>;
}