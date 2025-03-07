import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { GET as meHandler } from "@/app/api/auth/me/route";
import config from "@/app/config";
import { User } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

jest.mock("jsonwebtoken");

const BASE_API_URL_ME = "http://localhost:3000/api/auth/me";

describe("GET /me", () => {
  let testUser: User;

  beforeAll(() => {
    testUser = {
      id: "8efbb0a7-da66-4c7c-b13d-54eb36bc6e25",
      email: "user@example.com",
      password: "hashedPassword123",
      name: "Test User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Happy Path 
  test("Should return user data if token is valid and user is found", async () => {
    // Mock jwt.verify to return payload
    (jwt.verify as jest.Mock).mockReturnValue({ id: testUser.id });

    // Mock prisma.user.findUnique to return testUser
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
      headers: {
        Authorization: "Bearer validToken",
      },
    });

    const response = await meHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("user");
    expect(json.user).toEqual({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });

    expect(jwt.verify).toHaveBeenCalledWith("validToken", config.JWT_ACCESS_SECRET);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: testUser.id },
      select: { id: true, email: true, role: true },
    });
  });

  // ❌ Unhappy Path
  test("Should return 403 if no token is provided", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
    });

    const response = await meHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "No access token");
  });

  // ❌ Unhappy Path
  test("Should return 403 if token is invalid or expired", async () => {
    // Mock jwt.verify to return null (invalid token)
    (jwt.verify as jest.Mock).mockReturnValue(null);

    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
      headers: {
        Authorization: "Bearer invalidToken",
      },
    });

    const response = await meHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
  });

  // ❌ Unhappy Path - Token is valid, but couldn't find user with the id earned
  test("Should return 401 if user is not found", async () => {
    // Mock jwt.verify to return payload
    (jwt.verify as jest.Mock).mockReturnValue({ id: testUser.id });

    // Mock prisma.user.findUnique to return null (user not found)
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
      headers: {
        Authorization: "Bearer validToken",
      },
    });

    const response = await meHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "User not found");
  });

  // ❌ Unhappy Path 
  test("Should return 500 if there is an error accessing the database", async () => {
    // Mock jwt.verify to return payload
    (jwt.verify as jest.Mock).mockReturnValue({ id: testUser.id });

    // Mock prisma.user.findUnique to throw an error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(
      new Error("Database error")
    );

    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
      headers: {
        Authorization: "Bearer validToken",
      },
    });

    const response = await meHandler(request);
    const json = await response.json();
    expect(response.status).toBe(500);
    expect(json).toHaveProperty("message", "Internal server error");
  });

  // ❌ Corner Case 
  test("Should return 403 if Authorization header is missing", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_ME), {
      method: "GET",
      // No Authorization header
    });

    const response = await meHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "No access token");
  });
});
