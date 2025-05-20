import { ProviderService } from '@/app/(backend)/services/providerService';
import { IProviderRepository } from '@/app/(backend)/interfaces/IProviderRepository';
import { IApiKeyService } from '@backend/interfaces/IApiKeyService';
import { IModelService } from '@/app/(backend)/interfaces/IModelService';
import { DefaultProviderFactory } from '@backend/factories/defaultProviderFactory';
import { NotFoundResponse } from '@/app/(backend)/utils/exceptions';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';

jest.mock('zod', () => {
  const actual = jest.requireActual('zod');
  return {
    ...actual,
    string: () => ({
      uuid: () => ({ _def: { typeName: 'ZodString' } }),
      min: () => ({ _def: { typeName: 'ZodString' } }),
      max: () => ({ _def: { typeName: 'ZodString' } })
    }),
    boolean: () => ({
      optional: () => ({
        default: () => ({ _def: { typeName: 'ZodBoolean' } })
      })
    })
  };
});

jest.mock('@/app/(backend)/dtos/provider.dto', () => ({
  ProviderSchema: {
    UUID_SCHEMA: { _def: { typeName: 'ZodString' } },
    NAME_SCHEMA: { _def: { typeName: 'ZodString' } }
  },
  ProviderValidation: {
    GET: { parse: jest.fn(data => data) },
    POST: { parse: jest.fn(data => data) },
    SET_ACTIVE_MODEL: { parse: jest.fn(data => data) },
    UPDATE_API_KEY: { parse: jest.fn(data => data) },
    ACTIVATE: { parse: jest.fn(data => data) },
    RESPONSE: { parse: jest.fn(provider => ({ ...provider, parsed: true })) },
    RESPONSE_WITH_MODELS: { parse: jest.fn(provider => ({ ...provider, parsed: true, withModels: true })) },
    RESPONSE_WITH_MODELS_INTERNAL: { parse: jest.fn(provider => ({ ...provider, parsed: true, withModels: true })) }
  }
}));

jest.mock('@/app/(backend)/dtos/aimodel.dto', () => ({
  AIModelSchema: {
    NAME_SCHEMA: { _def: { typeName: 'ZodString' } },
    IDENTIFIER_SCHEMA: { _def: { typeName: 'ZodString' } }
  },
  AIModelValidation: {
    POST: { parse: jest.fn(data => data) },
    RESPONSE: { parse: jest.fn(model => ({ ...model, parsed: true })) }
  }
}));

jest.mock('@/app/(backend)/factories/defaultProviderFactory', () => ({
  DefaultProviderFactory: jest.fn().mockImplementation(() => ({
    createDefault: jest.fn().mockResolvedValue({
      id: 'default-id',
      name: 'Default Provider',
      displayName: 'Default Provider',
      apiKey: 'encrypted-key',
      isActive: true,
      isDefault: true,
      activeModelId: 'default-model-id',
      activeModel: {
        id: 'default-model-id',
        name: 'Default Model',
        modelIdentifier: 'default-model',
        providerId: 'default-id',
        isDefault: true,
        isAvailable: true
      },
      models: [{
        id: 'default-model-id',
        name: 'Default Model',
        modelIdentifier: 'default-model',
        providerId: 'default-id',
        isDefault: true,
        isAvailable: true
      }]
    })
  }))
}));

// Helper function untuk membuat mock model yang lengkap
function createMockModel(overrides = {}) {
  return {
    id: 'model-id',
    name: 'Model Name',
    modelIdentifier: 'gemini-1.0',
    providerId: 'provider-id',
    isDefault: true,
    isAvailable: true,
    ...overrides
  };
}

// Helper function untuk membuat mock provider yang lengkap
function createMockProvider(overrides: { id?: string;[key: string]: any } = {}) {
  const id = overrides.id || 'provider-id';
  const modelId = 'model-id';

  return {
    id: id,
    name: 'Gemini',
    displayName: 'Google Gemini',
    apiKey: 'encrypted-key-123',
    isActive: true,
    isDefault: false,
    activeModelId: modelId,
    activeModel: createMockModel({ id: modelId }),
    models: [createMockModel({ id: modelId })],
    ...overrides
  };
}

