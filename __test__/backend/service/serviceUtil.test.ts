import { validateServiceInput } from '@backend/utils/serviceUtils';
import { ZodError } from 'zod';

describe('serviceUtils', () => {
  describe('validateServiceInput', () => {
    it('should validate correct input', () => {
      const data = {
        name: 'OpenAI',
        platformCode: 'MongoDB',
      };

      expect(validateServiceInput(data)).toEqual(data);
    });

    it('should throw ZodError for missing name', () => {
      const data = {
        platformCode: 'MongoDB',
      };

      expect(() => validateServiceInput(data)).toThrow(ZodError);
    });

    it('should throw ZodError for missing platformCode', () => {
      const data = {
        name: 'OpenAI',
      };

      expect(() => validateServiceInput(data)).toThrow(ZodError);
    });

    it('should throw ZodError for empty strings', () => {
      const data = {
        name: '',
        platformCode: '',
      };

      expect(() => validateServiceInput(data)).toThrow(ZodError);
    });

    it('should throw ZodError for invalid platform code', () => {
      const data = {
        name: 'Gemini',
        platformCode: 'not_valid',
      };

      expect(() => validateServiceInput(data)).toThrow(ZodError);
    });
  });
});
