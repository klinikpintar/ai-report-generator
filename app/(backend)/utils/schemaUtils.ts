import { CreateSchemaDto } from '../dtos/schema.dtos';

export const validateSchemaInput = (body: unknown) => {
  return CreateSchemaDto.parse(body);
}