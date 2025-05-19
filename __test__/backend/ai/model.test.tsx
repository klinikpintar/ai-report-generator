import { NextRequest } from 'next/server';
import { PATCH, GET } from '@/app/(backend)/api/ai/model/route';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse } from '@/app/(backend)/utils/exceptions';

const BASE_API_URL_AI_MODEL = "http://localhost:3000/api/ai/model";

jest.mock('@/app/(backend)/services/providerService', () => ({
    updateActiveModel: jest.fn(),
    getAllProviders: jest.fn(),
    getActiveOrDefaultProvider: jest.fn(),
}));

jest.mock('@/app/(backend)/utils/validationUtils', () => ({
    validateBody: jest.fn().mockImplementation((schema, req) => {
        return req.json();
    }),
    validateQueryParams: jest.fn().mockImplementation((schema, req) => {
        const url = new URL(req.url);
        return Object.fromEntries(url.searchParams);
    }),
}));

describe('AI Provider API - GET Models', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ✅ Happy Path - Get Providers with Models
    test("Should retrieve providers with models successfully", async () => {
        // Mock provider service response
        const mockProviders = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'openai',
                displayName: 'OpenAI',
                isActive: true,
                models: [
                    { id: '456e7890-ab12-34cd-ef56-789012345678', name: 'GPT-4', isActive: true },
                    { id: '789e0123-cd45-67ef-89ab-123456789012', name: 'GPT-3.5', isActive: false },
                ],
            },
            {
                id: '234f5678-f90c-23e4-b567-537725285111',
                name: 'anthropic',
                displayName: 'Anthropic',
                isActive: false,
                models: [
                    { id: '890f1234-de56-78fg-hi90-234567890123', name: 'Claude', isActive: true },
                ],
            }
        ];
        (providerService.getAllProviders as jest.Mock).mockResolvedValue(mockProviders);

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "GET",
        });

        // Call the API endpoint
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(mockProviders);
        expect(providerService.getAllProviders).toHaveBeenCalledWith(
            expect.objectContaining({
                includeModels: true
            })
        );
    });

    // ✅ Happy Path - Get with Query Parameters
    test("Should filter providers by query parameters", async () => {
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateQueryParams.mockReturnValue({
            providerId: '123e4567-e89b-12d3-a456-426614174000',
            onlyAvailable: true
        });

        // Mock provider service response
        const mockProviders = [
            {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'openai',
                displayName: 'OpenAI',
                isActive: true,
                models: [
                    { id: '456e7890-ab12-34cd-ef56-789012345678', name: 'GPT-4', isActive: true }
                ],
            }
        ];
        (providerService.getAllProviders as jest.Mock).mockResolvedValue(mockProviders);

        // Create a request with query params
        const url = new URL(BASE_API_URL_AI_MODEL);
        url.searchParams.append('providerId', '123e4567-e89b-12d3-a456-426614174000');
        url.searchParams.append('onlyAvailable', 'true');

        const request = new NextRequest(url, {
            method: "GET",
        });

        // Call the API endpoint
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(mockProviders);
        expect(providerService.getAllProviders).toHaveBeenCalledWith(
            expect.objectContaining({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                onlyAvailable: true,
                includeModels: true
            })
        );
    });

    // ✅ Edge Case - Empty Providers List with Fallback
    test("Should create default provider if no providers exist", async () => {
        // Mock empty providers list and default provider
        (providerService.getAllProviders as jest.Mock).mockResolvedValue([]);

        const defaultProvider = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'openai',
            displayName: 'OpenAI',
            isActive: true,
            models: [
                { id: '456e7890-ab12-34cd-ef56-789012345678', name: 'GPT-4', isActive: true }
            ],
        };
        (providerService.getActiveOrDefaultProvider as jest.Mock).mockResolvedValue(defaultProvider);

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "GET",
        });

        // Call the API endpoint
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual([defaultProvider]);
        expect(providerService.getAllProviders).toHaveBeenCalled();
        expect(providerService.getActiveOrDefaultProvider).toHaveBeenCalled();
    });

    // ❌ Unhappy Path - Validation Error
    test("Should handle validation errors in query params", async () => {
        // Mock validation failure
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateQueryParams.mockImplementation(() => {
            throw new ErrorResponse('Invalid query parameters', 400);
        });

        // Create a request with invalid params
        const url = new URL(BASE_API_URL_AI_MODEL);
        url.searchParams.append('invalidParam', 'value');

        const request = new NextRequest(url, {
            method: "GET",
        });

        // Call the API endpoint
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid query parameters");
    });

    // ❌ Unhappy Path - Service Error
    test("Should handle service errors during model fetch", async () => {
        // Mock service error
        (providerService.getAllProviders as jest.Mock).mockRejectedValue(new Error('Database error'));

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "GET",
        });

        // Call the API endpoint
        const response = await GET(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toHaveProperty("message", "Failed to fetch AI models");
    });
});

describe('AI Provider API - PATCH (Set Active Model)', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ✅ Happy Path - Model Berhasil Diaktifkan
    test("Should set active model successfully", async () => {
        // Mock provider service response
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string, modelId: string }> => ({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                modelId: '456e7890-ab12-34cd-ef56-789012345678'
            })
        );

        const mockUpdatedProvider = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Provider',
            activeModelId: '456e7890-ab12-34cd-ef56-789012345678',
            models: [
                { id: '456e7890-ab12-34cd-ef56-789012345678', name: 'GPT-4', isActive: true },
                { id: '789e0123-cd45-67ef-89ab-123456789012', name: 'Claude', isActive: false },
            ],
        };
        (providerService.updateActiveModel as jest.Mock).mockResolvedValue(mockUpdatedProvider);

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                modelId: '456e7890-ab12-34cd-ef56-789012345678'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(mockUpdatedProvider);
        expect(providerService.updateActiveModel).toHaveBeenCalledWith(
            '123e4567-e89b-12d3-a456-426614174000',
            '456e7890-ab12-34cd-ef56-789012345678'
        );
    });

    // ❌ Unhappy Path - Validasi Gagal
    test("Should fail with invalid model ID", async () => {
        // Mock validation failure
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('Invalid model ID', 400)
        );

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                modelId: 'invalid-id'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid model ID");
    });

    // ❌ Unhappy Path - Service Error
    test("Should handle service errors gracefully", async () => {
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string, modelId: string }> => ({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                modelId: '456e7890-ab12-34cd-ef56-789012345678'
            })
        );

        // Mock service error
        (providerService.updateActiveModel as jest.Mock).mockRejectedValue(new Error('Service error'));

        const request = new NextRequest(new URL(BASE_API_URL_AI_MODEL), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                modelId: '456e7890-ab12-34cd-ef56-789012345678'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toHaveProperty("message", "Failed to update active model");
    });
});

