import { NextRequest } from 'next/server';
import { PATCH } from '@/app/(backend)/api/ai/activate/route';
import { ErrorResponse} from '@/app/(backend)/utils/exceptions';
import { ServiceFactory } from '@/app/(backend)/factories/serviceFactory';
import { ProviderService } from '@/app/(backend)/services/providerService';

// Base URL untuk API
const BASE_API_URL_AI_ACTIVATE = "http://localhost:3000/api/ai/activate";

const mockSetActiveProvider = jest.fn();

// Mock modul validationUtils
jest.mock('@/app/(backend)/utils/validationUtils', () => ({
  validateBody: jest.fn(),
}));

describe('AI Provider API - Activate Provider', () => {
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

    setActiveProvider: mockSetActiveProvider,
    getAllProviders: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    getActiveOrDefaultProvider: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    updateActiveModel: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    updateApiKey: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
    createProvider: jest.fn().mockImplementation(() => { throw new Error('Not implemented'); }),
  } as unknown as ProviderService; // Type assertion untuk ProviderService

  beforeAll(() => {
    // Mock ServiceFactory.getProviderService untuk mengembalikan mock lengkap
    jest.spyOn(ServiceFactory, 'getProviderService').mockReturnValue(mockProviderService);
  });

  beforeEach(() => {
    // Reset mock sebelum setiap tes
    jest.clearAllMocks();
    mockSetActiveProvider.mockReset();
    validateBody.mockReset();
  });

  // ✅ Tes Happy Path - Aktivasi Berhasil
  test('Should activate provider successfully', async () => {
    const mockUpdatedProvider = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test Provider',
      isActive: true,
    };

    validateBody.mockResolvedValue({ providerId: '123e4567-e89b-12d3-a456-426614174000' });
    mockSetActiveProvider.mockResolvedValue(mockUpdatedProvider);

    const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
      method: 'PATCH',
      body: JSON.stringify({ providerId: '123e4567-e89b-12d3-a456-426614174000' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(mockUpdatedProvider);
    expect(mockSetActiveProvider).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
  });

  // ❌ Tes Unhappy Path - Validasi Gagal
  test('Should fail activation with invalid request data', async () => {
    validateBody.mockRejectedValue(new ErrorResponse('Invalid request data', 400));

    const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
      method: 'PATCH',
      body: JSON.stringify({ providerId: 'invalid-id' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PATCH(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty('message', 'Invalid request data');
  });

  test('Should handle unexpected errors gracefully', async () => {
    // Mock validateBody untuk mengembalikan data valid
    validateBody.mockResolvedValue({ providerId: '123e4567-e89b-12d3-a456-426614174000' });
    
    // Mock setActiveProvider untuk melempar error tak terduga
    mockSetActiveProvider.mockRejectedValue(new Error('Unexpected error'));

    // Buat request PATCH
    const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
      method: 'PATCH',
      body: JSON.stringify({ providerId: '123e4567-e89b-12d3-a456-426614174000' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await PATCH(request);
    const json = await response.json();

    // Verifikasi hasil
    expect(response.status).toBe(500);
    expect(json).toHaveProperty('message', 'Failed to activate provider');
  });
});