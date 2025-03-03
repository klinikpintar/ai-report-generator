import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as refreshHandler } from "@/app/api/auth/token/refresh/route";
import config from "@/app/config";

const BASE_API_URL_AUTH_TOKEN_REFRESH =
  "http://localhost:3000/api/auth/token/refresh";

describe("Auth API Test", () => {
  let testUser: User, anotherUser: User;
  let accessToken: string, refreshToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        id: "e618eb3e-6248-4f0f-b9fa-6cf7a14f73bb",
        email: "user1@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Test User",
        isActive: true,
        role: "BUSINESS_ANALYST",
      },
    });

    anotherUser = await prisma.user.create({
      data: {
        id: "0567b54d-c5e4-4d0b-b4e1-fc6d0991a63b",
        email: "userlagi@gmail.com",
        password: await bcrypt.hash("password123", 10),
        name: "Another User",
        isActive: true,
        role: "BUSINESS_ANALYST",
      },
    });

    accessToken = jwt.sign(
      { id: testUser.id, role: testUser.role },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: config.JWT_ACCESS_EXPIRES,
      }
    );
    const token = jwt.sign({ id: testUser.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES,
    });

    refreshToken = `refresh_token=${token}`;
    await prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(token, 10),
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, anotherUser.email],
        },
      },
    });
    await prisma.refreshToken.deleteMany({
      where: {
        userId: {
          in: [testUser.id, anotherUser.id],
        },
      },
    });
    await prisma.$disconnect();
  });

  // ✅ Happy Path - Refresh Token Berhasil
  test("Should refresh token successfully", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_TOKEN_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: refreshToken || "",
      },
    });

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Token refreshed");

    expect(json).toHaveProperty("data.access_token");
    accessToken = json.data.access_token;
    const validAccessToken = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    expect(validAccessToken).toHaveProperty("id", testUser.id);
    expect(validAccessToken).toHaveProperty("role", testUser.role);

    refreshToken = response.headers.get("set-cookie") as string;

    const refreshTokenCookie = response.cookies.get("refresh_token");
    const valueRefreshToken = refreshTokenCookie?.value as string;
    expect(refreshTokenCookie).toBeDefined();
    const validRefreshJWT = jwt.verify(
      valueRefreshToken,
      config.JWT_REFRESH_SECRET
    );
    expect(validRefreshJWT).toHaveProperty("id", testUser.id);
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
    const expiredToken = jwt.sign(
      { id: testUser.id },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: "-1s",
      }
    );

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
    const validRefreshToken = jwt.sign(
      { id: anotherUser.id },
      config.JWT_REFRESH_SECRET,
      { expiresIn: config.JWT_REFRESH_EXPIRES }
    );

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
