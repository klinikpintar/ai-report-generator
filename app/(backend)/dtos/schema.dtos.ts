import { z } from 'zod';

export const CreateSchemaDto = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  schemaText: z.string().min(1, 'Schema text is required'),
  serviceId: z.string().uuid('Service ID is required'),
});

-import const PLATFORM_CODES = ['POSTGRESQL', 'MYSQL', 'MONGODB'];
+import { PLATFORM_CODES as PlatformCodes } from '@backend/dtos/platform.dto';
+const PLATFORM_CODES = PlatformCodes.map(code => code.toUpperCase());

export const GetSchemaDto = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? "1"))
    .refine((val) => val > 0, { message: "Page must be greater than 0" }),

  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? "10"))
    .refine((val) => val > 0, { message: "Limit must be greater than 0" }),

  serviceIds: z
    .array(z.string().uuid({ message: 'Service ID must be a valid UUID' }))
    .optional(),

  platformCodes: z
    .array(z.string())
    .transform((val) => val.map((code) => code.toUpperCase()))
    .refine((val) => val.every((code) => PLATFORM_CODES.includes(code)), {
      message: `Platform codes must be one of: ${PLATFORM_CODES.join(', ')}`,
    })
    .optional(),
})