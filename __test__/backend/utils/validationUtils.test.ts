import { z } from 'zod';
import { validateData, validateQueryParams, validateBody } from '@/app/(backend)/utils/validationUtils';
import { BadRequestResponse } from '@/app/(backend)/utils/exceptions';

describe('validationUtils', () => {
    // Test schemas
    const userSchema = z.object({
        name: z.string().min(3, "Nama minimal 3 karakter"),
        age: z.number().min(18, "Umur minimal 18 tahun"),
        email: z.string().email("Email tidak valid")
    });

    const queryParamSchema = z.object({
        page: z.string().optional().transform(Number),
        limit: z.string().optional().transform(Number),
        search: z.string().optional()
    });

    describe('validateData', () => {
        test('should validate data successfully with valid input', () => {
            const validData = {
                name: 'John Doe',
                age: 25,
                email: 'john@example.com'
            };

            const result = validateData(userSchema, validData);
            expect(result).toEqual(validData);
        });

        test('should throw BadRequestResponse for invalid data', () => {
            const invalidData = {
                name: 'Jo',
                age: 15,
                email: 'not-an-email'
            };

            expect(() => validateData(userSchema, invalidData)).toThrow(BadRequestResponse);
        });

        test('should include all validation errors in the message', () => {
            const invalidData = {
                name: 'Jo',
                age: 15,
                email: 'not-an-email'
            };

            try {
                validateData(userSchema, invalidData);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(BadRequestResponse);
                if (error instanceof BadRequestResponse) {
                    expect(error.message).toContain('name: Nama minimal 3 karakter');
                    expect(error.message).toContain('age: Umur minimal 18 tahun');
                    expect(error.message).toContain('email: Email tidak valid');
                }
            }
        });

        test('should pass through non-Zod errors', () => {
            const customError = new Error('Custom error');

            // Mock z.ZodType.parse to throw a non-Zod error
            const mockSchema = {
                parse: jest.fn().mockImplementation(() => {
                    throw customError;
                })
            } as unknown as z.ZodType<any>;

            expect(() => validateData(mockSchema, {})).toThrow(customError);
        });
    });

    describe('validateQueryParams', () => {
        test('should extract and validate query parameters from URL', () => {
            const request = new Request('http://example.com?page=1&limit=10&search=test');

            const result = validateQueryParams(queryParamSchema, request);

            expect(result).toEqual({
                page: 1,
                limit: 10,
                search: 'test'
            });
        });

        test('should work with optional params', () => {
            const request = new Request('http://example.com?page=1');

            const result = validateQueryParams(queryParamSchema, request);

            expect(result).toEqual({
                page: 1,
                limit: NaN, // Transform akan mengubah undefined menjadi NaN
                search: undefined
            });
        });

        test('should throw BadRequestResponse for invalid query params', () => {
            const strictSchema = z.object({
                page: z.string().refine((val) => !isNaN(parseInt(val)), {
                    message: "Page must be a number"
                }).transform(Number)
            });

            const request = new Request('http://example.com?page=abc');

            expect(() => validateQueryParams(strictSchema, request)).toThrow(BadRequestResponse);
        });
    });

    describe('validateBody', () => {
        test('should parse and validate valid JSON body', async () => {
            const validBody = {
                name: 'John Doe',
                age: 25,
                email: 'john@example.com'
            };

            const request = new Request('http://example.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(validBody)
            });

            const result = await validateBody(userSchema, request);
            expect(result).toEqual(validBody);
        });

        test('should throw BadRequestResponse for invalid JSON', async () => {
            // Buat mock request yang melempar SyntaxError saat json() dipanggil
            const mockRequest = {
                json: jest.fn().mockImplementation(() => {
                    throw new SyntaxError('Invalid JSON');
                })
            } as unknown as Request;

            try {
                await validateBody(userSchema, mockRequest);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(BadRequestResponse);
                if (error instanceof BadRequestResponse) {
                    expect(error.message).toBe('Invalid JSON body');
                }
            }
        });

        test('should throw BadRequestResponse for invalid data against schema', async () => {
            const invalidBody = {
                name: 'Jo',
                age: 15,
                email: 'not-an-email'
            };

            const request = new Request('http://example.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invalidBody)
            });

            try {
                await validateBody(userSchema, request);
                fail('Should have thrown an error');
            } catch (error) {
                expect(error).toBeInstanceOf(BadRequestResponse);
                if (error instanceof BadRequestResponse) {
                    expect(error.message).toContain('name: Nama minimal 3 karakter');
                    expect(error.message).toContain('age: Umur minimal 18 tahun');
                    expect(error.message).toContain('email: Email tidak valid');
                }
            }
        });

        test('should pass through non-SyntaxError errors', async () => {
            const customError = new Error('Network error');

            // Mock request.json to throw a non-SyntaxError
            const mockRequest = {
                json: jest.fn().mockRejectedValue(customError)
            } as unknown as Request;

            await expect(validateBody(userSchema, mockRequest)).rejects.toThrow(customError);
            expect(mockRequest.json).toHaveBeenCalled();
        });
    });
});