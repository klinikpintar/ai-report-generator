import { NextRequest } from 'next/server';
import { PATCH } from '@/app/(backend)/api/ai/key/route';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse } from '@/app/(backend)/utils/exceptions';

const BASE_API_URL_AI_KEY = "http://localhost:3000/api/ai/key";

jest.mock('@/app/(backend)/services/providerService', () => ({
    updateApiKey: jest.fn(),
}));

jest.mock('@/app/(backend)/utils/validationUtils', () => ({
    validateBody: jest.fn().mockImplementation((schema, req) => {
        return req.json();
    }),
}));

describe('AI Provider API - Update API Key', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ✅ Happy Path - API Key Berhasil Diupdate
    test("Should update API key successfully", async () => {
        // Mock provider service response
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string, apiKey: string }> => ({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: 'new-api-key-12345678'
            })
        );

        const mockUpdatedProvider = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Provider',
            apiKey: 'new-api-key-12345678',
        };
        (providerService.updateApiKey as jest.Mock).mockResolvedValue(mockUpdatedProvider);

        const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: 'new-api-key-12345678'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual(mockUpdatedProvider);
        expect(providerService.updateApiKey).toHaveBeenCalledWith(
            '123e4567-e89b-12d3-a456-426614174000',
            'new-api-key-12345678'
        );
    });

    // ❌ Unhappy Path - Validasi Gagal
    test("Should fail update with invalid API key", async () => {
        // Mock validation failure
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('Invalid API key format', 400)
        );

        // Create a request using the URL approach
        const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: 'short'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid API key format");
    });

    // ❌ Unhappy Path - Service Error
    test("Should handle service errors gracefully", async () => {
        // Explicitly ensure validateBody returns the expected data without errors
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string, apiKey: string }> => ({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: 'new-api-key-12345678'
            })
        );

        // Mock service error
        (providerService.updateApiKey as jest.Mock).mockRejectedValue(new Error('Service error'));

        const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: 'new-api-key-12345678'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toHaveProperty("message", "Failed to update API key");
    });

    // ❌ Edge Case - Empty API Key
    test("Should reject empty API key", async () => {
        // Mock validation failure for empty API key
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('API key cannot be empty', 400)
        );

        // Create a request with empty API key
        const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000',
                apiKey: '' // Empty API key
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "API key cannot be empty");
    });

    // ❌ Edge Case - Invalid Request Body Format
    test("Should handle malformed JSON body", async () => {
        // Mock validation function to throw BadRequestResponse for invalid JSON
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('Invalid JSON body', 400)
        );

        const request = new NextRequest(new URL(BASE_API_URL_AI_KEY), {
            method: "PATCH",
            body: '{ providerId: "invalid-json",',
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid JSON body");
    });
});