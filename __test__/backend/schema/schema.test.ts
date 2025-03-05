import { NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";
import { POST, GET, PATCH, DELETE } from "@/app/api/schema/route";
import prisma from "@/lib/prisma";
import schemaService from "@/app/services/schemaService";

const NON_EXISTING_ID = 9999;

const validSchemaData = {
  name: "products",
  description: "Table to store products data",
  schemaText: "CREATE TABLE products (id SERIAL PRIMARY KEY, name TEXT);",
};

const updatedSchemaData = {
  description: "Updated table description",
};

const invalidSchemaData = {
  name: "products_invalid",
};

const nonExistingSchemaReqBody = {
  id: NON_EXISTING_ID,
  description: "Trying to update a non-existing schema",
};

const sendRequest = (method: string, body?: any) => {
  return new NextRequest(new URL("http://localhost/api/schema"), {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: { "Content-Type": "application/json" },
  });
};

const createValidSchema = async () => {
  const request = sendRequest("POST", validSchemaData);
  const response = await POST(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.CREATED);
  return json.id;
};

const createSchema = async (schemaBody: any) => {
  const request = sendRequest("POST", schemaBody);
  const response = await POST(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.CREATED);
  return json.id;
};

const createInvalidSchema = async () => {
  const request = sendRequest("POST", invalidSchemaData);
  const response = await POST(request);

  expect(response.status).toBe(StatusCodes.BAD_REQUEST);
};

const createDuplicateSchema = async () => {
  await createValidSchema();

  const request = sendRequest("POST", validSchemaData);
  const response = await POST(request);

  expect(response.status).toBe(StatusCodes.CONFLICT);
};

const readSchema = async () => {
  const request = sendRequest("GET");
  const response = await GET(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.OK);
  expect(Array.isArray(json)).toBe(true);
};

const getSchemasWithFailure = async () => {
  jest.spyOn(schemaService, "findAllSchemas").mockRejectedValue(new Error("Database Error"));

  const request = sendRequest("GET");
  const response = await GET(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
  expect(json.error).toBe("Failed to fetch schemas");
};

const findSchema = async (schemaName: string, shouldExist: boolean) => {
  const request = sendRequest("GET");
  const response = await GET(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.OK);

  const schemaFound = json.find((schema: any) => schema.name === schemaName);

  if (shouldExist) expect(schemaFound).toBeDefined();
  else expect(schemaFound).toBeUndefined();
};

const createAndReadSchema = async () => {
  const schemaId = await createValidSchema();
  await findSchema(validSchemaData.name, true);
  return schemaId;
};

const updateSchema = async (schemaId: number, updateSchemaRequestBody: any) => {
  const request = sendRequest("PATCH", { id: schemaId, ...updateSchemaRequestBody });
  return await PATCH(request);
};

const deleteSchema = async (schemaId: number) => {
  const request = sendRequest("DELETE", { id: schemaId });
  return await DELETE(request);
};

const updateSchemaTest = async () => {
  const schemaId = await createValidSchema();
  const response = await updateSchema(schemaId, updatedSchemaData);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.OK);
  expect(json.description).toBe(updatedSchemaData.description);
};

const deleteSchemaTest = async () => {
  const schemaId = await createValidSchema();
  const response = await deleteSchema(schemaId);

  expect(response.status).toBe(StatusCodes.OK);
};

const updateAndFindSchema = async () => {
  await updateSchemaTest();
  await findSchema(validSchemaData.name, true);
};

const updateNonExistingSchema = async () => {
  const response = await updateSchema(NON_EXISTING_ID, nonExistingSchemaReqBody);
  expect(response.status).toBe(StatusCodes.NOT_FOUND);
};

const updateSchemaToDuplicate = async () => {

  const schemaA = await createSchema({ 
    name: "schemaA", 
    description: "This is SchemaA",
    schemaText: "SchemaA",
  });
  const schemaB = await createSchema({ 
    name: "schemaB", 
    description: "This is SchemaB",
    schemaText: "SchemaB",
  });

  const response = await updateSchema(schemaA, { name: "schemaB" });

  expect(response.status).toBe(StatusCodes.CONFLICT);
};

const deleteNonExistingSchema = async () => {
  const response = await deleteSchema(NON_EXISTING_ID);
  expect(response.status).toBe(StatusCodes.NOT_FOUND);
};

const updateSchemaWithoutId = async () => {
  const request = sendRequest("PATCH", {});
  const response = await PATCH(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  expect(json.error).toBe("Schema ID is required");
};

const deleteSchemaWithoutId = async () => {
  const request = sendRequest("DELETE", {});
  const response = await DELETE(request);
  const json = await response.json();

  expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  expect(json.error).toBe("Schema ID is required");
};

const deleteAndFindSchema = async () => {
  await deleteSchemaTest();
  await findSchema(validSchemaData.name, false);
};

beforeEach(async () => {
  await prisma.schema.deleteMany();
});

describe("CRUD of Schema API (Using NextRequest)", () => {
  it("should be able to save valid schema", createValidSchema);
  it("should return BAD REQUEST for invalid schema data", createInvalidSchema);
  it("should return CONFLICT for duplicate schema", createDuplicateSchema);

  it("should be able to read schema", readSchema);
  it("should be able to integrate save and read (CR) of schema", createAndReadSchema);
  
  it("should be able to update schema", updateSchemaTest);
  it("should be able to integrate update and read (UR) of schema", updateAndFindSchema);
  it("should return NOT_FOUND for invalid schema id", updateNonExistingSchema);
  it("should return CONFLICT when updating schema to an existing schema name", updateSchemaToDuplicate);
  it("should return BAD REQUEST when updating schema without ID", updateSchemaWithoutId);
  
  it("should be able to delete schema", deleteSchemaTest);
  it("should be able to integrate delete and read (DR) of schema", deleteAndFindSchema);
  it("should return NOT_FOUND when deleting a non-existing schema", deleteNonExistingSchema);
  it("should return BAD REQUEST when deleting schema without ID", deleteSchemaWithoutId);
  
  it("should return INTERNAL_SERVER_ERROR if fetching schemas fails", getSchemasWithFailure);
});
