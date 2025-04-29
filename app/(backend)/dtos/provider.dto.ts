import { z } from "zod";

export class ProviderValidation {
    // Validasi untuk membuat/mengupdate provider
    static readonly POST = z.object({
        name: z
            .string()
            .min(1, { message: "Provider name cannot be empty" })
            .max(255, { message: "Provider name is too long" })
            .refine((val) => /^[a-z0-9]+$/.test(val), {
                message: "Provider name must contain only lowercase letters and numbers (e.g., 'openai', 'gemini')"
            }),

        displayName: z
            .string()
            .min(1, { message: "Display name cannot be empty" })
            .max(255, { message: "Display name is too long" }),

        apiKey: z
            .string()
            .min(8, { message: "API key must be at least 8 characters" })
            .max(512, { message: "API key is too long" })
            .refine(val => val.length > 0, {
                message: "API key cannot be empty"
            })
            .refine(val => !/\s/.test(val), {
                message: "API key cannot contain whitespace"
            }),

        isActive: z
            .boolean()
            .optional()
            .default(false),

        isDefault: z
            .boolean()
            .optional()
            .default(false),
    });

    // Validasi untuk update partial
    static readonly PATCH = z.object({
        apiKey: z
            .string()
            .min(8, { message: "API key must be at least 8 characters" })
            .optional(),

        displayName: z
            .string()
            .min(1, { message: "Display name cannot be empty" })
            .max(255, { message: "Display name is too long" })
            .optional(),

        isActive: z
            .boolean()
            .optional(),

        isDefault: z
            .boolean()
            .optional(),
    });

    // Validasi khusus untuk update API key
    static readonly UPDATE_API_KEY = z.object({
        providerId: z
            .string()
            .uuid({ message: "Invalid provider ID format" }),
        apiKey: z
            .string()
            .min(8, { message: "API key must be at least 8 characters" }),
    });

    // Validasi untuk mengaktifkan provider
    static readonly ACTIVATE = z.object({
        providerId: z
            .string()
            .uuid({ message: "Invalid provider ID format" }),
    });

    // Validasi untuk mengubah model aktif
    static readonly SET_ACTIVE_MODEL = z.object({
        providerId: z
            .string()
            .uuid({ message: "Invalid provider ID format" }),
        modelId: z
            .string()
            .uuid({ message: "Invalid model ID format" }),
    });

    // Validasi untuk query parameters
    static readonly GET = z.object({
        includeModels: z
            .enum(['true', 'false'])
            .optional()
            .transform(val => val === undefined ? undefined : val === 'true'),

        onlyActive: z
            .enum(['true', 'false'])
            .optional()
            .transform(val => val === undefined ? undefined : val === 'true'),
    });

    // Schema untuk response
    static readonly RESPONSE = z.object({
        id: z.string().uuid(),
        name: z.string(),
        displayName: z.string(),
        apiKey: z.string().transform(() => '********'), // Mask API key
        isActive: z.boolean(),
        isDefault: z.boolean(),
        activeModelId: z.string().uuid().nullable(),
    });

    // Response dengan models included
    static readonly RESPONSE_WITH_MODELS = ProviderValidation.RESPONSE.extend({
        models: z.array(z.lazy(() => ProviderValidation.MODEL_RESPONSE)),
        activeModel: z.lazy(() => ProviderValidation.MODEL_RESPONSE).nullable(),
    });

    // Model response schema (untuk digunakan dalam RESPONSE_WITH_MODELS)
    static readonly MODEL_RESPONSE = z.object({
        id: z.string().uuid(),
        name: z.string(),
        modelIdentifier: z.string(),
        isDefault: z.boolean(),
        isAvailable: z.boolean(),
    });
}