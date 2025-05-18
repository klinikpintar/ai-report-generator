import { createDeepSeek } from '@ai-sdk/deepseek';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ProviderService } from '@/app/(backend)/services/providerService';
import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { z } from 'zod';

import { PrismaProviderRepository } from '@/app/(backend)/repositories/PrismaProviderRepository'; 
import { ModelService } from '@/app/(backend)/services/modelService';
import { ApiKeyService } from '@/app/(backend)/services/apiKeyService';
import { PrismaAIModelRepository } from '@/app/(backend)/repositories/PrismaAIModelRepository';

const apiKeyService = new ApiKeyService();
const modelService = new ModelService(new PrismaAIModelRepository());
const providerRepository = new PrismaProviderRepository();
const providerService = new ProviderService(providerRepository, modelService, apiKeyService);
import { LanguageModelV1 } from 'ai';

type ModelBuilderFn = (apiKey: string, modelIdentifier: string) => LanguageModelV1;


const modelBuilders: Record<string, ModelBuilderFn> = {
  deepseek: (apiKey, modelId) => createDeepSeek({ apiKey })(modelId),
  gemini: (apiKey, modelId) => createGoogleGenerativeAI({ apiKey })(modelId),
};

export const getAllModelInstances = async () => {
  const providers = await providerService.getAllProviders({ includeModels: true }) as z.infer<typeof ProviderValidation.RESPONSE_WITH_MODELS_INTERNAL>[];
  console.log(":::", providers, ProviderValidation.RESPONSE_WITH_MODELS_INTERNAL)

  return await Promise.all(
    providers.flatMap(async (provider) => {
      const builder = modelBuilders[provider.name];
      if (!builder) return [];

      try {
        const decryptedKey = apiKeyService.decryptApiKey(provider.apiKey);
        return (provider.models || [])
          .filter(model => model.isAvailable)
          .map(model => ({
            providerName: provider.name,
            modelIdentifier: model.modelIdentifier,
            instance: builder(decryptedKey, model.modelIdentifier),
          }));
      } catch (err) {
        console.error(`Failed to decrypt API key for provider ${provider.name}:`, err);
        return [];
      }
    })
  ).then(results => results.flat());
};
