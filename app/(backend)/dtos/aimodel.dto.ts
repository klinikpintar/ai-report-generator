import { z } from "zod";
import { ProviderSchema } from "./provider.dto";

export class AIModelTransform {
  /**
   * Mengubah string boolean query parameter menjadi boolean sebenarnya
   */
  static stringToBoolean(value: string | undefined): boolean | undefined {
    return value === undefined ? undefined : value === 'true';
  }
  
}

export class AIModelSchema {
  // Skema dasar untuk nama model
  static readonly NAME_SCHEMA = z
    .string()
    .min(1, { message: "Model name cannot be empty" })
    .max(255, { message: "Model name is too long" });

  // Skema untuk identifier model
  static readonly IDENTIFIER_SCHEMA = z
    .string()
    .min(1, { message: "Model identifier cannot be empty" })
    .max(255, { message: "Model identifier is too long" })
    .refine((val) => /^[a-z0-9\-\.]+$/.test(val), {
      message: "Model identifier must contain only lowercase letters, numbers, hyphens, and dots"
    });
}

export class AIModelValidation {
  // Validasi untuk membuat model baru
  static readonly POST = z.object({
    name: AIModelSchema.NAME_SCHEMA,
    modelIdentifier: AIModelSchema.IDENTIFIER_SCHEMA,
    providerId: ProviderSchema.UUID_SCHEMA,
    isDefault: z.boolean().optional().default(false),
    isAvailable: z.boolean().optional().default(true),
  });

  // Validasi untuk update model
  static readonly PATCH = z.object({
    name: AIModelSchema.NAME_SCHEMA.optional(),
    modelIdentifier: AIModelSchema.IDENTIFIER_SCHEMA.optional(),
    isDefault: z.boolean().optional(),
    isAvailable: z.boolean().optional(),
  });

  // Validasi untuk query params dengan transformasi terpisah
  static readonly GET = z.object({
    providerId: ProviderSchema.UUID_SCHEMA.optional(),
    onlyAvailable: z
      .enum(['true', 'false'])
      .optional()
      .transform(AIModelTransform.stringToBoolean),
  });

  // Base response schema
  static readonly BASE_RESPONSE = z.object({
    id: ProviderSchema.UUID_SCHEMA,
    name: z.string(),
    modelIdentifier: z.string(),
    providerId: ProviderSchema.UUID_SCHEMA,
    isDefault: z.boolean(),
    isAvailable: z.boolean(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

  // Response schema
  static readonly RESPONSE = AIModelValidation.BASE_RESPONSE;

  // Response dengan provider included
  static readonly RESPONSE_WITH_PROVIDER = AIModelValidation.BASE_RESPONSE.extend({
    provider: z.object({
      id: ProviderSchema.UUID_SCHEMA,
      name: z.string(),
      displayName: z.string(),
    }),
  });
}