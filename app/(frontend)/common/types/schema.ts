import { Service } from "./service";

export type Schema = {
  id: string;
  createdAt: string;
  name: string;
  description: string;
  schemaText: string;
  service: Service
}