import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { NotFoundResponse } from '@/app/(backend)/utils/exceptions';
import * as apiKeyUtils from '@/app/(backend)/utils/apiKeyUtils';
import { PrismaProviderRepository } from '@/app/(backend)/repositories/PrismaProviderRepository';
import { PrismaAIModelRepository } from '@/app/(backend)/repositories/PrismaAIModelRepository';
import prisma from '@/lib/prisma';
import ProviderService from '@/app/(backend)/services/providerService';

// Create a way to access the class for resetting instance
const ProviderServiceClass = Object.getPrototypeOf(ProviderService).constructor;

jest.mock('@/lib/prisma', () => {
  return {
    provider: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    aIModel: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn) => {
      if (typeof fn === 'function') {
        return fn(prisma);
      } else if (Array.isArray(fn)) {
        return Promise.all(fn);
      }
    }),
  };
});

jest.mock('@/app/(backend)/utils/apiKeyUtils', () => ({
  encryptApiKey: jest.fn((key) => `encrypted-${key}`),
}));

jest.mock('@/app/(backend)/dtos/provider.dto', () => {
  return {
    ProviderValidation: {
      GET: {
        parse: jest.fn((data) => data),
      },
      POST: {
        parse: jest.fn((data) => data),
      },
      SET_ACTIVE_MODEL: {
        parse: jest.fn((data) => data),
      },
      UPDATE_API_KEY: {
        parse: jest.fn((data) => data),
      },
      ACTIVATE: {
        parse: jest.fn((data) => data),
      },
      RESPONSE: {
        parse: jest.fn((provider) => ({ ...provider, parsed: true })),
      },
      RESPONSE_WITH_MODELS: {
        parse: jest.fn((provider) => ({ ...provider, parsed: true, withModels: true })),
      },
    }
  };
});

jest.mock('@/app/(backend)/dtos/aimodel.dto', () => {
  return {
    AIModelValidation: {
      POST: {
        parse: jest.fn((data) => data),
      },
    }
  };
});

jest.mock('@/app/(backend)/repositories/PrismaProviderRepository');
jest.mock('@/app/(backend)/repositories/PrismaAIModelRepository');

