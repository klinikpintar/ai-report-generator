import { z } from "zod";

export class AIModelValidation {
  // Validasi untuk membuat model baru
  static readonly POST = z.object({
    name: z
      .string()
      .min(1, { message: "Model name cannot be empty" })
      .max(255, { message: "Model name is too long" }),

    modelIdentifier: z
      .string()
      .min(1, { message: "Model identifier cannot be empty" })
      .max(255, { message: "Model identifier is too long" })
      .refine((val) => /^[a-z0-9\-\.]+$/.test(val), {
        message: "Model identifier must contain only lowercase letters, numbers, hyphens, and dots (e.g., 'gpt-4', 'gemini-1.5-flash')"
      }),

    providerId: z
      .string()
      .uuid({ message: "Invalid provider ID format" }),

    isDefault: z
      .boolean()
      .optional()
      .default(false),

    isAvailable: z
      .boolean()
      .optional()
      .default(true),
  });

  // Validasi untuk update model
  static readonly PATCH = z.object({
    name: z
      .string()
      .min(1, { message: "Model name cannot be empty" })
      .max(255, { message: "Model name is too long" })
      .optional(),

    modelIdentifier: z
      .string()
      .min(1, { message: "Model identifier cannot be empty" })
      .max(255, { message: "Model identifier is too long" })
      .optional(),

    isDefault: z
      .boolean()
      .optional(),

    isAvailable: z
      .boolean()
      .optional(),
  });

  // Validasi untuk query params
  static readonly GET = z.object({
    providerId: z
      .string()
      .uuid({ message: "Invalid provider ID" })
      .optional(),

    onlyAvailable: z
      .enum(['true', 'false'])
      .optional()
      .transform(val => val === undefined ? undefined : val === 'true'),
  });

  // Response schema dasar
  static readonly RESPONSE = z.object({
    id: z.string().uuid(),
    name: z.string(),
    modelIdentifier: z.string(),
    providerId: z.string().uuid(),
    isDefault: z.boolean(),
    isAvailable: z.boolean(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
  });

  // Response dengan provider included
  static readonly RESPONSE_WITH_PROVIDER = AIModelValidation.RESPONSE.extend({
    provider: z.object({
      id: z.string().uuid(),
      name: z.string(),
      displayName: z.string(),
    }),
  });
}