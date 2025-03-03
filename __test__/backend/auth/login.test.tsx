import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import config from "@/app/config";

const BASE_API_URL_AUTH_LOGIN = "http://localhost:3000/api/auth/login";

describe("Auth API Test", () => {
  let testUser: User, adminUser: User, inactiveUser: User;
  let accessToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        id: "8efbb0a7-da66-4c7c-b13d-54eb36bc6e25",
        email: "user@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Test User",
        isActive: true,
        role: "BUSINESS_ANALYST",
      },
    });

    adminUser = await prisma.user.create({
      data: {
        id: "24562f8f-dbe0-49b6-a847-1bb8f44f27fa",
        email: "admin@example.com",
        password: await bcrypt.hash("adminpassword", 10),
        name: "Admin User",
        isActive: true,
        role: "ADMIN",
      },
    });

    inactiveUser = await prisma.user.create({
      data: {
        id: "a0b76a06-a17d-49a6-8e2c-da21df8d5d2f",
        email: "inactiveuser@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Inactive User",
        isActive: false,
        role: "BUSINESS_ANALYST",
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, adminUser.email, inactiveUser.email],
        },
      },
    });
    await prisma.refreshToken.deleteMany({
      where: {
        userId: {
          in: [testUser.id, adminUser.id, inactiveUser.id],
        },
      },
    });
    await prisma.$disconnect();
  });

  // ✅ Happy Path - Login Berhasil
  test("Should login successfully and return access token & refresh token in cookie", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Login successful");

    expect(json).toHaveProperty("data.access_token");
    accessToken = json.data.access_token;
    const validAccessToken = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    expect(validAccessToken).toHaveProperty("id", testUser.id);
    expect(validAccessToken).toHaveProperty("role", "BUSINESS_ANALYST");

    const refreshTokenCookie = response.cookies.get("refresh_token");
    expect(refreshTokenCookie).toBeDefined();
    const valueRefreshToken = refreshTokenCookie?.value as string;
    const validRefreshTokenCookie = jwt.verify(
      valueRefreshToken,
      config.JWT_REFRESH_SECRET
    );
    expect(validRefreshTokenCookie).toHaveProperty("id", testUser.id);
  });

  // ✅ Happy Path - Login Berhasil Admin
  test("Should login successfully and return access token for admin", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: adminUser.email,
        password: "adminpassword",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Login successful");

    expect(json).toHaveProperty("data.access_token");
    accessToken = json.data.access_token;
    const validAccessToken = jwt.verify(accessToken, config.JWT_ACCESS_SECRET);
    expect(validAccessToken).toHaveProperty("id", adminUser.id);
    expect(validAccessToken).toHaveProperty("role", "ADMIN");

    const refreshTokenCookie = response.cookies.get("refresh_token");
    expect(refreshTokenCookie).toBeDefined();
    const valueRefreshToken = refreshTokenCookie?.value as string;
    expect(refreshTokenCookie).toBeDefined();
    const validRefreshTokenCookie = jwt.verify(
      valueRefreshToken,
      config.JWT_REFRESH_SECRET
    );
    expect(validRefreshTokenCookie).toHaveProperty("id", adminUser.id);
  });

  // ❌ Unhappy Path - User Tidak Ditemukan
  test("Should fail login with non-existent user", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: "salahemail@gmail.com",
        password: "inipassword",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "User not found");
  });

  // ❌ Unhappy Path - User Tidak Aktif
  test("Should fail login with inactive user", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: inactiveUser.email,
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "User not active");
  });

  // ❌ Unhappy Path - Salah Password
  test("Should fail login with wrong password", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: "inipasswordyangsalah",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toHaveProperty("message", "Invalid credentials");
  });

  // ❌ Edge Case - Empty Body Login
  test("Should fail login with empty body", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Required");
  });

  // ❌ Corner Case - Wrong email format
  test("Should fail login with invalid email", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: "salahemail",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Invalid email format");
  });

  // ❌ Corner Case - Empty Password
  test("Should fail login with empty password", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH_LOGIN}`), {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: "",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Password cannot be empty");
  });
});
