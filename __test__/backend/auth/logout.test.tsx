/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { POST as logoutHandler } from "@backend/api/auth/logout/route";
import { User } from "@prisma/client";
import config from "@backend/config";

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const BASE_API_URL_AUTH_LOGOUT = "http://localhost:3000/api/auth/logout";

describe("Auth API - Logout", () => {
  let testUser: User;
  let accessToken: string;
  let refreshToken: string;
  let jwtSignSpy: jest.SpyInstance;
  let jwtVerifySpy: jest.SpyInstance;

  beforeAll(() => {
    testUser = {
      id: "a00baadf-e281-4ddb-989f-00314e472bb5",
      email: "user2@example.com",
      password: "hashedPassword123",
      name: "Test User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

    jwtSignSpy = jest
      .spyOn(jwt, "sign")
      .mockImplementation((payload: string | object | Buffer) => {
        if (typeof payload === "object" && "id" in payload) {
          return `mockedToken-${(payload as { id: string }).id}`;
        }
        return "mockedToken";
      });

    jwtVerifySpy = jest.spyOn(jwt, "verify").mockImplementation((token) => {
      if (token.includes("invalid")) throw new Error("Invalid token");
      if (token.includes("expired")) throw new Error("Token expired");
      return { id: testUser.id, role: testUser.role };
    });

    accessToken = `mockedToken-${testUser.id}`;
    refreshToken = `mockedRefreshToken-${testUser.id}`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Happy Path - Logout
  test("Should log out successfully and clear refresh token", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Logged out");

    const refreshTokenCookie = response!.cookies.get("refresh_token");
    expect(refreshTokenCookie?.value).toBe("");

    expect(jwtVerifySpy).toHaveBeenCalledWith(
      accessToken,
      config.JWT_ACCESS_SECRET
    );
  });

  // ❌ Unhappy Path - Logout Token Invalid
  test("Should fail logout if token is invalid", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}invalid`,
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
    expect(jwtVerifySpy).toHaveBeenCalledWith(
      `${accessToken}invalid`,
      config.JWT_ACCESS_SECRET
    );
  });

  // ❌ Unhappy Path - Logout Token Expired
  test("Should fail logout if token is expired", async () => {
    const expiredToken = `mockedToken-expired`;

    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${expiredToken}`,
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Invalid or expired access token");
    expect(jwtVerifySpy).toHaveBeenCalledWith(
      expiredToken,
      config.JWT_ACCESS_SECRET
    );
  });

  // ❌ Corner Case - Logout Tanpa Token
  test("Should fail logout if no token provided", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Unauthorized");
  });
});
