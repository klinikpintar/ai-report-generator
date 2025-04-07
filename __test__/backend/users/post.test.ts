import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { POST as createUserHandler } from "@backend/api/users/route";
import { NextRequest } from "next/server";

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
        password: "securePassword",
        confirmPassword: "securePassword",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toHaveProperty("message", "User created");
    expect(json.data.user).toMatchObject({
      id: "12345",
      name: "John Doe",
      email: "johndoe@example.com",
      role: "BUSINESS_ANALYST",
      isActive: true,
    });

    expect(bcryptHashSpy).toHaveBeenCalledWith("securePassword", 10);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  // ❌ Unhappy Path - Email sudah terdaftar
  test("Should return conflict error if email already exists", async () => {
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Jane Doe",
        email: "janedoe@example.com",
        password: "securePassword",
        confirmPassword: "securePassword",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json).toHaveProperty("message", "Email already exists");
  });

  // ❌ Unhappy Path - Password dan confirm password tidak cocok
  test("Should return error if passwords do not match", async () => {
    const request = new NextRequest(new URL(BASE_API_URL_USERS), {
      method: "POST",
      body: JSON.stringify({
        name: "Jake Doe",
        email: "jakedoe@example.com",
        password: "password123",
        confirmPassword: "differentPassword",
        role: "BUSINESS_ANALYST",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty(
      "message",
      "Password and confirm password must be the same"
    );
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
});
