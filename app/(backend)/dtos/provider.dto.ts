import { z } from "zod";

export class ProviderTransform {
    /**
     * Mengubah string boolean query parameter menjadi boolean sebenarnya
     */
    static stringToBoolean(value: string | undefined): boolean | undefined {
      return value === undefined ? undefined : value === 'true';
    }
  
    /**
     * Menyamarkan API key agar tidak terekspos
     */
    static maskApiKey(apiKey: string): string {
      return '********';
    }
  
    /**
     * Mempersiapkan provider untuk respons API dengan data sensitif disamarkan
     */
    static toPublicResponse(provider: any): any {
      return {
        ...provider,
        apiKey: this.maskApiKey(provider.apiKey)
      };
    }
  }

export class ProviderSchema {
    static readonly NAME_SCHEMA = z
        .string()
        .min(1, { message: "Provider name cannot be empty" })
        .max(255, { message: "Provider name is too long" })
        .refine((val) => /^[a-z0-9]+$/.test(val), {
            message: "Provider name must contain only lowercase letters and numbers (e.g., 'openai', 'gemini')"
        });

    static readonly DISPLAY_NAME_SCHEMA = z
        .string()
        .min(1, { message: "Display name cannot be empty" })
        .max(255, { message: "Display name is too long" });

    static readonly API_KEY_SCHEMA = z
        .string()
        .min(8, { message: "API key must be at least 8 characters" })
        .max(512, { message: "API key is too long" })
        .refine(val => val.length > 0, {
            message: "API key cannot be empty"
        })
        .refine(val => !/\s/.test(val), {
            message: "API key cannot contain whitespace"
        });

    static readonly UUID_SCHEMA = z
        .string()
        .uuid({ message: "Invalid UUID format" });
}

export class ProviderValidation {
    // Validasi untuk membuat/mengupdate provider
    static readonly POST = z.object({
        name: ProviderSchema.NAME_SCHEMA,
        displayName: ProviderSchema.DISPLAY_NAME_SCHEMA,
        apiKey: ProviderSchema.API_KEY_SCHEMA,
        isActive: z.boolean().optional().default(false),
        isDefault: z.boolean().optional().default(false),
    });

    // Validasi untuk update partial
    static readonly PATCH = z.object({
        apiKey: ProviderSchema.API_KEY_SCHEMA.optional(),
        displayName: ProviderSchema.DISPLAY_NAME_SCHEMA.optional(),
        isActive: z.boolean().optional(),
        isDefault: z.boolean().optional(),
    });

    // Validasi khusus untuk update API key
    static readonly UPDATE_API_KEY = z.object({
        providerId: ProviderSchema.UUID_SCHEMA,
        apiKey: ProviderSchema.API_KEY_SCHEMA,
    });

    // Validasi untuk mengaktifkan provider
    static readonly ACTIVATE = z.object({
        providerId: ProviderSchema.UUID_SCHEMA,
    });

    // Validasi untuk mengubah model aktif
    static readonly SET_ACTIVE_MODEL = z.object({
        providerId: ProviderSchema.UUID_SCHEMA,
        modelId: ProviderSchema.UUID_SCHEMA,
    });

    // Validasi untuk query parameters dengan transformasi terpisah
    static readonly GET = z.object({
        includeModels: z
            .enum(['true', 'false'])
            .optional()
            .transform(ProviderTransform.stringToBoolean),

        onlyActive: z
            .enum(['true', 'false'])
            .optional()
            .transform(ProviderTransform.stringToBoolean),
    });

    // Schema untuk model dasar
    static readonly MODEL_SCHEMA = z.object({
        id: ProviderSchema.UUID_SCHEMA,
        name: z.string(),
        modelIdentifier: z.string(),
        isDefault: z.boolean(),
        isAvailable: z.boolean(),
    });

    // Base schema untuk response
    static readonly BASE_RESPONSE = z.object({
        id: ProviderSchema.UUID_SCHEMA,
        name: z.string(),
        displayName: z.string(),
        apiKey: z.string().transform(ProviderTransform.maskApiKey), // Transformasi terpisah
        isActive: z.boolean(),
        isDefault: z.boolean(),
        activeModelId: ProviderSchema.UUID_SCHEMA.nullable(),
    });

    static readonly RESPONSE = ProviderValidation.BASE_RESPONSE;

    static readonly RESPONSE_WITH_MODELS = ProviderValidation.BASE_RESPONSE.extend({
        models: z.array(ProviderValidation.MODEL_SCHEMA),
        activeModel: ProviderValidation.MODEL_SCHEMA.nullable(),
    });
}