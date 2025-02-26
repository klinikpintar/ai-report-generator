import request from "supertest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { User } from "@prisma/client";

const BASE_API_URL = process.env.BASE_API_URL || "http://localhost:3000";
const BASE_SCHEMA_URL = "/api/auth";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

describe("Auth API Test", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({ email: "user@example.com", password: "password123" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data.access_token");
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.headers["set-cookie"]).toBeDefined();

    accessToken = res.body.data.access_token;
    refreshToken = res.headers["set-cookie"];
  });

  // ✅ Happy Path - Login Berhasil Admin
  test("Should login successfully and return access token for admin", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({ email: "admin@example.com", password: "adminpassword" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data.access_token");
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  // ❌ Unhappy Path - Salah Password
  test("Should fail login with wrong password", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({ email: "user@example.com", password: "wrongpassword" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });

  // ❌ Unhappy Path - User Tidak Ditemukan
  test("Should fail login with non-existent user", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({ email: "nonexistent@example.com", password: "password" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "User not found");
  });

  // ❌ Unhappy Path - User Tidak Aktif
  test("Should fail login with inactive user", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({ email: "inactiveuser@example.com", password: "password123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User not active");
  });

  // ❌ Edge Case - Empty Body Login
  test("Should fail login with empty body", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/login`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "message",
      "Email and password are required"
    );
  });

  // ✅ Happy Path - Refresh Token Berhasil
  test("Should refresh token successfully", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/token/refresh`)
      .set("Cookie", refreshToken);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data.access_token");
    expect(res.body).toHaveProperty("message", "Token refreshed");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  // ❌ Unhappy Path - Tanpa Refresh Token
  test("Should fail refresh token if no refresh token is provided", async () => {
    const res = await request(BASE_API_URL).post(
      `${BASE_SCHEMA_URL}/token/refresh`
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "No refresh token");
  });

  // ❌ Unhappy Path - Refresh Token Expired
  test("Should fail refresh with expired token", async () => {
    const expiredToken = jwt.sign({ id: testUser.id }, REFRESH_SECRET, {
      expiresIn: "-1s",
    });

    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/token/refresh`)
      .set("Cookie", `refresh_token=${expiredToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "Invalid refresh token");
  });

  // ❌ Unhappy Path - Refresh Token Expired for Admin
  test("Should fail refresh with expired token for admin", async () => {
    const expiredToken = jwt.sign({ id: adminUser.id }, REFRESH_SECRET, {
      expiresIn: "-1s",
    });

    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/token/refresh`)
      .set("Cookie", `refresh_token=${expiredToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "Invalid refresh token");
  });

  // ✅ Happy Path - Logout
  test("Should log out successfully and clear refresh token", async () => {
    const res = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/logout`)
      .set("Cookie", refreshToken)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logged out");

    // ❌ Unhappy Path - Gunakan Refresh Token Setelah Logout
    const failedRes = await request(BASE_API_URL)
      .post(`${BASE_SCHEMA_URL}/token/refresh`)
      .set("Cookie", refreshToken);

    expect(failedRes.statusCode).toBe(403);
    expect(failedRes.body).toHaveProperty("message", "Invalid refresh token");
  });

  // ❌ Unhappy Path - Logout Tanpa Token
  test("Should fail logout if no token provided", async () => {
    const res = await request(BASE_API_URL).post(`${BASE_SCHEMA_URL}/logout`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "No refresh token provided");
  });
});
