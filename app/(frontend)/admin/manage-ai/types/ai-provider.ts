import { AIModel } from "./ai-model";

export interface AIProvider {
  id: string;
  name: string;
  displayName: string;
  apiKey: string;
  isActive: boolean;
  isDefault: boolean;
  activeModelId: string | null;
  models: AIModel[];
  activeModel: AIModel | null;
  logoUrl: string | null;
}