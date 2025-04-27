import { NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";
import { POST, GET, DELETE } from "@backend/api/service/route";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

jest.mock("@/lib/prisma", () => ({
  service: {
    create: jest.fn().mockResolvedValue({
      id: "uuid-1234",
      name: "OpenAI",
      platformCode: "PLATFORM_X",
      createdAt: new Date(),
    }),
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue({ id: "uuid-1234" }),
  },
}));

jest.mock("@backend/utils/serviceUtils", () => {
  const actual = jest.requireActual("@backend/utils/serviceUtils");

  return {
    ...actual,
    validateServiceInput: jest.fn((data) => {
      if (data.name === "invalid_service") {
        throw new ZodError([
          {
            message: "Invalid input",
            path: ["name"],
            code: "invalid_type",
            expected: "string",
            received: "object",
          },
        ]);
      }
      return data;
    }),
  };
});

const NON_EXISTING_ID = "non-existing-id";

const validServiceData = {
  name: "OpenAI",
  platformCode: "PLATFORM_X",
};

const invalidServiceData = {
  name: "invalid_service",
};

const sendRequest = (method: string, body?: any) => {
  return new NextRequest(new URL("http://localhost/api/service"), {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
};

describe("CRUD of Service API (Using NextRequest)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return INTERNAL_SERVER_ERROR when GET fails", async () => {
    (prisma.service.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));

    const request = sendRequest("GET");
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(json.error).toBe("GET Services: Internal Server Error");
  });

  it("should create a service", async () => {
    const request = sendRequest("POST", validServiceData);
    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.CREATED);
    expect(json.id).toBe("uuid-1234");
  });

  it("should return BAD REQUEST for invalid service data", async () => {
    const request = sendRequest("POST", invalidServiceData);
    const response = await POST(request);

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
  });

  it("should return CONFLICT for duplicate service", async () => {
    (prisma.service.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "4.10.0",
      })
    );

    const response = await POST(sendRequest("POST", validServiceData));

    expect(response.status).toBe(StatusCodes.CONFLICT);
  });

  it("should return NOT_FOUND when deleting a non-existing service", async () => {
    (prisma.service.delete as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Record to delete does not exist.", {
        code: "P2025",
        clientVersion: "4.10.0",
      })
    );

    const response = await DELETE(sendRequest("DELETE", { id: NON_EXISTING_ID }));
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.NOT_FOUND);
    expect(json.error).toBe("Instance not found");
  });

  it("should return BAD REQUEST when deleting service without ID", async () => {
    const response = await DELETE(sendRequest("DELETE", {}));
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(json.error).toBe("Service ID is required");
  });

  it("should delete a service", async () => {
    (prisma.service.findUnique as jest.Mock).mockResolvedValue({ id: "uuid-1234", name: "OpenAI" });
    (prisma.service.delete as jest.Mock).mockResolvedValue({ id: "uuid-1234" });

    const request = sendRequest("DELETE", { id: "uuid-1234" });
    const response = await DELETE(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.message).toBe("Service deleted successfully");
  });

  it("should remove service from list after deletion", async () => {
    await DELETE(sendRequest("DELETE", { id: "uuid-1234" }));
    (prisma.service.findMany as jest.Mock).mockResolvedValue([]);

    const request = sendRequest("GET");
    const response = await GET();
    const json = await response.json();

    expect(json.some((service: any) => service.name === validServiceData.name)).toBe(false);
  });
});
