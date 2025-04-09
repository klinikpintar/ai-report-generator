import { z } from 'zod';
import { PLATFORM_CODES } from './platform.dto';

export const CreateServiceDto = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  platformCode: z.enum(PLATFORM_CODES),
});