import dotenv from 'dotenv';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../../lib/prisma';

dotenv.config()

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3000"
const BASE_SCHEMA_URL = '/api/schema'
const NON_EXISTING_ID = 9999

let createdSchemaId: number;

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

const nonExistingSchemaReqBody = {
  id: NON_EXISTING_ID,
  description: 'Trying to update a non-existing schema',
}

const createValidSchema = async () => {
  const response = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)

  expect(response.status).toBe(StatusCodes.CREATED)
  createdSchemaId = response.body.id;

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
  const response = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  const duplicateResponse = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  createdSchemaId = duplicateResponse.body.id;

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

const updateSchema = async (schemaId: number, updateSchemaRequestBody: any) => {
  const response = await request(BASE_API_URL).patch(BASE_SCHEMA_URL).send({
    id: schemaId,
    ...updateSchemaRequestBody,
  });

  return response
};

const deleteSchema = async (schemaId: number) => {
  const response = await request(BASE_API_URL).delete(BASE_SCHEMA_URL).send({ id: schemaId });

  return response
};

const updateSchemaTest = async () => {
  const responseCreate = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
  createdSchemaId = responseCreate.body.id;
  
  const response = await updateSchema(createdSchemaId, updatedSchemaData)

  expect(response.status).toBe(StatusCodes.OK);
  expect(response.body.description).toBe(updatedSchemaData.description);
}

const deleteSchemaTest = async () => {
  const responseCreate = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(validSchemaData)
    createdSchemaId = responseCreate.body.id;
  
  const response = await deleteSchema(createdSchemaId)
  expect(response.status).toBe(StatusCodes.OK);
}

const updateAndFindSchema = async () => {
  await updateSchemaTest()

  const response = await findSchema("products", true)
  
  expect(response.description).toBe("Updated table description")
}

const updateNonExistingSchema = async () => {
  const response = await updateSchema(NON_EXISTING_ID, nonExistingSchemaReqBody)

  expect(response.status).toBe(StatusCodes.NOT_FOUND);
};

const updateSchemaToDuplicate = async () => {
  const schemaA = await request(BASE_API_URL).post(BASE_SCHEMA_URL).send({
    name: 'schema_A',
    description: 'Schema A',
    schemaText: 'CREATE TABLE schema_A (id SERIAL PRIMARY KEY, name TEXT);',
  });

  const schemaB = await request(BASE_API_URL).post(BASE_SCHEMA_URL).send({
    name: 'schema_B',
    description: 'Schema B',
    schemaText: 'CREATE TABLE schema_B (id SERIAL PRIMARY KEY, name TEXT);',
  });

  const response = await updateSchema(schemaA.body.id, { name: schemaB.body.name });

  expect(response.status).toBe(StatusCodes.CONFLICT);
};

const deleteNonExistingSchema = async () => {
  const response = await deleteSchema(NON_EXISTING_ID);

  expect(response.status).toBe(StatusCodes.NOT_FOUND);
};


const deleteAndFindSchema = async () => {
  await deleteSchemaTest()

  await findSchema("products", false)
}

beforeEach(async () => {
  await prisma.schema.deleteMany();
});

describe('CRUD of Schema API', () => {
  it("should be able to save valid schema", createValidSchema)
  it("should return BAD REQUEST for invalid schema data", createInvalidSchema)
  it("should return CONFLICT for duplicate schema", createDuplicateSchema)

  it("should be able to read schema", readSchema)
  it("should be able to integrate save and read (CR) of schema", createAndReadSchema)

  it("should be able to update schema", updateSchemaTest)
  it("should be able to integrate update and read (UR) of schema", updateAndFindSchema)
  it("should return NOT_FOUND for invalid schema id", updateNonExistingSchema)
  it("should return CONFLICT when updating schema to an existing schema name", updateSchemaToDuplicate);

  it("should be able to delete schema", deleteSchemaTest)
  it("should be able to integrate delete and read (DR) of schema", deleteAndFindSchema)
  it("should return NOT_FOUND when deleting a non-existing schema", deleteNonExistingSchema);
})