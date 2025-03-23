import { z } from 'zod';

export const CreateServiceValidator = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  platformCode: z.string().min(1, { message: 'Platform code is required' }),
});

export type CreateServiceDto = z.infer<typeof CreateServiceValidator>;
