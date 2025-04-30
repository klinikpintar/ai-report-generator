import { NextRequest } from 'next/server';
import { PATCH } from '@/app/(backend)/api/ai/activate/route';
import providerService from '@/app/(backend)/services/providerService';
import { ErrorResponse } from '@/app/(backend)/utils/exceptions';

// Define base API URL
const BASE_API_URL_AI_ACTIVATE = "http://localhost:3000/api/ai/activate";

// Mock the provider service
jest.mock('@/app/(backend)/services/providerService', () => ({
    setActiveProvider: jest.fn(),
}));

// Mock validation utils
jest.mock('@/app/(backend)/utils/validationUtils', () => ({
    validateBody: jest.fn().mockImplementation((schema, req) => {
        return req.json();
    }),
}));

describe('AI Provider API - Activate Provider', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    // ✅ Happy Path - Provider Berhasil Diaktifkan
    test("Should activate provider successfully", async () => {
        // Mock provider service response
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string }> => ({ providerId: '123e4567-e89b-12d3-a456-426614174000' })
        );
        const mockUpdatedProvider = {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Test Provider',
            isActive: true,
        };
        (providerService.setActiveProvider as jest.Mock).mockResolvedValue(mockUpdatedProvider);

        // Create a request using the URL approach
        const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        // Assertions
        expect(response.status).toBe(200);
        expect(json).toEqual(mockUpdatedProvider);
        expect(providerService.setActiveProvider).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174000');
    });

    // ❌ Unhappy Path - Validasi Gagal
    test("Should fail activation with invalid request data", async () => {
        // Mock validation failure
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('Invalid request data', 400)
        );

        // Create a request using the URL approach
        const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
            method: "PATCH",
            body: JSON.stringify({ providerId: 'invalid-id' }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        // Assertions
        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid request data");
    });

    // ❌ Unhappy Path - Service Error
    test("Should handle service errors gracefully", async () => {
        // Explicitly ensure validateBody returns the expected data without errors
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string }> => ({ providerId: '123e4567-e89b-12d3-a456-426614174000' })
        );

        // Mock service error
        (providerService.setActiveProvider as jest.Mock).mockRejectedValue(new Error('Service error'));

        // Create a request using the URL approach
        const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        // Assertions
        expect(response.status).toBe(500);
        expect(json).toHaveProperty("message", "Failed to activate provider");
    });

    // ❌ Edge Case - Provider Not Found
    test("Should handle non-existent provider ID", async () => {
        // Mock validation passes but service throws not found error
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockImplementation(
            async (schema: unknown, req: NextRequest): Promise<{ providerId: string }> => ({
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            })
        );

        // Mock service error - provider not found
        (providerService.setActiveProvider as jest.Mock).mockRejectedValue(
            new ErrorResponse('Provider not found', 404)
        );

        // Create a request
        const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
            method: "PATCH",
            body: JSON.stringify({
                providerId: '123e4567-e89b-12d3-a456-426614174000'
            }),
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint
        const response = await PATCH(request);
        const json = await response.json();

        // Assertions
        expect(response.status).toBe(404);
        expect(json).toHaveProperty("message", "Provider not found");
    });

    // ❌ Edge Case - Invalid Request Body Format
    test("Should handle malformed JSON body", async () => {
        jest.requireMock('@/app/(backend)/utils/validationUtils').validateBody.mockRejectedValue(
            new ErrorResponse('Invalid JSON body', 400)
        );
        // Create a mock request with invalid JSON
        const request = new NextRequest(new URL(BASE_API_URL_AI_ACTIVATE), {
            method: "PATCH",
            // Using a string that's not valid JSON
            body: '{ providerId: "invalid-json",',
            headers: { "Content-Type": "application/json" },
        });

        // Call the API endpoint, which should catch JSON parse error
        const response = await PATCH(request);
        const json = await response.json();

        // Assertions
        expect(response.status).toBe(400);
        expect(json).toHaveProperty("message", "Invalid JSON body");
    });
});