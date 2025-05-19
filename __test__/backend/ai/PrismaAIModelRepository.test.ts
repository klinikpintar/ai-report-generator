import { PrismaAIModelRepository } from '@/app/(backend)/repositories/PrismaAIModelRepository';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  aIModel: {
    findFirst: jest.fn(),
    create: jest.fn(),
  }
}));

describe('PrismaAIModelRepository', () => {
  let repository: PrismaAIModelRepository;
  
  beforeEach(() => {
    repository = new PrismaAIModelRepository();
    jest.clearAllMocks();
  });

  describe('findById', () => {
    test('should find AI model by ID and provider ID', async () => {
      const mockModel = { 
        id: 'model-id', 
        providerId: 'provider-id', 
        name: 'Test Model',
        isAvailable: true,
      };

      (prisma.aIModel.findFirst as jest.Mock).mockResolvedValue(mockModel);
      
      const result = await repository.findById('model-id', 'provider-id');
      
      expect(prisma.aIModel.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'model-id',
          providerId: 'provider-id',
          isAvailable: true
        }
      });
      expect(result).toEqual(mockModel);
    });

    test('should return null for non-existent model', async () => {
      (prisma.aIModel.findFirst as jest.Mock).mockResolvedValue(null);
      
      const result = await repository.findById('non-existent-id', 'provider-id');
      
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    test('should create new AI model', async () => {
      const modelData = {
        name: 'New Model',
        modelIdentifier: 'new-model',
        providerId: 'provider-id',
        isDefault: true,
        isAvailable: true,
      };
      
      const createdModel = {
        id: 'generated-id',
        ...modelData
      };

      (prisma.aIModel.create as jest.Mock).mockResolvedValue(createdModel);
      
      const result = await repository.create(modelData);
      
      expect(prisma.aIModel.create).toHaveBeenCalledWith({
        data: modelData
      });
      expect(result).toEqual(createdModel);
    });

    test('should create model with minimal required fields', async () => {
      const minimalModelData = {
        name: 'Minimal Model',
        modelIdentifier: 'minimal-model',
        providerId: 'provider-id',
      };
      
      const createdModel = {
        id: 'generated-id',
        ...minimalModelData
      };

      (prisma.aIModel.create as jest.Mock).mockResolvedValue(createdModel);
      
      const result = await repository.create(minimalModelData);
      
      expect(prisma.aIModel.create).toHaveBeenCalledWith({
        data: minimalModelData
      });
      expect(result).toEqual(createdModel);
    });
  });

  describe('Error handling', () => {
    test('should propagate errors from Prisma', async () => {
      (prisma.aIModel.create as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(repository.create({
        name: 'Error Model',
        modelIdentifier: 'error-model',
        providerId: 'provider-id',
      }))
        .rejects
        .toThrow('Database error');
    });
  });
});