describe('ProviderService', () => {
  // Mocks
  let mockProviderRepo: jest.Mocked<IProviderRepository>;
  let mockModelService: jest.Mocked<IModelService>;
  let mockApiKeyService: jest.Mocked<IApiKeyService>;
  let mockDefaultProviderFactory: jest.Mocked<DefaultProviderFactory>;
  let service: ProviderService;

  beforeEach(() => {
    // Mock repository
    mockProviderRepo = {
      findMany: jest.fn(),
      findById: jest.fn(),
      findActive: jest.fn(),
      findByDefault: jest.fn(),
      updateById: jest.fn(),
      updateApiKey: jest.fn(),
      updateActiveModel: jest.fn(),
      setActive: jest.fn(),
      createWithDefaults: jest.fn()
    } as unknown as jest.Mocked<IProviderRepository>;

    // Mock model service
    mockModelService = {
      findById: jest.fn(),
      selectDefaultModelId: jest.fn()
    } as unknown as jest.Mocked<IModelService>;

    // Mock API key service
    mockApiKeyService = {
      validateApiKey: jest.fn().mockResolvedValue(true),
      encryptApiKey: jest.fn(key => `encrypted-${key}`),
      decryptApiKey: jest.fn()
    } as unknown as jest.Mocked<IApiKeyService>;

    // Mock default provider factory
    mockDefaultProviderFactory = {
      createDefault: jest.fn()
    } as unknown as jest.Mocked<DefaultProviderFactory>;

    // Mock constructor
    (DefaultProviderFactory as jest.Mock).mockImplementation(() => mockDefaultProviderFactory);

    // Create service
    service = new ProviderService(mockProviderRepo, mockModelService, mockApiKeyService);
  });

  describe('getAllProviders', () => {
    test('should get all providers with default options', async () => {
      // Mock data dengan createMockProvider untuk memastikan semua properti ada
      const mockProviders = [
        createMockProvider({ id: 'provider-1' }),
        createMockProvider({ id: 'provider-2' })
      ];
      mockProviderRepo.findMany.mockResolvedValue(mockProviders);

      // Call method
      const result = await service.getAllProviders();

      // Verify
      expect(mockProviderRepo.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { activeModel: true }
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('parsed', true);
    });

    test('should include models when specified', async () => {
      // Mock data dengan createMockProvider
      const mockProviders = [
        createMockProvider({
          id: 'provider-1',
          // models sudah diisi di helper function
        })
      ];
      mockProviderRepo.findMany.mockResolvedValue(mockProviders);

      // Call with includeModels
      const result = await service.getAllProviders({ includeModels: true });

      // Verify
      expect(mockProviderRepo.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          activeModel: true,
          models: { orderBy: { name: 'asc' } }
        }
      });
      expect(result[0]).toHaveProperty('withModels', true);
    });

    test('should filter active providers when specified', async () => {
      // Mock data
      mockProviderRepo.findMany.mockResolvedValue([]);

      // Call with onlyActive
      await service.getAllProviders({ onlyActive: true });

      // Verify
      expect(mockProviderRepo.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { activeModel: true }
      });
    });
  });

  describe('getActiveOrDefaultProvider', () => {
    test('should return active provider when found', async () => {
      // Gunakan helper function untuk mock
      const mockProvider = createMockProvider({ id: 'active-provider' });
      mockProviderRepo.findActive.mockResolvedValue(mockProvider);

      // Call method
      const result = await service.getActiveOrDefaultProvider();

      // Verify
      expect(mockProviderRepo.findActive).toHaveBeenCalledWith({
        activeModel: true,
        models: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      });
      expect(mockProviderRepo.findByDefault).not.toHaveBeenCalled();
      expect(mockDefaultProviderFactory.createDefault).not.toHaveBeenCalled();
      expect(result).toHaveProperty('parsed', true);
      expect(result).toHaveProperty('withModels', true);
    });

    test('should fallback to default provider when no active provider', async () => {
      // Mock no active but default provider exists
      mockProviderRepo.findActive.mockResolvedValue(null);

      const mockDefaultProvider = createMockProvider({
        id: 'default-provider',
        isActive: false,
        isDefault: true,
      });

      mockProviderRepo.findByDefault.mockResolvedValue(mockDefaultProvider);
      mockProviderRepo.updateById.mockResolvedValue({
        ...mockDefaultProvider,
        isActive: true
      });

      // Call method
      const result = await service.getActiveOrDefaultProvider();

      // Verify
      expect(mockProviderRepo.findByDefault).toHaveBeenCalled();
      expect(mockProviderRepo.updateById).toHaveBeenCalledWith(
        'default-provider',
        { isActive: true },
        expect.anything()
      );
      expect(mockDefaultProviderFactory.createDefault).not.toHaveBeenCalled();
    });

    test('should create default provider when no provider exists', async () => {
      // Mock no providers at all
      mockProviderRepo.findActive.mockResolvedValue(null);
      mockProviderRepo.findByDefault.mockResolvedValue(null);

      const mockDefaultProvider = createMockProvider({
        id: 'created-provider',
        isActive: true,
        isDefault: true
      });

      mockDefaultProviderFactory.createDefault.mockResolvedValue(mockDefaultProvider);

      // Call method
      await service.getActiveOrDefaultProvider();

      // Verify
      expect(mockDefaultProviderFactory.createDefault).toHaveBeenCalled();
    });

    test('should set active model if provider has models but no active model', async () => {
      // Mock provider with models but no activeModel
      const model1 = createMockModel({
        id: 'model-1',
        name: 'Model 1',
        isDefault: false
      });

      const model2 = createMockModel({
        id: 'model-2',
        name: 'Model 2',
        isDefault: true
      });

      const mockProvider = createMockProvider({
        id: 'provider-id',
        activeModelId: null,
        activeModel: null,
        models: [model1, model2]
      });

      mockProviderRepo.findActive.mockResolvedValue(mockProvider);
      mockModelService.selectDefaultModelId.mockResolvedValue('model-2');

      // Mock updating activeModel
      mockProviderRepo.updateById.mockResolvedValue({
        ...mockProvider,
        activeModelId: 'model-2',
        activeModel: model2
      });

      // Call method
      await service.getActiveOrDefaultProvider();

      // Verify
      expect(mockModelService.selectDefaultModelId).toHaveBeenCalled();
      expect(mockProviderRepo.updateById).toHaveBeenCalledWith(
        'provider-id',
        { activeModelId: 'model-2' },
        expect.anything()
      );
    });
  });

  describe('updateActiveModel', () => {
    test('should update active model for provider', async () => {
      // Mock provider and model exist
      const providerId = 'provider-id';
      const modelId = 'model-id';

      mockProviderRepo.findById.mockResolvedValue(createMockProvider({ id: 'provider-id' }));
      mockModelService.findById.mockResolvedValue(createMockModel({
        id: modelId,
        name: 'Model Name',
        providerId: providerId
      }));
      mockProviderRepo.updateActiveModel.mockResolvedValue({
        id: providerId,
        name: 'Gemini',
        displayName: 'Google Gemini',
        apiKey: 'encrypted-key-123',
        isActive: true,
        isDefault: false,
        activeModelId: modelId,
        activeModel: createMockModel({ id: modelId, name: 'Model Name', providerId: providerId })
      });

      // Call method
      const result = await service.updateActiveModel(providerId, modelId);

      // Verify
      expect(mockProviderRepo.findById).toHaveBeenCalledWith(providerId);
      expect(mockModelService.findById).toHaveBeenCalledWith(modelId, providerId);
      expect(mockProviderRepo.updateActiveModel).toHaveBeenCalledWith(providerId, modelId);
      expect(result).toHaveProperty('parsed', true);
    });

    test('should throw NotFoundResponse when provider not found', async () => {
      // Pastikan mock mengembalikan null
      mockProviderRepo.findById.mockResolvedValue(null);

      // Ubah ekspektasi dengan menggunakan try-catch yang lebih eksplisit
      try {
        await service.updateActiveModel('unknown-id', 'model-id');
        // Jika tidak error, test seharusnya gagal
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundResponse);
        if (error instanceof NotFoundResponse) {
          expect(error.message).toMatch(/provider.*not found/i);
        }
      }
    });

    test('should throw NotFoundResponse when model not found', async () => {
      // Setup: Provider ada tapi model tidak
      mockProviderRepo.findById.mockResolvedValue(createMockProvider({ id: 'provider-id' }));
      mockModelService.findById.mockResolvedValue(null);

      // Gunakan try-catch untuk lebih eksplisit
      try {
        await service.updateActiveModel('provider-id', 'unknown-model');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundResponse);
        if (error instanceof NotFoundResponse) {
          expect(error.message).toMatch(/model.*not found/i);
        }
      }
    });
  });

  describe('updateApiKey', () => {
    test('should update API key after validation', async () => {
      // Mock provider exists
      const providerId = 'provider-id';
      const apiKey = 'new-api-key';

      // Gunakan createMockProvider untuk mockProviderRepo.findById
      mockProviderRepo.findById.mockResolvedValue(createMockProvider({
        id: providerId,
        name: 'gemini'
      }));

      mockApiKeyService.validateApiKey.mockResolvedValue(true);

      // Gunakan createMockProvider untuk mockProviderRepo.updateApiKey
      mockProviderRepo.updateApiKey.mockResolvedValue(createMockProvider({
        id: providerId,
        apiKey: 'encrypted-new-api-key'
      }));

      // Call method
      const result = await service.updateApiKey(providerId, apiKey);

      // Verify
      expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith('gemini', apiKey);
      expect(mockApiKeyService.encryptApiKey).toHaveBeenCalledWith(apiKey);
      expect(mockProviderRepo.updateApiKey).toHaveBeenCalledWith(
        providerId,
        'encrypted-new-api-key'
      );
      expect(result).toHaveProperty('parsed', true);
    });

    test('should throw NotFoundResponse when provider not found', async () => {
      mockProviderRepo.findById.mockResolvedValue(null);

      try {
        await service.updateApiKey('unknown-id', 'api-key');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundResponse);
        if (error instanceof NotFoundResponse) {
          expect(error.message).toMatch(/provider.*not found/i);
        }
      }
    });
  });

  describe('setActiveProvider', () => {
    test('should set provider as active', async () => {
      // Mock provider exists
      const providerId = 'provider-id';

      mockProviderRepo.findById.mockResolvedValue(createMockProvider({
        id: providerId,
        isActive: false
      }));

      mockProviderRepo.setActive.mockResolvedValue(createMockProvider({
        id: providerId,
        isActive: true
      }));

      // Call method
      const result = await service.setActiveProvider(providerId);

      // Verify
      expect(mockProviderRepo.setActive).toHaveBeenCalledWith(providerId);
      expect(result).toHaveProperty('parsed', true);
    });

    test('should throw NotFoundResponse when provider not found', async () => {
      // Mock provider tidak ada
      mockProviderRepo.findById.mockResolvedValue(null);

      try {
        await service.setActiveProvider('unknown-id');
        fail('Expected error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundResponse);
        if (error instanceof NotFoundResponse) {
          expect(error.message).toMatch(/provider.*not found/i);
        }
      }

      expect(mockProviderRepo.findById).toHaveBeenCalledWith('unknown-id');
      // Memastikan setActive tidak dipanggil
      expect(mockProviderRepo.setActive).not.toHaveBeenCalled();
    });
  });

  describe('createProvider', () => {
    test('should create provider after validating API key', async () => {
      // Mock data
      const providerData = {
        name: 'gemini',
        displayName: 'Google Gemini',
        apiKey: 'api-key',
        isActive: true,
        isDefault: false
      };

      mockApiKeyService.validateApiKey.mockResolvedValue(true);

      // Hasil createWithDefaults adalah provider lengkap
      const createdProvider = {
        id: 'new-provider-id',
        name: 'gemini',
        displayName: 'Google Gemini',
        apiKey: 'encrypted-api-key',
        isActive: true,
        isDefault: false,
        activeModelId: null
      };

      mockProviderRepo.createWithDefaults.mockResolvedValue(createdProvider);

      // Call method
      const result = await service.createProvider(providerData);

      // Verify
      expect(mockApiKeyService.validateApiKey).toHaveBeenCalledWith('gemini', 'api-key');
      expect(mockApiKeyService.encryptApiKey).toHaveBeenCalledWith('api-key');
      expect(mockProviderRepo.createWithDefaults).toHaveBeenCalledWith({
        name: 'gemini',
        displayName: 'Google Gemini',
        apiKey: 'encrypted-api-key',
        isActive: true,
        isDefault: false
      });
      expect(result).toHaveProperty('parsed', true);
    });
  });
});