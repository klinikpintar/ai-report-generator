import serviceService from '@backend/services/serviceService';
import prisma from '@/lib/prisma';
import { Service } from '@prisma/client';

jest.mock('@/lib/prisma', () => ({
  service: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('ServiceService Unit Tests', () => {
  const mockService: Service = {
    id: 'uuid-1234',
    name: 'OpenAI',
    platformCode: 'PLATFORM_X',
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a service', async () => {
    (prisma.service.create as jest.Mock).mockResolvedValue(mockService);

    const result = await serviceService.createService({
      name: 'OpenAI',
      platformCode: 'PLATFORM_X',
    });

    expect(prisma.service.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockService);
  });

  it('should retrieve all services', async () => {
    (prisma.service.findMany as jest.Mock).mockResolvedValue([mockService]);

    const result = await serviceService.findAllServices();

    expect(prisma.service.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([mockService]);
  });

  it('should delete a service', async () => {
    (prisma.service.delete as jest.Mock).mockResolvedValue(undefined);

    await expect(serviceService.deleteService('uuid-1234')).resolves.not.toThrow();
    expect(prisma.service.delete).toHaveBeenCalledTimes(1);
    expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1234' } });
  });

  it('should handle error when creating a duplicate service', async () => {
    (prisma.service.create as jest.Mock).mockRejectedValue(new Error('Duplicate'));

    await expect(serviceService.createService({
      name: 'OpenAI',
      platformCode: 'PLATFORM_X',
    })).rejects.toThrow('Duplicate');
  });

  it('should handle error when deleting non-existent service', async () => {
    (prisma.service.delete as jest.Mock).mockRejectedValue(new Error('Not found'));

    await expect(serviceService.deleteService('non-existent-id')).rejects.toThrow('Not found');
  });
});
