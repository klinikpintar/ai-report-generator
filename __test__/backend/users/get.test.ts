import prisma from "@/lib/prisma";
import { GET as getUsersHandler } from "@backend/api/users/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/prisma", () => ({
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
}));

describe("User API - Get Users (Corner Cases)", () => {
  const BASE_API_URL_USERS = "http://localhost:3000/api/users";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Default param (no query given)
  test("Should return default paginated users if no query param is provided", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(2);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      { id: "1", name: "User1", email: "user1@example.com", role: "ADMIN", isActive: true },
      { id: "2", name: "User2", email: "user2@example.com", role: "BUSINESS_ANALYST", isActive: true },
    ]);

    const request = new NextRequest(new URL(BASE_API_URL_USERS));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.length).toBe(2);
    expect(json.pagination).toEqual({
      current_page: 1,
      total_pages: 1,
      total_items: 2,
    });
  });

  // ❌ page > total_pages
  test("Should return empty array if page exceeds total pages", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(5);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL(BASE_API_URL_USERS + "?page=999&limit=2"));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.pagination.total_pages).toBe(Math.ceil(5 / 2));
  });

  // ❌ page or limit < 1
  test("Should return 400 for invalid pagination values", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS + "?page=0&limit=-5"));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ non-numeric page/limit
  test("Should return 400 if page or limit are not numbers", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS + "?page=abc&limit=xyz"));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ invalid role not in enum
  test("Should return 400 for invalid role", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS + "?role=HACKER"));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ✅ valid role but no users found
  test("Should return empty data if role exists but no matching user", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(0);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);

    const request = new NextRequest(new URL(BASE_API_URL_USERS + "?role=ADMIN"));
    const response = await getUsersHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
    expect(json.pagination.total_items).toBe(0);
  });

  test("Should accept role in lowercase and transform it", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(1);
    (prisma.user.findMany as jest.Mock).mockResolvedValue([
      {
        id: "1",
        name: "Lowercase Admin",
        email: "lower@admin.com",
        role: "ADMIN",
        isActive: true,
      },
    ]);
  
    const url = new URL(`${BASE_API_URL_USERS}?role=admin&page=1&limit=10`);
    const request = new NextRequest(url);
  
    const response = await getUsersHandler(request);
    const json = await response.json();
  
    expect(response.status).toBe(200);
    expect(json.data[0]).toHaveProperty("role", "ADMIN");
  });  
});
