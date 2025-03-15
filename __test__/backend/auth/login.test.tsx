import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "@backend/api/auth/login/route";
import config from "@backend/config";
import { User } from "@prisma/client";

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

const BASE_API_URL_AUTH_LOGIN = "http://localhost:3000/api/auth/login";

describe("Auth API - Login", () => {
  let testUser: User;
  let adminUser: User;
  let inactiveUser: User;
  let bcryptCompareSpy: jest.SpyInstance;
  let jwtSignSpy: jest.SpyInstance;

  beforeAll(() => {
    testUser = {
      id: "8efbb0a7-da66-4c7c-b13d-54eb36bc6e25",
      email: "user@example.com",
      password: "hashedPassword123",
      name: "Test User",
      isActive: true,
      role: "BUSINESS_ANALYST",
    };

    adminUser = {
      id: "24562f8f-dbe0-49b6-a847-1bb8f44f27fa",
      email: "admin@example.com",
      password: "hashedAdminPassword",
      name: "Admin User",
      isActive: true,
      role: "ADMIN",
    };

    inactiveUser = {
      id: "a0b76a06-a17d-49a6-8e2c-da21df8d5d2f",
      email: "inactiveuser@example.com",
      password: "hashedInactivePassword",
      name: "Inactive User",
      isActive: false,
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockImplementation(
      async ({ where }) => {
        if (where.email === testUser.email) return testUser;
        if (where.email === adminUser.email) return adminUser;
        if (where.email === inactiveUser.email) return inactiveUser;
        return null;
      }
    );

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Happy Path - Login Berhasil
  test("Should login successfully and return access & refresh token", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, password: "password123" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "Login successful");
    expect(json).toHaveProperty(
      "data.access_token",
      `mockedToken-${testUser.id}`
    );

    expect(bcryptCompareSpy).toHaveBeenCalledWith(
      "password123",
      testUser.password
    );
    expect(jwtSignSpy).toHaveBeenCalledWith(
      { id: testUser.id, role: testUser.role },
      config.JWT_ACCESS_SECRET,
      { expiresIn: config.JWT_ACCESS_EXPIRES }
    );
  });

  // ✅ Happy Path - Login Berhasil Admin
  test("Should login successfully as admin", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
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
    expect(json).toHaveProperty(
      "data.access_token",
      `mockedToken-${adminUser.id}`
    );
  });

  // ❌ Unhappy Path - Salah Password
  test("Should fail login with wrong password", async () => {
    bcryptCompareSpy.mockResolvedValueOnce(false);

    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
      method: "POST",
      body: JSON.stringify({
        email: testUser.email,
        password: "wrongpassword",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Invalid credentials");
  });

  // ❌ Unhappy Path - User Tidak Ditemukan
  test("Should fail login with non-existent user", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
      method: "POST",
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "password123",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toHaveProperty("message", "User not found");
  });

  // ❌ Unhappy Path - User Tidak Aktif
  test("Should fail login with inactive user", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
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
    expect(json).toHaveProperty("message", "User is not active");
  });

  // ❌ Edge Case - Empty Body Login
  test("Should fail login with empty body", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
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
  test("Should fail login with invalid email format", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
      method: "POST",
      body: JSON.stringify({ email: "invalidemail" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Invalid email format");
  });

  // ❌ Corner Case - Wrong password format
  test("Should fail login with invalid password format", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_AUTH_LOGIN), {
      method: "POST",
      body: JSON.stringify({ email: testUser.email, password: "" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Password cannot be empty");
  });
});