describe('ProviderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance before each test
    ProviderServiceClass.resetInstance();

    // Reset mocks
    (PrismaProviderRepository as jest.Mock).mockClear();
    (PrismaAIModelRepository as jest.Mock).mockClear();
  });

  describe('getAllProviders', () => {
    test('should return all providers with activeModel', async () => {
      // Mock repository response
      const mockProviders = [
        { id: 'id1', name: 'provider1', activeModel: { id: 'model1' } },
        { id: 'id2', name: 'provider2', activeModel: null },
      ];
      const mockRepo = {
        findMany: jest.fn().mockResolvedValue(mockProviders),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getAllProviders();

      // Expectations
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { activeModel: true },
      });
      expect(ProviderValidation.RESPONSE.parse).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('parsed', true);
    });

    test('should include models when includeModels is true', async () => {
      // Mock repository response
      const mockProviders = [
        {
          id: 'id1',
          name: 'provider1',
          activeModel: { id: 'model1' },
          models: [{ id: 'model1' }, { id: 'model2' }]
        },
      ];
      const mockRepo = {
        findMany: jest.fn().mockResolvedValue(mockProviders),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getAllProviders({ includeModels: true });

      // Expectations
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: {
          activeModel: true,
          models: { orderBy: { name: 'asc' } }
        },
      });
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledTimes(1);
      expect(result[0]).toHaveProperty('withModels', true);
    });

    test('should filter by active providers when onlyActive is true', async () => {
      // Mock repository response
      const mockProviders = [
        { id: 'id1', name: 'provider1', isActive: true },
      ];
      const mockRepo = {
        findMany: jest.fn().mockResolvedValue(mockProviders),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getAllProviders({ onlyActive: true });

      // Expectations
      expect(mockRepo.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { activeModel: true },
      });
    });

    test('should handle empty result', async () => {
      // Mock repository response
      const mockRepo = {
        findMany: jest.fn().mockResolvedValue([]),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getAllProviders();

      // Expectations
      expect(result).toEqual([]);
    });
  });

  describe('getActiveOrDefaultProvider', () => {
    test('should return active provider if it exists', async () => {
      // Mock active provider
      const mockActiveProvider = {
        id: 'active-id',
        name: 'Active Provider',
        isActive: true,
        activeModel: { id: 'model1' },
        models: [{ id: 'model1', name: 'Model 1' }],
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(mockActiveProvider),
        findByDefault: jest.fn(),
        updateById: jest.fn(),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getActiveOrDefaultProvider();

      // Expectations
      expect(mockRepo.findActive).toHaveBeenCalledWith({
        activeModel: true,
        models: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      });
      expect(mockRepo.findByDefault).not.toHaveBeenCalled();
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(mockActiveProvider);
      expect(result).toHaveProperty('withModels', true);
    });

    test('should fallback to default provider if no active provider exists', async () => {
      // Mock default provider (not active)
      const mockDefaultProvider = {
        id: 'default-id',
        name: 'Default Provider',
        isActive: false,
        isDefault: true,
        activeModel: { id: 'model1' },
        models: [{ id: 'model1', name: 'Model 1' }],
      };

      const updatedProvider = {
        ...mockDefaultProvider,
        isActive: true
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(null),
        findByDefault: jest.fn().mockResolvedValue(mockDefaultProvider),
        updateById: jest.fn().mockResolvedValue(updatedProvider),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getActiveOrDefaultProvider();

      // Expectations
      expect(mockRepo.findActive).toHaveBeenCalled();
      expect(mockRepo.findByDefault).toHaveBeenCalled();
      expect(mockRepo.updateById).toHaveBeenCalledWith(
        mockDefaultProvider.id,
        { isActive: true },
        expect.objectContaining({
          activeModel: true,
          models: {
            orderBy: { name: 'asc' },
            where: { isAvailable: true }
          }
        })
      );
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(updatedProvider);
    });

    test('should set default model as active if provider has no active model', async () => {
      // Mock provider with no active model but with models
      const mockProvider = {
        id: 'provider-id',
        name: 'Test Provider',
        isActive: true,
        activeModel: null,
        activeModelId: null,
        models: [
          { id: 'model2', name: 'Model 2' },
          { id: 'model1', name: 'Model 1', isDefault: true },
        ],
      };

      const updatedProvider = {
        ...mockProvider,
        activeModel: { id: 'model1', name: 'Model 1', isDefault: true },
        activeModelId: 'model1'
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
        updateById: jest.fn().mockResolvedValue(updatedProvider),
      };
      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getActiveOrDefaultProvider();

      // Expectations
      expect(mockRepo.updateById).toHaveBeenCalledWith(
        mockProvider.id,
        { activeModelId: 'model1' },
        expect.objectContaining({
          activeModel: true,
          models: {
            orderBy: { name: 'asc' },
            where: { isAvailable: true }
          }
        })
      );
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(updatedProvider);
    });

    test('should create default provider if no provider exists', async () => {
      // Mock empty database
      const mockDefaultProvider = {
        id: 'generated-id',
        name: 'gemini',
        displayName: 'Google Gemini',
        isActive: true,
        isDefault: true,
        activeModel: { id: 'model1' },
        models: [{ id: 'model1', name: 'Gemini 2.0 Flash' }],
      };

      const mockProviderRepo = {
        findActive: jest.fn().mockResolvedValue(null),
        findByDefault: jest.fn().mockResolvedValue(null),
        createDefaultProviderWithModel: jest.fn().mockResolvedValue(mockDefaultProvider),
        findById: jest.fn().mockResolvedValue(mockDefaultProvider),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Simulate environment variable
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.getActiveOrDefaultProvider();

      // Expectations
      expect(mockProviderRepo.findActive).toHaveBeenCalled();
      expect(mockProviderRepo.findByDefault).toHaveBeenCalled();
      expect(mockProviderRepo.createDefaultProviderWithModel).toHaveBeenCalled();
      expect(apiKeyUtils.encryptApiKey).toHaveBeenCalledWith('test-api-key');
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(mockDefaultProvider);

      // Cleanup
      delete process.env.GEMINI_API_KEY;
    });

    test('should throw error when creating default provider without API key', async () => {
      // Mock empty database
      const mockProviderRepo = {
        findActive: jest.fn().mockResolvedValue(null),
        findByDefault: jest.fn().mockResolvedValue(null),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Ensure no API key in environment
      delete process.env.GEMINI_API_KEY;

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.getActiveOrDefaultProvider())
        .rejects
        .toThrow('GEMINI_API_KEY env var is required');
    });

    test('should use default model when available', async () => {
      // Mock data
      const defaultModel = { id: 'default-model-id', name: 'Default Model', isDefault: true };
      const nonDefaultModel = { id: 'model-id', name: 'Regular Model' };

      const mockProvider = {
        id: 'provider-id',
        name: 'Test Provider',
        models: [nonDefaultModel, defaultModel], // defaultModel ada tapi di posisi kedua
        activeModel: null, // belum ada model aktif
      };

      // Mock repository
      const mockProviderRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
        findByDefault: jest.fn(),
        updateById: jest.fn().mockResolvedValue({ ...mockProvider, activeModelId: defaultModel.id }),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      await service.getActiveOrDefaultProvider();

      expect(mockProviderRepo.updateById).toHaveBeenCalledWith(
        'provider-id',
        { activeModelId: 'default-model-id' },
        expect.objectContaining({
          activeModel: true,
          models: {
            orderBy: { name: 'asc' },
            where: { isAvailable: true }
          }
        })
      );
    });

    test('should use first model when no default model exists', async () => {
      // Mock data - tidak ada model default
      const firstModel = { id: 'first-model-id', name: 'First Model', isDefault: false };
      const secondModel = { id: 'second-model-id', name: 'Second Model', isDefault: false };

      const mockProvider = {
        id: 'provider-id',
        name: 'Test Provider',
        models: [firstModel, secondModel], // tidak ada model dengan isDefault: true
        activeModel: null, // belum ada model aktif
      };

      // Mock repository
      const mockProviderRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
        findByDefault: jest.fn(),
        updateById: jest.fn().mockResolvedValue({ ...mockProvider, activeModelId: firstModel.id }),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      await service.getActiveOrDefaultProvider();

      // Verify model pertama dipilih karena tidak ada default
      expect(mockProviderRepo.updateById).toHaveBeenCalledWith(
        'provider-id',
        { activeModelId: 'first-model-id' },
        expect.objectContaining({
          activeModel: true,
          models: {
            orderBy: { name: 'asc' },
            where: { isAvailable: true }
          }
        })
      );
    });
  });

  describe('updateActiveModel', () => {
    test('should update active model for provider', async () => {
      // Mock data
      const providerId = 'provider-id';
      const modelId = 'model-id';
      const mockProvider = {
        id: providerId,
        name: 'Test Provider',
      };
      const mockModel = {
        id: modelId,
        name: 'Test Model',
        providerId,
      };
      const updatedProvider = {
        ...mockProvider,
        activeModelId: modelId,
        activeModel: mockModel,
      };

      // Mock repositories
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(mockProvider),
        updateActiveModel: jest.fn().mockResolvedValue(updatedProvider),
      };
      const mockModelRepo = {
        findById: jest.fn().mockResolvedValue(mockModel),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);
      (PrismaAIModelRepository as jest.Mock).mockImplementation(() => mockModelRepo);

      // Get fresh instance with mocked repos
      const service = ProviderServiceClass.getInstance();
      const result = await service.updateActiveModel(providerId, modelId);

      // Expectations
      expect(mockProviderRepo.findById).toHaveBeenCalledWith(providerId);
      expect(mockModelRepo.findById).toHaveBeenCalledWith(modelId, providerId);
      expect(mockProviderRepo.updateActiveModel).toHaveBeenCalledWith(providerId, modelId);
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(updatedProvider);
    });

    test('should throw NotFoundResponse when provider does not exist', async () => {
      // Mock repositories
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(null),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repos
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.updateActiveModel('invalid-id', 'model-id'))
        .rejects
        .toBeInstanceOf(NotFoundResponse);
    });

    test('should throw NotFoundResponse when model does not exist', async () => {
      // Mock data
      const providerId = 'provider-id';
      const mockProvider = {
        id: providerId,
        name: 'Test Provider',
      };

      // Mock repositories
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(mockProvider),
      };
      const mockModelRepo = {
        findById: jest.fn().mockResolvedValue(null),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);
      (PrismaAIModelRepository as jest.Mock).mockImplementation(() => mockModelRepo);

      // Get fresh instance with mocked repos
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.updateActiveModel(providerId, 'invalid-model-id'))
        .rejects
        .toBeInstanceOf(NotFoundResponse);
    });
  });

  describe('updateApiKey', () => {
    test('should update API key for provider', async () => {
      // Mock data
      const providerId = 'provider-id';
      const apiKey = 'new-api-key';
      const mockProvider = {
        id: providerId,
        name: 'Test Provider',
      };
      const updatedProvider = {
        ...mockProvider,
        apiKey: 'encrypted-new-api-key',
      };
      const parsedProvider = {
        ...updatedProvider,
        parsed: true,
        withModels: true
      };

      // Mock repository
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(mockProvider),
        updateApiKey: jest.fn().mockResolvedValue(updatedProvider),
      };

      // Mock validation to return specific value we can verify
      (ProviderValidation.RESPONSE_WITH_MODELS.parse as jest.Mock).mockReturnValue(parsedProvider);

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.updateApiKey(providerId, apiKey);

      // Expectations
      expect(mockProviderRepo.findById).toHaveBeenCalledWith(providerId);
      expect(apiKeyUtils.encryptApiKey).toHaveBeenCalledWith(apiKey);
      expect(mockProviderRepo.updateApiKey).toHaveBeenCalledWith(
        providerId,
        'encrypted-new-api-key'
      );
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(updatedProvider);

      // Verifikasi hasil dari fungsi updateApiKey (line 97)
      expect(result).toBe(parsedProvider);
      expect(result).toEqual(expect.objectContaining({
        id: providerId,
        parsed: true,
        withModels: true
      }));
    });

    test('should throw NotFoundResponse when provider does not exist', async () => {
      // Mock repository
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(null),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.updateApiKey('invalid-id', 'api-key'))
        .rejects
        .toBeInstanceOf(NotFoundResponse);
    });
  });

  describe('setActiveProvider', () => {
    test('should set provider as active and deactivate others', async () => {
      // Mock data
      const providerId = 'provider-id';
      const mockProvider = {
        id: providerId,
        name: 'Test Provider',
      };
      const updatedProvider = {
        ...mockProvider,
        isActive: true,
      };

      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(mockProvider),
        setActive: jest.fn().mockResolvedValue(updatedProvider),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.setActiveProvider(providerId);

      // Expectations
      expect(mockProviderRepo.findById).toHaveBeenCalledWith(providerId);
      expect(mockProviderRepo.setActive).toHaveBeenCalledWith(providerId);
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalledWith(updatedProvider);
    });

    test('should throw NotFoundResponse when provider does not exist', async () => {
      // Mock repository
      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(null),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.setActiveProvider('invalid-id'))
        .rejects
        .toBeInstanceOf(NotFoundResponse);
    });
  });

  describe('createProvider', () => {
    test('should create new provider with ACID transaction', async () => {
      // Mock data
      const providerData = {
        name: 'new-provider',
        displayName: 'New Provider',
        apiKey: 'api-key-123',
        isActive: true,
        isDefault: false,
      };
      const createdProvider = {
        id: 'generated-id',
        ...providerData,
        apiKey: 'encrypted-api-key-123',
      };

      // Mock repository
      const mockProviderRepo = {
        createWithDefaults: jest.fn().mockResolvedValue(createdProvider)
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.createProvider(providerData);

      // Expectations
      expect(ProviderValidation.POST.parse).toHaveBeenCalledWith(providerData);
      expect(apiKeyUtils.encryptApiKey).toHaveBeenCalledWith(providerData.apiKey);
      expect(mockProviderRepo.createWithDefaults).toHaveBeenCalledWith({
        name: providerData.name,
        displayName: providerData.displayName,
        apiKey: 'encrypted-api-key-123',
        isActive: providerData.isActive,
        isDefault: providerData.isDefault,
      });
      expect(ProviderValidation.RESPONSE.parse).toHaveBeenCalledWith(createdProvider);
    });

    test('should reset defaults when creating default provider', async () => {
      // Mock data
      const providerData = {
        name: 'default-provider',
        displayName: 'Default Provider',
        apiKey: 'api-key-123',
        isActive: true,
        isDefault: true,
      };
      const createdProvider = {
        id: 'generated-id',
        ...providerData,
        apiKey: 'encrypted-api-key-123',
      };

      // Mock repository
      const mockProviderRepo = {
        createWithDefaults: jest.fn().mockResolvedValue(createdProvider)  // Tambahkan ini
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.createProvider(providerData);

      // Expectations
      expect(mockProviderRepo.createWithDefaults).toHaveBeenCalledWith({
        name: providerData.name,
        displayName: providerData.displayName,
        apiKey: 'encrypted-api-key-123',
        isActive: providerData.isActive,
        isDefault: providerData.isDefault,
      });
      expect(ProviderValidation.RESPONSE.parse).toHaveBeenCalledWith(createdProvider);
    });
  });

  describe('Transaction and Data Consistency Tests', () => {
    test('createDefaultProvider should use atomic transaction', async () => {
      // Mock data
      const mockProvider = {
        id: 'provider-id',
        name: 'gemini',
        displayName: 'Google Gemini',
        apiKey: 'encrypted-test-api-key',
        isActive: true,
        isDefault: true,
        activeModelId: 'model-id',
        models: [
          { id: 'model-id', name: 'Gemini 2.0 Flash', modelIdentifier: 'gemini-2.0-flash' }
        ],
        activeModel: { id: 'model-id', name: 'Gemini 2.0 Flash' }
      };

      // Mock repository with createDefaultProviderWithModel implementation
      const mockProviderRepo = {
        createDefaultProviderWithModel: jest.fn().mockResolvedValue(mockProvider)
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Simulate environment variable
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Call private method directly using bracket notation
      const result = await service['createDefaultProvider']();

      // Verify transaction was used
      expect(mockProviderRepo.createDefaultProviderWithModel).toHaveBeenCalled();
      expect(mockProviderRepo.createDefaultProviderWithModel).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'gemini',
          displayName: 'Google Gemini',
          apiKey: 'encrypted-test-api-key',
          isActive: true,
          isDefault: true,
        }),
        expect.objectContaining({
          name: 'Gemini 2.0 Flash',
          modelIdentifier: 'gemini-2.0-flash',
          isDefault: true,
          isAvailable: true
        })
      );

      expect(result).toBe(mockProvider);

      // Cleanup
      delete process.env.GEMINI_API_KEY;
    });

    test('getActiveOrDefaultProvider should use transaction for activation', async () => {
      // Mock default provider (not active)
      const mockDefaultProvider = {
        id: 'default-id',
        name: 'Default Provider',
        isActive: false,
        isDefault: true,
        activeModel: null,
        models: []
      };

      const updatedProvider = {
        ...mockDefaultProvider,
        isActive: true
      };

      // Mock repository focusing on transaction behavior
      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(null),
        findByDefault: jest.fn().mockResolvedValue(mockDefaultProvider),
        updateById: jest.fn().mockResolvedValue(updatedProvider), // updateById handles transaction
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      await service.getActiveOrDefaultProvider();

      // Verify transaction-safe method was used
      expect(mockRepo.updateById).toHaveBeenCalledWith(
        mockDefaultProvider.id,
        { isActive: true },
        expect.objectContaining({
          activeModel: true,
          models: expect.objectContaining({
            where: { isAvailable: true }
          })
        })
      );
    });
  });

  describe('Error Handling and Recovery Tests', () => {
    test('should handle database connection failures gracefully', async () => {
      // Mock repository with error
      const mockProviderRepo = {
        findMany: jest.fn().mockRejectedValue(new Error('Database connection lost')),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Expectations
      await expect(service.getAllProviders())
        .rejects
        .toThrow('Database connection lost');
    });

    test('should throw error when default provider creation fails', async () => {
      const mockProviderRepo = {
        findActive: jest.fn().mockResolvedValue(null),
        findByDefault: jest.fn().mockResolvedValue(null),
        createDefaultProviderWithModel: jest.fn().mockResolvedValue(null)
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Simulate environment variable
      process.env.GEMINI_API_KEY = 'test-api-key';

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Verify error thrown when createDefaultProviderWithModel returns null
      await expect(service.getActiveOrDefaultProvider()).rejects.toThrow('Failed to create default provider');

      // Verify mocks were called
      expect(mockProviderRepo.findActive).toHaveBeenCalled();
      expect(mockProviderRepo.findByDefault).toHaveBeenCalled();
      expect(mockProviderRepo.createDefaultProviderWithModel).toHaveBeenCalled();

      // Cleanup
      delete process.env.GEMINI_API_KEY;
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty models array gracefully', async () => {
      // Mock provider with empty models array
      const mockProvider = {
        id: 'provider-id',
        name: 'Test Provider',
        isActive: true,
        activeModel: null,
        models: [] // Empty models array
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
        findByDefault: jest.fn(),
        updateById: jest.fn(),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Should fall back to creating default provider
      await service.getActiveOrDefaultProvider();

      // Should not try to update activeModelId since there are no models
      expect(mockRepo.updateById).not.toHaveBeenCalled();
    });

    test('should handle extremely long API keys', async () => {
      // Mock data
      const providerId = 'provider-id';
      const extremelyLongApiKey = 'a'.repeat(10000); // Extremely long API key
      const mockProvider = {
        id: providerId,
        name: 'Test Provider',
      };

      const mockProviderRepo = {
        findById: jest.fn().mockResolvedValue(mockProvider),
        updateApiKey: jest.fn().mockImplementation(() => {
          throw new Error('API key too long');
        }),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Should throw error for extremely long API key
      await expect(service.updateApiKey(providerId, extremelyLongApiKey))
        .rejects
        .toThrow('API key too long');
    });

    test('should handle unicode characters in provider and model names', async () => {
      // Mock data with unicode characters
      const providerData = {
        name: 'unicode-provider-😀',
        displayName: '유니코드 프로바이더',
        apiKey: 'api-key-123',
        isActive: true,
        isDefault: false,
      };

      const createdProvider = {
        id: 'generated-id',
        ...providerData,
        apiKey: 'encrypted-api-key-123',
      };

      const mockProviderRepo = {
        create: jest.fn().mockResolvedValue(createdProvider),
        resetDefaults: jest.fn(),
        createWithDefaults: jest.fn().mockResolvedValue(createdProvider)
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockProviderRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();
      const result = await service.createProvider(providerData);

      // Provider should be created correctly despite unicode characters
      expect(result).toHaveProperty('name', 'unicode-provider-😀');
      expect(result).toHaveProperty('displayName', '유니코드 프로바이더');
    });

    test('should handle very large data response from repository', async () => {
      // Create very large array of models
      const largeModelsArray = Array(1000).fill(null).map((_, i) => ({
        id: `model-${i}`,
        name: `Model ${i}`,
        modelIdentifier: `model-identifier-${i}`,
      }));

      // Mock provider with very large models array
      const mockProvider = {
        id: 'provider-id',
        name: 'Large Provider',
        isActive: true,
        activeModel: largeModelsArray[0],
        models: largeModelsArray,
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Should handle large data without crashing
      const result = await service.getActiveOrDefaultProvider();

      expect(result).toHaveProperty('id', 'provider-id');
      expect(ProviderValidation.RESPONSE_WITH_MODELS.parse).toHaveBeenCalled();
    });

    test('should handle null values in provider data', async () => {
      // Mock provider with null values
      const mockProvider = {
        id: 'provider-id',
        name: null,
        displayName: null,
        isActive: true,
        apiKey: 'encrypted-key',
        models: [],
      };

      const mockRepo = {
        findActive: jest.fn().mockResolvedValue(mockProvider),
      };

      (PrismaProviderRepository as jest.Mock).mockImplementation(() => mockRepo);

      // Modify parse to simulate validation error
      (ProviderValidation.RESPONSE_WITH_MODELS.parse as jest.Mock)
        .mockImplementationOnce(() => { throw new Error('Validation error: name cannot be null'); });

      // Get fresh instance with mocked repo
      const service = ProviderServiceClass.getInstance();

      // Should propagate Zod validation error
      await expect(service.getActiveOrDefaultProvider())
        .rejects
        .toThrow('Validation error: name cannot be null');
    });
  });
});