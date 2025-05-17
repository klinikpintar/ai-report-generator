import { AIModelValidation } from '@/app/(backend)/dtos/aimodel.dto';
import { AIModelTransform, AIModelSchema } from '@/app/(backend)/dtos/aimodel.dto';
import { ZodError } from 'zod';

describe('AI Model DTO Validation', () => {
  describe('POST Schema', () => {
    // ✅ Happy Path - Valid Model Data
    test('should validate correct model data', () => {
      const validData = {
        name: 'GPT-4',
        modelIdentifier: 'gpt-4',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        isDefault: true,
        isAvailable: true,
      };
      
      const result = AIModelValidation.POST.parse(validData);
      expect(result).toEqual(validData);
    });
    
    // ❌ Unhappy Path - Empty Model Name
    test('should reject empty model name', () => {
      const invalidData = {
        name: '',
        modelIdentifier: 'gpt-4',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      expect(() => AIModelValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ❌ Unhappy Path - Invalid Model Identifier
    test('should reject model identifier with invalid characters', () => {
      const invalidData = {
        name: 'GPT-4',
        modelIdentifier: 'gpt_4+', // Contains underscore and plus sign
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      expect(() => AIModelValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ❌ Unhappy Path - Invalid Provider ID
    test('should reject invalid provider ID format', () => {
      const invalidData = {
        name: 'GPT-4',
        modelIdentifier: 'gpt-4',
        providerId: 'not-a-uuid',
      };
      
      expect(() => AIModelValidation.POST.parse(invalidData)).toThrow(ZodError);
    });
    
    // ✅ Happy Path - Default Values
    test('should set default values for isDefault and isAvailable', () => {
      const partialData = {
        name: 'GPT-4',
        modelIdentifier: 'gpt-4',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      const result = AIModelValidation.POST.parse(partialData);
      expect(result.isDefault).toBe(false);
      expect(result.isAvailable).toBe(true);
    });

    // ✅ Happy Path - Valid Model Identifier with Hyphen and Dot
    test('should accept model identifier with hyphens and dots', () => {
      const validData = {
        name: 'Gemini Pro',
        modelIdentifier: 'gemini-1.5-pro',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
      };
      
      const result = AIModelValidation.POST.parse(validData);
      expect(result.modelIdentifier).toBe('gemini-1.5-pro');
    });
  });
  
  describe('PATCH Schema', () => {
    // ✅ Happy Path - Valid Partial Update
    test('should validate correct partial update', () => {
      const validData = {
        name: 'Updated GPT-4',
        isAvailable: false,
      };
      
      const result = AIModelValidation.PATCH.parse(validData);
      expect(result).toEqual(validData);
    });
    
    // ❌ Unhappy Path - Invalid Name in Update
    test('should reject empty name in update', () => {
      const invalidData = {
        name: '',
      };
      
      expect(() => AIModelValidation.PATCH.parse(invalidData)).toThrow(ZodError);
    });
  });
  
  describe('GET Schema', () => {
    // ✅ Happy Path - Query Parameters
    test('should transform string boolean parameters correctly', () => {
      const params = {
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        onlyAvailable: 'true',
      };
      
      const result = AIModelValidation.GET.parse(params);
      expect(result.providerId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.onlyAvailable).toBe(true);
    });
    
    // ✅ Happy Path - Optional Parameters
    test('should handle missing parameters', () => {
      const result = AIModelValidation.GET.parse({});
      expect(result.providerId).toBeUndefined();
      expect(result.onlyAvailable).toBeUndefined();
    });
    
    // ❌ Unhappy Path - Invalid Provider ID in Query
    test('should reject invalid provider ID in query', () => {
      const invalidParams = {
        providerId: 'not-a-uuid',
      };
      
      expect(() => AIModelValidation.GET.parse(invalidParams)).toThrow(ZodError);
    });
  });
  
  describe('RESPONSE Schema', () => {
    // ✅ Happy Path - Response Validation
    test('should validate correct response data', () => {
      const modelData = {
        id: '456e7890-ab12-34cd-ef56-789012345678',
        name: 'GPT-4',
        modelIdentifier: 'gpt-4',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        isDefault: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const result = AIModelValidation.RESPONSE.parse(modelData);
      expect(result.id).toBe('456e7890-ab12-34cd-ef56-789012345678');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });
  
  describe('RESPONSE_WITH_PROVIDER Schema', () => {
    // ✅ Happy Path - Response with Provider
    test('should validate response with provider included', () => {
      const modelWithProvider = {
        id: '456e7890-ab12-34cd-ef56-789012345678',
        name: 'GPT-4',
        modelIdentifier: 'gpt-4',
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        isDefault: true,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'openai',
          displayName: 'OpenAI',
        }
      };
      
      const result = AIModelValidation.RESPONSE_WITH_PROVIDER.parse(modelWithProvider);
      expect(result.provider.displayName).toBe('OpenAI');
    });
  });
});

describe('AIModelTransform', () => {
  describe('stringToBoolean', () => {
    test('should convert "true" to true', () => {
      expect(AIModelTransform.stringToBoolean('true')).toBe(true);
    });

    test('should convert "false" to false', () => {
      expect(AIModelTransform.stringToBoolean('false')).toBe(false);
    });

    test('should return undefined for undefined input', () => {
      expect(AIModelTransform.stringToBoolean(undefined)).toBeUndefined();
    });
  });
});

describe('AIModelSchema', () => {
  // Test untuk konstanta schema
  describe('NAME_SCHEMA', () => {
    test('should validate valid model name', () => {
      const validName = 'Test Model';
      expect(AIModelSchema.NAME_SCHEMA.parse(validName)).toBe(validName);
    });

    test('should reject empty model name', () => {
      expect(() => AIModelSchema.NAME_SCHEMA.parse('')).toThrow();
    });
  });

  describe('IDENTIFIER_SCHEMA', () => {
    test('should validate valid identifier', () => {
      const validIdentifier = 'gpt-3.5-turbo';
      expect(AIModelSchema.IDENTIFIER_SCHEMA.parse(validIdentifier)).toBe(validIdentifier);
    });

    test('should reject identifier with invalid characters', () => {
      expect(() => AIModelSchema.IDENTIFIER_SCHEMA.parse('invalid_identifier!')).toThrow();
    });
  });
});