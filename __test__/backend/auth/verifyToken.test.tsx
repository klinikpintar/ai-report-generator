/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { GET as verifyHandler } from "@backend/api/auth/token/verify/route";
import config from "@backend/config";
import { User } from "@prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

// Mock JWT
jest.mock("jsonwebtoken");

const BASE_API_URL_VERIFY_TOKEN = "http://localhost:3000/api/auth/token/verify";

describe("Auth API - Verify Token", () => {
  let testUser: User;
  let jwtVerifySpy: jest.SpyInstance;

  beforeAll(() => {
    testUser = {
      id: "8efbb0a7-da66-4c7c-b13d-54eb36bc6e80",
      email: "user@example.com",
      password: "hashedPassword123",
      name: "Test User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();

    (prisma.user.findUnique as jest.Mock).mockImplementation(
      async ({ where }) => {
        if (where.id === testUser.id) return testUser;
        return null;
      }
    );

    jwtVerifySpy = jest
      .spyOn(jwt, "verify")
      .mockImplementation((token, secret) => {
        if (token.includes("invalid")) throw new Error("Invalid token");
        if (token.includes("expired")) throw new Error("Token expired");
        return { id: testUser.id };
      });
  });

  test("✅ Should return user data if token is valid and user is found", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: testUser.id });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      name: testUser.name,
      isActive: true,
    });

    const request = new NextRequest(new URL(BASE_API_URL_VERIFY_TOKEN), {
      method: "GET",
      headers: {
        Cookie: "access_token=validToken",
      },
      credentials: "include",
    });

    const response = await verifyHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("data.user");
    expect(json.data.user).toEqual({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
      name: testUser.name,
      isActive: true,
    });
    expect(json).toHaveProperty("message", "Token verified");
    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      config.JWT_ACCESS_SECRET
    );
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: testUser.id },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        isActive: true,
      },
    });
  });

  test("❌ Should return 403 if token is invalid or expired", async () => {
    jwtVerifySpy.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const request = new NextRequest(new URL(BASE_API_URL_VERIFY_TOKEN), {
      method: "GET",
      headers: {
        Cookie: "access_token=invalidToken",
      },
      credentials: "include",
    });

    const response = await verifyHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
  });

  test("❌ Should return 404 if user is not found", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: testUser.id });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(new URL(BASE_API_URL_VERIFY_TOKEN), {
      method: "GET",
      headers: {
        Cookie: "access_token=validToken",
      },
      credentials: "include",
    });

    const response = await verifyHandler(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toHaveProperty("message", "User not found");
  });

  test("❌ Should return 401 if no token is provided", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_VERIFY_TOKEN), {
      method: "GET",
      credentials: "include",
    });

    const response = await verifyHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Unauthorized");
  });
});
