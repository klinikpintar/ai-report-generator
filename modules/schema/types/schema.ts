import { BaseModel, Service } from ".";


export interface Schema extends BaseModel {
  name: string;
  service: Service;
  description: string | null;
  schemaText: string;
}