/* eslint-disable @typescript-eslint/no-unused-vars */
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { POST as refreshHandler } from "@/app/api/auth/token/refresh/route";
import { User } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

const BASE_API_URL_AUTH_TOKEN_REFRESH =
  "http://localhost:3000/api/auth/token/refresh";

describe("Auth API - Refresh Token", () => {
  let testUser: User, anotherUser: User;
  let accessToken: string, refreshToken: string;
  let bcryptCompareSpy: jest.SpyInstance;
  let jwtSignSpy: jest.SpyInstance;
  let jwtVerifySpy: jest.SpyInstance;

  beforeAll(() => {
    testUser = {
      id: "e618eb3e-6248-4f0f-b9fa-6cf7a14f73bb",
      email: "user1@example.com",
      password: "hashedPassword123",
      name: "Test User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };

    anotherUser = {
      id: "0567b54d-c5e4-4d0b-b4e1-fc6d0991a63b",
      email: "userlagi@gmail.com",
      password: "hashedPassword123",
      name: "Another User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(
      async ({ where }) => {
        if (where.id === testUser.id) return testUser;
        if (where.id === anotherUser.id) return anotherUser;
        return null;
      }
    );

    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
      token: "hashedRefreshToken",
      userId: testUser.id,
    });

    bcryptCompareSpy = jest
      .spyOn(bcrypt, "compare")
      .mockResolvedValue(true as never);

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
      return { id: testUser.id };
    });

    accessToken = `mockedToken-${testUser.id}`;
    refreshToken = `mockedRefreshToken-${testUser.id}`;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Happy Path - Refresh Token Berhasil
  test("Should refresh token successfully", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Token refreshed");
    expect(json).toHaveProperty(
      "data.access_token",
      `mockedToken-${testUser.id}`
    );
  });
  
  // ❌ Unhappy Path - Tanpa Refresh Token
  test("Should fail refresh token if no refresh token is provided", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: "",
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "No refresh token");
  });

   // ❌ Unhappy Path - Refresh Token Expired
  test("Should fail refresh with expired token", async () => {
    jwtVerifySpy.mockImplementationOnce(() => {
      throw new Error("Token expired");
    });

    const expiredToken = `mockedToken-expired`;

    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${expiredToken}`,
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid refresh token or expired");
  });

  // ❌ Corner Case - Refresh Token Invalid
  test("Should fail refresh with invalid token", async () => {
    jwtVerifySpy.mockImplementationOnce(() => {
      throw new Error("Invalid token");
    });

    const invalidToken = "invalid_token";

    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${invalidToken}`,
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid refresh token or expired");
  });

  // ❌ Corner Case - Refresh Token Valid Tapi Tidak Ada di Database
  test("Should fail refresh with valid token but not in database", async () => {
    (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

    const validRefreshToken = `mockedToken-${anotherUser.id}`;

    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refresh_token=${validRefreshToken}`,
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid refresh token");
  });
});
