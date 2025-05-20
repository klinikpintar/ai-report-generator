import { DELETE } from "@/app/(backend)/api/users/[id]/route";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Only mock the necessary parts
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
  sign: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  user: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  refreshToken: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
}));

type Params = { params: Promise<{ id: string }> };

const validLoginUserId = "550e8400-e29b-41d4-a716-446655440000";
const validTargetUserId = "660e8400-e29b-41d4-a716-446655440001";
const differentUserId = "770e8400-e29b-41d4-a716-446655440002";

describe("DELETE /api/users/[id] route (full flow including usersService)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Positive Case: Sukses delete user lain
  it("should delete user successfully with valid login and id (positive case)", async () => {
    // Setup mock for cookies
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "valid-access-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    
    // Mock JWT verification
    (jwt.verify as jest.Mock).mockReturnValue({ id: validLoginUserId });
    
    // Mock user data
    const fakeUserLogin = { 
      id: validLoginUserId,
      email: "admin@example.com", 
      role: "ADMIN"
    };
    const fakeTargetUser = {
      id: validTargetUserId,
      name: "John Doe",
      email: "john@example.com",
      role: "USER",
      isActive: true,
    };

    // Set up prisma mocks to return appropriate data
    (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
      if (args.where.id === validLoginUserId) {
        return Promise.resolve(fakeUserLogin);
      } else if (args.where.id === validTargetUserId) {
        return Promise.resolve(fakeTargetUser);
      }
      return Promise.resolve(null);
    });
    (prisma.user.delete as jest.Mock).mockResolvedValue(fakeTargetUser);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.message).toBe("User deleted successfully");
    expect(json.data).toEqual(fakeTargetUser);
  });

  // ❌ Negative Case: Tidak login (no cookie)
  it("should return 401 if user not logged in (negative case - no cookie)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue(undefined),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.message).toBe("Unauthorized");
  });

  // ❌ Negative Case: Tidak login (invalid token)
  it("should return 401 if token is invalid (negative case - invalid token)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "invalid-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (jwt.verify as jest.Mock).mockReturnValue(null);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.message).toBe("Unauthorized");
  });

  // ❌ Negative Case: Error dalam getUserLogin
  it("should return 401 if getUserLogin throws an error (negative case - catch block)", async () => {
    // Force the cookies() function to throw an error
    const mockError = new Error("Cookie store error");
    (cookies as jest.Mock).mockImplementation(() => {
      throw mockError;
    });
    
    // Spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.message).toBe("Unauthorized");
    
    // Verify the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error getting user from request:", 
      mockError
    );
    
    consoleErrorSpy.mockRestore();
  });

  // ❌ Negative Case: Hapus akun sendiri
  it("should return 400 if user tries to delete their own account (negative case)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "valid-access-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (jwt.verify as jest.Mock).mockReturnValue({ id: validLoginUserId });
    
    const fakeUserLogin = { 
      id: validLoginUserId,
      email: "admin@example.com", 
      role: "ADMIN"
    };
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUserLogin);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validLoginUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toBe("You cannot delete your own account");
  });

  // ❌ Negative Case: User ID invalid format
  it("should return 400 if id is invalid format (negative case)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "valid-access-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (jwt.verify as jest.Mock).mockReturnValue({ id: validLoginUserId });
    
    const fakeUserLogin = { 
      id: validLoginUserId,
      email: "admin@example.com", 
      role: "ADMIN"
    };
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(fakeUserLogin);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: "invalid-id-format" }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain("Invalid user ID format");
  });

  // ❌ Negative Case: User tidak ditemukan
  it("should return 404 if user to delete is not found (negative case)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "valid-access-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (jwt.verify as jest.Mock).mockReturnValue({ id: validLoginUserId });
    
    const fakeUserLogin = { 
      id: validLoginUserId,
      email: "admin@example.com", 
      role: "ADMIN"
    };
    
    // Set up prisma mocks to return logged-in user but not target user
    (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
      if (args.where.id === validLoginUserId) {
        return Promise.resolve(fakeUserLogin);
      } else {
        return Promise.resolve(null);  // Target user not found
      }
    });

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: differentUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.message).toBe("User not found");
  });

  // 🧪 Corner Case: Unexpected internal error
  it("should return 500 if unexpected error occurs (corner case)", async () => {
    const mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: "valid-access-token" }),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
    (jwt.verify as jest.Mock).mockReturnValue({ id: validLoginUserId });
    
    const fakeUserLogin = { 
      id: validLoginUserId,
      email: "admin@example.com", 
      role: "ADMIN"
    };
    
    // User login query works
    (prisma.user.findUnique as jest.Mock).mockImplementation((args) => {
      if (args.where.id === validLoginUserId) {
        return Promise.resolve(fakeUserLogin);
      } else {
        // But deleting throws an error
        throw new Error("Unexpected failure");
      }
    });

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.message).toBe("Internal server error");
  });
});
