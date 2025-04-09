import { Service } from '@prisma/client';

export interface CreateServiceDto {
  name: string;
  platformCode: string;
}

export interface IServiceService {
  createService(data: CreateServiceDto): Promise<Service>;
  findAllServices(): Promise<Service[]>;
  deleteService(id: string): Promise<void>;
}
