import { DefaultProviderFactory } from '@backend/factories/defaultProviderFactory';
import { IProviderRepository } from '@/app/(backend)/interfaces/IProviderRepository';
import { IApiKeyService } from '@backend/interfaces/IApiKeyService';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { AIModelValidation } from '@/app/(backend)/dtos/aimodel.dto';

// Mock DTOs
jest.mock('@/app/(backend)/dtos/provider.dto', () => ({
  ProviderValidation: {
    POST: { 
      parse: jest.fn(data => data) 
    }
  }
}));

jest.mock('@/app/(backend)/dtos/aimodel.dto', () => ({
  AIModelValidation: {
    POST: {
      parse: jest.fn(data => data)
    }
  }
}));

describe('DefaultProviderFactory', () => {
  let providerRepo: jest.Mocked<IProviderRepository>;
  let apiKeyService: jest.Mocked<IApiKeyService>;
  let factory: DefaultProviderFactory;
  
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock environment
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-gemini-key' };
    
    // Mock repository
    providerRepo = {
      createDefaultProviderWithModel: jest.fn()
    } as unknown as jest.Mocked<IProviderRepository>;
    
    // Mock API key service
    apiKeyService = {
      encryptApiKey: jest.fn(key => `encrypted-${key}`),
      decryptApiKey: jest.fn(),
      validateApiKey: jest.fn()
    } as unknown as jest.Mocked<IApiKeyService>;
    
    // Create factory
    factory = new DefaultProviderFactory(providerRepo, apiKeyService);
  });
  
  afterEach(() => {
    // Restore env
    process.env = originalEnv;
  });

  describe('createDefault', () => {
    test('should create default provider with model', async () => {
      // Mock successful provider creation
      const mockProvider = { 
        id: 'provider-id', 
        name: 'gemini',
        models: [{ id: 'model-id' }]
      };
      (providerRepo.createDefaultProviderWithModel as jest.Mock).mockResolvedValue(mockProvider);
      
      // Call the method
      const result = await factory.createDefault();
      
      // Verify validations are called
      expect(ProviderValidation.POST.parse).toHaveBeenCalledWith({
        name: 'gemini',
        displayName: 'Google Gemini',
        apiKey: 'test-gemini-key',
        isActive: true,
        isDefault: true
      });
      
      expect(AIModelValidation.POST.parse).toHaveBeenCalledWith({
        name: 'Gemini 2.0 Flash',
        modelIdentifier: 'gemini-2.0-flash',
        providerId: 'temporary',
        isDefault: true,
        isAvailable: true
      });
      
      // Verify key encryption
      expect(apiKeyService.encryptApiKey).toHaveBeenCalledWith('test-gemini-key');
      
      // Verify repository call
      expect(providerRepo.createDefaultProviderWithModel).toHaveBeenCalledWith(
        {
          name: 'gemini',
          displayName: 'Google Gemini',
          apiKey: 'encrypted-test-gemini-key',
          isActive: true,
          isDefault: true
        },
        {
          name: 'Gemini 2.0 Flash',
          modelIdentifier: 'gemini-2.0-flash',
          isDefault: true,
          isAvailable: true
        }
      );
      
      // Verify result
      expect(result).toEqual(mockProvider);
    });
    
    test('should throw error when GEMINI_API_KEY env var is missing', async () => {
      // Remove env var
      delete process.env.GEMINI_API_KEY;
      
      // Expect error
      await expect(factory.createDefault())
        .rejects
        .toThrow('GEMINI_API_KEY env var is required');
    });
    
    test('should throw error when creation fails', async () => {
      // Mock failed creation
      (providerRepo.createDefaultProviderWithModel as jest.Mock).mockResolvedValue(null);
      
      // Expect error
      await expect(factory.createDefault())
        .rejects
        .toThrow('Failed to create default provider');
    });
  });
});