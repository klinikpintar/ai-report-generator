import { ServiceFactory } from '@backend/factories/serviceFactory';
import { ProviderService } from '@/app/(backend)/services/providerService';
import { ApiKeyService } from '@/app/(backend)/services/apiKeyService';
import { ModelService } from '@/app/(backend)/services/modelService';
import { PrismaProviderRepository } from '@/app/(backend)/repositories/PrismaProviderRepository';
import { PrismaAIModelRepository } from '@/app/(backend)/repositories/PrismaAIModelRepository';

// Mock dependencies
jest.mock('@/app/(backend)/services/providerService', () => {
    const MockProviderService = jest.fn().mockImplementation(function (repo, modelService, apiKeyService) {
        return {
            repo,
            modelService,
            apiKeyService,
            getAllProviders: jest.fn(),
            getActiveOrDefaultProvider: jest.fn(),
            updateActiveModel: jest.fn(),
            updateApiKey: jest.fn(),
            setActiveProvider: jest.fn(),
            createProvider: jest.fn()
        };
    });

    MockProviderService.prototype.constructor = MockProviderService;

    return {
        ProviderService: MockProviderService
    };
});

jest.mock('@/app/(backend)/services/apiKeyService', () => ({
    ApiKeyService: jest.fn().mockImplementation(() => ({
        validateApiKey: jest.fn(),
        encryptApiKey: jest.fn(),
        decryptApiKey: jest.fn()
    }))
}));

jest.mock('@/app/(backend)/services/modelService', () => ({
    ModelService: jest.fn().mockImplementation(() => ({
        findById: jest.fn(),
        selectDefaultModelId: jest.fn()
    }))
}));
jest.mock('@/app/(backend)/repositories/PrismaProviderRepository');
jest.mock('@/app/(backend)/repositories/PrismaAIModelRepository');

describe('ServiceFactory', () => {
    beforeEach(() => {
        // Reset mocks and singletons
        jest.clearAllMocks();
        ServiceFactory.resetServices();
    });

    describe('getApiKeyService', () => {
        test('should return ApiKeyService singleton', () => {
            // First call should create service
            const service1 = ServiceFactory.getApiKeyService();

            // Second call should return same instance
            const service2 = ServiceFactory.getApiKeyService();

            expect(service1).toBeDefined();
            expect(service1).toHaveProperty('validateApiKey');
            expect(service1).toHaveProperty('encryptApiKey');
            expect(service1).toHaveProperty('decryptApiKey');

            expect(service2).toBe(service1);
            expect(ApiKeyService).toHaveBeenCalledTimes(1);
        });
    });

    describe('getModelService', () => {
        test('should return ModelService singleton with repository', () => {
            const service = ServiceFactory.getModelService();

            expect(service).toBeDefined();
            expect(service).toHaveProperty('findById');
            expect(service).toHaveProperty('selectDefaultModelId');

            expect(PrismaAIModelRepository).toHaveBeenCalledTimes(1);
            expect(ModelService).toHaveBeenCalledWith(expect.any(PrismaAIModelRepository));
        });
    });

    describe('getProviderService', () => {
        test('should return ProviderService singleton with dependencies', () => {
            const service = ServiceFactory.getProviderService();

            expect(service).toBeDefined();
            expect(service).toHaveProperty('getAllProviders');
            expect(service).toHaveProperty('getActiveOrDefaultProvider');
            expect(service).toHaveProperty('updateActiveModel');

            expect(PrismaProviderRepository).toHaveBeenCalledTimes(1);
            expect(ProviderService).toHaveBeenCalled();

            const args = (ProviderService as jest.Mock).mock.calls[0];
            expect(args).toHaveLength(3);

            // Verifikasi bahwa repo memiliki method yang diharapkan
            expect(args[0]).toHaveProperty('findById');
            expect(args[0]).toHaveProperty('findActive');

            // Verifikasi bahwa modelService memiliki method yang diharapkan
            expect(args[1]).toHaveProperty('findById');
            expect(args[1]).toHaveProperty('selectDefaultModelId');

            // Verifikasi bahwa apiKeyService memiliki method yang diharapkan
            expect(args[2]).toHaveProperty('validateApiKey');
            expect(args[2]).toHaveProperty('encryptApiKey');
        });

        test('should reuse existing services', () => {
            // Create services first
            const apiKeyService = ServiceFactory.getApiKeyService();
            const modelService = ServiceFactory.getModelService();

            // Reset mocks to verify they aren't called again
            (ApiKeyService as jest.Mock).mockClear();
            (ModelService as jest.Mock).mockClear();

            // Get ProviderService
            ServiceFactory.getProviderService();

            // Verify the constructors weren't called again
            expect(ApiKeyService).not.toHaveBeenCalled();
            expect(ModelService).not.toHaveBeenCalled();
        });
    });

    describe('createProviderService', () => {
        test('should create new instance with custom dependencies', () => {
            // Create mock dependencies
            const mockProviderRepo = {} as any;
            const mockModelService = {} as any;
            const mockApiKeyService = {} as any;

            // Create service
            const service = ServiceFactory.createProviderService(
                mockProviderRepo,
                mockModelService,
                mockApiKeyService
            );

            // Verify
            expect(service).toBeDefined();
            expect(typeof service).toBe('object');
            expect(ProviderService).toHaveBeenCalledWith(
                mockProviderRepo,
                mockModelService,
                mockApiKeyService
            );

            // Verifikasi properti yang diharapkan
            expect(service).toHaveProperty('getAllProviders');
            expect(service).toHaveProperty('getActiveOrDefaultProvider');
            expect(service).toHaveProperty('updateActiveModel');
        });
    });

    describe('resetServices', () => {
        test('should reset all service singletons', () => {
            // Create services
            ServiceFactory.getApiKeyService();
            ServiceFactory.getModelService();
            ServiceFactory.getProviderService();

            // Reset mocks to verify new calls
            (ApiKeyService as jest.Mock).mockClear();
            (ModelService as jest.Mock).mockClear();
            (ProviderService as jest.Mock).mockClear();

            // Reset services
            ServiceFactory.resetServices();

            // Get services again - should create new instances
            ServiceFactory.getApiKeyService();
            ServiceFactory.getModelService();
            ServiceFactory.getProviderService();

            // Verify constructors were called again
            expect(ApiKeyService).toHaveBeenCalledTimes(1);
            expect(ModelService).toHaveBeenCalledTimes(1);
            expect(ProviderService).toHaveBeenCalledTimes(1);
        });
    });
});