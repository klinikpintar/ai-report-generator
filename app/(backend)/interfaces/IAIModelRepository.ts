import { AIModel } from '@prisma/client';

export interface IAIModelRepository {
  findById(id: string, providerId: string): Promise<AIModel | null>;
  
  create(data: {
    name: string;
    modelIdentifier: string;
    providerId: string;
    isDefault?: boolean;
    isAvailable?: boolean;
  }): Promise<AIModel>;
}