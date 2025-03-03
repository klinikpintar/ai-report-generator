import dotenv from 'dotenv';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../lib/prisma';

dotenv.config()

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3000"
const BASE_SCHEMA_URL = '/api/schema'

const validSchemaData = {
  name: 'products',
  description: 'Table to store products data',
  schemaText: 'CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT);',
};

const updatedSchemaData = {
  description: 'Updated table description',
};

const invalidSchemaData = {
  name: 'products_invalid',
};

const createValidSchema = async () => {
  const response = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)

  expect(response.status).toBe(StatusCodes.CREATED)

  return validSchemaData.name
}

const createInvalidSchema = async () => {
  const response = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(invalidSchemaData)

  expect(response.status).toBe(StatusCodes.BAD_REQUEST)

  return validSchemaData.name
}

const createDuplicateSchema = async () => {
  const _ = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  const duplicateResponse = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)

  expect(duplicateResponse.status).toBe(StatusCodes.CONFLICT)
}

const readSchema = async () => {
  const response = await request(BASE_API_URL)
    .get(BASE_SCHEMA_URL)

  expect(response.status).toBe(StatusCodes.OK)
  expect(Array.isArray(response.body)).toBe(true)
}

const findSchema = async (schemaName: string, shouldExist: boolean) => {
  const response = await request(BASE_API_URL)
    .get(BASE_SCHEMA_URL)

  expect(response.status).toBe(StatusCodes.OK)

  const schemaFound = response.body.find((schema: any) => schema.name === schemaName)

  if (shouldExist) expect(schemaFound).toBeDefined()
  else expect(schemaFound).toBeUndefined()

  return schemaFound
}

const createAndReadSchema = async () => {
  const schemaName = await createValidSchema()
  await findSchema(schemaName, true)
}

const updateSchema = async (schemaId: number) => {
  const response = await request(BASE_API_URL).patch(BASE_SCHEMA_URL).send({
    id: schemaId,
    ...updatedSchemaData,
  });

  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body.description).toBe(updatedSchemaData.description);
};

const deleteSchema = async (schemaId: number) => {
  const response = await request(BASE_API_URL).delete(BASE_SCHEMA_URL).send({ id: schemaId });

  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body.message).toBe('Schema deleted successfully');
};

const updateSchemaTest = async () => {
  const _ = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  
  await updateSchema(1)
}

const deleteSchemaTest = async () => {
  const _ = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  
  await deleteSchema(1)
}

const updateAndFindSchema = async () => {
  await updateSchemaTest()

  const response = await findSchema("products", true)
  
  expect(response.body.description).toBe("Updated table description")
}

const deleteAndFindSchema = async () => {
  await deleteSchemaTest()

  await findSchema("products", false)
}

beforeEach(async () => {
  await prisma.schema.deleteMany();
});

describe('CR of Schema API', () => {
  it("should be able to save valid schema", createValidSchema)
  it("should return BAD REQUEST for invalid schema data", createInvalidSchema)
  it("should return CONFLICT for duplicate schema", createDuplicateSchema)

  it("should be able to read schema", readSchema)
  it("should be able to integrate save and read (CR) of schema", createAndReadSchema)

  it("should be able to update schema", updateSchemaTest)
  it("should be able to integrate update and read (UR) of schema", updateAndFindSchema)

  it("should be able to delete schema", deleteSchemaTest)
  it("should be able to integrate delete and read (DR) of schema", deleteAndFindSchema)
})