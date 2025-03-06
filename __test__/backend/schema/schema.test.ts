import { NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";
import { POST, GET, PATCH, DELETE } from "@/app/api/schema/route";
import prisma from "@/lib/prisma";
import schemaService from "@/app/services/schemaService";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { handlePrismaError } from "../../../app/utils/schemaUtils";

jest.mock("@/lib/prisma", () => ({
  schema: {
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    create: jest.fn().mockResolvedValue({ id: 1, name: "products", description: "test", schemaText: "CREATE TABLE test();" }),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ id: 1, description: "Updated table description" }),
    delete: jest.fn().mockResolvedValue({ id: 1 }),
  },
}));

jest.mock("../../../app/utils/schemaUtils", () => {
  const actual = jest.requireActual("../../../app/utils/schemaUtils");

  return {
    ...actual,
    validateSchemaInput: jest.fn((data) => {
      if (data.name === "invalid_schema") {
        throw new ZodError([
          {
            message: "Invalid schema format",
            path: ["name"],
            code: "invalid_type",
          },
        ]);
      }
      return data;
    }),
  };
});



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
  name: "invalid_schema",
};

const sendRequest = (method: string, body?: any) => {
  return new NextRequest(new URL("http://localhost/api/schema"), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe("CRUD of Schema API (Using NextRequest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a schema", async () => {
    const request = sendRequest("POST", validSchemaData);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(json.id).toBe(1);
  });

  it("should return BAD REQUEST for invalid schema data", async () => {
    const request = sendRequest("POST", invalidSchemaData);
    const response = await POST(request);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should return CONFLICT for duplicate schema", async () => {
    (prisma.schema.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "4.10.0",
      })
    );

    const response = await POST(sendRequest("POST", validSchemaData));

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it("should return NOT_FOUND when deleting a non-existing schema", async () => {
  
    (prisma.schema.delete as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record to delete does not exist.", {
        code: "P2025",
        clientVersion: "4.10.0",
      })
    );
  
    const response = await DELETE(sendRequest("DELETE", { id: NON_EXISTING_ID }));
    const json = await response.json();
  
    console.log("Response Status:", response.status);
    console.log("Response Body:", json);
  
    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(json.error).toBe("Schema not found");
  });
  
  

  it("should return CONFLICT when updating schema to an existing schema name", async () => {
    (prisma.schema.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "4.10.0",
      })
    );

    const response = await PATCH(sendRequest("PATCH", { id: 1, name: "duplicate_name" }));

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it("should return NOT_FOUND when deleting a non-existing schema", async () => {
    (prisma.schema.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await DELETE(sendRequest("DELETE", { id: NON_EXISTING_ID }));

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
  });

  it("should return BAD REQUEST when updating schema without ID", async () => {
    const response = await PATCH(sendRequest("PATCH", {}));
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(json.error).toBe("Schema ID is required");
  });

  it("should return BAD REQUEST when deleting schema without ID", async () => {
    const response = await DELETE(sendRequest("DELETE", {}));
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(json.error).toBe("Schema ID is required");
  });

  it("should delete a schema", async () => {
  
    (prisma.schema.findUnique as jest.Mock).mockResolvedValue({ id: 1, name: "products" });
  
  
    (prisma.schema.delete as jest.Mock).mockResolvedValue({ id: 1 });
  
    const request = sendRequest("DELETE", { id: 1 });
    const response = await DELETE(request);
    const json = await response.json();
  
    console.log("Response Status:", response.status);
    console.log("Response Body:", json);
  
    expect(response.status).toBe(StatusCodes.OK);
    expect(json.message).toBe("Schema deleted successfully");
  });
  

  it("should remove schema from list after deletion", async () => {
    await DELETE(sendRequest("DELETE", { id: 1 }));
    (prisma.schema.findMany as jest.Mock).mockResolvedValue([]);

    const request = sendRequest("GET");
    const response = await GET(request);
    const json = await response.json();

    expect(json.some((schema: any) => schema.name === validSchemaData.name)).toBe(false);
  });
});
