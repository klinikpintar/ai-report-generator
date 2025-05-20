import { NextRequest } from 'next/server';
import { PATCH } from '@/app/(backend)/api/ai/key/route';
import { ErrorResponse } from '@/app/(backend)/utils/exceptions';
import { ServiceFactory } from '@/app/(backend)/factories/serviceFactory';
import { ProviderService } from '@/app/(backend)/services/providerService';

// Base URL untuk API
const BASE_API_URL_AI_KEY = "http://localhost:3000/api/ai/key";

// Mock untuk updateApiKey
const mockUpdateApiKey = jest.fn();

// Mock modul validationUtils
jest.mock('@/app/(backend)/utils/validationUtils', () => ({
  validateBody: jest.fn(),
}));

describe('AI Provider API - Update API Key', () => {
  const validateBody = jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody;

  // Membuat mock lengkap untuk ProviderService
  const mockProviderService: ProviderService = {
    // Properti wajib dari constructor
    providerRepository: {
      findMany: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      findActive: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      findByDefault: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      updateById: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      findById: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      updateActiveModel: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      updateApiKey: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      setActive: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      createWithDefaults: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    } as any, // Type assertion untuk IProviderRepository
    modelService: {
      selectDefaultModelId: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      findById: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    } as any, // Type assertion untuk IModelService
    apiKeyService: {
      validateApiKey: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
      encryptApiKey: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    } as any, // Type assertion untuk IApiKeyService
    defaultProviderFactory: {
      createDefault: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    } as any, // Type assertion untuk DefaultProviderFactory

    // Metode wajib dari ProviderService
    setActiveProvider: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    getAllProviders: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    getActiveOrDefaultProvider: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    updateActiveModel: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    updateApiKey: mockUpdateApiKey, // Gunakan mock untuk method yang kita uji
    createProvider: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
  } as unknown as ProviderService; // Type assertion untuk ProviderService

  beforeAll(() => {
    // Mock ServiceFactory.getProviderService untuk mengembalikan mock lengkap
    jest.spyOn(ServiceFactory, 'getProviderService').mockReturnValue(mockProviderService);
  });

  beforeEach(() => {
    // Reset mock sebelum setiap tes
    jest.clearAllMocks();
    mockUpdateApiKey.mockReset();
    validateBody.mockReset();
  });

  // ✅ Tes Happy Path - API Key Berhasil Diupdate
  test("Should update API key successfully", async () => {
    const mockUpdatedProvider = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Provider',
      apiKey: 'new-api-key-12345678',
    };

    validateBody.mockResolvedValue({ 
      providerId: '123e4567-e89b-12d3-a456-426614174000', 
      apiKey: 'new-api-key-12345678' 
    });
    mockUpdateApiKey.mockResolvedValue(mockUpdatedProvider);

    const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
      method: "PATCH",
      body: JSON.stringify({
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        apiKey: 'new-api-key-12345678'
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(mockUpdatedProvider);
    expect(mockUpdateApiKey).toHaveBeenCalledWith(
      '123e4567-e89b-12d3-a456-426614174000',
      'new-api-key-12345678'
    );
  });

  // ❌ Unhappy Path - Validasi Gagal
  test("Should fail update with invalid API key", async () => {
    // Mock validation failure
    validateBody.mockRejectedValue(new ErrorResponse('Invalid API key format', 400));

    const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
      method: "PATCH",
      body: JSON.stringify({
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        apiKey: 'short'
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Invalid API key format");
  });

  // ❌ Unhappy Path - Service Error
  test("Should handle service errors gracefully", async () => {
    validateBody.mockResolvedValue({ 
      providerId: '123e4567-e89b-12d3-a456-426614174000', 
      apiKey: 'new-api-key-12345678' 
    });
    mockUpdateApiKey.mockRejectedValue(new Error('Service error'));

    const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
      method: "PATCH",
      body: JSON.stringify({
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        apiKey: 'new-api-key-12345678'
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty("message", "Failed to update API key");
  });

  // ❌ Edge Case - Empty API Key
  test("Should reject empty API key", async () => {
    validateBody.mockRejectedValue(new ErrorResponse('API key cannot be empty', 400));

    const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
      method: "PATCH",
      body: JSON.stringify({
        providerId: '123e4567-e89b-12d3-a456-426614174000',
        apiKey: '' // Empty API key
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "API key cannot be empty");
  });

  // ❌ Edge Case - Invalid Request Body Format
  test("Should handle malformed JSON body", async () => {
    validateBody.mockRejectedValue(new ErrorResponse('Invalid JSON body', 400));

    const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
      method: "PATCH",
      body: '{ providerId: "invalid-json",',
      headers: { "Content-Type": "application/json" },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Invalid JSON body");
  });
});