import { ApiKeyService } from '@/app/(backend)/services/apiKeyService';
import axios from 'axios';
import type { AxiosError } from 'axios';

// Mock dependencies
jest.mock('axios');
jest.mock('@/app/(backend)/config', () => ({
  ENCRYPTION_KEY: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
  JWT_ACCESS_SECRET: 'test-jwt-access',
  JWT_REFRESH_SECRET: 'test-jwt-refresh',
  JWT_ACCESS_EXPIRES: 3600,
  JWT_REFRESH_EXPIRES: 86400,
  NODE_ENV: 'test',
  BCRYPT_SALT_ROUNDS: 10,
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

function withMockedAxiosIsAxiosError<T>(fn: () => Promise<T>): Promise<T> {
  const origIsAxiosError = axios.isAxiosError;

  axios.isAxiosError = (((error: any): boolean => {
    return Boolean(error &&
      (error.isAxiosError === true) &&
      error.response);
  }) as unknown) as <T = any, D = any>(payload: any) => payload is AxiosError<T, D>;

  try {
    return fn();
  } finally {
    axios.isAxiosError = origIsAxiosError;
  }
}

function createMockAxiosError(options: {
  message: string;
  responseData?: any;
  responseStatus?: number;
}) {
  const error: any = new Error(options.message);

  Object.defineProperty(error, 'isAxiosError', {
    value: true,
    configurable: true,
    enumerable: true
  });

  const response = {
    data: options.responseData || {},
    status: options.responseStatus || 400,
    statusText: 'Error',
    headers: {},
    config: {}
  };

  Object.defineProperty(error, 'response', {
    value: response,
    configurable: true,
    enumerable: true
  });

  return error;
}

describe('ApiKeyService', () => {
  let apiKeyService: ApiKeyService;

  beforeEach(() => {
    jest.clearAllMocks();
    apiKeyService = new ApiKeyService();
  });

  describe('constructor', () => {
    test('should initialize with correct configuration', () => {
      expect(apiKeyService).toBeDefined();
    });

    test('should throw error when ENCRYPTION_KEY is not set', () => {
      const mockConfig = {
        ...jest.requireMock('@/app/(backend)/config'),
        ENCRYPTION_KEY: ''
      };
      expect(() => new ApiKeyService(mockConfig))
        .toThrow('ENCRYPTION_KEY environment variable is not set');
    });

    test('should throw error when ENCRYPTION_KEY has invalid length', () => {
      const mockConfig = {
        ...jest.requireMock('@/app/(backend)/config'),
        ENCRYPTION_KEY: '1234'
      };
      expect(() => new ApiKeyService(mockConfig))
        .toThrow('Encryption key must be exactly 32 bytes');
    });
  });

  describe('encryption and decryption', () => {
    test('should encrypt and decrypt back to original text', () => {
      const apiKey = 'test-api-key-123';
      const encrypted = apiKeyService.encryptApiKey(apiKey);
      const decrypted = apiKeyService.decryptApiKey(encrypted);

      expect(decrypted).toBe(apiKey);
    });

    test('should throw error when decrypting invalid format', () => {
      expect(() => {
        apiKeyService.decryptApiKey('invalid-format');
      }).toThrow('Invalid encrypted format');
    });
  });

  describe('validateApiKey', () => {
    test('should return true for unknown provider', async () => {
      const result = await apiKeyService.validateApiKey('unknown', 'any-key');
      expect(result).toBe(true);
    });

    test('should return true when Gemini API returns 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: {} });
      const result = await apiKeyService.validateApiKey('gemini', 'valid-key');
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('generativelanguage.googleapis.com/v1/models?key=valid-key'),
        expect.objectContaining({ timeout: 5000 })
      );
    });

    test('should return true when Deepseek API returns 200', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: {} });
      const result = await apiKeyService.validateApiKey('deepseek', 'valid-key');
      expect(result).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.deepseek.com/v1/models',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer valid-key'
          }),
          timeout: 5000
        })
      );
    });

    test('should handle different provider name capitalization', async () => {
      mockedAxios.get.mockResolvedValueOnce({ status: 200, data: {} });
      const result = await apiKeyService.validateApiKey('GEMINI', 'valid-key');
      expect(result).toBe(true);
    });
  });

  describe('error handling', () => {

    test('should handle axios error with standard message', async () => {
      const axiosError = createMockAxiosError({
        message: 'Request failed'
      });

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: Request failed'
        });
    });

    test('should handle axios error with response.data.error.message', async () => {
      const specificErrorMsg = 'API key not valid';

      // Langsung inspeksi implementation ApiKeyService
      const spy = jest.spyOn(axios, 'isAxiosError').mockImplementation((error: any) => {
        return true; // Selalu kembalikan true untuk test ini
      });

      // Buat mock AxiosError lebih lengkap
      const axiosError = {
        isAxiosError: true,
        message: 'Request failed',
        response: {
          data: {
            error: {
              message: specificErrorMsg
            }
          },
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {}
        },
        config: {},
        name: 'AxiosError',
        toJSON: () => ({})
      };

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      try {
        await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
          .rejects
          .toMatchObject({
            message: `Invalid API key: ${specificErrorMsg}`
          });
      } finally {
        spy.mockRestore();
      }
    });

    test('should handle axios error with missing error.response.data.error.message', async () => {
      const axiosError = createMockAxiosError({
        message: 'Base error message',
        responseData: {}  // No error property
      });

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await withMockedAxiosIsAxiosError(async () => {
        await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
          .rejects
          .toMatchObject({
            message: 'Invalid API key: Base error message'
          });
      });
    });

    test('should handle axios error with missing error.response.data', async () => {
      const axiosError = createMockAxiosError({
        message: 'No data error'
      });

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      // Gunakan helper function withMockedAxiosIsAxiosError yang sudah dibuat
      await withMockedAxiosIsAxiosError(async () => {
        await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
          .rejects
          .toMatchObject({
            message: 'Invalid API key: No data error'
          });
      });
    });

    test('should handle axios error with message but no error.response.data.error.message', async () => {
      const axiosError = createMockAxiosError({
        message: 'Custom error message',
        responseData: {} // Kosong tanpa property error
      });

      mockedAxios.get.mockRejectedValueOnce(axiosError);

      await withMockedAxiosIsAxiosError(async () => {
        await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
          .rejects
          .toMatchObject({
            message: 'Invalid API key: Custom error message'
          });
      });
    });

    test('should hit else-if branch for axios error with message but no error path', async () => {
      const customError = new Error('Branch specific message') as any;
      customError.isAxiosError = true;

      // Tambahkan response tapi tanpa data.error.message
      customError.response = {
        status: 400,
        data: {
          otherField: 'exists'
          // Tidak ada property "error"
        }
      };

      // Spy pada implementasi axios.isAxiosError yang asli
      const spy = jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

      try {
        mockedAxios.get.mockRejectedValueOnce(customError);

        await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
          .rejects
          .toMatchObject({
            message: 'Invalid API key: Branch specific message'
          });

        expect(spy).toHaveBeenCalled();
      } finally {
        spy.mockRestore();
      }
    });

    test('should handle non-axios Error objects', async () => {
      const regularError = new Error('Regular JS error');

      mockedAxios.get.mockRejectedValueOnce(regularError);

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: Regular JS error'
        });
    });

    test('should handle non-Error objects', async () => {
      // String error
      mockedAxios.get.mockImplementationOnce(() => {
        throw 'String error';
      });

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: String error'
        });

      // Object error
      mockedAxios.get.mockImplementationOnce(() => {
        throw { custom: 'Object error' };
      });

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: [object Object]'
        });
    });

    test('should handle null or undefined errors', async () => {
      // Null error
      mockedAxios.get.mockImplementationOnce(() => {
        throw null;
      });

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: null'
        });

      // Undefined error
      mockedAxios.get.mockImplementationOnce(() => {
        throw undefined;
      });

      await expect(apiKeyService.validateApiKey('gemini', 'invalid-key'))
        .rejects
        .toMatchObject({
          message: 'Invalid API key: undefined'
        });
    });
  });
});