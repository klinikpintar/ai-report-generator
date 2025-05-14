import { ProviderValidation } from '@/app/(backend)/dtos/provider.dto';
import { ProviderTransform } from '@/app/(backend)/dtos/provider.dto';
import { ZodError } from 'zod';

describe('Provider DTO Validation', () => {
  describe('POST Schema', () => {
    // ✅ Happy Path - Valid Provider Data
    test('should validate correct provider data', () => {
      const validData = {
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
        isActive: true,
        isDefault: true,
      };
      
      const result = ProviderValidation.POST.parse(validData);
      expect(result).toEqual(validData);
    });
    
    // ❌ Unhappy Path - Invalid Provider Name
    test('should reject provider name with special characters', () => {
      const invalidData = {
        name: 'open-ai', // Contains hyphen
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
      };
      
      expect(() => ProviderValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ❌ Unhappy Path - Empty Display Name
    test('should reject empty display name', () => {
      const invalidData = {
        name: 'openai',
        displayName: '',
        apiKey: 'sk-1234567890abcdef',
      };
      
      expect(() => ProviderValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ❌ Unhappy Path - API Key Too Short
    test('should reject API key that is too short', () => {
      const invalidData = {
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: '1234567', // Less than 8 characters
      };
      
      expect(() => ProviderValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ❌ Unhappy Path - API Key with Whitespace
    test('should reject API key with whitespace', () => {
      const invalidData = {
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234 abcdef', // Contains space
      };
      
      expect(() => ProviderValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ✅ Happy Path - Default Values
    test('should set default values for isActive and isDefault', () => {
      const partialData = {
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
      };
      
      const result = ProviderValidation.POST.parse(partialData);
      expect(result.isActive).toBe(false);
      expect(result.isDefault).toBe(false);
    });
  });
  
  describe('UPDATE_API_KEY Schema', () => {
    // ✅ Happy Path - Valid Update
    test('should validate correct API key update', () => {
      const validData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        apiKey: 'sk-1234567890abcdef',
      };
      
      const result = ProviderValidation.UPDATE_API_KEY.parse(validData);
      expect(result).toEqual(validData);
    });
    
    // ❌ Unhappy Path - Invalid UUID
    test('should reject invalid provider ID format', () => {
      const invalidData = {
        providerId: 'not-a-uuid',
        apiKey: 'sk-1234567890abcdef',
      };
      
      expect(() => ProviderValidation.UPDATE_API_KEY.parse(invalidData)).toThrow(ZodError);
    });
  });
  
  describe('ACTIVATE Schema', () => {
    // ✅ Happy Path - Valid Activation
    test('should validate correct provider activation', () => {
      const validData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      const result = ProviderValidation.ACTIVATE.parse(validData);
      expect(result).toEqual(validData);
    });
  });
  
  describe('SET_ACTIVE_MODEL Schema', () => {
    // ✅ Happy Path - Valid Model Activation
    test('should validate correct model activation', () => {
      const validData = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        modelId: '456e7890-ab12-34cd-ef56-789012345678',
      };
      
      const result = ProviderValidation.SET_ACTIVE_MODEL.parse(validData);
      expect(result).toEqual(validData);
    });
  });
  
  describe('GET Schema', () => {
    // ✅ Happy Path - Query Parameters
    test('should transform string boolean parameters correctly', () => {
      const params = {
        includeModels: 'true',
        onlyActive: 'false',
      };
      
      const result = ProviderValidation.GET.parse(params);
      expect(result.includeModels).toBe(true);
      expect(result.onlyActive).toBe(false);
    });
    
    // ✅ Happy Path - Optional Parameters
    test('should handle missing parameters', () => {
      const result = ProviderValidation.GET.parse({});
      expect(result.includeModels).toBeUndefined();
      expect(result.onlyActive).toBeUndefined();
    });
  });
  
  describe('RESPONSE Schema', () => {
    // ✅ Happy Path - Response Transformation
    test('should mask API key in response', () => {
      const provider = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
        isActive: true,
        isDefault: false,
        activeModelId: '456e7890-ab12-34cd-ef56-789012345678',
      };
      
      const result = ProviderValidation.RESPONSE.parse(provider);
      expect(result.apiKey).toBe('********');
    });
  });
  
  describe('RESPONSE_WITH_MODELS Schema', () => {
    // ✅ Happy Path - Response with Models
    test('should validate response with models included', () => {
      const providerWithModels = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
        isActive: true,
        isDefault: false,
        activeModelId: '456e7890-ab12-34cd-ef56-789012345678',
        models: [
          {
            id: '456e7890-ab12-34cd-ef56-789012345678',
            name: 'GPT-4',
            modelIdentifier: 'gpt-4',
            isDefault: true,
            isAvailable: true,
          }
        ],
        activeModel: {
          id: '456e7890-ab12-34cd-ef56-789012345678',
          name: 'GPT-4',
          modelIdentifier: 'gpt-4',
          isDefault: true,
          isAvailable: true,
        }
      };
      
      const result = ProviderValidation.RESPONSE_WITH_MODELS.parse(providerWithModels);
      expect(result.models).toHaveLength(1);
      expect(result.activeModel).not.toBeNull();
      expect(result.apiKey).toBe('********');
    });
    
    // ✅ Edge Case - Null Active Model
    test('should handle null activeModel', () => {
      const providerWithNullActiveModel = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'openai',
        displayName: 'OpenAI',
        apiKey: 'sk-1234567890abcdef',
        isActive: true,
        isDefault: false,
        activeModelId: null,
        models: [],
        activeModel: null,
      };
      
      const result = ProviderValidation.RESPONSE_WITH_MODELS.parse(providerWithNullActiveModel);
      expect(result.activeModel).toBeNull();
    });
  });
});

describe('ProviderTransform', () => {
  // Test langsung untuk class transformasi
  describe('stringToBoolean', () => {
    test('should convert "true" to true', () => {
      expect(ProviderTransform.stringToBoolean('true')).toBe(true);
    });

    test('should convert "false" to false', () => {
      expect(ProviderTransform.stringToBoolean('false')).toBe(false);
    });

    test('should return undefined for undefined input', () => {
      expect(ProviderTransform.stringToBoolean(undefined)).toBeUndefined();
    });
  });

  describe('maskApiKey', () => {
    test('should mask API key with asterisks', () => {
      expect(ProviderTransform.maskApiKey()).toBe('********');
    });
    
    test('should mask even empty API keys', () => {
      expect(ProviderTransform.maskApiKey()).toBe('****');
    });
  });
});