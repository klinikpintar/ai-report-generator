import { GET as getUsersHandler } from "@backend/api/users/route";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe("User API - GET Users", () => {
  const BASE_URL = "http://localhost:3000/api/users";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("✅ Should fetch users with default page and limit", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
        isActive: true,
      },
    ]);
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest(BASE_URL);
    const res = await getUsersHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.length).toBe(1);
    expect(json.pagination.current_page).toBe(1);
    expect(json.pagination.total_pages).toBe(1);
    expect(json.pagination.total_items).toBe(1);
  });

  test("✅ Should filter users by role", async () => {
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: "2",
        name: "Jane",
        email: "jane@example.com",
        role: "BUSINESS_ANALYST",
        isActive: true,
      },
    ]);
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const req = new NextRequest(`${BASE_URL}?role=BUSINESS_ANALYST`);
    const res = await getUsersHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data[0].role).toBe("BUSINESS_ANALYST");
  });

  test("❌ Should return error for invalid query param", async () => {
    const req = new NextRequest(`${BASE_URL}?page=-1`);
    const res = await getUsersHandler(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json).toHaveProperty("message", "Page must be greater than 0");
  });

  test("❌ Should return error for invalid role", async () => {
    const req = new NextRequest(`${BASE_URL}?role=INVALID`);
    const res = await getUsersHandler(req);
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.message).toMatch(/Invalid enum value/);
  });
});
