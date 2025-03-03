import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as logoutHandler } from "@/app/api/auth/logout/route";
import config from "@/app/config";

const BASE_API_URL_AUTH_LOGOUT = "http://localhost:3000/api/auth/logout";

describe("Auth API Test", () => {
  let testUser: User;
  let accessToken: string, refreshToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        id: "a00baadf-e281-4ddb-989f-00314e472bb5",
        email: "user2@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Test User",
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
    refreshToken = jwt.sign({ id: testUser.id }, config.JWT_REFRESH_SECRET, {
      expiresIn: config.JWT_REFRESH_EXPIRES,
    });
    await prisma.refreshToken.create({
      data: {
        token: await bcrypt.hash(refreshToken, 10),
        userId: testUser.id,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: testUser.email,
      },
    });
    await prisma.refreshToken.deleteMany({
      where: {
        userId: testUser.id,
      },
    });
    await prisma.$disconnect();
  });

  // ✅ Happy Path - Logout
  test("Should log out successfully and clear refresh token", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Cookie: refreshToken || "",
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Logged out");

    refreshToken = response.headers.get("set-cookie") as string;
    const refreshTokenCookie = response.cookies.get("refresh_token");
    const valueRefreshToken = refreshTokenCookie?.value as string;
    expect(valueRefreshToken).toBe("");
  });

  // ❌ Unhappy Path - Logout Token Invalid
  test("Should fail logout if token is invalid", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}invalid`,
        "Content-Type": "application/json",
        Cookie: refreshToken || "",
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Unauthorized");
  });

  // ❌ Unhappy Path - Logout Token Expired
  test("Should fail logout if token is expired", async () => {
    const expiredToken = jwt.sign(
      { id: testUser.id, role: testUser.role },
      config.JWT_ACCESS_SECRET,
      {
        expiresIn: -10,
      }
    );

    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGOUT}`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${expiredToken}`,
        "Content-Type": "application/json",
        Cookie: refreshToken || "",
      },
    });

    const response = await logoutHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Unauthorized");
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
