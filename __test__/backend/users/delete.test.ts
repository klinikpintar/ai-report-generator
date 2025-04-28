import { DELETE } from "@/app/(backend)/api/users/[id]/route";
import authService from "@/app/(backend)/services/authService";
import usersService from "@/app/(backend)/services/usersService";
import { NotFoundResponse } from "@/app/(backend)/utils/exceptions";

// 🛠️ Mock authService dan usersService
jest.mock("@/app/(backend)/services/authService", () => ({
  __esModule: true,
  default: {
    getUserLogin: jest.fn(),
  },
}));

jest.mock("@/app/(backend)/services/usersService", () => ({
  __esModule: true,
  default: {
    deleteUser: jest.fn(),
  },
}));

type Params = { params: Promise<{ id: string }> };

// 🛠️ Gunakan UUID valid untuk id
const validLoginUserId = "550e8400-e29b-41d4-a716-446655440000";
const validTargetUserId = "660e8400-e29b-41d4-a716-446655440001";
const differentUserId = "770e8400-e29b-41d4-a716-446655440002";

describe("DELETE /api/users/[id]", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Positive Case: Sukses delete user lain
  it("should delete user successfully with valid login and id (positive case)", async () => {
    const fakeUserLogin = { id: validLoginUserId };
    const fakeTargetUser = {
      id: validTargetUserId,
      name: "John Doe",
      email: "john@example.com",
      role: "ADMIN",
      isActive: true,
    };

    (authService.getUserLogin as jest.Mock).mockResolvedValue(fakeUserLogin);
    (usersService.deleteUser as jest.Mock).mockResolvedValue(fakeTargetUser);

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

  // ❌ Negative Case: Tidak login
  it("should return 401 if user not logged in (negative case)", async () => {
    (authService.getUserLogin as jest.Mock).mockResolvedValue(null);

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: validTargetUserId }),
    };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.message).toBe("Unauthorized");
  });

  // ❌ Negative Case: Hapus akun sendiri
  it("should return 400 if user tries to delete their own account (negative case)", async () => {
    (authService.getUserLogin as jest.Mock).mockResolvedValue({
      id: validLoginUserId,
    });

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
    (authService.getUserLogin as jest.Mock).mockResolvedValue({
      id: validLoginUserId,
    });

    const request = {} as Request;
    const params: Params = {
      params: Promise.resolve({ id: "invalid-id-format" }),
    }; // ❌ not uuid

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.message).toContain("Invalid user ID format");
  });

  // ❌ Negative Case: User tidak ditemukan
  it("should return 404 if user to delete is not found (negative case)", async () => {
    (authService.getUserLogin as jest.Mock).mockResolvedValue({
      id: validLoginUserId,
    });
    (usersService.deleteUser as jest.Mock).mockRejectedValue(
      new NotFoundResponse("User not found")
    );

    const request = {} as Request;
    const params: Params = { params: Promise.resolve({ id: differentUserId }) };

    const response = await DELETE(request, params);
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.message).toBe("User not found");
  });

  // 🧪 Corner Case: Unexpected internal error
  it("should return 500 if unexpected error occurs (corner case)", async () => {
    (authService.getUserLogin as jest.Mock).mockResolvedValue({
      id: validLoginUserId,
    });
    (usersService.deleteUser as jest.Mock).mockRejectedValue(
      new Error("Unexpected failure")
    );

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
