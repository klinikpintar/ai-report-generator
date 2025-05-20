import { ModelService } from '@/app/(backend)/services/modelService';
import { IAIModelRepository } from '@/app/(backend)/interfaces/IAIModelRepository';

describe('ModelService', () => {
  let modelService: ModelService;
  let mockModelRepository: IAIModelRepository;

  beforeEach(() => {
    // Mock the model repository
    mockModelRepository = {
      findById: jest.fn(),
      // Add other required methods from IAIModelRepository
    } as unknown as IAIModelRepository;

    modelService = new ModelService(mockModelRepository);
  });

  describe('findById', () => {
    test('should call repository with correct parameters', async () => {
      const modelId = 'model-id';
      const providerId = 'provider-id';
      const mockModel = { id: modelId, name: 'Model Name' };
      
      // Setup mock return value
      (mockModelRepository.findById as jest.Mock).mockResolvedValue(mockModel);
      
      // Call the method
      const result = await modelService.findById(modelId, providerId);
      
      // Verify
      expect(mockModelRepository.findById).toHaveBeenCalledWith(modelId, providerId);
      expect(result).toEqual(mockModel);
    });
  });

  describe('selectDefaultModelId', () => {
    test('should return default model ID when available', async () => {
      const provider = {
        id: 'provider-id',
        models: [
          { id: 'model-1', isDefault: false },
          { id: 'model-2', isDefault: true },
          { id: 'model-3', isDefault: false }
        ]
      };
      
      const result = await modelService.selectDefaultModelId(provider as any);
      expect(result).toBe('model-2');
    });

    test('should return first model ID when no default model exists', async () => {
      const provider = {
        id: 'provider-id',
        models: [
          { id: 'model-1', isDefault: false },
          { id: 'model-2', isDefault: false }
        ]
      };
      
      const result = await modelService.selectDefaultModelId(provider as any);
      expect(result).toBe('model-1');
    });

    test('should return null when provider has no models', async () => {
      const provider = {
        id: 'provider-id',
        models: []
      };
      
      const result = await modelService.selectDefaultModelId(provider as any);
      expect(result).toBeNull();
    });

    test('should handle undefined models array', async () => {
      const provider = {
        id: 'provider-id'
      };
      
      const result = await modelService.selectDefaultModelId(provider as any);
      expect(result).toBeNull();
    });
  });
});