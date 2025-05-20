import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { POST as logoutHandler } from "@backend/api/auth/logout/route";
import config from "@backend/config";
import { User } from "@prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    deleteMany: jest.fn(),
  },
}));

// Mock JWT
jest.mock("jsonwebtoken");

const BASE_API_URL_LOGOUT = "http://localhost:3000/api/auth/logout";

describe("Auth API - Logout", () => {
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

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

    jwtVerifySpy = jest.spyOn(jwt, "verify").mockImplementation((token) => {
      if (token.includes("invalid")) throw new Error("Invalid token");
      if (token.includes("expired")) throw new Error("Token expired");
      return { id: testUser.id };
    });
  });

  test("✅ Should log out successfully and clear refresh token", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_LOGOUT), {
      method: "POST",
      headers: {
        Cookie: `access_token=validToken; refresh_token=validRefreshToken`,
      },
      credentials: "include",
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Logged out");

    expect(response.cookies.get("access_token")?.value).toBe("");
    expect(response.cookies.get("refresh_token")?.value).toBe("");

    expect(jwtVerifySpy).toHaveBeenCalledWith("validToken", config.JWT_ACCESS_SECRET);
  });

  test("❌ Should fail logout if token is invalid", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_LOGOUT), {
      method: "POST",
      headers: {
        Cookie: `access_token=invalidToken; refresh_token=validRefreshToken`,
      },
      credentials: "include",
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
    expect(jwtVerifySpy).toHaveBeenCalledWith("invalidToken", config.JWT_ACCESS_SECRET);
  });

  test("❌ Should fail logout if token is expired", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_LOGOUT), {
      method: "POST",
      headers: {
        Cookie: `access_token=expiredToken; refresh_token=validRefreshToken`,
      },
      credentials: "include",
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
    expect(jwtVerifySpy).toHaveBeenCalledWith("expiredToken", config.JWT_ACCESS_SECRET);
  });

  test("❌ Should fail logout if no token is provided", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_LOGOUT), {
      method: "POST",
      credentials: "include",
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Unauthorized");
  });

  // Server Error
  test("❌ Should handle server error gracefully", async () => {
    (prisma.refreshToken.deleteMany as jest.Mock).mockRejectedValueOnce(new Error("Server error"));

    const request = new NextRequest(new URL(BASE_API_URL_LOGOUT), {
      method: "POST",
      headers: {
        Cookie: `access_token=validToken; refresh_token=validRefreshToken`,
      },
      credentials: "include",
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty("message", "Internal server error");
  });
});
