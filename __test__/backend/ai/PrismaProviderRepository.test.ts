import { PrismaProviderRepository } from '@/app/(backend)/repositories/PrismaProviderRepository';
import prisma from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
    provider: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
    }
}));

describe('PrismaProviderRepository', () => {
    let repository: PrismaProviderRepository;

    beforeEach(() => {
        repository = new PrismaProviderRepository();
        jest.clearAllMocks();
    });

    describe('findMany', () => {
        test('should call Prisma with correct parameters', async () => {
            const mockProviders = [{ id: 'id1', name: 'provider1' }];
            const options = {
                where: { isActive: true },
                include: { activeModel: true }
            };

            (prisma.provider.findMany as jest.Mock).mockResolvedValue(mockProviders);

            const result = await repository.findMany(options);

            expect(prisma.provider.findMany).toHaveBeenCalledWith(options);
            expect(result).toEqual(mockProviders);
        });

        test('should handle empty result', async () => {
            (prisma.provider.findMany as jest.Mock).mockResolvedValue([]);

            const result = await repository.findMany({});

            expect(result).toEqual([]);
        });
    });

    describe('findActive', () => {
        describe('findActive', () => {
            test('should find active provider with includes', async () => {
                const mockProvider = { id: 'id1', name: 'provider1', isActive: true };

                const includeOption = {
                    activeModel: true,
                    models: {
                        orderBy: { name: "asc" as const } // Gunakan 'as const' untuk literal type
                    }
                };

                (prisma.provider.findFirst as jest.Mock).mockResolvedValue(mockProvider);

                const result = await repository.findActive(includeOption);

                expect(prisma.provider.findFirst).toHaveBeenCalledWith({
                    where: { isActive: true },
                    include: includeOption
                });
                expect(result).toEqual(mockProvider);
            });
        });

        test('should return null when no active provider exists', async () => {
            (prisma.provider.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await repository.findActive();

            expect(result).toBeNull();
        });
    });

    describe('findByDefault', () => {
        test('should find default provider with includes', async () => {
            const mockProvider = { id: 'id1', name: 'provider1', isDefault: true };
            const includeOption = { activeModel: true };

            (prisma.provider.findFirst as jest.Mock).mockResolvedValue(mockProvider);

            const result = await repository.findByDefault(includeOption);

            expect(prisma.provider.findFirst).toHaveBeenCalledWith({
                where: { isDefault: true },
                include: includeOption
            });
            expect(result).toEqual(mockProvider);
        });

        test('should return null when no default provider exists', async () => {
            (prisma.provider.findFirst as jest.Mock).mockResolvedValue(null);

            const result = await repository.findByDefault();

            expect(result).toBeNull();
        });
    });

    describe('findById', () => {
        test('should find provider by ID with includes', async () => {
            const mockProvider = { id: 'test-id', name: 'Test Provider' };

            const includeOption = {
                models: {
                    orderBy: { name: "asc" as const } // Gunakan 'as const' untuk literal type
                }
            };

            (prisma.provider.findUnique as jest.Mock).mockResolvedValue(mockProvider);

            const result = await repository.findById('test-id', includeOption);

            expect(prisma.provider.findUnique).toHaveBeenCalledWith({
                where: { id: 'test-id' },
                include: includeOption
            });
            expect(result).toEqual(mockProvider);
        });

        test('should return null for non-existent ID', async () => {
            (prisma.provider.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await repository.findById('non-existent-id');

            expect(result).toBeNull();
        });
    });

    describe('updateActiveModel', () => {
        test('should update active model for provider', async () => {
            const providerId = 'provider-id';
            const modelId = 'model-id';
            const updatedProvider = {
                id: providerId,
                activeModelId: modelId,
                models: [{ id: modelId }]
            };

            (prisma.provider.update as jest.Mock).mockResolvedValue(updatedProvider);

            const result = await repository.updateActiveModel(providerId, modelId);

            expect(prisma.provider.update).toHaveBeenCalledWith({
                where: { id: providerId },
                data: { activeModelId: modelId },
                include: {
                    models: {
                        orderBy: { name: 'asc' },
                    },
                    activeModel: true,
                }
            });
            expect(result).toEqual(updatedProvider);
        });
    });

    describe('updateApiKey', () => {
        test('should update provider API key', async () => {
            const providerId = 'provider-id';
            const encryptedApiKey = 'encrypted-api-key';
            const updatedProvider = {
                id: providerId,
                apiKey: encryptedApiKey
            };

            (prisma.provider.update as jest.Mock).mockResolvedValue(updatedProvider);

            const result = await repository.updateApiKey(providerId, encryptedApiKey);

            expect(prisma.provider.update).toHaveBeenCalledWith({
                where: { id: providerId },
                data: { apiKey: encryptedApiKey },
                include: {
                    models: {
                        orderBy: { name: 'asc' },
                    },
                    activeModel: true,
                }
            });
            expect(result).toEqual(updatedProvider);
        });
    });

    describe('setActive', () => {
        test('should set provider as active', async () => {
            const providerId = 'provider-id';
            const updatedProvider = {
                id: providerId,
                isActive: true
            };

            (prisma.provider.update as jest.Mock).mockResolvedValue(updatedProvider);

            const result = await repository.setActive(providerId);

            expect(prisma.provider.update).toHaveBeenCalledWith({
                where: { id: providerId },
                data: { isActive: true },
                include: {
                    models: {
                        orderBy: { name: 'asc' },
                    },
                    activeModel: true
                }
            });
            expect(result).toEqual(updatedProvider);
        });
    });

    describe('create', () => {
        test('should create new provider', async () => {
            const providerData = {
                name: 'new-provider',
                displayName: 'New Provider',
                apiKey: 'encrypted-api-key',
                isActive: true,
                isDefault: false
            };

            const createdProvider = {
                id: 'generated-id',
                ...providerData
            };

            (prisma.provider.create as jest.Mock).mockResolvedValue(createdProvider);

            const result = await repository.create(providerData);

            expect(prisma.provider.create).toHaveBeenCalledWith({
                data: providerData
            });
            expect(result).toEqual(createdProvider);
        });
    });

    describe('resetDefaults', () => {
        test('should reset all default providers', async () => {
            (prisma.provider.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

            await repository.resetDefaults();

            expect(prisma.provider.updateMany).toHaveBeenCalledWith({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        });
    });

    describe('updateById', () => {
        test('should update provider by ID', async () => {
            const providerId = 'provider-id';
            const updateData = { displayName: 'Updated Provider' };

            const includeOption = {
                models: {
                    orderBy: { name: "asc" as const }
                }
            };

            const updatedProvider = {
                id: providerId,
                ...updateData
            };

            (prisma.provider.update as jest.Mock).mockResolvedValue(updatedProvider);

            const result = await repository.updateById(providerId, updateData, includeOption);

            expect(prisma.provider.update).toHaveBeenCalledWith({
                where: { id: providerId },
                data: updateData,
                include: includeOption
            });
            expect(result).toEqual(updatedProvider);
        });
    });

    describe('deactivateAll', () => {
        test('should deactivate all providers', async () => {
            (prisma.provider.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

            await repository.deactivateAll();

            expect(prisma.provider.updateMany).toHaveBeenCalledWith({
                data: { isActive: false }
            });
        });
    });

    describe('Error handling', () => {
        test('should propagate errors from Prisma', async () => {
            (prisma.provider.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await expect(repository.findMany({}))
                .rejects
                .toThrow('Database error');
        });
    });
});