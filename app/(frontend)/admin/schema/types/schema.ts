import { BaseModel, Service, Platform } from ".";


export interface Schema extends BaseModel {
  name: string;
  service?: Service;
  description: string | null;
  schemaText: string;
  platform?: Platform;
  serviceId?: string;
}