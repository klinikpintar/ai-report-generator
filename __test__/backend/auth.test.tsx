import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { User } from "@prisma/client";
import { NextRequest } from "next/server";
import { POST as loginHandler } from "../../app/api/auth/login/route";
import { POST as refreshHandler } from "../../app/api/auth/token/refresh/route";
import { POST as logoutHandler } from "../../app/api/auth/logout/route";

const BASE_API_URL_AUTH = "http://localhost:3000/api/auth";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

describe("Auth API Test", () => {
  let testUser: User, adminUser: User, inactiveUser: User;
  let accessToken: string, refreshToken: string;

  beforeAll(async () => {
    testUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: "user@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Test User",
        isActive: true,
        role: "BUSINESS_ANALYST",
      },
    });

    adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: "admin@example.com",
        password: await bcrypt.hash("adminpassword", 10),
        name: "Admin User",
        isActive: true,
        role: "ADMIN",
      },
    });

    inactiveUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: "inactiveuser@example.com",
        password: await bcrypt.hash("password123", 10),
        name: "Inactive User",
        isActive: false,
        role: "BUSINESS_ANALYST",
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  // ✅ Happy Path - Login Berhasil
  test("Should login successfully and return access token & refresh token in cookie", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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
    expect(json).toHaveProperty("data.access_token");
    accessToken = json.data.access_token;
    expect(json).toHaveProperty("message", "Login successful");
    expect(response.cookies.get("refresh_token")).toBeDefined();

    const validJWT = jwt.verify(accessToken, ACCESS_SECRET);
    expect(validJWT).toHaveProperty("id", testUser.id);
    expect(validJWT).toHaveProperty("role", testUser.role);

    const refreshTokenCookie = response.cookies.get("refresh_token");
    expect(refreshTokenCookie).toBeDefined();
    const valueRefreshToken = refreshTokenCookie?.value as string;

    refreshToken = response.headers.get("set-cookie") as string;

    const validRefreshJWT = jwt.verify(valueRefreshToken, REFRESH_SECRET);
    expect(validRefreshJWT).toHaveProperty("id", testUser.id);
  });

  // ✅ Happy Path - Login Berhasil Admin
  test("Should login successfully and return access token for admin", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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
    expect(json).toHaveProperty("data.access_token");
    expect(json).toHaveProperty("message", "Login successful");
    expect(response.cookies.get("refresh_token")).toBeDefined();

    const validJWT = jwt.verify(json.data.access_token, ACCESS_SECRET);
    expect(validJWT).toHaveProperty("id", adminUser.id);
    expect(validJWT).toHaveProperty("role", adminUser.role);

    const refreshTokenCookie = response.cookies.get("refresh_token");
    expect(refreshTokenCookie).toBeDefined();
    const refreshTokenAdmin = refreshTokenCookie?.value as string;
    const validRefreshJWT = jwt.verify(refreshTokenAdmin, REFRESH_SECRET);
    expect(validRefreshJWT).toHaveProperty("id", adminUser.id);
  });

  // ❌ Unhappy Path - Salah Password
  test("Should fail login with wrong password", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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

  // ❌ Unhappy Path - User Tidak Ditemukan
  test("Should fail login with non-existent user", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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

  // ❌ Edge Case - Empty Body Login
  test("Should fail login with empty body", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await loginHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Required");
  });

  // ❌ Edge Case - Wrong email format
  test("Should fail login with invalid email", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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

  // ❌ Edge Case - Empty Password
  test("Should fail login with empty password", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/login`), {
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

  // ✅ Happy Path - Refresh Token Berhasil
  test("Should refresh token successfully", async () => {
    const request = new NextRequest(
      new URL(`${BASE_API_URL_AUTH}/token/refresh`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: refreshToken || "",
        },
      }
    );

    const response = await refreshHandler(request);
    const json = await response.json();

    console.log(json);

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("data.access_token");
    accessToken = json.data.access_token;
    expect(json).toHaveProperty("message", "Token refreshed");
    expect(response.cookies.get("refresh_token")).toBeDefined();

    const validJWT = jwt.verify(accessToken, ACCESS_SECRET);
    expect(validJWT).toHaveProperty("id", testUser.id);
    expect(validJWT).toHaveProperty("role", testUser.role);

    const refreshTokenCookie = response.cookies.get("refresh_token");
    expect(refreshTokenCookie).toBeDefined();
    const valueRefreshToken = refreshTokenCookie?.value as string;

    refreshToken = response.headers.get("set-cookie") as string;

    const validRefreshJWT = jwt.verify(valueRefreshToken, REFRESH_SECRET);
    expect(validRefreshJWT).toHaveProperty("id", testUser.id);
  });

  // ❌ Unhappy Path - Tanpa Refresh Token
  test("Should fail refresh token if no refresh token is provided", async () => {
    const request = new NextRequest(
      new URL(`${BASE_API_URL_AUTH}/token/refresh`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "",
        },
      }
    );

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "No refresh token");
  });

  // ❌ Unhappy Path - Refresh Token Expired
  test("Should fail refresh with expired token", async () => {
    const expiredToken = jwt.sign({ id: testUser.id }, REFRESH_SECRET, {
      expiresIn: "-1s",
    });

    const request = new NextRequest(
      new URL(`${BASE_API_URL_AUTH}/token/refresh`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `refresh_token=${expiredToken}`,
        },
      }
    );

    const response = await refreshHandler(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json).toHaveProperty("message", "Invalid refresh token");
  });

  // ✅ Happy Path - Logout
  test("Should log out successfully and clear refresh token", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/logout`), {
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

    // ❌ Unhappy Path - Gunakan Refresh Token Setelah Logout
    const requestAgain = new NextRequest(
      new URL(`${BASE_API_URL_AUTH}/token/refresh`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: refreshToken || "",
        },
      }
    );

    const responseAgain = await refreshHandler(requestAgain);
    const failedRes = await responseAgain.json();

    expect(responseAgain.status).toBe(403);
    expect(failedRes).toHaveProperty("message", "No refresh token");
  });

  // ❌ Unhappy Path - Logout Tanpa Token
  test("Should fail logout if no token provided", async () => {
    const request = new NextRequest(new URL(`${BASE_API_URL_AUTH}/logout`), {
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
