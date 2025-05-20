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

export type ProviderCreateData = {
  name: string;
  displayName: string;
  apiKey: string;
  isActive?: boolean;
  isDefault?: boolean;
};

export type ModelCreateData = {
  name: string;
  modelIdentifier: string;
  isDefault?: boolean;
  isAvailable?: boolean;
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
  
  /**
   * Membuat provider baru dengan parameter yang diberikan
   */
  create(data: ProviderCreateData): Promise<Provider>;

  /**
   * Membuat provider baru dan mengatur sebagai default jika diperlukan
   * dalam satu transaksi untuk menjamin konsistensi data
   */
  createWithDefaults(data: ProviderCreateData): Promise<Provider>;

  /**
   * Membuat provider default dengan model dan mengatur hubungan antara keduanya
   * dalam satu transaksi atomik
   */
  createDefaultProviderWithModel(
    providerData: ProviderCreateData, 
    modelData: ModelCreateData
  ): Promise<ProviderWithModels>;
  
  /**
   * Reset semua provider default
   */
  resetDefaults(): Promise<void>;
  
  updateById(id: string, data: Partial<Provider>, include?: ProviderInclude): Promise<ProviderWithModels>;
  
  deactivateAll(): Promise<void>;
}