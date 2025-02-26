import { z } from 'zod';

export const CreateSchemaDto = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  schemaText: z.string().min(1, 'Schema text is required'),
});
