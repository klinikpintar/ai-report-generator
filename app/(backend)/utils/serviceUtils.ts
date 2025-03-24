import { CreateServiceDto } from "@backend/dtos/service.dtos";

export function validateServiceInput(data: unknown) {
  return CreateServiceDto.parse(data);
}