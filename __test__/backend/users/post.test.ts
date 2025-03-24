import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { POST as createUserHandler } from "@backend/api/users/route";
import { User } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

jest.mock("bcryptjs");

describe("User API - Create User", () => {
  let bcryptHashSpy: jest.SpyInstance;
  let testUser: Partial<User>;

  beforeAll(() => {
    testUser = {
      id: "12345",
      email: "newuser@example.com",
      password: "hashedPassword123",
      name: "New User",
      role: "BUSINESS_ANALYST",
    };
  });

  beforeEach(() => {
    bcryptHashSpy = jest
      .spyOn(bcrypt, "hash")
      .mockResolvedValue("hashedPassword123" as never);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(testUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Happy Path - User Berhasil Dibuat
  test("Should create user successfully", async () => {
    const request = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: testUser.name,
        email: testUser.email,
        password: "password123",
        confirmPassword: "password123",
        role: testUser.role,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toHaveProperty("message", "User created successfully");
    expect(json).toHaveProperty("data.email", testUser.email);
    expect(bcryptHashSpy).toHaveBeenCalledWith("password123", 10);
  });

  // ❌ Unhappy Path - Email Sudah Terdaftar
  test("Should fail if email already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(testUser);

    const request = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: testUser.name,
        email: testUser.email,
        password: "password123",
        confirmPassword: "password123",
        role: testUser.role,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Email already in use");
  });

  // ❌ Unhappy Path - Password dan Confirm Password Tidak Sama
  test("Should fail if passwords do not match", async () => {
    const request = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: testUser.name,
        email: testUser.email,
        password: "password123",
        confirmPassword: "wrongpassword",
        role: testUser.role,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Passwords do not match");
  });

  // ❌ Edge Case - Empty Request Body
  test("Should fail if request body is empty", async () => {
    const request = new NextRequest("http://localhost:3000/api/users", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });

    const response = await createUserHandler(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("message", "Required fields are missing");
  });
});
