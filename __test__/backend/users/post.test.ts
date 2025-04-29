import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST as createUserHandler } from "@backend/api/users/route";
import { NextRequest } from "next/server";
import config from "@backend/config";

jest.mock("@/lib/prisma", () => ({
  user: {
    count: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock("bcryptjs");

describe("User API - Create User", () => {
  let bcryptHashSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    bcryptHashSpy = jest
      .spyOn(bcrypt, "hash")
      .mockResolvedValue("hashedPassword" as never);
  });

  const BASE_API_URL_USERS = "http://localhost:3000/api/users";

  // ✅ Happy Path - User berhasil dibuat
  test("Should create a user successfully", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(0);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "12345",
      name: "John Doe",
      email: "johndoe@example.com",
      role: "BUSINESS_ANALYST",
      isActive: true,
    });

    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "Secure123!",
        confirmPassword: "Secure123!",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("User created");
    expect(json.data.user.email).toBe("johndoe@example.com");
    expect(bcryptHashSpy).toHaveBeenCalledWith("Secure123!", config.BCRYPT_SALT_ROUNDS);
  });

  // ❌ Unhappy Path - Email sudah terdaftar
  test("Should return conflict error if email already exists", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: "Secure123!",
        confirmPassword: "Secure123!",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json).toHaveProperty("message", "Email already exists");
  });

  // ❌ Password tidak memenuhi policy (kurang simbol)
  test("Should reject password that lacks symbol", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "test@example.com",
        password: "Secure123", // No symbol
        confirmPassword: "Secure123",
        role: "ADMIN",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain(
      "Password must contain at least one special character"
    );
  });

  // ❌ Password terlalu pendek
  test("Should reject password with less than 8 characters", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Short Password",
        email: "shortpass@example.com",
        password: "S1!", // too short
        confirmPassword: "S1!",
        role: "ADMIN",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain(
      "Password must be at least 8 characters"
    );
  });

  // ❌ Password dan confirmPassword tidak cocok (Zod akan tangkap)
  test("Should return error if password and confirmPassword don't match", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Mismatch",
        email: "mismatch@example.com",
        password: "Secure123!",
        confirmPassword: "Different123!",
        role: "ADMIN",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain("Password and confirm password must match");
  });

  // ❌ Unhappy Path - Format request tidak valid
  test("Should return error for invalid request format", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({ name: "OnlyName" }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ Corner Path - Request body kosong
  test("Should return error for empty request body", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ Corner Path - Request role tidak sesuai enum
  test("Should return error for invalid role", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "johndoe@example.com",
        password: "securePassword",
        confirmPassword: "securePassword",
        role: "INVALID_ROLE",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message");
  });

  // ❌ Corner Path - Server error (simulated)
  test("Should return 500 for server error", async () => {
    (prisma.user.count as jest.Mock).mockImplementation(() => {
      throw new Error("Database error");
    });

    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "johndoe@example.com",
        password: "Secure123!",
        confirmPassword: "Secure123!",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toHaveProperty("message", "Internal server error");

  });
});
