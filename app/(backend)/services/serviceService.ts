import prisma from '@/lib/prisma';
import { Service } from '@prisma/client';
import { CreateServiceDto, IServiceService } from '../interfaces/IServiceService';

class ServiceService implements IServiceService {
  async createService(data: CreateServiceDto): Promise<Service> {
    return prisma.service.create({ data });
  }

  async findAllServices(): Promise<Service[]> {
    return prisma.service.findMany();
  }

  async deleteService(id: string): Promise<void> {
    await prisma.service.delete({ where: { id } });
  }
}

const serviceService = new ServiceService();
export default serviceService;
