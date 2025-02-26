import dotenv from 'dotenv';
import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import prisma from '../../lib/prisma';

dotenv.config()

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3000"
const BASE_SCHEMA_URL = '/api/schema'

const createSchema = async () => {
  const schemaData = {
    "name": 'products',
    "description": 'table to store products data',
    "schemaText": "CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT);"
  }

  const response = await request(BASE_API_URL)
    .post(BASE_SCHEMA_URL)
    .send(schemaData)

  expect(response.status).toBe(StatusCodes.CREATED)

  return schemaData.name
}

const readSchema = async () => {
  const response = await request(BASE_API_URL)
    .get(BASE_SCHEMA_URL)

  expect(response.status).toBe(StatusCodes.OK)
  expect(Array.isArray(response.body)).toBe(true)
}

const findSchema = async (schemaName: string) => {
  const response = await request(BASE_API_URL)
    .get(BASE_SCHEMA_URL)

  expect(response.status).toBe(StatusCodes.OK)

  const schemaFound = response.body.find((schema: any) => schema.name === schemaName)
  expect(schemaFound).toBeDefined()
}

const createAndReadSchema = async () => {
  const schemaName = await createSchema()
  await findSchema(schemaName)
}

beforeEach(async () => {
  await prisma.schema.deleteMany();
});

describe('CR of Schema API', () => {
  it("should be able to save schema", createSchema)
  it("should be able to read schema", readSchema)
  it("should be able to integrate save and read (CR) of schema", createAndReadSchema)
})