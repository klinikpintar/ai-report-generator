import { z } from 'zod';
import { BadRequestResponse } from './exceptions';

/**
 * Utilitas untuk memvalidasi data dengan schema Zod
 * dan menangani error dengan format yang konsisten
 */
export function validateData<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): z.infer<T> {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new BadRequestResponse(
                error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
            );
        }
        throw error;
    }
}

/**
 * Utilitas untuk mengekstrak dan memvalidasi query parameters
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
    schema: T,
    request: Request
): z.infer<T> {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    return validateData(schema, queryParams);
}

/**
 * Utilitas untuk memvalidasi body request
 */
export async function validateBody<T extends z.ZodTypeAny>(
    schema: T,
    request: Request
): Promise<z.infer<T>> {
    try {
        const body = await request.json();
        return validateData(schema, body);
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new BadRequestResponse('Invalid JSON body');
        }
        throw error;
    }
}