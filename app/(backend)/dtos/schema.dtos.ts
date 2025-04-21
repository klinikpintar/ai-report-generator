import { z } from 'zod';

export const CreateSchemaDto = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  schemaText: z.string().min(1, 'Schema text is required'),
  serviceId: z.string().uuid('Service ID is required'),
});

const PLATFORM_CODES = ['POSTGRESQL', 'MYSQL', 'MONGODB'];

export const GetSchemaDto = z.object({
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