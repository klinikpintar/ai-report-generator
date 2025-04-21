import { GET } from "@backend/api/schema/route";
import { NextRequest } from "next/server";
import { StatusCodes } from "http-status-codes";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  schema: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

const platformCodes = ['POSTGRESQL'];

const services = [
  {
    id: 'bd7a4c7a-1234-4c5e-b123-df12345abcd1',
    name: 'User Service',
    platformCode: platformCodes[0],
  },
  {
    id: 'bd7a4c7a-1234-4c5e-b123-df12345abcd2',
    name: 'Product Service',
    platformCode: platformCodes[0],
  },
]

const schemas = [
  {
    id: 1,
    name: "products",
    description: "Table for product info",
    schemaText: "CREATE TABLE products (id SERIAL PRIMARY KEY);",
    serviceId: 'bd7a4c7a-1234-4c5e-b123-df12345abcd1',
    service: services[1],
  },
  {
    id: 2,
    name: "users",
    description: "Table for user info",
    schemaText: "CREATE TABLE users (id SERIAL PRIMARY KEY);",
    serviceId: 'bd7a4c7a-1234-4c5e-b123-df12345abcd2',
    service: services[0],
  },
];

describe("Read Schema with Filtering", () => {
  // ✓ Positive case
  it("should return schemas filtered by serviceIds (UUIDs)", async () => {
    const [SERVICE_ID_1, SERVICE_ID_2] = services.map(service => service.id);

    (prisma.schema.count as jest.Mock).mockResolvedValue(schemas.length);
    (prisma.schema.findMany as jest.Mock).mockImplementation(({ where }) => {
      return Promise.resolve(
        schemas.filter((schema) =>
          where.AND[0].serviceId.in.includes(schema.serviceId)
        )
      );
    });

    const request = new NextRequest(
      new URL(
        `http://localhost/api/schema?serviceIds=${SERVICE_ID_1}&serviceIds=${SERVICE_ID_2}`
      ),
      {
        method: "GET",
      }
    );

    const response = await GET(request);
    const json = await response.json();
    const { data } = json;

    expect(prisma.schema.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { AND: [{ serviceId: { in: [SERVICE_ID_1, SERVICE_ID_2] } }, expect.anything()] },
        include: {
          service: true,
        },
      })
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(data.length).toBe(2);
    expect(data[0].serviceId).toBe(SERVICE_ID_1);
    expect(data[1].serviceId).toBe(SERVICE_ID_2);
  });

  // ✓ Positive case
  it('should return schemas filtered by platform codes', async () => {
    (prisma.schema.count as jest.Mock).mockResolvedValue(schemas.length);
    (prisma.schema.findMany as jest.Mock).mockResolvedValue(schemas);

    const request = new NextRequest(
      new URL(`http://localhost/api/schema?platformCodes=${platformCodes[0]}`),
      {
        method: "GET",
      }
    );

    const response = await GET(request);
    const json = await response.json();
    const { data } = json;


    expect(prisma.schema.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND:
            expect.arrayContaining([
              { service: { platformCode: expect.objectContaining({ in: platformCodes }) } }
            ]),
        }
      })
    );

    expect(response.status).toBe(StatusCodes.OK);
    expect(data.length).toBe(2);
    expect(data[0].service.platformCode).toBe(platformCodes[0]);
    expect(data[1].service.platformCode).toBe(platformCodes[0]);
  })

  // ❌ Negative case
  it("should return 400 Bad Request if invalid service ID", async () => {
    const req = new NextRequest(
      new URL("http://localhost/api/schema?serviceIds=not-a-uuid"),
      { method: "GET" }
    );
    const res = await GET(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });

  // ❌ Negative case
  it("should return 400 Bad Request if invalid platform code", async () => {
    const req = new NextRequest(
      new URL("http://localhost/api/schema?platformCodes=INVALID"),
      { method: "GET" }
    );
    const res = await GET(req);
    expect(res.status).toBe(StatusCodes.BAD_REQUEST);
  });


  // Edge case
  it("should return INTERNAL_SERVER_ERROR when DB fails", async () => {
    (prisma.schema.findMany as jest.Mock).mockRejectedValue(new Error("Database error"));

    const req = new NextRequest(new URL("http://localhost/api/schema"), { method: "GET" });
    const res = await GET(req);
    const json = await res.json();
    expect(res.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(json.error).toBe("GET Schemas: Internal Server Error");
  });
});


describe("Pagination for Read Schema", () => {
  it("should return paginated schemas if no query param provided", async () => {
    (prisma.schema.findMany as jest.Mock).mockResolvedValue(schemas);

    const request = new NextRequest(new URL("http://localhost/api/schema"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.data.length).toBe(2);
    expect(json.pagination.current_page).toBe(1);
    expect(json.pagination.total_pages).toBe(1);
    expect(json.pagination.total_items).toBe(2);
  })
  it("should return paginated schemas with 'page' query param provided", async () => {
    (prisma.schema.findMany as jest.Mock).mockResolvedValue(schemas);

    const request = new NextRequest(new URL("http://localhost/api/schema?page=2"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.data.length).toBe(2);
    expect(json.pagination.current_page).toBe(2);
  })
  it("should return paginated schemas with 'limit' query param provided", async () => {
    (prisma.schema.findMany as jest.Mock).mockResolvedValue(schemas.slice(0, 1));

    const request = new NextRequest(new URL("http://localhost/api/schema?limit=1"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.data.length).toBe(1);
    expect(json.pagination.current_page).toBe(1);
  })
  it("should return paginated schemas with all query param provided", async () => {
    (prisma.schema.findMany as jest.Mock).mockResolvedValue(schemas.slice(0, 1));

    const request = new NextRequest(new URL("http://localhost/api/schema?page=2&limit=1"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.data.length).toBe(1);
    expect(json.pagination.current_page).toBe(2);
  })

  it("should return 400 Bad Request if page or limit is not a number", async () => {
    const request = new NextRequest(new URL("http://localhost/api/schema?page=abc&limit=xyz"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(json).toHaveProperty("message");
  })
  it("should return 400 Bad Request if page or limit is less than 1", async () => {
    const request = new NextRequest(new URL("http://localhost/api/schema?page=0&limit=-5"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(json).toHaveProperty("message");
  });

  it("should return empty list if page exceeds total pages", async () => {
    (prisma.schema.count as jest.Mock).mockResolvedValue(5);
    (prisma.schema.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL("http://localhost/api/schema?page=999&limit=2"), {
      method: "GET",
    });

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(StatusCodes.OK);
    expect(json.data).toEqual([]);
    expect(json.pagination.total_pages).toBe(Math.ceil(5 / 2));
  })
})