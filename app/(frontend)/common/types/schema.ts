import { Service } from "./service";

export type Schema = {
  id: number;
  name: string;
  description: string;
  schemaText: string;
  createdAt: string;
  serviceId: Service["id"];
  service: Service;
}