import { CreateServiceValidator } from '../dtos/service.dtos';

export function validateServiceInput(data: unknown) {
  return CreateServiceValidator.parse(data);
}